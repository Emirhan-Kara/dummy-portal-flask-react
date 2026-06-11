"""
Özel dekoratörler — kimlik doğrulama, rol kontrolü ve validasyon.
Controller katmanında kullanılır; birden fazla işlevi tek satırda birleştirir.
"""

from functools import wraps
from typing import Type

from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema


def role_required(role: str):
    """
    Belirli bir rol gerektiren endpoint'ler için dekoratör.
    JWT doğrulamasını da içerir — ayrıca @jwt_required() eklemeye gerek yok.
    Kullanım: @role_required('STUDENT')
    """
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            # Lazy import — döngüsel bağımlılıkları önlemek için
            from app.repositories.user_repository import user_repository

            user_id: int = int(get_jwt_identity())
            user = user_repository.find_by_id(user_id)

            if not user or user.role != role:
                return jsonify({"error": "Bu işlem için yetkiniz yok."}), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator


def validate_body(schema_class: Type[Schema]):
    """
    Request body'sini Marshmallow şemasıyla doğrulayan dekoratör.
    Geçersiz veri durumunda 400 döndürür, Service katmanına ulaşmaz.
    Kullanım: @validate_body(LoginSchema)
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # JSON body olup olmadığını kontrol et
            json_data = request.get_json(silent=True)
            if json_data is None:
                return jsonify({"error": "Geçersiz veya eksik JSON verisi."}), 400

            # Marshmallow ile doğrula
            schema = schema_class()
            errors = schema.validate(json_data)
            if errors:
                return jsonify({
                    "error": "Geçersiz veri.",
                    "details": errors
                }), 400

            return fn(*args, **kwargs)
        return wrapper
    return decorator
