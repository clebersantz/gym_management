/** @odoo-module **/



import { registry } from '@web/core/registry';
import { Dialog } from '@web/core/dialog/dialog';
import AbstractAction from '@web/core/action/abstract_action';

console.log("Biometric JS loaded");

class BiometricCaptureAction extends AbstractAction {
    async start() {
        const dialog = new Dialog(this.env, {
            title: 'Capture Biometric Photo',
            size: 'medium',
            buttons: [
                {
                    text: 'Close',
                    close: true,
                    classes: 'btn-secondary',
                },
            ],
            $content: $(`
                <div style="text-align:center;">
                    <video id="video" width="320" height="240" autoplay></video>
                    <canvas id="canvas" width="320" height="240" style="display:none;"></canvas>
                    <br/>
                    <button id="snap" class="btn btn-primary mt-2">Capture Photo</button>
                    <img id="photo" style="margin-top: 10px; max-width:320px; display:none;" />
                </div>
            `),
            onOpen: () => {
                const video = dialog.$content.find('#video')[0];
                const canvas = dialog.$content.find('#canvas')[0];
                const photo = dialog.$content.find('#photo')[0];
                const snapBtn = dialog.$content.find('#snap')[0];

                navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                    video.srcObject = stream;
                    video.play();

                    snapBtn.onclick = () => {
                        const context = canvas.getContext('2d');
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const dataURL = canvas.toDataURL('image/png');
                        photo.src = dataURL;
                        photo.style.display = 'block';

                        stream.getTracks().forEach(track => track.stop());

                        this.env.services.rpc({
                            model: 'res.partner',
                            method: 'write',
                            args: [[this.props.record.id], {
                                biometric_image: dataURL.split(',')[1],
                                biometric_captured: true,
                            }],
                        }).then(() => {
                            dialog.close();
                            this.env.notification.add('Biometric photo captured successfully!', { type: 'success' });
                        }).catch(() => {
                            this.env.notification.add('Failed to save biometric photo.', { type: 'danger' });
                        });
                    };
                }).catch(() => {
                    this.env.notification.add('Could not access the camera.', { type: 'danger' });
                });
            }
        });
        dialog.open();
        return Promise.resolve();
    }
}

registry.category('actions').add('biometric_capture_action', BiometricCaptureAction);