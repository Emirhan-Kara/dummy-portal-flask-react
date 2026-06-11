"""Ders modeli."""

from datetime import datetime
from app.extensions import db


class Course(db.Model):
    """
    Ders tablosu.
    Her dersin benzersiz bir kodu, adı, kredisi ve öğretim görevlisi (düz metin) vardır.
    Kapasite, ön koşul gibi karmaşık özellikler bu projede YOK.
    """

    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(10), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    credits = db.Column(db.Integer, nullable=False)  # Minimum 1, sıfır kredi yok
    instructor = db.Column(db.String(100), nullable=False)  # Düz metin, FK değil
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # İlişkiler
    selections = db.relationship(
        'StudentCourseSelection',
        backref='course',
        lazy='dynamic'
    )

    def to_dict(self) -> dict:
        """Ders verisini sözlük olarak döndürür."""
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'credits': self.credits,
            'instructor': self.instructor,
        }
