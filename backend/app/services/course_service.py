"""Ders listeleme iş mantığı."""

from app.models.course import Course
from app.repositories.course_repository import course_repository


class CourseService:
    """Ders işlemleri için iş mantığı katmanı."""

    def __init__(self) -> None:
        self.course_repository = course_repository

    def get_all_courses(self) -> list[dict]:
        """Tüm dersleri listele ve sözlük olarak döndür."""
        courses: list[Course] = self.course_repository.find_all()
        return [course.to_dict() for course in courses]


# Modül seviyesinde tekil örnek
course_service = CourseService()
