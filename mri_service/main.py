from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import os
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.utils import get_custom_objects
import tensorflow.keras.backend as K
import io
import sys

app = FastAPI()

# Add a root endpoint
@app.get("/")
async def root():
    return {"message": "Brain Tumor Detection API"}

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define custom metrics and loss functions
def dice_coefficient(y_true, y_pred, smooth=1e-6):
    y_true_f = K.flatten(y_true)
    y_pred_f = K.flatten(y_pred)
    intersection = K.sum(y_true_f * y_pred_f)
    return (2. * intersection + smooth) / (K.sum(y_true_f) + K.sum(y_pred_f) + smooth)

def dice_loss(y_true, y_pred):
    return 1 - dice_coefficient(y_true, y_pred)

def bce_dice_loss(y_true, y_pred):
    return K.binary_crossentropy(y_true, y_pred) + dice_loss(y_true, y_pred)

def iou_metric(y_true, y_pred, smooth=1e-6):
    intersection = K.sum(K.abs(y_true * y_pred))
    union = K.sum(y_true) + K.sum(y_pred) - intersection
    return (intersection + smooth) / (union + smooth)

# Register custom objects
custom_objects = {
    'bce_dice_loss': bce_dice_loss,
    'dice_loss': dice_loss,
    'dice_coefficient': dice_coefficient,
    'iou_metric': iou_metric
}

# Load the pre-trained models
try:
    with tf.keras.utils.custom_object_scope(custom_objects):
        segmentation_model = tf.keras.models.load_model('models/new_segmentation_model.h5')
        classification_model = tf.keras.models.load_model('models/new_classification_model.h5')
    print("Models loaded successfully")
except Exception as e:
    print(f"Error loading models: {e}")

# Class names for classification
class_names = ['Glioma', 'Meningioma', 'Pituitary', 'No Tumour']

@app.post("/process-mri/")
async def process_mri(file: UploadFile = File(...)):
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('L')  # Convert to grayscale
        
        # Preprocess image for segmentation
        image = image.resize((200, 200)).convert('L')
        image_array = np.array(image) / 255.0
        image_array = np.expand_dims(image_array, axis=(0, -1))
        
        # Perform segmentation
        segmentation = segmentation_model.predict(image_array)
        
        # Preprocess image for classification
        image = image.resize((200, 200)).convert('RGB')
        image_array = np.array(image) / 255.0
        image_array = np.expand_dims(image_array, axis=0)
        
        # Perform classification
        classification = classification_model.predict(image_array)
        classification_label = np.argmax(classification, axis=1)[0]
        
        return {
            "status": "success",
            "segmentation": segmentation.tolist(),
            "classification": class_names[classification_label]
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080) 