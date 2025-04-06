import os
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
from huggingface_hub import hf_hub_download

app = Flask(__name__)

def download_model(repo_id, filename):
    # hf_hub_download télécharge le fichier dans le cache local s'il n'existe pas déjà
    model_path = hf_hub_download(repo_id=repo_id, filename=filename)
    return model_path

# Remplace "ton_utilisateur/ton-model" par l'identifiant et le nom de ton dépôt sur Hugging Face
repo_id = "Cedric4444/emotions-detection"  
filename = "best_emotion_model.h5"

model_path = download_model(repo_id, filename)
print("Modèle téléchargé depuis Hugging Face :", model_path)

# Charger le modèle Keras
model = load_model(model_path)

@app.route('/predict', methods=['POST'])
def predict():
    # Récupérer l'image envoyée depuis le frontend
    image_file = request.files['image']
    image = Image.open(image_file.stream)
    image = image.resize((48, 48))  # Ajuster la taille selon ton modèle
    image = np.array(image.convert('L'))  # Convertir en niveaux de gris
    image = image.reshape(1, 48, 48, 1)
    image = image / 255.0  # Normalisation

    # Prédiction
    prediction = model.predict(image)
    emotion = int(np.argmax(prediction))
    # Liste des émotions (à adapter selon ton modèle)
    emotions = ['angry', "disgust", "fear", 'happy', "neutral", "sad", "surprise"]
    
    return jsonify({'emotion': emotions[emotion]})

if __name__ == '__main__':
    app.run(debug=True)
