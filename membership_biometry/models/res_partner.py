from odoo import models, fields, _

import logging
_logger = logging.getLogger(__name__)

class ResPartner(models.Model):
    _inherit = 'res.partner'

    biometric_image = fields.Image(
        string="Biometria Facial",
        help="Armazene a imagem facial capturada via câmera.",
        attachment=True
    )

    def new_partner_image(self):
        return {
            'type': 'ir.actions.client',
            'tag': 'new_partner_image',
            'params': {
                'partner_id': self.id,
            }
        }

