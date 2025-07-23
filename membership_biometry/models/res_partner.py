from odoo import models, fields, api

import logging
_logger = logging.getLogger(__name__)

class ResPartner(models.Model):
    _inherit = 'res.partner'

    image_biometric = fields.Image(
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


    @api.model
    def register_face(self, partner_id, image_data):
    
        partner = self.browse(partner_id)
        if not partner.exists():
            raise ValueError("Parceiro não encontrado.")
        
        # Se estiver no formato data:image/png;base64,...
        if image_data.startswith("data:image"):
            image_data = image_data.split(",")[1]

        partner.image_biometric = image_data
        return {'status': 'ok'}