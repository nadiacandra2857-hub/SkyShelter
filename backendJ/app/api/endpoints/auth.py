from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.config import settings
from app.core.dependencies import get_db, get_current_user
from app.core.security import verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse, LogoutResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login menggunakan username atau email dan kata sandi.
    Mengembalikan token JWT Bearer beserta detail pengguna.
    """
    identifier = request.username.strip()
    user = (
        db.query(User)
        .filter(or_(User.username == identifier, User.email == identifier))
        .first()
    )

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Username/email atau kata sandi tidak sesuai."},
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "ACCOUNT_DISABLED", "message": "Akun ini telah dinonaktifkan oleh administrator."},
        )

    access_token = create_access_token(
        subject=user.id,
        extra_claims={"username": user.username, "is_admin": user.is_admin}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in_minutes=settings.JWT_EXPIRE_MINUTES,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Mendapatkan profil informasi pengguna yang sedang login."""
    return UserResponse.model_validate(current_user)


@router.post("/logout", response_model=LogoutResponse)
def logout(current_user: User = Depends(get_current_user)):
    """
    Logout dari sesi pengguna.
    Mengingat JWT menggunakan mekanisme stateless Bearer token, klien (frontend React)
    harus menghapus access token dari local storage atau cookie browser.
    """
    return LogoutResponse(
        message="Logout berhasil. Silakan hapus token dari penyimpanan sesi klien.",
        details="Stateless JWT: Token dibuang di sisi klien."
    )
