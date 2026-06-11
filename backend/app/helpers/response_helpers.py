"""Standart JSON yanıt oluşturucular."""

from flask import jsonify


def success_response(data = None, message: str = "İşlem başarılı.", status: int = 200):
    """Başarılı API yanıtı oluşturur."""
    body = {"message": message}
    if data is not None:
        body["data"] = data
    return jsonify(body), status


def error_response(message: str, status: int = 400, details = None):
    """Hatalı API yanıtı oluşturur."""
    body = {"error": message}
    if details is not None:
        body["details"] = details
    return jsonify(body), status
