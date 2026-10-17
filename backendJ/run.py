import argparse
import sys
import uvicorn
from app.core.config import settings
from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.models.user import User
from app.core.security import get_password_hash
from app.utils.datetime import now_jakarta


def cmd_run():
    print(f"Memulai server {settings.APP_NAME}...")
    print(f"Host: {settings.APP_HOST}, Port: {settings.APP_PORT}")
    print(f"Swagger Docs: http://{settings.APP_HOST}:{settings.APP_PORT}/docs")
    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.DEBUG,
    )


def cmd_init_db():
    print("Menginisialisasi database...")
    db = SessionLocal()
    try:
        init_db(db)
        print("Inisialisasi database selesai.")
    finally:
        db.close()


def cmd_create_admin(username, email, password, full_name):
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            print(f"Pengguna '{username}' sudah ada. Memperbarui kata sandi...")
            existing.hashed_password = get_password_hash(password)
            existing.email = email
            existing.is_admin = True
            existing.is_active = True
            existing.updated_at = now_jakarta()
            db.commit()
            print(f"Akun administrator '{username}' berhasil diperbarui.")
            return

        admin = User(
            username=username,
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            is_active=True,
            is_admin=True,
            created_at=now_jakarta(),
            updated_at=now_jakarta()
        )
        db.add(admin)
        db.commit()
        print(f"Administrator '{username}' berhasil dibuat.")
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Weather-Responsive Roofing System V2.0 CLI Runner")
    subparsers = parser.add_subparsers(dest="command", help="Perintah yang tersedia")

    # Command: run (default)
    subparsers.add_parser("run", help="Jalankan server FastAPI (default)")

    # Command: init-db
    subparsers.add_parser("init-db", help="Inisialisasi tabel dan data awal database")

    # Command: create-admin
    admin_parser = subparsers.add_parser("create-admin", help="Buat akun administrator baru")
    admin_parser.add_argument("--username", required=True, help="Username admin")
    admin_parser.add_argument("--email", required=True, help="Email admin")
    admin_parser.add_argument("--password", required=True, help="Password admin")
    admin_parser.add_argument("--full-name", default="Administrator", help="Nama lengkap")

    args = parser.parse_args()

    if args.command == "init-db":
        cmd_init_db()
    elif args.command == "create-admin":
        cmd_create_admin(args.username, args.email, args.password, args.full_name)
    else:
        cmd_run()


if __name__ == "__main__":
    main()
