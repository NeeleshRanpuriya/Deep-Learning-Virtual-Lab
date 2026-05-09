📚 DeepLab 3D – Interactive Deep Learning Visualizer
Home Page

🗂️ Table of Contents
Overview
Features
Real Neural Network Logic
Technologies Used
How It Works
Screenshots
Installation and Setup
Backend API Endpoints
Future Enhancements
Developer Info
License
Acknowledgments
📖 Overview
DeepLab 3D is an interactive educational platform for learning Deep Learning concepts through real canvas animations. The system provides hands-on exploration of neural networks, convolutional architectures, recurrent models, and generative systems with actual mathematical computations running in real-time.

Developed During: Interactive learning platform showcasing real neural network mathematics and visualizations.

Stack: React 18 + Vite + Tailwind CSS (Frontend) · Python FastAPI + NumPy (Backend)

Design: Clean light theme UI with animations focused exclusively within canvas/visualization areas.

✨ Features

🧠 Chapter I – Foundations of Deep Learning
Perceptron Lab: Animated single neuron with weighted sum, bias, and activation visualization
NN Builder: Full neural network builder with real forward/backward propagation animations. Users can set layers, neurons, activation, optimizer, loss, learning rate, epochs, batch size.
Activation Functions: Interactive graph showing f(x) and f'(x) for ReLU, Leaky ReLU, ELU, Sigmoid, Tanh, Linear
Optimizer Comparison: Side-by-side SGD vs Momentum vs RMSProp vs Adam on Rosenbrock loss landscape
Loss Curves: Train vs Validation loss curve visualization
Overfitting/Underfitting: Polynomial regression demo with adjustable model complexity

🏗️ Chapter II – Deep Network Architectures
Width vs Depth: Visualize how changing width/neurons vs depth/layers changes the network
Representation Learning: How deep networks transform non-linearly-separable data into separable representations
RBM Visualizer: Restricted Boltzmann Machine with Contrastive Divergence animation (positive/negative phase)
Basic Autoencoder: Layered autoencoder animation showing encode → latent → decode flow

🎨 Chapter III – Convolutional Neural Networks
CNN Architecture: 3D block-diagram visualization for AlexNet, ResNet, DenseNet, PixelNet
Filter Sliding: Real animation of a convolutional filter sliding over input, generating feature map
Feature Maps: Multi-filter feature map visualization (edge, texture, color, Gabor)
Parameter Sharing: Visual comparison of CNN parameter sharing vs fully connected

🔄 Chapter IV – Recurrent Neural Networks
RNN Unrolled: Step-by-step sequence processing animation
Bidirectional RNN: Forward (→) and backward (←) pass animations
Seq2Seq: Encoder → Context Vector → Decoder animation
BPTT: Backpropagation through time gradient flow visualization
LSTM Gates: Interactive gate controls (Forget, Input, Cell, Output) with real LSTM math

✨ Chapter V – Generative & Unsupervised Models
Autoencoder: Input → Encoder → Latent Space → Decoder → Output with scatter plot visualization
GAN Trainer: Generator vs Discriminator training cycle animation with generated samples
Boltzmann Machine: Energy landscape + Boltzmann distribution at different temperatures
Deep Belief Network (DBN): Greedy layer-wise pre-training visualization
Deep Boltzmann Machine (DBM): Bidirectional connections visualization

💡 Real Neural Network Logic
All neural network computations are real math (not fake UI):
Weight initialization: He init (ReLU family), Xavier (sigmoid/tanh)
Forward propagation: z = Wx + b, a = f(z)
Backpropagation: Chain rule gradient computation
Optimizers: SGD, Momentum, RMSProp, Adam (real update rules)
Loss functions: MSE, MAE, Binary CE, Categorical CE
Activation functions: ReLU, Leaky ReLU, ELU, Sigmoid, Tanh, Linear + derivatives

🛠️ Technologies Used

Programming Languages and Libraries
Frontend:
React 18
Vite (build tool)
Tailwind CSS
React Router
HTML5 Canvas API
Recharts (visualization)

Backend & Computing:
Python
FastAPI (web framework)
NumPy (numerical computations)

Development & Deployment:
PM2 (process manager)
Vercel (frontend deployment)

⚙️ How It Works

1. Interactive Lab Selection:
Users navigate to their desired chapter and lab.
Clean UI presents interactive controls and parameter inputs.

2. Real-Time Computation:
Frontend sends parameters to backend API.
Backend performs actual neural network mathematics using NumPy.
Results stream back to frontend for visualization.

3. Canvas Animation:
HTML5 Canvas renders animations of:
Forward/backward propagation
Weight updates
Feature maps
Activation flows

4. Educational Feedback:
Real-time loss/accuracy tracking.
Parameter adjustment with instant visual feedback.
Formulas and explanations integrated into interface.

🖼️ Screenshots
[Screenshots section - Add images of:
1. Home Page
2. Perceptron Lab
3. NN Builder
4. Activation Functions Lab
5. CNN Filter Visualization
6. RNN Architecture
7. GAN Trainer
8. Loss Curve Visualization
9. Feature Maps
10. Interactive Controls]

🛠️ Installation and Setup

Clone the repository:
```bash
git clone <repository-url>
cd deep-learning-virtual-lab
```

Install frontend dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
cd ..
```

Start both services:
```bash
pm2 start ecosystem.config.cjs
```

Check status:
```bash
pm2 list
```

View logs:
```bash
pm2 logs deeplab-frontend --nostream
pm2 logs deeplab-backend --nostream
```

Access the application:
Open your browser and navigate to https://deep-learning-virtual-lab.vercel.app/

Backend API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| POST | /api/train | Train neural network (returns loss/acc history) |
| POST | /api/activation | Compute activation values and derivatives |

Technology Stack Summary
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Canvas | HTML5 Canvas API (all animations) |
| Charts | Recharts |
| Backend | Python FastAPI |
| NN Math | NumPy |
| Process Manager | PM2 |

🚀 Future Enhancements
Advanced analytics for network training trends
GPU acceleration support for backend computations
Mobile app integration
Interactive quiz and assessment modules
3D visualization for deeper network layers
Export/import trained models
Community lab contributions feature
Expanded activation function library
Real dataset training integration

👨‍💻 Developer Info
Created as an interactive educational platform for deep learning concepts.

For inquiries or collaborations, please reach out via the repository.
