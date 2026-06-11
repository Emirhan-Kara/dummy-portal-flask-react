"""Ders seçimi işlemleri için Marshmallow validasyon şemaları."""

from marshmallow import Schema, fields


class AddSelectionSchema(Schema):
    """Sepete ders ekleme isteği validasyonu."""
    course_id = fields.Integer(
        required=True,
        error_messages={"required": "Ders ID zorunludur."}
    )


class GuideTeacherSchema(Schema):
    """Danışman öğretmen atama isteği validasyonu."""
    teacher_id = fields.Integer(
        required=True,
        error_messages={"required": "Öğretmen ID zorunludur."}
    )
