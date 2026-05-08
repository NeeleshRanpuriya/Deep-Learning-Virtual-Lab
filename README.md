# DeepLab 3D – Interactive Deep Learning Visualizer

## Project Overview
- **Name**: DeepLab 3D
- **Goal**: Interactive educational platform for learning Deep Learning concepts through real canvas animations
- **Stack**: React 18 + Vite + Tailwind CSS (Frontend) · Python FastAPI + NumPy (Backend)
- **Design**: Clean light theme UI, animations ONLY inside canvas/visualization areas

## Live URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Features

### Unit I – Foundations of Deep Learning
- **Perceptron Lab**: Animated single neuron with weighted sum, bias, and activation visualization
- **NN Builder**: Full neural network builder with real forward/backward propagation animations. Users can set layers, neurons, activation, optimizer, loss, learning rate, epochs, batch size.
- **Activation Functions**: Interactive graph showing f(x) and f'(x) for ReLU, Leaky ReLU, ELU, Sigmoid, Tanh, Linear
- **Optimizer Comparison**: Side-by-side SGD vs Momentum vs RMSProp vs Adam on Rosenbrock loss landscape
- **Loss Curves**: Train vs Validation loss curve visualization
- **Overfitting/Underfitting**: Polynomial regression demo with adjustable model complexity

### Unit II – Deep Network Architectures
- **Width vs Depth**: Visualize how changing width/neurons vs depth/layers changes the network
- **Representation Learning**: How deep networks transform non-linearly-separable data into separable representations
- **RBM Visualizer**: Restricted Boltzmann Machine with Contrastive Divergence animation (positive/negative phase)
- **Basic Autoencoder**: Layered autoencoder animation showing encode → latent → decode flow

### Unit III – Convolutional Neural Networks
- **CNN Architecture**: 3D block-diagram visualization for AlexNet, ResNet, DenseNet, PixelNet
- **Filter Sliding**: Real animation of a convolutional filter sliding over input, generating feature map
- **Feature Maps**: Multi-filter feature map visualization (edge, texture, color, Gabor)
- **Parameter Sharing**: Visual comparison of CNN parameter sharing vs fully connected

### Unit IV – Recurrent Neural Networks
- **RNN Unrolled**: Step-by-step sequence processing animation
- **Bidirectional RNN**: Forward (→) and backward (←) pass animations
- **Seq2Seq**: Encoder → Context Vector → Decoder animation
- **BPTT**: Backpropagation through time gradient flow visualization
- **LSTM Gates**: Interactive gate controls (Forget, Input, Cell, Output) with real LSTM math

### Unit V – Generative & Unsupervised Models
- **Autoencoder**: Input → Encoder → Latent Space → Decoder → Output with scatter plot visualization
- **GAN Trainer**: Generator vs Discriminator training cycle animation with generated samples
- **Boltzmann Machine**: Energy landscape + Boltzmann distribution at different temperatures
- **Deep Belief Network (DBN)**: Greedy layer-wise pre-training visualization
- **Deep Boltzmann Machine (DBM)**: Bidirectional connections visualization

## Real Neural Network Logic
All neural network computations are real math (not fake UI):
- **Weight initialization**: He init (ReLU family), Xavier (sigmoid/tanh)
- **Forward propagation**: z = Wx + b, a = f(z)
- **Backpropagation**: Chain rule gradient computation
- **Optimizers**: SGD, Momentum, RMSProp, Adam (real update rules)
- **Loss functions**: MSE, MAE, Binary CE, Categorical CE
- **Activation functions**: ReLU, Leaky ReLU, ELU, Sigmoid, Tanh, Linear + derivatives

## Backend API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| POST | /api/train | Train neural network (returns loss/acc history) |
| POST | /api/activation | Compute activation values and derivatives |

## Running the Project
```bash
# Start both services
pm2 start ecosystem.config.cjs

# Check status
pm2 list

# Logs
pm2 logs deeplab-frontend --nostream
pm2 logs deeplab-backend --nostream
```

## Technology Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Canvas | HTML5 Canvas API (all animations) |
| Charts | Recharts |
| Backend | Python FastAPI |
| NN Math | NumPy |
| Process | PM2 |

## Design Philosophy
- **Simple clean UI**: White cards, slate background, blue accent, no neon/particles
- **Canvas-only animations**: All neural network animations run inside dedicated canvas areas
- **Real math**: JavaScript + Python NumPy implement actual NN forward/backward pass
- **Educational focus**: Every lab has explanations, formulas, and real-time parameter controls

## Deployment Status
- **Platform**: Sandbox (localhost)
- **Status**: ✅ Active
- **Last Updated**: 2026-05-08
