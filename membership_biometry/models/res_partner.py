from odoo import http
from odoo.http import request
import base64
import cv2
import numpy as np

class BiometryController(http.Controller):

    @http.route('/biometry/validate_face', type='json', auth='user')
    def validate_face(self, image):
        try:
            img_data = base64.b64decode(image.split(",")[1])
            nparr = np.frombuffer(img_data, np.uint8)
            img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)

            return bool(len(faces))
        except Exception:
            return False