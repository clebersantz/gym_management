odoo.define('membership_biometry.capture_biometric', function (require) {
    "use strict";

    const Dialog = require('web.Dialog');
    const core = require('web.core');
    const QWeb = core.qweb;

    function openBiometryDialog(partner_id) {
        const dialog = new Dialog(null, {
            title: "Captura de Biometria Facial",
            size: 'large',
            $content: $(QWeb.render('membership_biometry.WebCamDialog', {})),
            buttons: [],  // você pode adicionar botões se quiser salvar no backend
        });

        dialog.opened().then(() => {
            const liveWebcamDiv = dialog.$el.find('#live_webcam')[0];
            const resultContainer = dialog.$el.find('#webcam_result')[0];
            const btnCapture = dialog.$el.find('#btn-click')[0];
            const btnClose = dialog.$el.find('#btn-close')[0];

            // Cria dinamicamente o vídeo
            const video = document.createElement('video');
            video.setAttribute('autoplay', '');
            video.setAttribute('playsinline', '');
            video.style.width = '100%';
            video.style.borderRadius = '8px';
            video.style.backgroundColor = '#000';

            // Insere o vídeo no container
            liveWebcamDiv.innerHTML = '';
            liveWebcamDiv.appendChild(video);

            // Cria canvas para captura
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;

            // Acessa webcam
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    video.srcObject = stream;
                })
                .catch(err => {
                    console.error("Erro ao acessar webcam:", err);
                    liveWebcamDiv.innerHTML = `<p class="text-danger">Erro ao acessar a webcam: ${err.name} - ${err.message}</p>`;
                });

            // Evento captura foto
            btnCapture.addEventListener('click', () => {
                const context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imgData = canvas.toDataURL('image/png');

                resultContainer.innerHTML = '';
                const img = document.createElement('img');
                img.src = imgData;
                img.style.width = '100%';
                img.style.borderRadius = '8px';
                resultContainer.appendChild(img);
            });

            // Fecha diálogo e para stream
            btnClose.addEventListener('click', () => {
                if (video.srcObject) {
                    const tracks = video.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                    video.srcObject = null;
                }
                dialog.close();
            });
        });

        dialog.open();
    }

    core.action_registry.add('new_partner_image', function (env, action) {
        openBiometryDialog(action.context.partner_id);
        return Promise.resolve();
    });

    return {
        openBiometryDialog,
    };
});