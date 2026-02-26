from fastapi import FastAPI, HTTPException, Depends, status, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Any
import sqlite3
from datetime import datetime
import secrets
import os
import uuid
import shutil
from collections import defaultdict
import time
from pathlib import Path
from dotenv import load_dotenv
import threading
import httpx

# .env dosyasını yükle (şifre vb. burada)
load_dotenv()

app = FastAPI(title="ArslanOps API")

# Uploads directory
UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# Serve uploaded files as static
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Basic Auth
security = HTTPBasic()

# CORS
PRODUCTION_ORIGIN = os.getenv("PRODUCTION_ORIGIN", "")
cors_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
if PRODUCTION_ORIGIN:
    cors_origins.append(PRODUCTION_ORIGIN)
# Custom domain origins
cors_origins.extend(["https://arslanops.com", "https://www.arslanops.com"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Keep-alive: Render ücretsiz planda uyuma engelleyici ───
RENDER_URL = os.getenv("RENDER_EXTERNAL_URL", "")

def keep_alive():
    """Her 14 dakikada backend'e ping atarak uyumasını engeller."""
    while True:
        time.sleep(14 * 60)  # 14 dakika
        if RENDER_URL:
            try:
                httpx.get(f"{RENDER_URL}/health", timeout=10)
            except Exception:
                pass

@app.on_event("startup")
async def start_keep_alive():
    if RENDER_URL:
        thread = threading.Thread(target=keep_alive, daemon=True)
        thread.start()

@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# Rate limiter (in-memory)
rate_limit_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_MAX = 5  # max requests
RATE_LIMIT_WINDOW = 300  # per 5 minutes (seconds)

def check_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    # clean old entries
    rate_limit_store[client_ip] = [
        t for t in rate_limit_store[client_ip] if now - t < RATE_LIMIT_WINDOW
    ]
    if len(rate_limit_store[client_ip]) >= RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=429,
            detail="Çok fazla istek gönderdiniz. Lütfen birkaç dakika sonra tekrar deneyin."
        )
    rate_limit_store[client_ip].append(now)

# Admin credentials from env
ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASS = os.getenv("ADMIN_PASS", "arslanops2024")

# Database initialization
def init_db():
    conn = sqlite3.connect("leads.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ad_soyad TEXT NOT NULL,
            isletme_turu TEXT NOT NULL,
            sehir TEXT NOT NULL,
            telefon TEXT NOT NULL,
            email TEXT,
            mesaj TEXT NOT NULL,
            paket TEXT,
            utm_source TEXT,
            utm_campaign TEXT,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

# Models
class LeadCreate(BaseModel):
    ad_soyad: str
    isletme_turu: str
    sehir: str
    telefon: str
    email: Optional[str] = None
    mesaj: str
    paket: Optional[str] = None
    utm_source: Optional[str] = None
    utm_campaign: Optional[str] = None
    website: Optional[str] = None  # honeypot field

    @validator("ad_soyad", "isletme_turu", "sehir", "telefon", "mesaj")
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Bu alan boş bırakılamaz")
        return v.strip()

    @validator("telefon")
    def validate_phone(cls, v):
        cleaned = v.strip().replace(" ", "").replace("-", "")
        if len(cleaned) < 10:
            raise ValueError("Telefon numarası en az 10 karakter olmalıdır")
        return cleaned

    @validator("email")
    def validate_email_if_present(cls, v):
        if v and v.strip():
            if "@" not in v:
                raise ValueError("Geçerli bir e-posta adresi giriniz")
            return v.strip()
        return None

class Lead(BaseModel):
    id: int
    ad_soyad: str
    isletme_turu: str
    sehir: str
    telefon: str
    email: Optional[str]
    mesaj: str
    paket: Optional[str]
    utm_source: Optional[str]
    utm_campaign: Optional[str]
    created_at: str

# Auth dependency
def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USER)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASS)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yanlış kullanıcı adı veya şifre",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# ─── File Upload ───

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15MB

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    category: str = Form(default="general"),
    username: str = Depends(verify_admin)
):
    """Upload a file (image or video). category: logo, hero, general"""
    if file.content_type not in ALLOWED_IMAGE_TYPES | ALLOWED_VIDEO_TYPES:
        raise HTTPException(400, f"Desteklenmeyen dosya türü: {file.content_type}")
    
    # Read and check size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(400, "Dosya boyutu 15MB'dan büyük olamaz")
    
    # Create category subfolder
    category_dir = UPLOADS_DIR / category
    category_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    ext = os.path.splitext(file.filename or "file")[1]
    filename = f"{uuid.uuid4().hex[:12]}{ext}"
    filepath = category_dir / filename
    
    with open(filepath, "wb") as f:
        f.write(contents)
    
    # Return the URL path
    url = f"/uploads/{category}/{filename}"
    return {"success": True, "url": url, "filename": filename, "category": category}

