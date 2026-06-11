"""Danışman öğretmen iş mantığı."""

from typing import Tuple, Optional

from app.models.user import User
from app.repositories.user_repository import user_repository


class StudentService:
    """Öğrenci-öğretmen ilişkisi için iş mantığı katmanı."""

    def __init__(self) -> None:
        self.user_repository = user_repository

    def get_available_teachers(self) -> list[dict]:
        """Seçilebilir öğretmenlerin listesini döndür."""
        teachers: list[User] = self.user_repository.find_all_teachers()
        return [
            {'id': t.id, 'full_name': t.full_name}
            for t in teachers
        ]

    def set_guide_teacher(
        self, student_id: int, teacher_id: int
    ) -> Tuple[Optional[dict], Optional[str]]:
        """
        Öğrenciye danışman öğretmen ata (kalıcı).
        Başarılı: (user_dict, None)
        Başarısız: (None, hata_mesajı)
        """
        # Öğrenciyi bul ve rolünü doğrula
        student = self.user_repository.find_by_id(student_id)
        if not student or student.role != 'STUDENT':
            return None, "Öğrenci bulunamadı."

        # Daha önce atanmışsa değişikliğe izin verme
        if student.guide_teacher_id is not None:
            return None, "Danışman öğretmen daha önce atanmış ve değiştirilemez."

        # Öğretmenin geçerli olduğunu doğrula
        teacher = self.user_repository.find_by_id(teacher_id)
        if not teacher or teacher.role != 'TEACHER':
            return None, "Geçersiz öğretmen ID."

        # Danışman öğretmeni ata
        updated = self.user_repository.update_guide_teacher(student, teacher_id)
        return updated.to_dict(), None


# Modül seviyesinde tekil örnek
student_service = StudentService()
