from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import io

app = Flask(__name__)

# Charger le modèle pré-entraîné
model = load_model('model.h5')

@app.route('/predict', methods=['POST'])
def predict():
    # Récupérer l'image envoyée par le frontend
    image_file = request.files['image']
    image = Image.open(image_file.stream)
    image = image.resize((48, 48))  # Redimensionner selon la taille attendue par le modèle
    image = np.array(image.convert('L'))  # Convertir l'image en niveaux de gris
    image = image.reshape(1, 48, 48, 1)  # Redimensionner pour correspondre à l'entrée du modèle
    image = image / 255.0  # Normaliser l'image

    # Prédiction
    prediction = model.predict(image)
    emotion = np.argmax(prediction)

    # Retourner l'émotion prédite
    emotions = ['Anger', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
    return jsonify({'emotion': emotions[emotion]})

if __name__ == '__main__':
    app.run(debug=True)
