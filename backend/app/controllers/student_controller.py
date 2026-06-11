"""Danışman öğretmen API endpoint'leri."""

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity

from app.helpers.decorators import role_required, validate_body
from app.helpers.response_helpers import success_response, error_response
from app.dtos.selection_dto import GuideTeacherSchema
from app.services.student_service import student_service


student_bp = Blueprint('students', __name__)


class StudentController:
    """Öğrenci danışman öğretmen işlemleri endpoint'leri."""

    def __init__(self) -> None:
        self.student_service = student_service

    @role_required('STUDENT')
    def get_teachers(self):
        """
        GET /api/students/teachers
        Seçilebilir öğretmenlerin listesini döndür.
        """
        teachers = self.student_service.get_available_teachers()
        return success_response(data=teachers)

    @role_required('STUDENT')
    @validate_body(GuideTeacherSchema)
    def set_guide_teacher(self):
        """
        PUT /api/students/guide-teacher
        Öğrenciye danışman öğretmen ata (kalıcı).
        İlk seçimden sonra değiştirilebilir — öğretmen onayı gerekmez.
        """
        student_id: int = int(get_jwt_identity())
        data = request.get_json()

        result, error = self.student_service.set_guide_teacher(
            student_id=student_id,
            teacher_id=data['teacher_id']
        )

        if error:
            return error_response(error)

        return success_response(data=result, message="Danışman öğretmen atandı.")


# Controller örneği ve rota kaydı
_controller = StudentController()

student_bp.add_url_rule(
    '/teachers', 'get_teachers', _controller.get_teachers, methods=['GET']
)
student_bp.add_url_rule(
    '/guide-teacher', 'set_guide_teacher', _controller.set_guide_teacher, methods=['PUT']
)
