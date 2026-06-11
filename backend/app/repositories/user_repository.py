"""Kullanıcı veritabanı işlemleri (CRUD)."""

from typing import Optional
from app.extensions import db
from app.models.user import User


class UserRepository:
    """Kullanıcı tablosu için veritabanı erişim katmanı."""

    def find_by_id(self, user_id: int) -> Optional[User]:
        """ID ile kullanıcı bul."""
        return User.query.get(user_id)

    def find_by_username(self, username: str) -> Optional[User]:
        """Kullanıcı adıyla kullanıcı bul."""
        return User.query.filter_by(username=username).first()

    def find_all_teachers(self) -> list[User]:
        """Tüm öğretmenleri listele."""
        return User.query.filter_by(role='TEACHER').all()

    def update_guide_teacher(self, student: User, teacher_id: int) -> User:
        """Öğrencinin danışman öğretmenini güncelle (kalıcı atama)."""
        student.guide_teacher_id = teacher_id
        db.session.commit()
        return student


# Modül seviyesinde tekil örnek — Service katmanı tarafından kullanılır
user_repository = UserRepository()
