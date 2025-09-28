---

# Brain Tumor Detection System

### Tumor Classification & Segmentation using Deep Learning with Web Deployment

---

## Overview

This project provides a complete system for brain tumor detection from MRI scans. It combines **deep learning models** with a **web-based interface** to deliver classification and segmentation functionalities.

* **Machine Learning Models (Python/Flask)**

  * Brain Tumor Classification (CNN)
  * Brain Tumor Segmentation (U-Net)

* **Web Front-End (Next.js)**

  * User-friendly interface for uploading MRI scans and viewing results.

* **Web Back-End (Node.js + Flask)**

  * Node.js API handles user requests, authentication, and communication with the ML service.
  * Flask serves the trained ML models for prediction and segmentation.

---

## System Architecture

```
           ┌─────────────────────┐
           │      Next.js UI     │
           │  (Frontend Client)  │
           └─────────┬──────────┘
                     │
         ┌───────────▼────────────┐
         │       Node.js API       │
         │ (Auth, REST endpoints) │
         └───────────┬────────────┘
                     │
         ┌───────────▼────────────┐
         │        Flask API        │
         │ (ML Models: CNN, U-Net) │
         └───────────┬────────────┘
                     │
         ┌───────────▼────────────┐
         │      ML Models          │
         │ Classification, Segmentation │
         └─────────────────────────┘
```

---

## Project Structure

```
Brain-Tumor-Detection-System
 ├── frontend/                          # Next.js web interface
 ├── backend-node/                      # Node.js API server
 ├── backend-flask/                     # Flask ML service (classification & segmentation)
 │   ├── ML Project 1 Brain_Tumor_classification.ipynb
 │   ├── ML Project 2 brain_tumor_segmentation.ipynb
 │   ├── models/                        # Saved models
 │   └── data/                          # Dataset (MRI scans)
 ├── results/                           # Example outputs
 ├── requirements.txt                   # Python dependencies
 ├── package.json                       # Node.js dependencies
 └── README.md                          # Project documentation
```

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone [https://github.com/yourusername/Brain-Tumor-Detection-System](https://github.com/ayelefransi/Advanced-Brain-Tumor-Detection-System-Using-Deep-Learning-Method.git
cd Advanced-Brain-Tumor-Detection-System-Using-Deep-Learning-Method
```

### 2. Set up the Flask ML backend

```bash
cd backend-flask
pip install -r requirements.txt
python app.py
```

### 3. Set up the Node.js backend

```bash
cd backend-node
npm install
npm start
```

### 4. Set up the Next.js frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Usage

1. Start Flask ML service (model server).
2. Start Node.js backend API.
3. Run Next.js frontend.
4. Open `http://localhost:3000` in your browser.
5. Upload an MRI image:

   * The system classifies tumor type (classification).
   * If requested, it returns a segmented tumor mask (segmentation).

---

## Results

* **Classification**: High accuracy across multiple tumor classes.
* **Segmentation**: Effective tumor localization with strong Dice score performance.
* Web application provides real-time visualization of results.

---

## Future Improvements

* Dockerize all services for easier deployment.
* Deploy to cloud (AWS/GCP/Azure).
* Add authentication and role-based access.
* Enable batch MRI analysis.
* Improve model explainability with Grad-CAM integration.

---

## Requirements

* Python ≥ 3.8 (Flask, TensorFlow/PyTorch, OpenCV, scikit-learn)
* Node.js ≥ 18 (Express, Axios)
* Next.js ≥ 13 (React, Tailwind CSS)

---

## License

This project is licensed under the MIT License.

---

