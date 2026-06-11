"""Öğrenci ders seçimi junction tablosu."""

from datetime import datetime
from app.extensions import db


class StudentCourseSelection(db.Model):
    """
    Öğrenci-Ders seçim tablosu (junction table).
    Her kayıt bir öğrencinin bir ders için yaptığı seçimi temsil eder.
        DRAFT → PENDING_APPROVAL → APPROVED / REVISION / REJECTED
    Bir öğrenci aynı dersi iki kez seçemez (unique constraint).
    """

    __tablename__ = 'student_course_selections'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )
    course_id = db.Column(
        db.Integer,
        db.ForeignKey('courses.id'),
        nullable=False
    )
    status = db.Column(
        db.Enum(
            'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REVISION', 'REJECTED',
            name='selection_status'
        ),
        nullable=False,
        default='DRAFT'
    )
    # Öğretmen notu — sadece REVISION veya REJECTED durumlarında zorunlu
    teacher_note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Benzersizlik kısıtı — bir öğrenci aynı dersi tekrar seçemez
    __table_args__ = (
        db.UniqueConstraint('student_id', 'course_id', name='uq_student_course'),
    )

    def to_dict(self) -> dict:
        """Seçim verisini sözlük olarak döndürür (ders bilgisiyle birlikte)."""
        result = {
            'id': self.id,
            'student_id': self.student_id,
            'course_id': self.course_id,
            'status': self.status,
            'teacher_note': self.teacher_note,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        # Eğer course ilişkisi yüklüyse, ders bilgisini de ekle
        if self.course:
            result['course'] = self.course.to_dict()
        return result
