"""Öğretmen değerlendirme iş mantığı."""

from typing import Tuple, Optional

from app.repositories.selection_repository import selection_repository
from app.repositories.user_repository import user_repository


class TeacherService:
    """Öğretmen ders değerlendirmesi için iş mantığı katmanı."""

    def __init__(self) -> None:
        self.selection_repository = selection_repository
        self.user_repository = user_repository

    def get_assigned_students(self, teacher_id: int) -> list[dict]:
        """
        Öğretmene atanmış öğrencileri ve bekleyen seçimlerini getir.
        Sadece PENDING_APPROVAL durumundaki öğrenciler listelenir.
        """
        return self.selection_repository.find_pending_by_teacher(teacher_id)

    def get_student_selections(
        self, teacher_id: int, student_id: int
    ) -> Tuple[Optional[list[dict]], Optional[str]]:
        """
        Belirli bir öğrencinin bekleyen seçimlerini getir.
        Öğretmenin bu öğrencinin danışmanı olduğunu doğrular.
        """
        # Öğrenciyi bul ve danışman ilişkisini doğrula
        student = self.user_repository.find_by_id(student_id)
        if not student or student.guide_teacher_id != teacher_id:
            return None, "Bu öğrenci size atanmamış."

        # Öğrencinin tüm seçimlerini getir
        selections = self.selection_repository.find_all_by_student_for_teacher(student_id)
        return [s.to_dict() for s in selections], None

    def finalize_decisions(
        self, teacher_id: int, student_id: int, decisions: list[dict]
    ) -> Tuple[bool, Optional[str]]:
        """
        Öğretmenin öğrenci dersleri için toplu kararını kaydet.
        Kurallar:
        - Öğretmen bu öğrencinin danışmanı olmalı
        - Tüm PENDING_APPROVAL dersler için karar verilmeli (kısmi kabul yok)
        - REVISION/REJECTED kararlarında teacher_note zorunlu
        - Kararlar kalıcıdır — geri alınamaz
        """
        # 1) Danışman ilişkisini doğrula
        student = self.user_repository.find_by_id(student_id)
        if not student or student.guide_teacher_id != teacher_id:
            return False, "Bu öğrenci size atanmamış."

        # 2) Öğrencinin bekleyen seçimlerini al
        pending = self.selection_repository.find_by_student_and_status(
            student_id, 'PENDING_APPROVAL'
        )
        if not pending:
            return False, "Bu öğrencinin bekleyen ders seçimi yok."

        # 3) Tüm bekleyen seçimler için karar verilmiş mi kontrol et
        pending_ids = {s.id for s in pending}
        decision_ids = {d['selection_id'] for d in decisions}

        if pending_ids != decision_ids:
            return False, (
                "Tüm bekleyen dersler için karar verilmelidir. "
                "Kısmi değerlendirme yapılamaz."
            )

        # 4) Her karar için teacher_note zorunluluğunu kontrol et
        for decision in decisions:
            action = decision['action']
            note = decision.get('teacher_note')

            # REVISION ve REJECTED durumlarında not zorunlu
            if action in ('REVISION', 'REJECTED') and not note:
                return False, (
                    f"'{action}' kararı için öğretmen notu zorunludur."
                )

        # 5) Kararları uygula — her seçimi güncelle
        selection_map = {s.id: s for s in pending}
        for decision in decisions:
            selection = selection_map[decision['selection_id']]
            self.selection_repository.update_decision(
                selection=selection,
                action=decision['action'],
                teacher_note=decision.get('teacher_note')
            )

        return True, None


# Modül seviyesinde tekil örnek
teacher_service = TeacherService()
