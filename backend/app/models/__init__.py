"""
Models paketi — tüm SQLAlchemy modellerini içe aktarır.
Bu dosya sayesinde db.create_all() çağrıldığında tüm tablolar oluşturulur.
"""

from app.models.user import User
from app.models.course import Course
from app.models.student_course_selection import StudentCourseSelection

__all__ = ['User', 'Course', 'StudentCourseSelection']
