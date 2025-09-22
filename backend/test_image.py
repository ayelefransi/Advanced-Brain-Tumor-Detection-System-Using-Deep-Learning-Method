import requests
import sys
import json
import os
from PIL import Image

def test_image_processing(image_path):
    print(f"Testing image: {image_path}")
    
    # Validate file exists
    if not os.path.exists(image_path):
        print(f"Error: File not found: {image_path}")
        return
        
    # Validate file is an image
    try:
        with Image.open(image_path) as img:
            print(f"\nImage validation:")
            print(f"Format: {img.format}")
            print(f"Size: {img.size}")
            print(f"Mode: {img.mode}")
    except Exception as e:
        print(f"Error validating image: {str(e)}")
        return
    
    # Get file size
    file_size = os.path.getsize(image_path)
    print(f"File size: {file_size / 1024:.2f} KB")
    
    # Prepare the file for upload
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f, 'image/jpeg')}
            
            # Test image preprocessing
            print("\nTesting image preprocessing...")
            response = requests.post('http://localhost:8080/test-image', files=files)
            
            print(f"Preprocessing response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("\nPreprocessing successful!")
                print("\nImage details:")
                print(f"Original size: {result['details']['original_size']}")
                print(f"Original mode: {result['details']['original_mode']}")
                print(f"Segmentation shape: {result['details']['segmentation_shape']}")
                print(f"Classification shape: {result['details']['classification_shape']}")
                
                # Save the preview images
                import base64
                
                # Save segmentation preview
                seg_data = base64.b64decode(result['details']['segmentation_preview'])
                with open('segmentation_preview.png', 'wb') as f:
                    f.write(seg_data)
                print("\nSaved segmentation preview as 'segmentation_preview.png'")
                
                # Save classification preview
                class_data = base64.b64decode(result['details']['classification_preview'])
                with open('classification_preview.png', 'wb') as f:
                    f.write(class_data)
                print("Saved classification preview as 'classification_preview.png'")
                
            else:
                print("\nError during preprocessing:")
                try:
                    error_data = response.json()
                    print(json.dumps(error_data, indent=2))
                except:
                    print(f"Raw response: {response.text}")
            
            # Test full analysis
            print("\nTesting full analysis...")
            with open(image_path, 'rb') as f:
                files = {'file': (os.path.basename(image_path), f, 'image/jpeg')}
                response = requests.post('http://localhost:8080/upload', files=files)
            
            print(f"Analysis response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("\nAnalysis successful!")
                print("\nResults:")
                print(f"Tumor Type: {result['tumorType']}")
                print(f"Confidence: {result['confidence']:.2%}")
                print(f"Has Tumor: {result['hasTumor']}")
                
                # Save the segmentation mask
                mask_data = base64.b64decode(result['segmentationMask'])
                with open('segmentation_mask.png', 'wb') as f:
                    f.write(mask_data)
                print("\nSaved segmentation mask as 'segmentation_mask.png'")
                
            else:
                print("\nError during analysis:")
                try:
                    error_data = response.json()
                    print(json.dumps(error_data, indent=2))
                except:
                    print(f"Raw response: {response.text}")
                
    except Exception as e:
        print(f"\nError: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_image.py <path_to_image>")
        sys.exit(1)
        
    test_image_processing(sys.argv[1]) 