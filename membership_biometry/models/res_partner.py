# models/res_partner.py
import base64
import cv2
import numpy as np
from odoo import models, fields, api

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
            'name': 'Captura de Biometria',
            'context': {
                'partner_id': self.id,
            }
        }


    @api.onchange('image_biometric')
    def _onchange_image_biometric(self):
        for partner in self:
            partner.image_1920 = partner.image_biometric
        
        
       

    @api.model
    def detect_face_in_image(self, image_base64):
        if not image_base64:
            raise exceptions.ValidationError("Imagem não recebida.")

        try:
            # Decodifica a imagem base64
            img_data = base64.b64decode(image_base64)
            np_arr = np.frombuffer(img_data, np.uint8)
            img_np = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            # Converte para escala de cinza
            gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)

            # Carrega o classificador de face Haar
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

            # Detecta faces
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

            if len(faces) == 0:
                return {'has_face': False}
            return {'has_face': True}

        except Exception as e:
            raise exceptions.UserError(f"Erro ao processar imagem: {str(e)}")

