"""Ders seçimi veritabanı işlemleri (CRUD)."""

from typing import Optional
from app.extensions import db
from app.models.student_course_selection import StudentCourseSelection
from app.models.course import Course
from app.models.user import User


class SelectionRepository:
    """Öğrenci ders seçimi tablosu için veritabanı erişim katmanı."""

    def find_by_id(self, selection_id: int) -> Optional[StudentCourseSelection]:
        """ID ile seçim kaydı bul."""
        return StudentCourseSelection.query.get(selection_id)

    def find_by_student_id(self, student_id: int) -> list[StudentCourseSelection]:
        """Bir öğrencinin tüm seçimlerini getir."""
        return StudentCourseSelection.query.filter_by(
            student_id=student_id
        ).all()

    def find_by_student_and_course(
        self, student_id: int, course_id: int
    ) -> Optional[StudentCourseSelection]:
        """Bir öğrencinin belirli bir ders için seçim kaydını bul."""
        return StudentCourseSelection.query.filter_by(
            student_id=student_id,
            course_id=course_id
        ).first()

    def find_by_student_and_status(
        self, student_id: int, status: str
    ) -> list[StudentCourseSelection]:
        """Bir öğrencinin belirli durumdaki seçimlerini getir."""
        return StudentCourseSelection.query.filter_by(
            student_id=student_id,
            status=status
        ).all()

    def find_by_student_and_statuses(
        self, student_id: int, statuses: list[str]
    ) -> list[StudentCourseSelection]:
        """Bir öğrencinin birden fazla durumdaki seçimlerini getir."""
        return StudentCourseSelection.query.filter(
            StudentCourseSelection.student_id == student_id,
            StudentCourseSelection.status.in_(statuses)
        ).all()

    def find_pending_by_teacher(self, teacher_id: int) -> list[dict]:
        """
        Bir öğretmenin danışmanı olduğu öğrencilerin
        PENDING_APPROVAL durumdaki seçimlerini öğrenci bazında grupla.
        """

        # Bu öğretmene atanmış öğrencileri bul
        students = User.query.filter_by(
            role='STUDENT',
            guide_teacher_id=teacher_id
        ).all()

        result = []
        for student in students:
            # Her öğrencinin bekleyen seçimlerini al
            pending = StudentCourseSelection.query.filter_by(
                student_id=student.id,
                status='PENDING_APPROVAL'
            ).all()

            if pending:
                result.append({
                    'student': student.to_dict(),
                    'pending_selections': [s.to_dict() for s in pending]
                })

        return result

    def find_all_by_student_for_teacher(
        self, student_id: int
    ) -> list[StudentCourseSelection]:
        """Bir öğrencinin tüm seçimlerini öğretmen görünümü için getir."""
        return StudentCourseSelection.query.filter_by(
            student_id=student_id
        ).all()

    def create(self, student_id: int, course_id: int) -> StudentCourseSelection:
        """Yeni ders seçimi oluştur (DRAFT durumunda)."""
        selection = StudentCourseSelection(
            student_id=student_id,
            course_id=course_id,
            status='DRAFT'
        )
        db.session.add(selection)
        db.session.commit()
        return selection

    def delete(self, selection: StudentCourseSelection) -> None:
        """Seçim kaydını sil."""
        db.session.delete(selection)
        db.session.commit()

    def update_status_bulk(
        self, selections: list[StudentCourseSelection], new_status: str
    ) -> None:
        """Birden fazla seçimin durumunu toplu güncelle."""
        for selection in selections:
            selection.status = new_status
            # Yeni duruma geçişte öğretmen notunu temizle (DRAFT/REVISION → PENDING)
            if new_status == 'PENDING_APPROVAL':
                selection.teacher_note = None
        db.session.commit()

    def update_decision(
        self,
        selection: StudentCourseSelection,
        action: str,
        teacher_note: Optional[str]
    ) -> None:
        """Tek bir seçimin durumunu ve öğretmen notunu güncelle (finalize)."""
        selection.status = action
        selection.teacher_note = teacher_note
        db.session.commit()

    def calculate_consumed_credits(self, student_id: int) -> int:
        """
        Öğrencinin kullanılan kredi toplamını hesapla.
        Kredi tüketen durumlar: DRAFT, PENDING_APPROVAL, APPROVED, REVISION.
        REJECTED durumu kredi tüketmez.
        """

        credit_consuming_statuses = [
            'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REVISION'
        ]

        # Kredi tüketen seçimlerin ders kredilerini topla
        result = db.session.query(
            db.func.coalesce(db.func.sum(Course.credits), 0)
        ).join(
            StudentCourseSelection,
            StudentCourseSelection.course_id == Course.id
        ).filter(
            StudentCourseSelection.student_id == student_id,
            StudentCourseSelection.status.in_(credit_consuming_statuses)
        ).scalar()

        return int(result)


# Modül seviyesinde tekil örnek
selection_repository = SelectionRepository()
