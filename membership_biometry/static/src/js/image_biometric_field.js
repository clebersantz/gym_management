/** @odoo-module **/

import { h } 				from "@odoo/owl";
import { ComponentWrapper } from "@odoo/owl";
import { registry } 		from '@web/core/registry';
import { _t } 				from "@web/core/l10n/translation";
import { useService } 		from "@web/core/utils/hooks";
import { Dialog } 			from "@web/core/dialog/dialog";
import { ImageField } 		from '@web/views/fields/image/image_field';

import { BiometricCaptureDialog } from "./biometric_capture_dialog"; // verifique o caminho correto

export class ImageBiometricField extends ImageField {
    static template = "web.ImageBiometricField";
    static props = ImageField.props;
    static supportedTypes = ['binary'];
    static fieldDependencies = ImageField.fieldDependencies;

    setup() {
        super.setup();
        this.dialog = useService("dialog");
    }

    onClickImage(ev) {
        console.log('Image clicked for biometry processing:', this.props.value);
        return super.onClickImage(ev);
    }

    openCaptureDialog() {
		

		this.dialog.add(Dialog, {
			
			title: _t("Captura Biométrica"),
			size: "md",
			
			slots: {
				default: {
					Component: BiometricCaptureDialog,
					props: {
						'close': () => BiometricCaptureDialog.closeDialog(),
					},
				},
			},
			
		});
		
		
		//this.dialog.add(BiometricCaptureDialog, {});



    }
}

registry.category('fields').add('image_biometric', ImageBiometricField);