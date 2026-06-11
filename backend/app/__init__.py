"""Flask uygulama fabrikası — tüm bileşenleri birleştirir."""

from flask import Flask
from app.config import Config
from app.extensions import db, ma, jwt, cors


def create_app() -> Flask:
    """
    Flask uygulamasını oluşturur ve yapılandırır.
    Eklentileri başlatır, Blueprint'leri kaydeder.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # Eklentileri başlat
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, supports_credentials=True, origins=["http://localhost:5173"])

    # Burada çağırılmasının sebebi app ve db bağlantısı kurulduktan sonra modellerin tanımlanmasıymış!
    from app import models

    # Blueprint'leri kaydet
    from app.controllers.auth_controller import auth_bp
    from app.controllers.course_controller import course_bp
    from app.controllers.student_controller import student_bp
    from app.controllers.selection_controller import selection_bp
    from app.controllers.teacher_controller import teacher_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(course_bp, url_prefix='/api/courses')
    app.register_blueprint(student_bp, url_prefix='/api/students')
    app.register_blueprint(selection_bp, url_prefix='/api/selections')
    app.register_blueprint(teacher_bp, url_prefix='/api/teacher')

    return app
