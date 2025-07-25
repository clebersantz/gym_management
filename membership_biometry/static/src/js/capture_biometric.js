odoo.define('membership_biometry.capture_biometric', function (require) {
    "use strict";

    const Dialog = require('web.Dialog');
    const core = require('web.core');
    const rpc = require('web.rpc');
    const QWeb = core.qweb;

    function openBiometryDialog(partner_id) {
        let videoElement = null;
        let videoStream = null;

        const dialog = new Dialog(null, {
            title: "Captura de Biometria Facial",
            size: 'large',
            $content: $(QWeb.render('membership_biometry.WebCamDialog', {})),
            buttons: [],
        });

        dialog.opened().then(() => {
            const canvas = document.createElement('canvas');
            canvas.width = 600;
            canvas.height = 600;

            const liveWebcamContainer = dialog.$el.find('#live_webcam')[0];
            const resultContainer = dialog.$el.find('#webcam_result')[0];
            const messageContainer = dialog.$el.find('#message_container')[0];

            videoElement = document.createElement('video');
            videoElement.setAttribute('autoplay', '');
            videoElement.setAttribute('playsinline', '');
            videoElement.style.width = '100%';
            videoElement.style.borderRadius = '8px';
            videoElement.style.backgroundColor = '#000';
            videoElement.style.objectFit = 'cover';

            liveWebcamContainer.innerHTML = '';
            liveWebcamContainer.appendChild(videoElement);

            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    videoStream = stream;
                    videoElement.srcObject = stream;
                })
                .catch(err => {
                    console.error("Erro ao acessar webcam:", err);
                    liveWebcamContainer.innerHTML = `<p class="text-danger">Erro ao acessar a webcam: ${err.message}</p>`;
                });

            const btnCapture = dialog.$el.find('#btn-capture')[0];
            const btnSave = dialog.$el.find('#btn-save')[0];

			btnCapture.addEventListener('click', () => {
				const ctx = canvas.getContext('2d');

				const videoWidth = videoElement.videoWidth;
				const videoHeight = videoElement.videoHeight;

				const side = Math.min(videoWidth, videoHeight);
				const sx = (videoWidth - side) / 2;
				const sy = (videoHeight - side) / 2;

				ctx.drawImage(videoElement, sx, sy, side, side, 0, 0, 600, 600);

				const imgData = canvas.toDataURL('image/png');
				const base64Data = imgData.split(',')[1];  // <-- AGORA definido corretamente

				resultContainer.innerHTML = '';
				const img = document.createElement('img');
				img.src = imgData;
				img.style.width = '100%';
				img.style.borderRadius = '8px';
				resultContainer.appendChild(img);

				dialog._capturedImageData = imgData;

				// Chama o método backend
				rpc.query({
					model: 'res.partner',
					method: 'detect_face_in_image',
					args: [base64Data],
				}).then(result => {
					if (!result.has_face) {
						messageContainer.innerHTML = '<span class="text-danger">Nenhum rosto foi detectado na imagem.</span>';
						dialog._capturedImageData = null; // limpa para impedir o salvamento
						return;
					}
					messageContainer.innerHTML = '<span class="text-success">Imagem capturada com sucesso!</span>';
				}).catch(err => {
					messageContainer.innerHTML = '<span class="text-danger">Erro ao detectar rosto na imagem.</span>';
					console.error('Erro na detecção facial:', err);
				});
			});


            btnSave.addEventListener('click', () => {
                const imageData = dialog._capturedImageData;
                if (!imageData || !imageData.startsWith('data:image')) {
                    messageContainer.innerHTML = '<span class="text-danger">Imagem inválida ou não capturada.</span>';
                    return;
                }

                // Remove o prefixo base64
                const base64Image = imageData.split(',')[1];

                rpc.query({
                    model: 'res.partner',
                    method: 'write',
                    args: [[partner_id], {
						image_biometric: base64Image,
                    }],
                }).then(() => {
                    dialog.close();
					dialog.trigger_up('reload');
                }).catch(err => {
                    messageContainer.innerHTML = '<span class="text-danger">Erro ao salvar a imagem.</span>';
                    console.error('Erro ao salvar imagem:', err);
                });
            });
        });

        dialog.on('closed', this, function () {
            if (videoElement && videoStream) {
                const tracks = videoStream.getTracks();
                tracks.forEach(track => track.stop());
                videoElement.srcObject = null;
                console.log('Webcam desligada ao fechar o diálogo.');
            }
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
