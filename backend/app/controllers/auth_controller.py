"""Kimlik doğrulama API endpoint'leri."""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, set_access_cookies, unset_jwt_cookies

from app.helpers.decorators import validate_body
from app.helpers.response_helpers import success_response, error_response
from app.dtos.auth_dto import LoginSchema
from app.services.auth_service import auth_service


auth_bp = Blueprint('auth', __name__)


class AuthController:
    """Giriş, çıkış ve mevcut kullanıcı bilgisi endpoint'leri."""

    def __init__(self) -> None:
        self.auth_service = auth_service

    @validate_body(LoginSchema)
    def login(self):
        """
        POST /api/auth/login
        Kullanıcı adı ve şifre ile giriş yap.
        Başarılıysa JWT token'ı httpOnly cookie olarak ayarlar.
        """
        data = request.get_json()
        token, user, error = self.auth_service.login(
            username=data['username'],
            password=data['password']
        )

        if error:
            return error_response(error, 401)

        # JWT cookie olarak ayarla ve kullanıcı bilgisini döndür
        response = success_response(
            data=user.to_dict(),
            message="Giriş başarılı."
        )
        set_access_cookies(response[0], token)
        return response

    @jwt_required()
    def logout(self):
        """
        POST /api/auth/logout
        JWT cookie'yi temizleyerek çıkış yap.
        """
        response = success_response(message="Çıkış başarılı.")
        unset_jwt_cookies(response[0])
        return response

    @jwt_required()
    def me(self):
        """
        GET /api/auth/me
        Mevcut oturumdaki kullanıcı bilgisini döndür.
        """
        user_id: int = int(get_jwt_identity())
        user = self.auth_service.get_current_user(user_id)

        if not user:
            return error_response("Kullanıcı bulunamadı.", 404)

        return success_response(data=user.to_dict())


# Controller örneği ve rota kaydı
_controller = AuthController()

auth_bp.add_url_rule('/login', 'login', _controller.login, methods=['POST'])
auth_bp.add_url_rule('/logout', 'logout', _controller.logout, methods=['POST'])
auth_bp.add_url_rule('/me', 'me', _controller.me, methods=['GET'])
