// Real Neural Network Math Engine - JavaScript implementation
// Mirrors TensorFlow/Keras/PyTorch logic

export type ActivationFn = 'relu' | 'leaky_relu' | 'elu' | 'sigmoid' | 'tanh' | 'linear'
export type OptimizerType = 'sgd' | 'momentum' | 'rmsprop' | 'adam'
export type LossFn = 'mse' | 'mae' | 'bce' | 'cce'

// ---------- Activations ----------
export const activations = {
  relu: (x: number) => Math.max(0, x),
  leaky_relu: (x: number) => x >= 0 ? x : 0.01 * x,
  elu: (x: number) => x >= 0 ? x : Math.exp(x) - 1,
  sigmoid: (x: number) => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))),
  tanh: (x: number) => Math.tanh(x),
  linear: (x: number) => x,
}

export const activationDerivatives = {
  relu: (x: number) => x > 0 ? 1 : 0,
  leaky_relu: (x: number) => x >= 0 ? 1 : 0.01,
  elu: (x: number) => x >= 0 ? 1 : Math.exp(x),
  sigmoid: (x: number) => { const s = activations.sigmoid(x); return s * (1 - s) },
  tanh: (x: number) => 1 - Math.tanh(x) ** 2,
  linear: (_: number) => 1,
}

// ---------- Matrix math ----------
export function matMul(A: number[][], B: number[][]): number[][] {
  const rows = A.length, cols = B[0].length, inner = B.length
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) =>
      Array.from({ length: inner }, (__, k) => A[i][k] * B[k][j]).reduce((a, b) => a + b, 0)
    )
  )
}

export function addVec(a: number[], b: number[]): number[] {
  return a.map((v, i) => v + b[i])
}

export function applyActivation(vec: number[], fn: ActivationFn): number[] {
  return vec.map(activations[fn])
}

export function softmax(vec: number[]): number[] {
  const max = Math.max(...vec)
  const exp = vec.map(v => Math.exp(v - max))
  const sum = exp.reduce((a, b) => a + b, 0)
  return exp.map(v => v / sum)
}

// ---------- He / Xavier init ----------
export function initWeights(rows: number, cols: number, activation: ActivationFn): number[][] {
  const scale = activation === 'relu' || activation === 'leaky_relu' || activation === 'elu'
    ? Math.sqrt(2 / rows)   // He init
    : Math.sqrt(1 / rows)   // Xavier init
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() * 2 - 1) * scale)
  )
}

export function initBias(size: number): number[] {
  return new Array(size).fill(0)
}

// ---------- Loss functions ----------
export function computeLoss(pred: number[], target: number[], fn: LossFn): number {
  const eps = 1e-7
  switch (fn) {
    case 'mse':
      return pred.reduce((s, p, i) => s + (p - target[i]) ** 2, 0) / pred.length
    case 'mae':
      return pred.reduce((s, p, i) => s + Math.abs(p - target[i]), 0) / pred.length
    case 'bce':
      return -pred.reduce((s, p, i) => {
        const t = target[i]
        return s + t * Math.log(Math.max(p, eps)) + (1 - t) * Math.log(Math.max(1 - p, eps))
      }, 0) / pred.length
    case 'cce':
      return -pred.reduce((s, p, i) => s + target[i] * Math.log(Math.max(p, eps)), 0)
  }
}

export function lossGradient(pred: number[], target: number[], fn: LossFn): number[] {
  const n = pred.length
  const eps = 1e-7
  switch (fn) {
    case 'mse':  return pred.map((p, i) => 2 * (p - target[i]) / n)
    case 'mae':  return pred.map((p, i) => (p > target[i] ? 1 : -1) / n)
    case 'bce':  return pred.map((p, i) =>
      (-target[i] / Math.max(p, eps) + (1 - target[i]) / Math.max(1 - p, eps)) / n
    )
    case 'cce':  return pred.map((p, i) => p - target[i]) // softmax+CCE combined
  }
}

// ---------- Network types ----------
export interface LayerState {
  z: number[]       // pre-activation
  a: number[]       // post-activation
  weights: number[][] // [in x out]
  biases: number[]
  delta: number[]
  weightGrads: number[][]
  biasGrads: number[]
}

export interface NetworkConfig {
  inputSize: number
  hiddenLayers: { size: number; activation: ActivationFn }[]
  outputSize: number
  outputActivation: ActivationFn
  optimizer: OptimizerType
  loss: LossFn
  learningRate: number
}

export interface OptimizerState {
  vW: number[][][]   // momentum / v for adam
  vB: number[][]
  sW: number[][][]   // rmsprop second moment / s for adam
  sB: number[][]
  t: number          // adam timestep
}

// ---------- Build network ----------
export function buildNetwork(cfg: NetworkConfig): LayerState[] {
  const sizes = [cfg.inputSize, ...cfg.hiddenLayers.map(l => l.size), cfg.outputSize]
  const activs = [...cfg.hiddenLayers.map(l => l.activation), cfg.outputActivation]
  return sizes.slice(1).map((size, i) => {
    const inSize = sizes[i]
    return {
      z: new Array(size).fill(0),
      a: new Array(size).fill(0),
      weights: initWeights(inSize, size, activs[i]),
      biases: initBias(size),
      delta: new Array(size).fill(0),
      weightGrads: Array.from({ length: inSize }, () => new Array(size).fill(0)),
      biasGrads: new Array(size).fill(0),
    }
  })
}

