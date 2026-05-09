# 📚 DeepLab 3D – Interactive Deep Learning Visualizer

---

## 🗂️ Table of Contents

- [📖 Overview](#-overview)
- [✨ Features](#-features)
- [🧠 Real Neural Network Logic](#-real-neural-network-logic)
- [🛠️ Technologies Used](#️-technologies-used)
- [⚙️ How It Works](#️-how-it-works)
- [🛠️ Installation and Setup](#️-installation-and-setup)
- [🔌 Backend API Endpoints](#-backend-api-endpoints)
- [🚀 Future Enhancements](#-future-enhancements)
- [👨‍💻 Developer Info](#-developer-info)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

---

## 📖 Overview

DeepLab 3D transforms abstract deep learning concepts into interactive visual experiments. Each lab runs actual neural network mathematics (forward/backward propagation, optimizers, loss functions) and visualises them using HTML5 Canvas. The platform is structured into five chapters, covering everything from the perceptron to generative models.

**Developed During:** Interactive learning platform showcasing real neural network mathematics and visualizations.

---

## ✨ Features

### 🧠 Chapter I – Foundations of Deep Learning
- **Perceptron Lab** – Animated single neuron with weighted sum, bias, and activation visualisation.
- **NN Builder** – Full neural network builder with real forward/backward propagation animations. Set layers, neurons, activation, optimizer, loss, learning rate, epochs, batch size.
- **Activation Functions** – Interactive graph showing `f(x)` and `f'(x)` for ReLU, Leaky ReLU, ELU, Sigmoid, Tanh, Linear.
- **Optimizer Comparison** – Side‑by‑side SGD vs Momentum vs RMSProp vs Adam on the Rosenbrock loss landscape.
- **Loss Curves** – Train vs validation loss curve visualisation.
- **Overfitting/Underfitting** – Polynomial regression demo with adjustable model complexity.

### 🏗️ Chapter II – Deep Network Architectures
- **Width vs Depth** – Visualise how changing neurons (width) vs layers (depth) changes the network.
- **Representation Learning** – See how deep networks transform non‑linearly separable data into separable representations.
- **RBM Visualizer** – Restricted Boltzmann Machine with Contrastive Divergence animation (positive/negative phase).
- **Basic Autoencoder** – Layered autoencoder animation showing encode → latent → decode flow.

### 🎨 Chapter III – Convolutional Neural Networks
- **CNN Architecture** – 3D block‑diagram visualisation for AlexNet, ResNet, DenseNet, PixelNet.
- **Filter Sliding** – Real animation of a convolutional filter sliding over input, generating feature maps.
- **Feature Maps** – Multi‑filter feature map visualisation (edge, texture, colour, Gabor).
- **Parameter Sharing** – Visual comparison of CNN parameter sharing vs fully connected.

### 🔄 Chapter IV – Recurrent Neural Networks
- **RNN Unrolled** – Step‑by‑step sequence processing animation.
- **Bidirectional RNN** – Forward (→) and backward (←) pass animations.
- **Seq2Seq** – Encoder → Context Vector → Decoder animation.
- **BPTT** – Backpropagation through time gradient flow visualisation.
- **LSTM Gates** – Interactive gate controls (Forget, Input, Cell, Output) with real LSTM math.

### ✨ Chapter V – Generative & Unsupervised Models
- **Autoencoder** – Input → Encoder → Latent Space → Decoder → Output with scatter plot visualisation.
- **GAN Trainer** – Generator vs Discriminator training cycle animation with generated samples.
- **Boltzmann Machine** – Energy landscape + Boltzmann distribution at different temperatures.
- **Deep Belief Network (DBN)** – Greedy layer‑wise pre‑training visualisation.
- **Deep Boltzmann Machine (DBM)** – Bidirectional connections visualisation.

---

## 🧠 Real Neural Network Logic

All neural network computations are **real math**, not fake UI animations:

- **Weight initialisation** – He init (ReLU family), Xavier (sigmoid/tanh).
- **Forward propagation** – `z = Wx + b`, `a = f(z)`.
- **Backpropagation** – Chain rule gradient computation.
- **Optimizers** – SGD, Momentum, RMSProp, Adam (real update rules).
- **Loss functions** – MSE, MAE, Binary Cross‑Entropy, Categorical Cross‑Entropy.
- **Activation functions** – ReLU, Leaky ReLU, ELU, Sigmoid, Tanh, Linear + their derivatives.

---

## 🛠️ Technologies Used

| Layer          | Technology                                                                 |
|----------------|----------------------------------------------------------------------------|
| **Frontend**   | React 18, Vite, Tailwind CSS, React Router                                 |
| **Canvas**     | HTML5 Canvas API (all animations)                                          |
| **Charts**     | Recharts                                                                   |
| **Backend**    | Python FastAPI                                                             |
| **NN Math**    | NumPy                                                                      |
| **Process Mgr**| PM2                                                                        |
| **Deployment** | Vercel (frontend)                                                          |

---

## ⚙️ How It Works

1. **Interactive Lab Selection** – Users choose a chapter and lab; the UI presents controls and parameter inputs.
2. **Real‑Time Computation** – The frontend sends parameters to the backend API. The backend performs actual neural network mathematics using NumPy and streams results back.
3. **Canvas Animation** – HTML5 Canvas renders animations of forward/backward propagation, weight updates, feature maps, activation flows, etc.
4. **Educational Feedback** – Real‑time loss/accuracy tracking, parameter adjustment with instant visual feedback, and integrated formulas/ explanations.

---
