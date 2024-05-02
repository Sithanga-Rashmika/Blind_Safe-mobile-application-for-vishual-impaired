from flask import Flask, send_file
from PIL import Image, ImageFilter, ImageOps
from ultralytics import YOLO
import os
import shutil

app = Flask(__name__)
injury_model = YOLO("injury_detection.pt")
wound_model =  YOLO("wound_detection.pt")
directory = os.getcwd()


@app.route('/injury-detection')
def index():
    # Run YOLO model and generate predictions
    injury_model.predict(source="v1.mp4", save=True, conf=0.5, save_crop=True)

    # Path to the directory containing the predicted images
    image_directory = './runs/detect/predict/crops/injury'
    # List all files in the directory
    files = os.listdir(image_directory)

    # Filter out only image files
    image_files = [file for file in files if file.endswith(('.jpg', '.jpeg', '.png', '.gif'))]

    # Check if there are any image files
    if not image_files:
        print("No image files found in the directory.")
    else:
        # Open and display the first image
        img1_path = os.path.join(image_directory, image_files[0])
        img1 = Image.open(img1_path)
        
        #pass the image into wound detection model
        wound_model.predict(source=img1, save=True, conf=0.5, save_crop=True)
        # Path to the 'crops' directory
        crops_directory = r'./runs/detect/predict2/crops'

        # Get a list of directories inside the 'crops' directory
        subdirectories = [subdir for subdir in os.listdir(crops_directory) if os.path.isdir(os.path.join(crops_directory, subdir))]

        # Assuming there's only one directory inside 'crops'
        if len(subdirectories) > 0:
            wound_type = subdirectories[0]
            print("Wound Type:", wound_type)
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

    return f"Wound type: {wound_type}"



if __name__ == "__main__":
    app.run(debug=True)
