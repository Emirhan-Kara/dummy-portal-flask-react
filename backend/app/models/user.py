"""Kullanıcı modeli — Öğrenci ve Öğretmen rollerini içerir."""

from datetime import datetime
from app.extensions import db


class User(db.Model):
    """
    Kullanıcı tablosu.
    Hem STUDENT hem TEACHER rolü tek tabloda tutulur.
    Öğrencilerin isteğe bağlı bir danışman öğretmeni (guide_teacher) olabilir.
    """

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(
        db.Enum('STUDENT', 'TEACHER', name='user_role'),
        nullable=False
    )
    full_name = db.Column(db.String(100), nullable=False)

    # Sadece öğrenciler için — danışman öğretmen referansı
    guide_teacher_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=True
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # İlişkiler
    guide_teacher = db.relationship(
        'User',
        remote_side=[id],
        backref='students'
    )
    selections = db.relationship(
        'StudentCourseSelection',
        backref='student',
        lazy='dynamic'
    )

    def to_dict(self) -> dict:
        """Kullanıcı verisini sözlük olarak döndürür."""
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'full_name': self.full_name,
            'guide_teacher_id': self.guide_teacher_id,
        }
