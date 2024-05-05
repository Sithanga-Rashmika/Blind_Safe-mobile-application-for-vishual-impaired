from flask import Flask, request, send_file
from ultralytics import YOLO
import os
import shutil
import cv2
import google.generativeai as genai
import time
import pathlib
import base64

app = Flask(__name__)
injury_model = YOLO("injury_detection.pt")
wound_model =  YOLO("wound_detection.pt")
directory = os.getcwd()


@app.route('/injury-detection', methods=['POST'])
def index():
    print("request came")
    if request.method == 'POST':
        start_time = time.time()
        timeout = 8
        cap =cv2.VideoCapture('v5.mp4')
        image_files = [] 
        wound_type = "Could not detect the injury..!"
        final_val = ""
        
        while(cap.isOpened()):
            ret, frame = cap.read()
            if not ret:
                break

            # Process the frame with the injury model
            injury_model.predict(source=frame, conf=0.5, save_crop=True)
            # Path to the directory containing the predicted images
            image_directory = './runs/detect/predict/crops'
            exist_files = os.path.exists(image_directory)
            
            if exist_files:
                print("detected")
                break
            else:
                if time.time() - start_time > timeout:
                    print("Timeout reached. Exiting loop.")
                    break
                
        # Release the video capture object
        cap.release()

        image_directory2 = './runs/detect/predict/crops/injury'
        files = os.path.exists(image_directory2)
        if files:
            files2 = os.listdir(image_directory2)
            image_files = [file for file in files2 if file.endswith(('.jpg', '.jpeg', '.png', '.gif'))]
        else:
            print("Injury not detected..!")
        # Check if there are any image files
        if not image_files:
            print("No image files found in the directory.")
        else:
            # Open and display the first image
            img1_path = os.path.join(image_directory2, image_files[0])
            
            #pass the image into wound detection model
            wound_model.predict(source=img1_path, save=True, conf=0.5, save_crop=True)
            # Path to the 'crops' directory
            crops_directory = r'./runs/detect/predict2/crops'

            # Get a list of directories inside the 'crops' directory
            subdirectories = [subdir for subdir in os.listdir(crops_directory) if os.path.isdir(os.path.join(crops_directory, subdir))]

            # Assuming there's only one directory inside 'crops'
            if len(subdirectories) > 0:
                wound_type = subdirectories[0]
                print("Wound Type:", wound_type)
                final_val = upload_to_gemini(img1_path, wound_type)

            else:
                print("No detect the wound type..!")
        
            # delete the directory
            directory_path = './runs/detect/predict2'

            try:
                shutil.rmtree(directory_path)
                print(f"Directory '{directory_path}' and its contents successfully deleted.")
            except OSError as e:
                print(f"Error: {directory_path} : {e.strerror}")
                
            
        # delete the directory
        directory_path = './runs/detect/predict'

        try:
            shutil.rmtree(directory_path)
            print(f"Directory '{directory_path}' and its contents successfully deleted.")
        except OSError as e:
            print(f"Error: {directory_path} : {e.strerror}")
            

        return f"Detected wound type is:{wound_type}  and  {final_val}", 200

#function image upload to gemini

def upload_to_gemini(image_path, text):
    genai.configure(api_key="AIzaSyBP4B0TOih2DuZMZBwn4ficnUo0gudHPu0")

    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 0,
        "max_output_tokens": 8192,
    }

    safety_settings = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        }
    ]

    model = genai.GenerativeModel(model_name="gemini-1.5-pro-latest",
                                  generation_config=generation_config,
                                  safety_settings=safety_settings)
        
    image_bytes = pathlib.Path(image_path).read_bytes()

    # Encode the image data as base64
    image_base64 = base64.b64encode(image_bytes).decode('utf-8')

    # Prepare the image data
    image_data = {
        'mime_type': 'image/jpg',
        'data': image_base64
    }

    # Start a conversation with the image data
    convo = model.start_chat(history=[])

    convo.send_message(f"here image that i provide is {text} wound, now i want to get small description status about the wound like what kind of wound what should you do small steps give like maximum 50 words? do not provide too much text just small description i need paragraph do not pointform?")
    convo.send_message(image_data)
    return convo.last.text
 

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
