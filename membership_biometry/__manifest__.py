{
    "name": "Membership Biometry",
    "summary": "Widget para captura e exibição de biometria através de imagem",
    "version": "16.0.1.0.0",
    "category": "Custom",
    "author": "Sua Empresa",
    "license": "AGPL-3",
    "depends": ["base", "web", "contacts"],
    "data": [
        "views/res_partner_view.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "membership_biometry/static/src/js/image_biometric_field.js",
            "membership_biometry/static/src/js/biometric_capture_dialog.js",
            "membership_biometry/static/src/xml/image_biometric_field.xml",
        ],
    },
    "installable": True,
    "application": False,
}