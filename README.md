# Arslan Danışmanlık - Kurumsal DanÄ±ÅŸmanlÄ±k Web Sitesi

Premium tek sayfa kurumsal danÄ±ÅŸmanlÄ±k web sitesi. Next.js frontend + FastAPI backend.

## Teknoloji Stack

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS 4
- **Backend**: FastAPI + SQLite
- **Ä°konlar**: Lucide React
- **Font**: Inter (Google Fonts)

## Kurulum ve Ã‡alÄ±ÅŸtÄ±rma

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend `http://localhost:8000` adresinde Ã§alÄ±ÅŸacaktÄ±r.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:3000` adresinde Ã§alÄ±ÅŸacaktÄ±r.

## Ã–zellikler

### Ana Sayfa
- âœ… Hero bÃ¶lÃ¼mÃ¼ (kelime dÃ¶ngÃ¼sÃ¼ animasyonu)
- âœ… Sorunlar (3 kart)
- âœ… Teslim Edilenler (5 madde)
- âœ… PortfÃ¶y (4 gÃ¶rsel)
- âœ… Paketler (3 seÃ§enek)
- âœ… HakkÄ±mda
- âœ… SSS (accordion)
- âœ… Ä°letiÅŸim formu (UTM tracking)
- âœ… WhatsApp floating button

### Backend API
- `GET /api/health` - SaÄŸlÄ±k kontrolÃ¼
- `POST /api/leads` - Lead kaydetme (form gÃ¶nderimi)
- `GET /api/leads` - Leadleri listeleme (Basic Auth)

### Admin Panel
- `/admin` sayfasÄ±ndan eriÅŸim
- Basic Auth (varsayÄ±lan: admin / Arslan Danışmanlık2024)
- Lead tablosu (tarih, ad, iÅŸletme tÃ¼rÃ¼, ÅŸehir, paket, telefon)

## Ortam DeÄŸiÅŸkenleri

Backend iÃ§in `.env` dosyasÄ± oluÅŸturun (`.env.example` dosyasÄ±ndan kopyalayÄ±n):

```env
ADMIN_USER=admin
ADMIN_PASS=Arslan Danışmanlık2024
```

## Ãœretim (Production)

### Frontend Build
```powershell
cd frontend
npm run build
npm run start
```

### Backend Production
```powershell
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Ä°letiÅŸim

- Email: info@Arslan Danışmanlık.com
- WhatsApp: +90 539 233 11 474

## Lisans

Â© 2026 Arslan Danışmanlık - Ä°lhan Arslan DanÄ±ÅŸmanlÄ±k