export function buildOptimizerState(layers: LayerState[]): OptimizerState {
  return {
    vW: layers.map(l => l.weights.map(row => new Array(row.length).fill(0))),
    vB: layers.map(l => new Array(l.biases.length).fill(0)),
    sW: layers.map(l => l.weights.map(row => new Array(row.length).fill(0))),
    sB: layers.map(l => new Array(l.biases.length).fill(0)),
    t: 0,
  }
}

// ---------- Forward pass ----------
export function forwardPass(
  input: number[],
  layers: LayerState[],
  cfg: NetworkConfig
): number[] {
  const activs = [...cfg.hiddenLayers.map(l => l.activation), cfg.outputActivation]
  let current = input
  layers.forEach((layer, li) => {
    layer.z = layer.biases.map((b, j) =>
      b + current.reduce((s, a, i) => s + a * layer.weights[i][j], 0)
    )
    layer.a = applyActivation(layer.z, activs[li])
    if (cfg.outputActivation === 'sigmoid' && li === layers.length - 1 && cfg.loss === 'cce') {
      layer.a = softmax(layer.z)
    }
    current = layer.a
  })
  return current
}

// ---------- Backward pass ----------
export function backwardPass(
  input: number[],
  target: number[],
  layers: LayerState[],
  cfg: NetworkConfig
): void {
  const activs = [...cfg.hiddenLayers.map(l => l.activation), cfg.outputActivation]
  const n = layers.length

  // Output layer delta
  const outDelta = lossGradient(layers[n - 1].a, target, cfg.loss)
  layers[n - 1].delta = outDelta.map((d, j) =>
    d * activationDerivatives[activs[n - 1]](layers[n - 1].z[j])
  )

  // Hidden layers
  for (let li = n - 2; li >= 0; li--) {
    layers[li].delta = layers[li].a.map((_, j) => {
      const sum = layers[li + 1].delta.reduce((s, d, k) => s + d * layers[li + 1].weights[j][k], 0)
      return sum * activationDerivatives[activs[li]](layers[li].z[j])
    })
  }

  // Compute gradients
  const inputs = [input, ...layers.slice(0, -1).map(l => l.a)]
  layers.forEach((layer, li) => {
    layer.weightGrads = layer.weights.map((_, i) =>
      layer.delta.map(d => d * inputs[li][i])
    )
    layer.biasGrads = [...layer.delta]
  })
}

// ---------- Optimizer update ----------
export function updateWeights(
  layers: LayerState[],
  opt: OptimizerState,
  cfg: NetworkConfig
): void {
  const lr = cfg.learningRate
  const beta1 = 0.9, beta2 = 0.999, eps = 1e-8

  if (cfg.optimizer === 'adam') opt.t++

  layers.forEach((layer, li) => {
    layer.weights = layer.weights.map((row, i) =>
      row.map((w, j) => {
        const g = layer.weightGrads[i][j]
        switch (cfg.optimizer) {
          case 'sgd':
            return w - lr * g
          case 'momentum':
            opt.vW[li][i][j] = 0.9 * opt.vW[li][i][j] + g
            return w - lr * opt.vW[li][i][j]
          case 'rmsprop':
            opt.sW[li][i][j] = 0.9 * opt.sW[li][i][j] + 0.1 * g * g
            return w - lr * g / (Math.sqrt(opt.sW[li][i][j]) + eps)
          case 'adam':
            opt.vW[li][i][j] = beta1 * opt.vW[li][i][j] + (1 - beta1) * g
            opt.sW[li][i][j] = beta2 * opt.sW[li][i][j] + (1 - beta2) * g * g
            const mHat = opt.vW[li][i][j] / (1 - beta1 ** opt.t)
            const vHat = opt.sW[li][i][j] / (1 - beta2 ** opt.t)
            return w - lr * mHat / (Math.sqrt(vHat) + eps)
        }
      })
    )
    layer.biases = layer.biases.map((b, j) => {
      const g = layer.biasGrads[j]
      switch (cfg.optimizer) {
        case 'sgd': return b - lr * g
        case 'momentum':
          opt.vB[li][j] = 0.9 * opt.vB[li][j] + g
          return b - lr * opt.vB[li][j]
        case 'rmsprop':
          opt.sB[li][j] = 0.9 * opt.sB[li][j] + 0.1 * g * g
          return b - lr * g / (Math.sqrt(opt.sB[li][j]) + eps)
        case 'adam':
          opt.vB[li][j] = beta1 * opt.vB[li][j] + (1 - beta1) * g
          opt.sB[li][j] = beta2 * opt.sB[li][j] + (1 - beta2) * g * g
          const mHat = opt.vB[li][j] / (1 - beta1 ** opt.t)
          const vHat = opt.sB[li][j] / (1 - beta2 ** opt.t)
          return b - lr * mHat / (Math.sqrt(vHat) + eps)
      }
    })
  })
}

// ---------- Generate training data ----------
export function generateXORData(n = 200): { inputs: number[][], targets: number[][] } {
  const inputs: number[][] = [], targets: number[][] = []
  for (let i = 0; i < n; i++) {
    const x1 = Math.random() > 0.5 ? 1 : 0
    const x2 = Math.random() > 0.5 ? 1 : 0
    inputs.push([x1, x2])
    targets.push([x1 ^ x2])
  }
  return { inputs, targets }
}

export function generateCircleData(n = 200): { inputs: number[][], targets: number[][] } {
  const inputs: number[][] = [], targets: number[][] = []
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * 2 * Math.PI
    const r = Math.random()
    const noise = (Math.random() - 0.5) * 0.1
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    inputs.push([x, y])
    targets.push([r < 0.5 + noise ? 1 : 0])
  }
  return { inputs, targets }
}
