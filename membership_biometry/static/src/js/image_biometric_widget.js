/** @odoo-module **/

import { Component, useRef, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { useDialog } from "@web/core/dialog/dialog_hook";
import { useRPC } from "@web/core/rpc_service";

export class ImageBiometric extends Component {
    static template = "WebCamDialog";
    static props = {
        ...standardFieldProps,
    };

    setup() {
        this.rpc = useRPC();
        this.dialog = useDialog();
        this.videoRef = useRef("video");
        this.canvasRef = useRef("canvas");
        this.message = "";

        onMounted(() => {
            this._initWebcam();
        });
    }

    async _initWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoRef.el.srcObject = stream;
            this.stream = stream;
        } catch (e) {
            console.error("Erro ao acessar webcam", e);
        }
    }

    async capture() {
        const canvas = this.canvasRef.el;
        const video = this.videoRef.el;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, 300, 300);
        const dataURL = canvas.toDataURL("image/jpeg");

        try {
            const hasFace = await this.rpc("/biometry/validate_face", { image: dataURL });
            if (hasFace) {
                const base64 = dataURL.split(",")[1];
                const size = Math.floor(3 * (base64.length / 4));
                this.props.update({
                    size,
                    name: "biometria.jpeg",
                    type: "image/jpeg",
                    data: base64,
                });
            } else {
                this.message = "Nenhuma face detectada.";
            }
        } catch (err) {
            this.message = "Erro na validação facial.";
            console.error(err);
        }
    }

    destroy() {
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
        }
    }
}

registry.category("fields").add("image_biometric", {
    component: ImageBiometric,
    supportedTypes: ["binary"],
});