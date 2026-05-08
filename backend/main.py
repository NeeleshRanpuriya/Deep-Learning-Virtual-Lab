"""
DeepLab 3D – FastAPI Backend
Real neural network calculations using NumPy
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import json

app = FastAPI(title="DeepLab 3D API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# Activation functions
# ──────────────────────────────────────────────
def relu(x): return np.maximum(0, x)
def leaky_relu(x): return np.where(x >= 0, x, 0.01 * x)
def elu(x): return np.where(x >= 0, x, np.exp(np.clip(x, -500, 0)) - 1)
def sigmoid(x): return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
def tanh_fn(x): return np.tanh(x)
def linear(x): return x
def softmax(x):
    e = np.exp(x - np.max(x))
    return e / e.sum()

ACTIVATIONS = {
    "relu": relu, "leaky_relu": leaky_relu, "elu": elu,
    "sigmoid": sigmoid, "tanh": tanh_fn, "linear": linear,
}
DERIV = {
    "relu": lambda x: (x > 0).astype(float),
    "leaky_relu": lambda x: np.where(x >= 0, 1, 0.01),
    "elu": lambda x: np.where(x >= 0, 1, np.exp(np.clip(x, -500, 0))),
    "sigmoid": lambda x: sigmoid(x) * (1 - sigmoid(x)),
    "tanh": lambda x: 1 - np.tanh(x)**2,
    "linear": lambda x: np.ones_like(x),
}


# ──────────────────────────────────────────────
# Request/Response models
# ──────────────────────────────────────────────
class TrainRequest(BaseModel):
    input_size: int = 2
    hidden_layers: List[dict] = [{"size": 4, "activation": "relu"}]
    output_size: int = 1
    output_activation: str = "sigmoid"
    optimizer: str = "adam"
    loss: str = "bce"
    learning_rate: float = 0.01
    epochs: int = 50
    batch_size: int = 16
    dataset: str = "xor"  # "xor" | "circle" | "spiral"

class TrainResponse(BaseModel):
    loss_history: List[float]
    acc_history: List[float]
    final_weights: List[List[List[float]]]
    final_biases: List[List[float]]


# ──────────────────────────────────────────────
# Dataset generators
# ──────────────────────────────────────────────
def gen_xor(n=200):
    X = np.random.randint(0, 2, (n, 2)).astype(float)
    X += np.random.randn(n, 2) * 0.1
    y = (X[:, 0].round().astype(int) ^ X[:, 1].round().astype(int)).reshape(-1, 1).astype(float)
    return X, y

def gen_circle(n=200):
    r = np.random.rand(n)
    a = np.random.rand(n) * 2 * np.pi
    X = np.column_stack([r * np.cos(a), r * np.sin(a)])
    y = (r < 0.5).reshape(-1, 1).astype(float)
    return X, y

def gen_spiral(n=200):
    k = n // 2
    theta = np.linspace(0, 4*np.pi, k)
    r = np.linspace(0.1, 1, k)
    X0 = np.column_stack([r*np.cos(theta), r*np.sin(theta)]) + np.random.randn(k, 2)*0.05
    X1 = np.column_stack([r*np.cos(theta+np.pi), r*np.sin(theta+np.pi)]) + np.random.randn(k, 2)*0.05
    X = np.vstack([X0, X1])
    y = np.vstack([np.zeros((k,1)), np.ones((k,1))])
    return X, y


# ──────────────────────────────────────────────
# Neural Network class (NumPy)
# ──────────────────────────────────────────────
class NeuralNet:
    def __init__(self, req: TrainRequest):
        self.req = req
        layer_defs = req.hidden_layers + [{"size": req.output_size, "activation": req.output_activation}]
        sizes = [req.input_size] + [l["size"] for l in layer_defs]
        self.activs = [l["activation"] for l in layer_defs]

        # He init for relu-family, Xavier otherwise
        self.W, self.b = [], []
        for i in range(len(sizes) - 1):
            act = self.activs[i]
            scale = np.sqrt(2/sizes[i]) if act in ("relu","leaky_relu","elu") else np.sqrt(1/sizes[i])
            self.W.append(np.random.randn(sizes[i], sizes[i+1]) * scale)
            self.b.append(np.zeros(sizes[i+1]))

        # Optimizer state
        self.vW = [np.zeros_like(w) for w in self.W]
        self.vb = [np.zeros_like(b) for b in self.b]
        self.sW = [np.zeros_like(w) for w in self.W]
        self.sb = [np.zeros_like(b) for b in self.b]
        self.t = 0

    def forward(self, x):
        self.zs, self.as_ = [], [x]
        cur = x
        for i, (W, b) in enumerate(zip(self.W, self.b)):
            z = cur @ W + b
            self.zs.append(z)
            a = ACTIVATIONS[self.activs[i]](z)
            self.as_.append(a)
            cur = a
        return cur

    def loss(self, pred, target):
        eps = 1e-7
        n = pred.shape[0]
        fn = self.req.loss
        if fn == "mse":  return float(np.mean((pred - target)**2))
        if fn == "mae":  return float(np.mean(np.abs(pred - target)))
        if fn == "bce":  return float(-np.mean(target*np.log(pred+eps) + (1-target)*np.log(1-pred+eps)))
        if fn == "cce":  return float(-np.mean(np.sum(target*np.log(pred+eps), axis=1)))
        return 0.0

    def loss_grad(self, pred, target):
        eps = 1e-7
        n = pred.shape[0]
        fn = self.req.loss
        if fn == "mse":  return 2*(pred - target)/n
        if fn == "mae":  return np.sign(pred - target)/n
        if fn == "bce":  return (-target/(pred+eps) + (1-target)/(1-pred+eps))/n
        if fn == "cce":  return (pred - target)/n  # softmax+CCE
        return pred - target

    def backward(self, x, target):
        pred = self.as_[-1]
        delta = self.loss_grad(pred, target) * DERIV[self.activs[-1]](self.zs[-1])
        dWs, dbs = [None]*len(self.W), [None]*len(self.b)
        dWs[-1] = self.as_[-2].T @ delta
        dbs[-1] = delta.sum(axis=0)

        for i in range(len(self.W)-2, -1, -1):
            delta = (delta @ self.W[i+1].T) * DERIV[self.activs[i]](self.zs[i])
            dWs[i] = self.as_[i].T @ delta
            dbs[i] = delta.sum(axis=0)
        return dWs, dbs

    def update(self, dWs, dbs):
        lr = self.req.learning_rate
        opt = self.req.optimizer
        eps = 1e-8
        b1, b2 = 0.9, 0.999
        if opt == "adam": self.t += 1

        for i in range(len(self.W)):
            gW, gb = dWs[i], dbs[i]
            if opt == "sgd":
                self.W[i] -= lr * gW
                self.b[i] -= lr * gb
            elif opt == "momentum":
                self.vW[i] = 0.9*self.vW[i] + gW
                self.vb[i] = 0.9*self.vb[i] + gb
                self.W[i] -= lr * self.vW[i]
                self.b[i] -= lr * self.vb[i]
            elif opt == "rmsprop":
                self.sW[i] = 0.9*self.sW[i] + 0.1*gW**2
                self.sb[i] = 0.9*self.sb[i] + 0.1*gb**2
                self.W[i] -= lr * gW / (np.sqrt(self.sW[i]) + eps)
                self.b[i] -= lr * gb / (np.sqrt(self.sb[i]) + eps)
            elif opt == "adam":
                self.vW[i] = b1*self.vW[i] + (1-b1)*gW
                self.vb[i] = b1*self.vb[i] + (1-b1)*gb
                self.sW[i] = b2*self.sW[i] + (1-b2)*gW**2
                self.sb[i] = b2*self.sb[i] + (1-b2)*gb**2
                mW = self.vW[i]/(1-b1**self.t)
                mb = self.vb[i]/(1-b1**self.t)
                vW = self.sW[i]/(1-b2**self.t)
                vb = self.sb[i]/(1-b2**self.t)
                self.W[i] -= lr * mW / (np.sqrt(vW) + eps)
                self.b[i] -= lr * mb / (np.sqrt(vb) + eps)


# ──────────────────────────────────────────────
# API Endpoints
# ──────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "DeepLab 3D API"}

@app.post("/api/train")
def train_network(req: TrainRequest):
    datasets = {"xor": gen_xor, "circle": gen_circle, "spiral": gen_spiral}
    X, y = datasets.get(req.dataset, gen_xor)(400)

    net = NeuralNet(req)
    loss_hist, acc_hist = [], []

    for ep in range(req.epochs):
        idx = np.random.choice(len(X), req.batch_size, replace=False)
        xb, yb = X[idx], y[idx]
        pred = net.forward(xb)
        dWs, dbs = net.backward(xb, yb)
        net.update(dWs, dbs)

        if ep % max(1, req.epochs // 40) == 0:
            full_pred = net.forward(X)
            l = net.loss(full_pred, y)
            acc = float(np.mean((full_pred.round() == y)))
            loss_hist.append(round(l, 5))
            acc_hist.append(round(acc, 4))

    return TrainResponse(
        loss_history=loss_hist,
        acc_history=acc_hist,
        final_weights=[[row.tolist() for row in w] for w in net.W],
        final_biases=[b.tolist() for b in net.b],
    )

@app.post("/api/activation")
def compute_activation(body: dict):
    fn = body.get("fn", "relu")
    xs = np.array(body.get("xs", []))
    vals = ACTIVATIONS.get(fn, relu)(xs)
    derivs = DERIV.get(fn, DERIV["relu"])(xs)
    return {"values": vals.tolist(), "derivatives": derivs.tolist()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
