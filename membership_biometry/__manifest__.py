{
    'name': 'Membership Biometry',
    'version': '16.0.1.0',
    'depends': ['web', 'membership'],
    'data': [
        'views/res_partner_view.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'membership_biometry/static/src/js/capture_biometric.js',
            'membership_biometry/static/src/css/capture_biometric.css',
            'membership_biometry/static/src/xml/capture_biometric_template.xml',
        ],
    },
    'installable': True,
    'application': False,
}