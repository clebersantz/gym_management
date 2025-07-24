odoo.define('membership_biometry.capture_biometric', function (require) {
    "use strict";

    const AbstractAction = require('web.AbstractAction');
    const core = require('web.core');
    const QWeb = core.qweb;

    const BiometryCaptureAction = AbstractAction.extend({
        template: 'WebCamDialogWrapper',  // Um template com layout de dialog (abaixo explico)

        init: function (parent, action) {
            this._super.apply(this, arguments);
            this.partner_id = action && action.context ? action.context.partner_id : undefined;
        },

        start: function () {
            this.$el.html(QWeb.render("WebCamDialog", {}));
            this.initCamera();
            this._bind_events();
            return Promise.resolve();
        },

        initCamera: function () {
            const video = document.createElement('video');
            video.setAttribute('autoplay', '');
            video.setAttribute('playsinline', '');
            video.style.width = '100%';
            video.style.borderRadius = '8px';

            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;

            const btnCapture = document.createElement('button');
            btnCapture.className = 'btn btn-primary mt-2';
            btnCapture.innerHTML = '<i class="fa fa-camera"></i> Capturar';

            const webcamContainer = this.$el.find('#live_webcam')[0];
            const resultContainer = this.$el.find('#webcam_result')[0];

            webcamContainer.innerHTML = '';
            webcamContainer.appendChild(video);
            webcamContainer.appendChild(btnCapture);

            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    video.srcObject = stream;
                })
                .catch(err => {
                    console.error("Erro ao acessar webcam:", err);
                    webcamContainer.innerHTML = `<p class="text-danger">Erro ao acessar a webcam</p>`;
                });

            btnCapture.addEventListener('click', () => {
                canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                const imgData = canvas.toDataURL('image/png');
                resultContainer.innerHTML = '';

                const img = document.createElement('img');
                img.src = imgData;
                img.style.width = '100%';
                img.style.borderRadius = '8px';

                resultContainer.appendChild(img);
            });
        },

        _bind_events: function () {
            const self = this;
            this.$('.btn-close-dialog').on('click', function () {
                self._on_close();
            });
        },

        _on_close: function () {
            this._stop_stream();
            this.trigger_up('history_back'); // Fecha a action e retorna para tela anterior
        },

        _stop_stream: function () {
            const video = document.querySelector('video');
            if (video && video.srcObject) {
                const tracks = video.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                video.srcObject = null;
            }
        }
    });

    core.action_registry.add('new_partner_image', BiometryCaptureAction);

    return BiometryCaptureAction;
});