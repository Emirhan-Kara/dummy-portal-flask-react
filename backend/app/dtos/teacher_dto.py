"""Öğretmen değerlendirme işlemleri için Marshmallow validasyon şemaları."""

from marshmallow import Schema, fields, validate


class DecisionSchema(Schema):
    """Tek bir ders için öğretmen kararı validasyonu."""
    selection_id = fields.Integer(
        required=True,
        error_messages={"required": "Seçim ID zorunludur."}
    )
    action = fields.String(
        required=True,
        validate=validate.OneOf(
            ['APPROVED', 'REVISION', 'REJECTED'],
            error="Geçerli aksiyonlar: APPROVED, REVISION, REJECTED."
        )
    )
    # REVISION ve REJECTED durumlarında öğretmen notu zorunlu olacak
    # (iş mantığı katmanında kontrol edilir)
    teacher_note = fields.String(allow_none=True, load_default=None)


class FinalizeSchema(Schema):
    """Öğretmen toplu değerlendirme isteği validasyonu."""
    decisions = fields.List(
        fields.Nested(DecisionSchema),
        required=True,
        validate=validate.Length(min=1, error="En az bir karar gereklidir.")
    )
