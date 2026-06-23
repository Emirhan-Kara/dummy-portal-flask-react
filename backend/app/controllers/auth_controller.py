"""Kimlik doğrulama API endpoint'leri."""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

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
        Başarılıysa JWT token'ı JSON body içinde döndür
        """
        data = request.get_json()
        token, user, error = self.auth_service.login(
            username=data['username'],
            password=data['password']
        )

        if error:
            return error_response(error, 401)

        # Token'ı JSON body içinde döndür. cookie yönetimi frontendde
        return success_response(
            data={'user': user.to_dict(), 'token': token},
            message="Giriş başarılı."
        )

    @jwt_required()
    def logout(self):
        """
        POST /api/auth/logout
        Çıkış yap. Token invalidation client tarafında yapılır.
        """
        return success_response(message="Çıkış başarılı.")

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
