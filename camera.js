// Bouton de téléchargement du modèle depuis Hugging Face (optionnel)
const downloadButton = document.getElementById('downloadModel');

downloadButton.addEventListener('click', () => {
    // URL raw du modèle hébergé sur Hugging Face (pour téléchargement manuel)
    const modelUrl = 'https://huggingface.co/ton_utilisateur/ton-model/resolve/main/model.h5';
    
    fetch(modelUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'model.h5';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Erreur de téléchargement du modèle:', error));
});

// Fonction pour démarrer la caméra
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.getElementById('video');
        videoElement.srcObject = stream;
        videoElement.onplay = () => detectEmotion(videoElement);
    } catch (error) {
        console.error("Erreur lors de l'accès à la caméra :", error);
        alert("Impossible d'accéder à la caméra !");
    }
}

// Envoi de l'image pour la prédiction
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
        console.error('Erreur lors de la communication avec le serveur :', error);
    }
}

// Capture d'une frame de la vidéo et envoi au serveur
async function detectEmotion(videoElement) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async function(blob) {
        await sendImageForPrediction(blob);
    }, 'image/jpeg');
}

// Démarrage de la caméra au chargement de la page
window.onload = function() {
    startCamera();
};
