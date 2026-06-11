"""Giriş işlemleri için Marshmallow validasyon şemaları."""

from marshmallow import Schema, fields, validate


class LoginSchema(Schema):
    """Kullanıcı giriş isteği validasyonu."""
    username = fields.String(
        required=True,
        validate=validate.Length(min=1, error="Kullanıcı adı boş olamaz.")
    )
    password = fields.String(
        required=True,
        validate=validate.Length(min=1, error="Şifre boş olamaz.")
    )
