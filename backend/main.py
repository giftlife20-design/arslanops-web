from fastapi import FastAPI, HTTPException, Depends, status, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Any
from datetime import datetime
import secrets
import os
import uuid
from collections import defaultdict
import time
from pathlib import Path
from dotenv import load_dotenv
import threading
import httpx
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# .env dosyasını yükle (şifre vb. burada)
load_dotenv()

app = FastAPI(title="ArslanOps API")

# ─── MongoDB Atlas Bağlantısı ───
from pymongo import MongoClient

MONGODB_URI = os.getenv("MONGODB_URI", "")
mongo_client = None
db = None

def get_db():
    global mongo_client, db
    if db is None and MONGODB_URI:
        mongo_client = MongoClient(MONGODB_URI)
        db = mongo_client["arslanops"]
    return db

# ─── Cloudinary Ayarları ───
import cloudinary
import cloudinary.uploader

CLOUDINARY_URL = os.getenv("CLOUDINARY_URL", "")
if CLOUDINARY_URL:
    # CLOUDINARY_URL formatı: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    cloudinary.config(cloudinary_url=CLOUDINARY_URL)

# ─── Uploads (local fallback eğer Cloudinary yoksa) ───
UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Basic Auth
security = HTTPBasic()

# CORS
PRODUCTION_ORIGIN = os.getenv("PRODUCTION_ORIGIN", "")
cors_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
if PRODUCTION_ORIGIN:
    cors_origins.append(PRODUCTION_ORIGIN)
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
    while True:
        time.sleep(14 * 60)
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
def health_check_root():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# Rate limiter (in-memory)
rate_limit_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_MAX = 5
RATE_LIMIT_WINDOW = 300

def check_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
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

# ─── SMTP E-posta Ayarları (Titan / GoDaddy) ───
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.titan.email")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "info@arslanops.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
NOTIFY_EMAIL = os.getenv("NOTIFY_EMAIL", "info@arslanops.com")

