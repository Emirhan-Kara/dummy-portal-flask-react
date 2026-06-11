"""
Veritabanını sıfırlama scripti.
Tüm tabloları siler ve yeniden oluşturur.
Kullanım: python reset_db.py
"""

from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    print("⚠️  Tüm tablolar siliniyor...")
    db.drop_all()
    print("✅  Tablolar silindi.")

    print("📦  Tablolar yeniden oluşturuluyor...")
    db.create_all()
    print("✅  Tablolar oluşturuldu.")

    print("\n🎉  Veritabanı başarıyla sıfırlandı!")
    print("💡  Şimdi 'python seed_db.py' ile test verilerini ekleyebilirsiniz.")
