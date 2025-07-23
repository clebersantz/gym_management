odoo.define('membership_biometry.webcam_controller', function (require) {
    'use strict';

    const publicWidgets = require('web.public.widget');

    publicWidgets.registry.WebcamController = publicWidgets.Widget.extend({
        selector: '.custom-webcam-container',
        events: {
            'click #start_camera': '_startCamera',
            'click #capture_image': '_captureImage',
        },

        /**
         * Inicializa o controle da câmera.
         */
        _startCamera: function () {
            const video = document.getElementById('webcam_video');
            const captureButton = document.getElementById('capture_image');

            // Solicita permissão para acessar a câmera
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    video.srcObject = stream; // Define a fonte do vídeo como o stream da câmera
                    video.play(); // Inicia o vídeo
                    captureButton.style.display = 'inline'; // Mostra o botão "Capturar Imagem"
                })
                .catch((error) => {
                    console.error("Erro ao acessar a câmera:", error);
                    alert("Não foi possível acessar a câmera. Verifique as permissões.");
                });
        },

        /**
         * Captura a imagem do vídeo e exibe no canvas.
         */
        _captureImage: function () {
            const video = document.getElementById('webcam_video');
            const canvas = document.getElementById('webcam_canvas');
            const context = canvas.getContext('2d');
            const img = document.getElementById('captured_image');

            canvas.width = 800;
            canvas.height = 800;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL('image/png'); // Obtém os dados da imagem
            img.src = imageData; // Define como a fonte da imagem capturada
            img.style.display = 'inline'; // Mostra a imagem capturada
        },
    });

    return publicWidgets.registry.WebcamController;
});