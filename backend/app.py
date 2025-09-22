from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import tensorflow.keras.backend as K
import tensorflow as tf
import base64
import io
import traceback
import time
from datetime import datetime
from werkzeug.utils import secure_filename
from openai import OpenAI
import json
from dotenv import load_dotenv

app = Flask(__name__)
# Configure maximum content length to 16MB
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept"],
        "max_age": 3600
    }
})

# Define custom metrics and loss functions
def dice_coefficient(y_true, y_pred, smooth=1e-6):
    y_true_f = K.flatten(y_true)
    y_pred_f = K.flatten(y_pred)
    intersection = K.sum(y_true_f * y_pred_f)
    return (2. * intersection + smooth) / (K.sum(y_true_f) + K.sum(y_pred_f) + smooth)

def dice_loss(y_true, y_pred):
    return 1 - dice_coefficient(y_true, y_pred)

def bce_dice_loss(y_true, y_pred):
    return tf.keras.losses.binary_crossentropy(y_true, y_pred) + dice_loss(y_true, y_pred)

def iou_metric(y_true, y_pred, smooth=1e-6):
    intersection = K.sum(K.abs(y_true * y_pred))
    union = K.sum(y_true) + K.sum(y_pred) - intersection
    return (intersection + smooth) / (union + smooth)

# Register custom objects
custom_objects = {
    'dice_coefficient': dice_coefficient,
    'dice_loss': dice_loss,
    'bce_dice_loss': bce_dice_loss,
    'iou_metric': iou_metric,
    'binary_crossentropy': tf.keras.losses.binary_crossentropy
}

# Get the absolute path to the models directory
current_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(current_dir, 'models')

# Model paths - FIXED: Corrected the swapped model paths
SEGMENTATION_MODEL_PATH = os.path.join(models_dir, "new_segmentation_model.h5")
CLASSIFICATION_MODEL_PATH = os.path.join(models_dir, "new_classification_model.h5")

print(f"Looking for models in: {models_dir}")
print(f"Segmentation model path: {SEGMENTATION_MODEL_PATH}")
print(f"Classification model path: {CLASSIFICATION_MODEL_PATH}")

# Create models directory if it doesn't exist
os.makedirs(models_dir, exist_ok=True)

# Load models
segmentation_model = None
classification_model = None

try:
    if not os.path.exists(SEGMENTATION_MODEL_PATH):
        print(f"Error: Segmentation model not found at {SEGMENTATION_MODEL_PATH}")
    else:
        print("Loading segmentation model...")
        tf.keras.utils.get_custom_objects().update(custom_objects)
        segmentation_model = load_model(SEGMENTATION_MODEL_PATH, compile=False)
        segmentation_model.compile(
            optimizer='adam',
            loss=bce_dice_loss,
            metrics=[dice_coefficient, iou_metric]
        )
        print("Segmentation model loaded successfully")
        print(f"Segmentation model input shape: {segmentation_model.input_shape}")

    if not os.path.exists(CLASSIFICATION_MODEL_PATH):
        print(f"Error: Classification model not found at {CLASSIFICATION_MODEL_PATH}")
    else:
        print("Loading classification model...")
        classification_model = load_model(CLASSIFICATION_MODEL_PATH)
        print("Classification model loaded successfully")
        print(f"Classification model input shape: {classification_model.input_shape}")

except Exception as e:
    print(f"Error loading models: {str(e)}")
    print(traceback.format_exc())

# Class names for classification
class_names = ['Glioma', 'Meningioma', 'Pituitary', 'No Tumour']

# Create data directories
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
UPLOADS_DIR = os.path.join(DATA_DIR, 'uploads')
MASKS_DIR = os.path.join(DATA_DIR, 'masks')
PATIENTS_JSON = os.path.join(DATA_DIR, 'patients.json')
SCANS_JSON = os.path.join(DATA_DIR, 'scans.json')

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(MASKS_DIR, exist_ok=True)
if not os.path.exists(PATIENTS_JSON):
    with open(PATIENTS_JSON, 'w') as f:
        json.dump([], f)
if not os.path.exists(SCANS_JSON):
    with open(SCANS_JSON, 'w') as f:
        json.dump([], f)

def read_json_list(path):
    try:
        with open(path, 'r') as f:
            return json.load(f)
    except Exception:
        return []

