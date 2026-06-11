"""Ders listeleme API endpoint'leri."""

from flask import Blueprint

from app.helpers.decorators import role_required
from app.helpers.response_helpers import success_response
from app.services.course_service import course_service
from flask_jwt_extended import jwt_required


course_bp = Blueprint('courses', __name__)


class CourseController:
    """Ders listeleme endpoint'leri."""

    def __init__(self) -> None:
        self.course_service = course_service

    @jwt_required()
    def get_all(self):
        """
        GET /api/courses
        Tüm dersleri listele. Her iki rol de erişebilir.
        """
        courses = self.course_service.get_all_courses()
        return success_response(data=courses)


# Controller örneği ve rota kaydı
_controller = CourseController()

course_bp.add_url_rule('/', 'get_all', _controller.get_all, methods=['GET'])
