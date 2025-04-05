// Téléchargement du modèle IA
const downloadButton = document.getElementById('downloadModel');

downloadButton.addEventListener('click', () => {
    const modelUrl = 'https://drive.google.com/uc?export=download&id=1vzoD3X92idbCNrA_V-EPGNuipE8K_J3E'; // Lien direct

    // Utilisation de Fetch API pour télécharger le modèle
    fetch(modelUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'model.h5';  // Nom du fichier téléchargé
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Erreur de téléchargement du modèle:', error));
});

// Fonction pour démarrer la caméra
async function startCamera() {
    try {
        // Demander l'accès à la caméra
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        // Récupérer l'élément vidéo et lui affecter le flux
        const videoElement = document.getElementById('video');
        videoElement.srcObject = stream;

        // Démarrer la détection d'émotions dès que la vidéo commence
        videoElement.onplay = () => detectEmotion(videoElement);
    } catch (error) {
        console.error("Erreur lors de l'accès à la caméra : ", error);
        alert("Impossible d'accéder à la caméra !");
    }
}

// Fonction pour envoyer l'image à Flask pour prédire l'émotion
async function sendImageForPrediction(imageData) {
    const formData = new FormData();
    formData.append('image', imageData);

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.emotion) {
            document.getElementById('emotion').innerText = `Émotion détectée : ${result.emotion}`;
        } else {
            console.error('Erreur dans la prédiction');
        }
    } catch (error) {
        console.error('Erreur lors de la communication avec le serveur : ', error);
    }
}

// Fonction pour capturer un frame de la vidéo et l'envoyer au serveur
async function detectEmotion(videoElement) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Dessiner le contenu vidéo sur le canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Convertir le canvas en image (Blob)
    canvas.toBlob(async function(blob) {
        await sendImageForPrediction(blob);
    }, 'image/jpeg');
}

// Démarrer la caméra lorsque la page est chargée
window.onload = function() {
    startCamera();
};
