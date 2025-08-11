
/** @odoo-module **/

import { Component } from "@odoo/owl";

export class BiometricCaptureDialog extends Component {
	
    static template = "web.BiometricCaptureDialog";
	
    static props = {
		
        'close': {
            type: Function,
            optional: false,
        },
		
    };

    closeDialog() {
        this.props.close();  // fecha o dialog
    }
	
}
