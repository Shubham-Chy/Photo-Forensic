# 🔬 PHOTO FORENSIC LABORATORY

![License](https://img.shields.io/badge/License-MIT-black?style=for-the-badge)
![Engine](https://img.shields.io/badge/Engine-Gemini_2.5_/_3.0-white?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Stable-lightgrey?style=for-the-badge)
![UI](https://img.shields.io/badge/Design-Minimalist_Noir-black?style=for-the-badge)

**Photo Forensic** is a professional-grade digital image investigation suite. It leverages the Google Gemini API to provide deep semantic analysis, neural reconstruction, and highlight isolation within a high-contrast, monochromatic interface.

---

## 🛠 CORE MODULES

### 1. [INSPECTOR] - Deep Forensic Analysis
Utilizes `gemini-3-pro-preview` and Google Search Grounding to decode the "why" and "where" of an image.
- **EXIF Extraction**: Identifies camera hardware, software builds, and timestamps.
- **Neural Briefing**: Generates a professional linguistic report of subject matter and technical vectors.
- **Audio Uplink**: Converts forensic reports to cold, professional audio briefings.

### 2. [SYNTHESIZER] - High-Fidelity Generation
Harnesses `gemini-3-pro-image-preview` for the creation of stark, artistic monochromatic assets.
- **Geometry Control**: Define aspect ratios (1:1, 16:9, 9:16).
- **Density Scaling**: Generate 1K, 2K, or 4K high-resolution outputs.

### 3. [MODIFIER] - Semantic Reconstruction
Powered by `gemini-2.5-flash-image` for natural language image manipulation.
- **Reconstruction**: Add, remove, or transform elements using text prompts.
- **Diff Slider**: Compare original vs. reconstructed artifacts in real-time.

---

## 📸 GENERATION PREVIEW
The laboratory specializes in the **Nano Banana** (Gemini 2.5/3.0) series for image synthesis. 

> **PROMPT**: *"A stark minimalist monolith standing in a dark desert, high contrast, film grain, noir style."*

| Stage | Process | Output Type |
| :--- | :--- | :--- |
| **Input** | Latent Space Calibration | Noise Matrix |
| **Neural** | Denoising Sequence | High Contrast Grayscale |
| **Export** | Artifact Finalization | **[VIEW_RESULT]** |

---

## 🚀 INSTALLATION PROCESS

### 1. Prerequisites
- Node.js (Latest LTS recommended)
- A valid Google Gemini API Key (obtain from [Google AI Studio](https://aistudio.google.com/))

### 2. Clone the Repository
```bash
git clone https://github.com/your-repo/photo-forensic.git
cd photo-forensic
```

### 3. Environment Configuration
Copy the example environment file and populate it with your credentials.
```bash
cp .env_example .env
```
*Note: For the **Neural Uplink** and **Synthesizer** modules, ensure your API Key is linked to a project with billing enabled.*

### 4. Dependency Deployment
```bash
npm install
```

### 5. Launch Protocol
```bash
npm run dev
```

---

## ⌨️ TERMINAL COMMANDS
The built-in system terminal allows for rapid navigation:
- `help`: Lists all available system protocols.
- `goto [view]`: Navigate to `analyze`, `generate`, `edit`, or `convert`.
- `status`: Check local uplink and encryption health.
- `whoami`: Verify current clearance level.

---

## 📜 LICENSE
MIT. For institutional and educational forensic research.

---
**SYSTEM_LOG**: *Uplink Stable. Forensic Node 0.0.1 Ready.*
