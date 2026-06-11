"""Öğretmen değerlendirme API endpoint'leri."""

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity

from app.helpers.decorators import role_required, validate_body
from app.helpers.response_helpers import success_response, error_response
from app.dtos.teacher_dto import FinalizeSchema
from app.services.teacher_service import teacher_service


teacher_bp = Blueprint('teacher', __name__)


class TeacherController:
    """Öğretmen ders değerlendirme endpoint'leri."""

    def __init__(self) -> None:
        self.teacher_service = teacher_service

    @role_required('TEACHER')
    def get_students(self):
        """
        GET /api/teacher/students
        Öğretmene atanmış öğrencileri ve bekleyen seçimlerini listele.
        """
        teacher_id: int = int(get_jwt_identity())
        students = self.teacher_service.get_assigned_students(teacher_id)
        return success_response(data=students)

    @role_required('TEACHER')
    def get_student_selections(self, student_id: int):
        """
        GET /api/teacher/students/<student_id>
        Belirli bir öğrencinin tüm seçimlerini getir (öğretmen görünümü).
        """
        teacher_id: int = int(get_jwt_identity())
        result, error = self.teacher_service.get_student_selections(
            teacher_id=teacher_id,
            student_id=student_id
        )

        if error:
            return error_response(error, 403)

        return success_response(data=result)

    @role_required('TEACHER')
    @validate_body(FinalizeSchema)
    def finalize(self, student_id: int):
        """
        POST /api/teacher/students/<student_id>/finalize
        Öğretmenin öğrenci için toplu kararını kaydet.
        Tüm bekleyen dersler için karar verilmeli — kısmi değerlendirme YOK.
        Kararlar kalıcıdır — geri alınamaz.
        """
        teacher_id: int = int(get_jwt_identity())
        data = request.get_json()

        success, error = self.teacher_service.finalize_decisions(
            teacher_id=teacher_id,
            student_id=student_id,
            decisions=data['decisions']
        )

        if error:
            return error_response(error)

        return success_response(message="Değerlendirme tamamlandı.")


# Controller örneği ve rota kaydı
_controller = TeacherController()

teacher_bp.add_url_rule(
    '/students', 'get_students', _controller.get_students, methods=['GET']
)
teacher_bp.add_url_rule(
    '/students/<int:student_id>', 'get_student_selections',
    _controller.get_student_selections, methods=['GET']
)
teacher_bp.add_url_rule(
    '/students/<int:student_id>/finalize', 'finalize',
    _controller.finalize, methods=['POST']
)
