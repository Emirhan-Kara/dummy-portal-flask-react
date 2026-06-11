"""Kimlik doğrulama iş mantığı."""

from typing import Optional, Tuple
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token

from app.models.user import User
from app.repositories.user_repository import user_repository


class AuthService:
    """Giriş/çıkış işlemleri için iş mantığı katmanı."""

    def __init__(self) -> None:
        self.user_repository = user_repository

    def login(self, username: str, password: str) -> Tuple[Optional[str], Optional[User], Optional[str]]:
        """
        Kullanıcı giriş işlemi.
        Başarılı: (token, user, None)
        Başarısız: (None, None, hata_mesajı)
        """
        # Kullanıcıyı veritabanında ara
        user = self.user_repository.find_by_username(username)
        if not user:
            return None, None, "Kullanıcı adı veya şifre hatalı."

        # Şifre doğrulama
        if not check_password_hash(user.password_hash, password):
            return None, None, "Kullanıcı adı veya şifre hatalı."

        # JWT token oluştur — identity olarak user ID kullanılır
        token = create_access_token(identity=str(user.id))
        return token, user, None

    def get_current_user(self, user_id: int) -> Optional[User]:
        """JWT'den gelen user ID ile mevcut kullanıcıyı getir."""
        return self.user_repository.find_by_id(user_id)


# Modül seviyesinde tekil örnek
auth_service = AuthService()
