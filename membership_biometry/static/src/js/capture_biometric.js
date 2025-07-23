odoo.define('membership_capture_biometric', function (require) {
    "use strict";

    const AbstractAction = require('web.AbstractAction');
    const core = require('web.core');
    const QWeb = core.qweb;
    const Dialog = require('web.Dialog');
    const session = require('web.session');

    const CapturePartnerImage = AbstractAction.extend({
        init: function (parent, action) {
            this.partner_id = action.params.partner_id;
            this._super.apply(this, arguments);
        },

        start: function () {
            const self = this;

            const $el = $(QWeb.render("CapturePartnerImage"));  // Renderiza o template XML

            this.dialog = new Dialog(this, {
                title: "Capturar Biometria",
                $content: $el,
                buttons: [],
                size: 'medium',
                onForceClose: function () {
                    self._stop_stream();
                    self.trigger_up('history_back');
                },
            });

            this.dialog.open();

            this._start_video_stream();
            this._bind_events($el);
        },

        _start_video_stream: function () {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    const video = document.getElementById('video');
                    video.srcObject = stream;
                })
                .catch(() => {
                    alert("Não foi possível acessar a câmera.");
                    this.trigger_up('history_back');
                });
        },

        _bind_events: function ($el) {
            const self = this;

            $el.find('#btn-close').on('click', function () {
                self._on_close();
            });

            $el.find('#btn-click').on('click', function () {
                const video = document.getElementById('video');
                const canvas = document.getElementById('canvas');
                const context = canvas.getContext('2d');

                canvas.width = 320;
                canvas.height = 240;
                context.drawImage(video, 0, 0, 320, 240);

                const imageData = canvas.toDataURL('image/png');

                self._rpc({
                    model: 'res.partner',
                    method: 'register_face',
                    args: [[self.partner_id], imageData],
                    context: session.user_context,
                }).then(() => {
                    Dialog.alert(self, "Imagem capturada e salva com sucesso!", {
                        onClose: function () {
                            self._on_close();
                        }
                    });
                });
            });
        },

        _stop_stream: function () {
            const video = document.getElementById('video');
            if (video && video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
                video.srcObject = null;
            }
        },

        _on_close: function () {
            this._stop_stream();
            if (this.dialog) this.dialog.close();
            this.trigger_up('history_back');
        }
    });

    core.action_registry.add('new_partner_image', CapturePartnerImage);
    return CapturePartnerImage;
});