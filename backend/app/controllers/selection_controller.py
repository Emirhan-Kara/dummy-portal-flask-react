"""Ders seçimi (sepet) API endpoint'leri."""

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity

from app.helpers.decorators import role_required, validate_body
from app.helpers.response_helpers import success_response, error_response
from app.dtos.selection_dto import AddSelectionSchema
from app.services.selection_service import selection_service


selection_bp = Blueprint('selections', __name__)


class SelectionController:
    """Öğrenci ders seçimi sepet işlemleri endpoint'leri."""

    def __init__(self) -> None:
        self.selection_service = selection_service

    @role_required('STUDENT')
    def get_selections(self):
        """
        GET /api/selections
        Öğrencinin tüm ders seçimlerini getir (tüm durumlar).
        """
        student_id: int = int(get_jwt_identity())
        selections = self.selection_service.get_selections(student_id)
        return success_response(data=selections)

    @role_required('STUDENT')
    @validate_body(AddSelectionSchema)
    def add_selection(self):
        """
        POST /api/selections
        Sepete yeni ders ekle (DRAFT durumunda).
        Sepet kilidi, kredi limiti ve tekrar seçim kontrolleri uygulanır.
        """
        student_id: int = int(get_jwt_identity())
        data = request.get_json()

        result, error = self.selection_service.add_selection(
            student_id=student_id,
            course_id=data['course_id']
        )

        if error:
            # Sepet kilidi durumunda 409 Conflict döndür
            status = 409 if "onay bekliyor" in error else 400
            return error_response(error, status)

        return success_response(data=result, message="Ders sepete eklendi.", status=201)

    @role_required('STUDENT')
    def remove_selection(self, selection_id: int):
        """
        DELETE /api/selections/<selection_id>
        Sepetten ders çıkar. Sadece DRAFT veya REVISION durumundaki dersler silinebilir.
        REVISION silme → tamamen kayıt silme (yeni ders için ayrıca POST yapılır).
        """
        student_id: int = int(get_jwt_identity())

        success, error = self.selection_service.remove_selection(
            student_id=student_id,
            selection_id=selection_id
        )

        if error:
            status = 409 if "onay bekliyor" in error else 400
            return error_response(error, status)

        return success_response(message="Ders sepetten çıkarıldı.")

    @role_required('STUDENT')
    def submit_selections(self):
        """
        POST /api/selections/submit
        Sepetteki tüm DRAFT ve REVISION dersleri onaya gönder.
        Tüm seçimler PENDING_APPROVAL durumuna geçer.
        """
        student_id: int = int(get_jwt_identity())

        success, error = self.selection_service.submit_selections(student_id)

        if error:
            status = 409 if "zaten onay bekliyor" in error else 400
            return error_response(error, status)

        return success_response(message="Ders seçimleri onaya gönderildi.")

    @role_required('STUDENT')
    def get_credits(self):
        """
        GET /api/selections/credits
        Öğrencinin kredi durumunu döndür (kullanılan, kalan, maksimum).
        """
        student_id: int = int(get_jwt_identity())
        credits = self.selection_service.get_credits(student_id)
        return success_response(data=credits)


# Controller örneği ve rota kaydı
_controller = SelectionController()

selection_bp.add_url_rule(
    '/', 'get_selections', _controller.get_selections, methods=['GET']
)
selection_bp.add_url_rule(
    '/', 'add_selection', _controller.add_selection, methods=['POST']
)
selection_bp.add_url_rule(
    '/<int:selection_id>', 'remove_selection', _controller.remove_selection, methods=['DELETE']
)
selection_bp.add_url_rule(
    '/submit', 'submit_selections', _controller.submit_selections, methods=['POST']
)
selection_bp.add_url_rule(
    '/credits', 'get_credits', _controller.get_credits, methods=['GET']
)