def write_json_list(path, data_list):
    with open(path, 'w') as f:
        json.dump(data_list, f)

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

def get_ai_response(message, scan_details=None):
    try:
        if not client:
            return "AI chat functionality is not available (API key missing)"
            
        system_prompt = """You are a helpful medical imaging AI assistant. You help users understand their brain scan analysis 
        results and provide general information about brain tumors. Always be professional, empathetic, and clear in your responses. 
        Do not make definitive medical diagnoses - always remind users to consult healthcare professionals for medical advice."""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ]
        
        if scan_details:
            messages.insert(1, {
                "role": "system",
                "content": f"Recent scan analysis shows: {json.dumps(scan_details)}"
            })

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=150,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error getting AI response: {str(e)}")
        return "I apologize, but I'm having trouble processing your request right now. Please try again later."

@app.route('/analyze', methods=['POST', 'OPTIONS'])
def analyze():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Accept')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response
        
    print("Received analyze request")
    
    if not TF_AVAILABLE:
        error_msg = "ML inference unavailable: TensorFlow failed to load. Install a compatible TensorFlow (e.g., 'pip install tensorflow-cpu') and required system dependencies."
        print(error_msg)
        return jsonify({'error': error_msg}), 503

    if segmentation_model is None or classification_model is None:
        error_msg = "Models not loaded. Please ensure model files are present in the models directory."
        print(error_msg)
        return jsonify({'error': error_msg}), 500

    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Read and process the image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))

        # Generate filename and save
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        base_filename = f"{timestamp}_scan.jpg"
        original_path = os.path.join(UPLOADS_DIR, base_filename)
        image.save(original_path)

        # Convert to RGB if needed
        if image.mode not in ['RGB', 'L']:
            image = image.convert('RGB')
            
        # Preprocess for segmentation
        image_seg = image.resize((128, 128)).convert('L')  # Convert to grayscale
        img_array_seg = np.array(image_seg) / 255.0
        img_array_seg = np.expand_dims(img_array_seg, axis=(0, -1))  # Shape: (1, 128, 128, 1)
        
        # Get segmentation mask
        mask = segmentation_model.predict(img_array_seg)[0]
        mask = (mask > 0.5).astype(np.uint8) * 255
        
        # Save segmentation mask
        mask_filename = f"mask_{base_filename}"
        mask_path = os.path.join(MASKS_DIR, mask_filename)
        mask_img = Image.fromarray(mask.squeeze(), mode='L')
        mask_img.save(mask_path)
        
        # Convert mask to base64
        buffer = io.BytesIO()
        mask_img.save(buffer, format='PNG')
        mask_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        # Preprocess for classification
        image_class = image.resize((200, 200)).convert('RGB')  # Ensure RGB
        img_array_class = np.array(image_class) / 255.0
        img_array_class = np.expand_dims(img_array_class, axis=0)  # Shape: (1, 200, 200, 3)

        # Get classification
        pred = classification_model.predict(img_array_class)
        class_idx = np.argmax(pred[0])
        confidence = float(pred[0][class_idx])

        # Convert original image to base64 for imageUrl
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG')
        image_base64 = f"data:image/jpeg;base64,{base64.b64encode(buffer.getvalue()).decode()}"

        # Format response
        response_data = {
            'classification': {
                'class': class_names[class_idx],
                'confidence': confidence
            },
            'segmentation_mask': mask_base64,
            'originalPath': original_path,
            'maskPath': mask_path,
            'imageUrl': image_base64,
            'error': None
        }
        return jsonify(response_data)

    except Exception as e:
        error_msg = f"Error processing image: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return jsonify({'error': error_msg}), 500

