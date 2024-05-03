from flask import Flask, send_file
from PIL import Image, ImageFilter, ImageOps
from ultralytics import YOLO
import cv2
import os
import shutil
import requests
import google.generativeai as genai



app = Flask(__name__)
injury_model = YOLO("injury_detection.pt")
wound_model =  YOLO("wound_detection.pt")
directory = os.getcwd()



@app.route('/')
def index():
    # Run YOLO model and generate predictions
    video_path = "v5.mp4"
    save_directory = './runs/detect/predict/crops/injury'

    # Open the video
    cap = cv2.VideoCapture(video_path)

    # Read the video frame by frame
    frame_count = 0
    while(cap.isOpened()):
        ret, frame = cap.read()

        # Check if the frame was read successfully
        if not ret:
            break

        # Process the frame with the injury model
        injury_model.predict(source=frame, save=True,show=True, conf=0.5, save_crop=True)
        
        # Increment frame count
        frame_count += 1
        
        # Break the loop after processing the first frame
        if frame_count == 1:
            break

    # Release the video capture object
    cap.release()

    # Continue with the rest of your logic

    return "Video processing stopped after saving the first frame."


if __name__ == "__main__":
    app.run(debug=True)
