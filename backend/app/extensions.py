"""Flask eklenti örnekleri — uygulama genelinde paylaşılır."""

from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Veritabanı ORM
db = SQLAlchemy()

# Marshmallow serializasyon ve validasyon
ma = Marshmallow()

# JWT kimlik doğrulama yöneticisi
jwt = JWTManager()

# Cross-Origin Resource Sharing
cors = CORS()
