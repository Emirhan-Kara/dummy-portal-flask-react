"""Ders seçimi iş mantığı — sepet işlemleri ve kredi kontrolü."""

from typing import Tuple, Optional

from app.repositories.selection_repository import selection_repository
from app.repositories.course_repository import course_repository
from app.repositories.user_repository import user_repository

# Maksimum kredi limiti
MAX_CREDITS = 40


class SelectionService:
    """Öğrenci ders seçimi için iş mantığı katmanı."""

    def __init__(self) -> None:
        self.selection_repository = selection_repository
        self.course_repository = course_repository
        self.user_repository = user_repository

    def get_selections(self, student_id: int) -> list[dict]:
        """Öğrencinin tüm seçimlerini getir."""
        selections = self.selection_repository.find_by_student_id(student_id)
        return [s.to_dict() for s in selections]

    def get_credits(self, student_id: int) -> dict:
        """Öğrencinin kredi durumunu hesapla."""
        consumed = self.selection_repository.calculate_consumed_credits(student_id)
        return {
            'consumed': consumed,
            'remaining': MAX_CREDITS - consumed,
            'max': MAX_CREDITS
        }

    def add_selection(
        self, student_id: int, course_id: int
    ) -> Tuple[Optional[dict], Optional[str]]:
        """
        Sepete ders ekle (DRAFT durumunda).
        Kurallar:
        - Sepet kilitliyse (PENDING_APPROVAL varsa) → engelle
        - Ders zaten seçiliyse veya reddedilmişse → engelle
        - Kredi limiti aşılıyorsa → engelle
        """
        # 1) Sepet kilidi kontrolü — PENDING_APPROVAL varsa sepet kilitli
        pending = self.selection_repository.find_by_student_and_status(
            student_id, 'PENDING_APPROVAL'
        )
        if pending:
            return None, "Sepetiniz onay bekliyor, değişiklik yapamazsınız."

        # 2) Dersin geçerli olduğunu doğrula
        course = self.course_repository.find_by_id(course_id)
        if not course:
            return None, "Ders bulunamadı."

        # 3) Aynı dersin daha önce seçilip seçilmediğini kontrol et
        existing = self.selection_repository.find_by_student_and_course(
            student_id, course_id
        )
        if existing:
            if existing.status == 'REJECTED':
                return None, "Bu ders reddedildi, tekrar seçilemez."
            return None, "Bu ders zaten sepetinizde."

        # 4) Kredi limiti kontrolü — eklenen dersle birlikte 40'ı geçmemeli
        consumed = self.selection_repository.calculate_consumed_credits(student_id)
        if consumed + course.credits > MAX_CREDITS:
            return None, (
                f"Kredi limiti aşılıyor. "
                f"Mevcut: {consumed}, Eklenmek istenen: {course.credits}, "
                f"Limit: {MAX_CREDITS}."
            )

        # 5) Yeni seçim oluştur
        selection = self.selection_repository.create(student_id, course_id)
        return selection.to_dict(), None

    def remove_selection(
        self, student_id: int, selection_id: int
    ) -> Tuple[bool, Optional[str]]:
        """
        Sepetten ders çıkar.
        Sadece DRAFT veya REVISION durumundaki seçimler silinebilir.
        REVISION silindiğinde yeni kayıt OLUŞTURULMAZ — öğrenci ayrıca yeni ders ekler.
        """
        # 1) Sepet kilidi kontrolü
        pending = self.selection_repository.find_by_student_and_status(
            student_id, 'PENDING_APPROVAL'
        )
        if pending:
            return False, "Sepetiniz onay bekliyor, değişiklik yapamazsınız."

        # 2) Seçim kaydını bul ve öğrenciye ait olduğunu doğrula
        selection = self.selection_repository.find_by_id(selection_id)
        if not selection or selection.student_id != student_id:
            return False, "Seçim kaydı bulunamadı."

        # 3) Sadece DRAFT veya REVISION durumundaki kayıtlar silinebilir
        if selection.status not in ('DRAFT', 'REVISION'):
            return False, "Bu durumdaki ders sepetten çıkarılamaz."

        # 4) Kaydı tamamen sil
        self.selection_repository.delete(selection)
        return True, None

    def submit_selections(
        self, student_id: int
    ) -> Tuple[bool, Optional[str]]:
        """
        Sepetteki tüm DRAFT ve REVISION derslerini onaya gönder.
        Kurallar:
        - Sepet zaten kilitliyse → engelle
        - Gönderilecek ders yoksa → engelle
        - Danışman öğretmen atanmamışsa → engelle
        """
        # 1) Sepet kilidi kontrolü
        pending = self.selection_repository.find_by_student_and_status(
            student_id, 'PENDING_APPROVAL'
        )
        if pending:
            return False, "Sepetiniz zaten onay bekliyor."

        # 2) Danışman öğretmen kontrolü
        student = self.user_repository.find_by_id(student_id)
        if not student or not student.guide_teacher_id:
            return False, "Lütfen önce bir danışman öğretmen seçin."

        # 3) Gönderilecek dersleri bul (DRAFT + REVISION)
        submittable = self.selection_repository.find_by_student_and_statuses(
            student_id, ['DRAFT', 'REVISION']
        )
        if not submittable:
            return False, "Gönderilecek ders seçimi bulunamadı."

        # 4) Tüm DRAFT/REVISION → PENDING_APPROVAL
        self.selection_repository.update_status_bulk(
            submittable, 'PENDING_APPROVAL'
        )
        return True, None


# Modül seviyesinde tekil örnek
selection_service = SelectionService()
