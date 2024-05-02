from flask import Flask, request, jsonify
from google.cloud import speech_v1p1beta1 as speech
from textblob import TextBlob
import os
import io
import tensorflow as tf
import numpy as np
import pandas as pd

app = Flask(__name__)

# Configure Google Cloud credentials if necessary
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "key.json"

# Load the pre-trained model
model = tf.keras.models.load_model("Fall_Detector1.h5")

# Define preprocessing function
def preprocess_data(sensor_data):
    # Assuming sensor data is in CSV format with columns: 'acc_x', 'acc_y', 'acc_z', 'gyr_x', 'gyr_y', 'gyr_z'
    # Convert CSV string to DataFrame
    data_df = pd.read_csv(io.StringIO(sensor_data))
    # Convert DataFrame to numpy array
    data_array = data_df.to_numpy()
    # Reshape the data to match the input shape of the model
    data_array = data_array.reshape(-1, 400, 6)
    return data_array

# Function to transcribe audio using Google Cloud Speech-to-Text API
def transcribe_audio(audio_content):
    client = speech.SpeechClient()

    audio = speech.RecognitionAudio(content=audio_content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code="en-US",
    )

    response = client.recognize(config=config, audio=audio)

    transcript = ""
    for result in response.results:
        transcript += result.alternatives[0].transcript

    return transcript

# Function to perform sentiment analysis using TextBlob
def analyze_sentiment(text):
    blob = TextBlob(text)
    sentiment = blob.sentiment.polarity
    if sentiment <= 0:
        return "negative"
    else:
        return "positive"

# Define prediction function
def predict_fall(sensor_data):
    preprocessed_data = preprocess_data(sensor_data)
    prediction = model.predict(preprocessed_data)
    # Assuming your model predicts probabilities for each class
    class_labels = ['fall', 'lfall', 'rfall', 'light', 'sit', 'step', 'walk']  # Assuming these are the class labels
    max_index = np.argmax(prediction)
    predicted_class = class_labels[max_index]
    return predicted_class

@app.route('/analyze_audio', methods=['POST'])
def analyze_audio():
    if 'audio_file' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio_file']
    if audio_file.filename == '':
        return jsonify({'error': 'No audio file selected'}), 400

    audio_content = audio_file.read()

    # Transcribe audio
    transcript = transcribe_audio(audio_content)

    # Analyze sentiment
    sentiment = analyze_sentiment(transcript)

    return jsonify({'transcript': transcript, 'sentiment': sentiment})

# API endpoint for receiving sensor data
@app.route("/predict", methods=["POST"])
def predict():
    if request.method == "POST":
        sensor_data = request.form.get('data')
        if sensor_data is None or sensor_data == "":
            return jsonify({"error": "No sensor data provided"})
        try:
            # Get prediction
            prediction = predict_fall(sensor_data)
            return jsonify({"prediction": prediction})
        except Exception as e:
            return jsonify({"error": str(e)})
    return "OK"

if __name__ == "__main__":
    app.run(debug=True)