@app.route('/test-image', methods=['POST'])
def test_image():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Read and verify the image
        image_bytes = file.read()
        try:
            image = Image.open(io.BytesIO(image_bytes))

            # Test segmentation preprocessing
            image_seg = image.resize((128, 128)).convert('L')
            img_array_seg = np.array(image_seg) / 255.0
            img_array_seg = np.expand_dims(img_array_seg, axis=(0, -1))
            print("Segmentation preprocessing successful")
            print(f"Segmentation input shape: {img_array_seg.shape}")

            # Test classification preprocessing
            image_class = image.resize((200, 200)).convert('RGB')
            img_array_class = np.array(image_class) / 255.0
            img_array_class = np.expand_dims(img_array_class, axis=0)
            print("Classification preprocessing successful")
            print(f"Classification input shape: {img_array_class.shape}")

            # Save preprocessed images for verification
            seg_preview = Image.fromarray((img_array_seg[0, :, :, 0] * 255).astype(np.uint8))
            seg_buffer = io.BytesIO()
            seg_preview.save(seg_buffer, format='PNG')
            seg_base64 = base64.b64encode(seg_buffer.getvalue()).decode()

            class_preview = Image.fromarray((img_array_class[0] * 255).astype(np.uint8))
            class_buffer = io.BytesIO()
            class_preview.save(class_buffer, format='PNG')
            class_base64 = base64.b64encode(class_buffer.getvalue()).decode()

            return jsonify({
                'success': True,
                'message': 'Image preprocessing successful',
                'details': {
                    'original_size': image.size,
                    'original_mode': image.mode,
                    'segmentation_shape': img_array_seg.shape,
                    'classification_shape': img_array_class.shape,
                    'segmentation_preview': seg_base64,
                    'classification_preview': class_base64
                }
            })

        except Exception as e:
            print(f"Error processing test image: {str(e)}")
            print(traceback.format_exc())
            return jsonify({
                'error': 'Failed to process image',
                'details': str(e)
            }), 400

    except Exception as e:
        print(f"Test endpoint error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message')
        scan_details = data.get('scanDetails')
        
        print("Received chat request with scan details:", scan_details)
        
        headers = {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Headers': 'Content-Type',
        }

        if not OPENAI_API_KEY:
            print("Error: OpenAI API key not found")
            return jsonify({'error': 'OpenAI API key not configured'}), 500, headers

        if not client:
            return jsonify({'error': 'OpenAI client not initialized'}), 500, headers

        system_message = f"""You are a helpful medical imaging AI assistant. Current scan details:
        - Tumor Type: {scan_details.get('tumorType')}
        - Confidence: {scan_details.get('confidence')*100:.1f}%
        - Status: {'Tumor detected' if scan_details.get('hasTumor') else 'No tumor detected'}
        
        Provide clear, empathetic responses about the scan results. Always include appropriate medical disclaimers."""

        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": message}
                ],
                max_tokens=150,
                temperature=0.7
            )
            
            print("OpenAI response received successfully")
            return jsonify({'response': response.choices[0].message.content}), 200, headers
            
        except Exception as e:
            print(f"Error during OpenAI API call: {str(e)}")
            return jsonify({'error': f'OpenAI API error: {str(e)}'}), 500, headers
            
    except Exception as e:
        print(f"Chat endpoint error: {str(e)}")
        print(f"Full error details: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'running',
        'segmentation_model_loaded': segmentation_model is not None,
        'classification_model_loaded': classification_model is not None,
        'model_paths': {
            'segmentation': SEGMENTATION_MODEL_PATH,
            'classification': CLASSIFICATION_MODEL_PATH
        },
        'openai_available': OPENAI_API_KEY is not None
    })

@app.route('/data/<path:filename>')
def serve_file(filename):
    return send_from_directory(DATA_DIR, filename)

@app.route('/test-openai', methods=['GET'])
def test_openai():
    try:
        if not OPENAI_API_KEY:
            return jsonify({
                'status': 'error',
                'error': 'OpenAI API key not configured'
            }), 500
            
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a test assistant."},
                {"role": "user", "content": "Say 'OpenAI connection successful!'"}
            ],
            max_tokens=20
        )
        
        return jsonify({
            'status': 'success',
            'message': response.choices[0].message.content,
            'api_key_present': bool(OPENAI_API_KEY),
            'api_key_preview': f"{OPENAI_API_KEY[:10]}..." if OPENAI_API_KEY else None
        })
        
    except Exception as e:
        print(f"OpenAI test error: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'api_key_present': bool(OPENAI_API_KEY),
            'api_key_preview': f"{OPENAI_API_KEY[:10]}..." if OPENAI_API_KEY else None
        }), 500

if __name__ == '__main__':
    print("\nStarting Flask server...")
    print(f"Models directory: {models_dir}")
    print(f"Segmentation model path: {SEGMENTATION_MODEL_PATH}")
    print(f"Classification model path: {CLASSIFICATION_MODEL_PATH}")
    app.run(host='localhost', port=8080, debug=True)