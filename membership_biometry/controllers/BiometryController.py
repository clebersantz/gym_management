from odoo import http
from odoo.http import request
import base64
import cv2
import numpy as np

class BiometryController(http.Controller):
    @http.route('/biometry/validate_face', type='json', auth='user')
    def validate_face(self, image):
        # Decode base64 image
        header, encoded = image.split(",", 1)
        binary = base64.b64decode(encoded)
        np_arr = np.frombuffer(binary, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)

        return bool(len(faces) > 0)
