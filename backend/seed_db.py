"""
Veritabanı test verisi ekleme scripti.
15 ders (CMPE/ENGR), 2 öğretmen, 2 öğrenci oluşturur.
Tüm şifreler: 1234
Kullanım: python seed_db.py
"""

from werkzeug.security import generate_password_hash
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.course import Course


app = create_app()

# ─── Test Kullanıcıları ─────────────────────────────────────────────
USERS = [
    {
        'username': 'teacher1',
        'password': '1234',
        'role': 'TEACHER',
        'full_name': 'Prof. Dr. Ahmet Yılmaz'
    },
    {
        'username': 'teacher2',
        'password': '1234',
        'role': 'TEACHER',
        'full_name': 'Doç. Dr. Elif Kaya'
    },
    {
        'username': 'student1',
        'password': '1234',
        'role': 'STUDENT',
        'full_name': 'Ali Veli Demir'
    },
    {
        'username': 'student2',
        'password': '1234',
        'role': 'STUDENT',
        'full_name': 'Ayşe Fatma Çelik'
    },
]

# ─── Test Dersleri (15 adet — CMPE ve ENGR kodları) ─────────────────
COURSES = [
    {'code': 'CMPE101', 'name': 'Bilgisayar Mühendisliğine Giriş', 'credits': 3, 'instructor': 'Prof. Dr. Ahmet Yılmaz'},
    {'code': 'CMPE201', 'name': 'Veri Yapıları', 'credits': 4, 'instructor': 'Doç. Dr. Elif Kaya'},
    {'code': 'CMPE202', 'name': 'Nesne Yönelimli Programlama', 'credits': 3, 'instructor': 'Prof. Dr. Ahmet Yılmaz'},
    {'code': 'CMPE301', 'name': 'Veritabanı Yönetim Sistemleri', 'credits': 4, 'instructor': 'Doç. Dr. Elif Kaya'},
    {'code': 'CMPE302', 'name': 'İşletim Sistemleri', 'credits': 4, 'instructor': 'Prof. Dr. Ahmet Yılmaz'},
    {'code': 'CMPE303', 'name': 'Bilgisayar Ağları', 'credits': 3, 'instructor': 'Doç. Dr. Elif Kaya'},
    {'code': 'CMPE401', 'name': 'Yazılım Mühendisliği', 'credits': 3, 'instructor': 'Prof. Dr. Ahmet Yılmaz'},
    {'code': 'CMPE402', 'name': 'Yapay Zeka', 'credits': 3, 'instructor': 'Doç. Dr. Elif Kaya'},
    {'code': 'CMPE403', 'name': 'Makine Öğrenmesi', 'credits': 3, 'instructor': 'Prof. Dr. Ahmet Yılmaz'},
    {'code': 'CMPE404', 'name': 'Web Programlama', 'credits': 3, 'instructor': 'Doç. Dr. Elif Kaya'},
    {'code': 'ENGR101', 'name': 'Mühendislik Matematiği I', 'credits': 4, 'instructor': 'Prof. Dr. Mehmet Öz'},
    {'code': 'ENGR102', 'name': 'Mühendislik Matematiği II', 'credits': 4, 'instructor': 'Prof. Dr. Mehmet Öz'},
    {'code': 'ENGR201', 'name': 'Olasılık ve İstatistik', 'credits': 3, 'instructor': 'Doç. Dr. Zeynep Arslan'},
    {'code': 'ENGR301', 'name': 'Mühendislik Etiği', 'credits': 2, 'instructor': 'Prof. Dr. Mehmet Öz'},
    {'code': 'ENGR401', 'name': 'Bitirme Projesi', 'credits': 5, 'instructor': 'Doç. Dr. Zeynep Arslan'},
]


with app.app_context():
    # Mevcut veri kontrolü
    existing_users = User.query.count()
    existing_courses = Course.query.count()

    if existing_users > 0 or existing_courses > 0:
        print("⚠️  Veritabanında zaten veri var!")
        print("💡  Önce 'python reset_db.py' ile sıfırlayın.")
        exit(1)

    # Kullanıcıları ekle
    print("👤  Kullanıcılar oluşturuluyor...")
    for user_data in USERS:
        user = User(
            username=user_data['username'],
            password_hash=generate_password_hash(user_data['password']),
            role=user_data['role'],
            full_name=user_data['full_name']
        )
        db.session.add(user)
        print(f"   ✅  {user_data['role']}: {user_data['username']} / {user_data['password']}")

    # Dersleri ekle
    print("\n📚  Dersler oluşturuluyor...")
    for course_data in COURSES:
        course = Course(
            code=course_data['code'],
            name=course_data['name'],
            credits=course_data['credits'],
            instructor=course_data['instructor']
        )
        db.session.add(course)
        print(f"   ✅  {course_data['code']} — {course_data['name']} ({course_data['credits']} kredi)")

    db.session.commit()

    print(f"\n🎉  Seed tamamlandı!")
    print(f"   👤  {len(USERS)} kullanıcı oluşturuldu")
    print(f"   📚  {len(COURSES)} ders oluşturuldu")
    print(f"\n💡  Giriş bilgileri:")
    print(f"   Öğretmen: teacher1/1234 veya teacher2/1234")
    print(f"   Öğrenci:  student1/1234 veya student2/1234")
