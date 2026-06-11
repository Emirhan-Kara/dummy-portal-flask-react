"""Ders veritabanı işlemleri (CRUD)."""

from typing import Optional
from app.models.course import Course


class CourseRepository:
    """Ders tablosu için veritabanı erişim katmanı."""

    def find_all(self) -> list[Course]:
        """Tüm dersleri listele."""
        return Course.query.order_by(Course.code).all()

    def find_by_id(self, course_id: int) -> Optional[Course]:
        """ID ile ders bul."""
        return Course.query.get(course_id)


# Modül seviyesinde tekil örnek
course_repository = CourseRepository()