@app.delete("/api/upload")
def delete_uploaded_file(url: str, username: str = Depends(verify_admin)):
    """Delete an uploaded file by its URL path"""
    if not url.startswith("/uploads/"):
        raise HTTPException(400, "Geçersiz dosya yolu")
    
    filepath = Path(__file__).parent / url.lstrip("/")
    if filepath.exists():
        filepath.unlink()
        return {"success": True, "message": "Dosya silindi"}
    raise HTTPException(404, "Dosya bulunamadı")

# Routes
@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/leads", status_code=201)
def create_lead(lead: LeadCreate, request: Request):
    # Rate limiting
    check_rate_limit(request)
    
    # Honeypot check (bots fill this hidden field)
    if lead.website:
        return {"success": True, "message": "Talebiniz başarıyla alındı", "id": 0}
    
    conn = sqlite3.connect("leads.db")
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO leads 
            (ad_soyad, isletme_turu, sehir, telefon, email, mesaj, paket, utm_source, utm_campaign, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            lead.ad_soyad,
            lead.isletme_turu,
            lead.sehir,
            lead.telefon,
            lead.email,
            lead.mesaj,
            lead.paket,
            lead.utm_source,
            lead.utm_campaign,
            datetime.now().isoformat()
        ))
        conn.commit()
        lead_id = cursor.lastrowid
        return {"success": True, "message": "Talebiniz başarıyla alındı", "id": lead_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Veritabanı hatası: {str(e)}")
    finally:
        conn.close()

@app.get("/api/leads", response_model=List[Lead])
def get_leads(username: str = Depends(verify_admin)):
    conn = sqlite3.connect("leads.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM leads ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

@app.delete("/api/leads/{lead_id}")
def delete_lead(lead_id: int, username: str = Depends(verify_admin)):
    conn = sqlite3.connect("leads.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Lead bulunamadı")
    conn.commit()
    conn.close()
    return {"success": True, "message": "Lead silindi"}

# ─── Content Management (CMS) ───

import json
from pathlib import Path

CONTENT_FILE = Path(__file__).parent / "content.json"

def load_content() -> dict:
    if CONTENT_FILE.exists():
        with open(CONTENT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_content(data: dict):
    with open(CONTENT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.get("/api/content")
def get_all_content():
    return load_content()

@app.get("/api/content/{section}")
def get_content_section(section: str):
    content = load_content()
    if section not in content:
        raise HTTPException(status_code=404, detail=f"Bölüm bulunamadı: {section}")
    return content[section]

@app.put("/api/content/{section}")
async def update_content_section(section: str, request: Request, username: str = Depends(verify_admin)):
    data = await request.json()
    content = load_content()
    content[section] = data
    save_content(content)
    return {"success": True, "message": f"{section} güncellendi", "data": content[section]}

@app.put("/api/content")
def update_all_content(data: dict, username: str = Depends(verify_admin)):
    save_content(data)
    return {"success": True, "message": "Tüm içerik güncellendi"}

# ─── Durum Özeti Raporları ───

REPORTS_FILE = Path(__file__).parent / "reports.json"

def load_reports() -> list:
    if REPORTS_FILE.exists():
        with open(REPORTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_reports(data: list):
    with open(REPORTS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.get("/api/reports")
def get_reports(username: str = Depends(verify_admin)):
    """Tüm raporları listele (özet bilgi)"""
    reports = load_reports()
    # Hafif yanıt için sadece özet alanları döndür
    summaries = []
    for r in reports:
        summaries.append({
            "id": r.get("id"),
            "isletme_adi": r.get("isletme_adi", ""),
            "isletme_turu": r.get("isletme_turu", ""),
            "ziyaret_tarihi": r.get("ziyaret_tarihi", ""),
            "toplam_skor": r.get("toplam_skor", 0),
            "created_at": r.get("created_at", ""),
            "updated_at": r.get("updated_at", ""),
        })
    return summaries

@app.get("/api/reports/{report_id}")
def get_report(report_id: str, username: str = Depends(verify_admin)):
    """Tek raporu getir"""
    reports = load_reports()
    for r in reports:
        if r.get("id") == report_id:
            return r
    raise HTTPException(status_code=404, detail="Rapor bulunamadı")

@app.post("/api/reports", status_code=201)
async def create_report(request: Request, username: str = Depends(verify_admin)):
    """Yeni rapor oluştur"""
    data = await request.json()
    reports = load_reports()

    report_id = uuid.uuid4().hex[:12]
    now = datetime.now().isoformat()

    # Toplam skoru hesapla
    skorlar = [
        data.get("skor_maliyet", 5), data.get("skor_stok", 5),
        data.get("skor_operasyon", 5), data.get("skor_personel", 5),
        data.get("skor_hijyen", 5), data.get("skor_musteri", 5)
    ]
    toplam = round(sum(skorlar) / len(skorlar) * 10)

    data["id"] = report_id
    data["toplam_skor"] = toplam
    data["created_at"] = now
    data["updated_at"] = now

    # photos alanı yoksa ekle
    if "photos" not in data:
        data["photos"] = []

    reports.append(data)
    save_reports(reports)

    return {"success": True, "id": report_id, "message": "Rapor kaydedildi"}

@app.put("/api/reports/{report_id}")
async def update_report(report_id: str, request: Request, username: str = Depends(verify_admin)):
    """Mevcut raporu güncelle"""
    data = await request.json()
    reports = load_reports()

    for i, r in enumerate(reports):
        if r.get("id") == report_id:
            # Toplam skoru güncelle
            skorlar = [
                data.get("skor_maliyet", 5), data.get("skor_stok", 5),
                data.get("skor_operasyon", 5), data.get("skor_personel", 5),
                data.get("skor_hijyen", 5), data.get("skor_musteri", 5)
            ]
            data["toplam_skor"] = round(sum(skorlar) / len(skorlar) * 10)
            data["id"] = report_id
            data["created_at"] = r.get("created_at", datetime.now().isoformat())
            data["updated_at"] = datetime.now().isoformat()
            reports[i] = data
            save_reports(reports)
            return {"success": True, "message": "Rapor güncellendi"}

    raise HTTPException(status_code=404, detail="Rapor bulunamadı")

@app.delete("/api/reports/{report_id}")
def delete_report(report_id: str, username: str = Depends(verify_admin)):
    """Raporu sil"""
    reports = load_reports()
    new_reports = [r for r in reports if r.get("id") != report_id]
    if len(new_reports) == len(reports):
        raise HTTPException(status_code=404, detail="Rapor bulunamadı")
    save_reports(new_reports)
    return {"success": True, "message": "Rapor silindi"}

@app.get("/api/reports/business/{isletme_adi}")
def get_reports_by_business(isletme_adi: str, username: str = Depends(verify_admin)):
    """Aynı işletmeye ait tüm raporları getir (karşılaştırma için)"""
    reports = load_reports()
    matched = [r for r in reports if r.get("isletme_adi", "").strip().lower() == isletme_adi.strip().lower()]
    matched.sort(key=lambda r: r.get("ziyaret_tarihi", ""))
    return matched
