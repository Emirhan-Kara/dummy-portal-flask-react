"""Uygulama yapılandırma ayarları."""

from datetime import timedelta


class Config:
    """Flask uygulama konfigürasyonu."""

    # Veritabanı bağlantı ayarları
    SQLALCHEMY_DATABASE_URI = (
        'mysql+pymysql://root:TuRkCeeLL2025.@localhost/student_portal?charset=utf8mb4'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT kimlik doğrulama ayarları
    JWT_SECRET_KEY = 'cart-curt-bla-bla'
    JWT_TOKEN_LOCATION = ['headers']
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