def send_lead_notification(lead_data: dict):
    if not SMTP_PASSWORD:
        return
    try:
        isletme_turu_map = {
            "coffee": "Coffee Shop", "restoran": "Restoran", "kafe": "Kafe",
            "pastane": "Pastane", "franchise": "Franchise",
            "yeni_acilis": "Yeni Açılış", "diger": "Diğer"
        }
        isletme_turu = isletme_turu_map.get(lead_data.get("isletme_turu", ""), lead_data.get("isletme_turu", "-"))

        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0B1F3B; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: #C5A55A; margin: 0; font-size: 22px;">🔔 Yeni Danışmanlık Talebi</h1>
            </div>
            <div style="background: #f8f9fa; padding: 24px; border: 1px solid #e9ecef;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 10px 0; color: #666; width: 130px;">👤 Ad Soyad:</td>
                        <td style="padding: 10px 0; font-weight: bold;">{lead_data.get('ad_soyad', '-')}</td></tr>
                    <tr><td style="padding: 10px 0; color: #666;">📞 Telefon:</td>
                        <td style="padding: 10px 0; font-weight: bold;">{lead_data.get('telefon', '-')}</td></tr>
                    <tr><td style="padding: 10px 0; color: #666;">📧 E-posta:</td>
                        <td style="padding: 10px 0;">{lead_data.get('email', '-') or '-'}</td></tr>
                    <tr><td style="padding: 10px 0; color: #666;">🏢 İşletme Türü:</td>
                        <td style="padding: 10px 0;">{isletme_turu}</td></tr>
                    <tr><td style="padding: 10px 0; color: #666;">📍 Şehir:</td>
                        <td style="padding: 10px 0;">{lead_data.get('sehir', '-')}</td></tr>
                    <tr><td style="padding: 10px 0; color: #666; vertical-align: top;">💬 Mesaj:</td>
                        <td style="padding: 10px 0;">{lead_data.get('mesaj', '-')}</td></tr>
                </table>
            </div>
            <div style="background: #0B1F3B; padding: 16px; text-align: center; border-radius: 0 0 12px 12px;">
                <p style="color: #C5A55A; margin: 0; font-size: 13px;">ArslanOps Web Sitesi • {datetime.now().strftime('%d.%m.%Y %H:%M')}</p>
            </div>
        </div>
        """
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🔔 Yeni Talep: {lead_data.get('ad_soyad', 'Bilinmiyor')} - {lead_data.get('sehir', '')}"
        msg["From"] = SMTP_USER
        msg["To"] = NOTIFY_EMAIL
        msg.attach(MIMEText(html_body, "html", "utf-8"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, NOTIFY_EMAIL, msg.as_string())
        print(f"[SMTP] Lead bildirimi gönderildi: {lead_data.get('ad_soyad')}")
    except Exception as e:
        print(f"[SMTP] Mail gönderilemedi: {e}")

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

# ────────────────────────────────────────────────────
# File Upload — Cloudinary (kalıcı) veya local (geçici)
# ────────────────────────────────────────────────────

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm"}
MAX_FILE_SIZE = 15 * 1024 * 1024

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    category: str = Form(default="general"),
    username: str = Depends(verify_admin)
):
    if file.content_type not in ALLOWED_IMAGE_TYPES | ALLOWED_VIDEO_TYPES:
        raise HTTPException(400, f"Desteklenmeyen dosya türü: {file.content_type}")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(400, "Dosya boyutu 15MB'dan büyük olamaz")

    # Cloudinary varsa buluta yükle (kalıcı)
    if CLOUDINARY_URL:
        try:
            resource_type = "video" if file.content_type in ALLOWED_VIDEO_TYPES else "image"
            result = cloudinary.uploader.upload(
                contents,
                folder=f"arslanops/{category}",
                resource_type=resource_type,
                public_id=uuid.uuid4().hex[:12]
            )
            url = result["secure_url"]
            return {"success": True, "url": url, "filename": result.get("public_id", ""), "category": category}
        except Exception as e:
            print(f"[Cloudinary] Yükleme hatası: {e}, local'e düşülüyor...")

    # Cloudinary yoksa veya hata olduysa local'e yükle
    category_dir = UPLOADS_DIR / category
    category_dir.mkdir(exist_ok=True)
    ext = os.path.splitext(file.filename or "file")[1]
    filename = f"{uuid.uuid4().hex[:12]}{ext}"
    filepath = category_dir / filename
    with open(filepath, "wb") as f:
        f.write(contents)
    url = f"/uploads/{category}/{filename}"
    return {"success": True, "url": url, "filename": filename, "category": category}

@app.delete("/api/upload")
def delete_uploaded_file(url: str, username: str = Depends(verify_admin)):
    # Cloudinary URL ise Cloudinary'den sil
    if "cloudinary" in url:
        try:
            # public_id'yi URL'den çıkar
            parts = url.split("/upload/")
            if len(parts) > 1:
                public_id = parts[1].rsplit(".", 1)[0]  # uzantıyı kaldır
                # version prefix'i kaldır (v1234567890/)
                if "/" in public_id:
                    segments = public_id.split("/")
                    if segments[0].startswith("v") and segments[0][1:].isdigit():
                        public_id = "/".join(segments[1:])
                cloudinary.uploader.destroy(public_id)
            return {"success": True, "message": "Dosya silindi"}
        except Exception as e:
            print(f"[Cloudinary] Silme hatası: {e}")
            raise HTTPException(500, f"Dosya silinemedi: {str(e)}")

    # Local dosya
    if not url.startswith("/uploads/"):
        raise HTTPException(400, "Geçersiz dosya yolu")
    filepath = Path(__file__).parent / url.lstrip("/")
    if filepath.exists():
        filepath.unlink()
        return {"success": True, "message": "Dosya silindi"}
    raise HTTPException(404, "Dosya bulunamadı")

# ────────────────────────────────────────────────────
# Content Management (CMS) — MongoDB Atlas (kalıcı)
# ────────────────────────────────────────────────────

import json

CONTENT_FILE = Path(__file__).parent / "content.json"

def load_content() -> dict:
    """MongoDB varsa oradan oku, yoksa dosyadan oku."""
    database = get_db()
    if database is not None:
        doc = database["content"].find_one({"_id": "site_content"})
        if doc:
            doc.pop("_id", None)
            return doc
        # MongoDB boşsa dosyadan seed yap
        file_content = _load_content_file()
        if file_content:
            save_content(file_content)
            return file_content
        return {}
    return _load_content_file()

def _load_content_file() -> dict:
    if CONTENT_FILE.exists():
        with open(CONTENT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_content(data: dict):
    """MongoDB varsa oraya yaz, yoksa dosyaya yaz."""
    database = get_db()
    if database is not None:
        database["content"].replace_one(
            {"_id": "site_content"},
            {**data, "_id": "site_content"},
            upsert=True
        )
        return
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
async def update_all_content(request: Request, username: str = Depends(verify_admin)):
    data = await request.json()
    save_content(data)
    return {"success": True, "message": "Tüm içerik güncellendi"}

# ────────────────────────────────────────────────────
# Leads — MongoDB Atlas (kalıcı)
# ────────────────────────────────────────────────────

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
    website: Optional[str] = None  # honeypot

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
    id: str
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

# Routes
@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/leads", status_code=201)
def create_lead(lead: LeadCreate, request: Request):
    check_rate_limit(request)

    if lead.website:
        return {"success": True, "message": "Talebiniz başarıyla alındı", "id": "0"}

    lead_data = {
        "id": uuid.uuid4().hex[:12],
        "ad_soyad": lead.ad_soyad,
        "isletme_turu": lead.isletme_turu,
        "sehir": lead.sehir,
        "telefon": lead.telefon,
        "email": lead.email,
        "mesaj": lead.mesaj,
        "paket": lead.paket,
        "utm_source": lead.utm_source,
        "utm_campaign": lead.utm_campaign,
        "created_at": datetime.now().isoformat()
    }

    database = get_db()
    if database is not None:
        database["leads"].insert_one(lead_data.copy())
    else:
        # SQLite fallback
        import sqlite3
        conn = sqlite3.connect("leads.db")
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id TEXT PRIMARY KEY,
                ad_soyad TEXT, isletme_turu TEXT, sehir TEXT, telefon TEXT,
                email TEXT, mesaj TEXT, paket TEXT, utm_source TEXT, utm_campaign TEXT, created_at TEXT
            )
        """)
        cursor.execute("""
            INSERT INTO leads (id, ad_soyad, isletme_turu, sehir, telefon, email, mesaj, paket, utm_source, utm_campaign, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (lead_data["id"], lead.ad_soyad, lead.isletme_turu, lead.sehir, lead.telefon,
              lead.email, lead.mesaj, lead.paket, lead.utm_source, lead.utm_campaign, lead_data["created_at"]))
        conn.commit()
        conn.close()

    # E-posta bildirimi
    threading.Thread(target=send_lead_notification, args=(lead_data,), daemon=True).start()

    return {"success": True, "message": "Talebiniz başarıyla alındı", "id": lead_data["id"]}

@app.get("/api/leads")
def get_leads(username: str = Depends(verify_admin)):
    database = get_db()
    if database is not None:
        leads = list(database["leads"].find({}, {"_id": 0}).sort("created_at", -1))
        return leads
    # SQLite fallback
    import sqlite3
    conn = sqlite3.connect("leads.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM leads ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.delete("/api/leads/{lead_id}")
def delete_lead(lead_id: str, username: str = Depends(verify_admin)):
    database = get_db()
    if database is not None:
        result = database["leads"].delete_one({"id": lead_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Lead bulunamadı")
        return {"success": True, "message": "Lead silindi"}
    import sqlite3
    conn = sqlite3.connect("leads.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Lead bulunamadı")
    conn.commit()
    conn.close()
    return {"success": True, "message": "Lead silindi"}

# ─── Durum Özeti Raporları — MongoDB Atlas ───

@app.get("/api/reports")
def get_reports(username: str = Depends(verify_admin)):
    database = get_db()
    if database is not None:
        reports = list(database["reports"].find({}, {"_id": 0}))
        summaries = []
        for r in reports:
            summaries.append({
                "id": r.get("id"), "isletme_adi": r.get("isletme_adi", ""),
                "isletme_turu": r.get("isletme_turu", ""), "ziyaret_tarihi": r.get("ziyaret_tarihi", ""),
                "toplam_skor": r.get("toplam_skor", 0), "created_at": r.get("created_at", ""),
                "updated_at": r.get("updated_at", ""),
            })
        return summaries
    return []

@app.get("/api/reports/{report_id}")
def get_report(report_id: str, username: str = Depends(verify_admin)):
    database = get_db()
    if database is not None:
        r = database["reports"].find_one({"id": report_id}, {"_id": 0})
        if r:
            return r
    raise HTTPException(status_code=404, detail="Rapor bulunamadı")

@app.post("/api/reports", status_code=201)
async def create_report(request: Request, username: str = Depends(verify_admin)):
    data = await request.json()
    report_id = uuid.uuid4().hex[:12]
    now = datetime.now().isoformat()
    skorlar = [
        data.get("skor_maliyet", 5), data.get("skor_stok", 5),
        data.get("skor_operasyon", 5), data.get("skor_personel", 5),
        data.get("skor_hijyen", 5), data.get("skor_musteri", 5)
    ]
    data["id"] = report_id
    data["toplam_skor"] = round(sum(skorlar) / len(skorlar) * 10)
    data["created_at"] = now
    data["updated_at"] = now
    if "photos" not in data:
        data["photos"] = []

    database = get_db()
    if database is not None:
        database["reports"].insert_one(data.copy())
    return {"success": True, "id": report_id, "message": "Rapor kaydedildi"}

@app.put("/api/reports/{report_id}")
async def update_report(report_id: str, request: Request, username: str = Depends(verify_admin)):
    data = await request.json()
    database = get_db()
    if database is not None:
        existing = database["reports"].find_one({"id": report_id})
        if not existing:
            raise HTTPException(status_code=404, detail="Rapor bulunamadı")
        skorlar = [
            data.get("skor_maliyet", 5), data.get("skor_stok", 5),
            data.get("skor_operasyon", 5), data.get("skor_personel", 5),
            data.get("skor_hijyen", 5), data.get("skor_musteri", 5)
        ]
        data["toplam_skor"] = round(sum(skorlar) / len(skorlar) * 10)
        data["id"] = report_id
        data["created_at"] = existing.get("created_at", datetime.now().isoformat())
        data["updated_at"] = datetime.now().isoformat()
        database["reports"].replace_one({"id": report_id}, data)
        return {"success": True, "message": "Rapor güncellendi"}
    raise HTTPException(status_code=404, detail="Rapor bulunamadı")

@app.delete("/api/reports/{report_id}")
def delete_report(report_id: str, username: str = Depends(verify_admin)):
    database = get_db()
    if database is not None:
        result = database["reports"].delete_one({"id": report_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Rapor bulunamadı")
        return {"success": True, "message": "Rapor silindi"}
    raise HTTPException(status_code=404, detail="Rapor bulunamadı")

@app.get("/api/reports/business/{isletme_adi}")
def get_reports_by_business(isletme_adi: str, username: str = Depends(verify_admin)):
    database = get_db()
    if database is not None:
        matched = list(database["reports"].find(
            {"isletme_adi": {"$regex": f"^{isletme_adi.strip()}$", "$options": "i"}},
            {"_id": 0}
        ))
        matched.sort(key=lambda r: r.get("ziyaret_tarihi", ""))
        return matched
    return []
