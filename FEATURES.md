# Arslan Danışmanlık Sitesi - Ã–zellikler ve KullanÄ±m

## âœ… Tamamlanan Ã–zellikler

### Frontend (Next.js + Tailwind CSS)

#### TasarÄ±m
- âœ… Premium renk paleti: Lacivert (#0B1F3B), Koyu gri (#2B2F36), BakÄ±r (#B8743A), Zemin (#F5F7FA)
- âœ… Inter font ailesi (Google Fonts)
- âœ… Lucide React ikon seti (tutarlÄ± stroke)
- âœ… Responsif tasarÄ±m (mobil, tablet, desktop)

#### BÃ¶lÃ¼mler
1. **Hero**
   - "Arslan Danışmanlık" ve "Ä°lhan Arslan DanÄ±ÅŸmanlÄ±k" branding
   - DÃ¶ngÃ¼lÃ¼ kelime animasyonu: maliyet â†’ stok â†’ kasa
   - 2 CTA butonu: "Ã–n GÃ¶rÃ¼ÅŸme" ve "Teklif Ä°ste"
   - Minimal deliverable gÃ¶rseli (PDF, Excel, Checklist ikonlarÄ±)

2. **Sorunlar**
   - 3 problem kartÄ±
   - Scroll ile yumuÅŸak giriÅŸ animasyonu (opacity + translateY)
   - Her kartta ikon

3. **Teslim Edilenler**
   - 5 madde liste (ikonlu)
   - Hover efektleri

4. **PortfÃ¶y**
   - 4 gÃ¶rsel (SVG placeholderlar)
   - Kategoriler: Kontrol Listeleri, COGS Analizi, Aksiyon PlanÄ±, SÃ¼reÃ§ HaritasÄ±
   - Hover zoom efekti

5. **Paketler**
   - 3 paket: Temel, Standart, Pro
   - "Ã–nerilen" badge (Standart pakette)
   - "Teklif Ä°ste" butonlarÄ± (form'a scroll)

6. **HakkÄ±mda**
   - Verilen metin (25+ yÄ±l deneyim)
   - SayÄ±sal gÃ¶stergeler (25+, 100+, Coffee & Restoran)
   - Dark gradient arka plan

7. **SSS**
   - 5 soru-cevap
   - Accordion (Chevron animasyonu)
   - Smooth aÃ§Ä±lma/kapanma

8. **Ä°letiÅŸim**
   - Form alanlarÄ±:
     - Ad Soyad (*)
     - Ä°ÅŸletme TÃ¼rÃ¼ (*) - dropdown: coffee/restoran/kiosk
     - Åehir (*)
     - Telefon (*)
     - E-posta
     - Paket seÃ§imi
     - Mesaj (*)
   - KVKK metni
   - Form validasyonu
   - UTM tracking (query parametrelerinden)
   - BaÅŸarÄ±/hata mesajlarÄ±

9. **Footer**
   - Arslan Danışmanlık branding
   - Ä°letiÅŸim bilgileri
   - E-posta: info@Arslan Danışmanlık.com
   - WhatsApp floating button (saÄŸ altta sabit)

#### Animasyonlar
- âœ… Hero'da tek kelime dÃ¶ngÃ¼sÃ¼ (fade + yukarÄ± hareket)
- âœ… Scroll triggered fade-in (bÃ¶lÃ¼mler)
- âœ… Kart hover efektleri (hafif yÃ¼kselme + gÃ¶lge)
- âœ… Smooth scroll (CTA butonlarÄ±)
- âŒ Typewriter, parallax, aÅŸÄ±rÄ± hareket YOK (istenildiÄŸi gibi)

### Backend (FastAPI + SQLite)

#### API Endpoints
- `GET /api/health` - Sistem durumu kontrolÃ¼
- `POST /api/leads` - Lead kaydetme
  - Validasyon: zorunlu alanlar, telefon uzunluÄŸu, e-posta formatÄ±
  - UTM tracking (utm_source, utm_campaign)
  - SQLite'a kaydetme
- `GET /api/leads` - Lead listesi (Basic Auth korumalÄ±)
  - Admin kullanÄ±cÄ± adÄ±/ÅŸifre kontrolÃ¼
  - created_at desc sÄ±ralama

#### VeritabanÄ±
- SQLite (leads.db)
- Tablo: leads
- Alanlar: id, ad_soyad, isletme_turu, sehir, telefon, email, mesaj, paket, utm_source, utm_campaign, created_at

#### CORS
- âœ… localhost:3000 ve 127.0.0.1:3000 iÃ§in yapÄ±landÄ±rÄ±lmÄ±ÅŸ
- âœ… TÃ¼m methodlar ve headerlar izinli

### Admin Panel

- `/admin` sayfasÄ±
- Basic Auth prompt
- Lead tablosu:
  - Tarih (formatlanmÄ±ÅŸ TÃ¼rkÃ§e)
  - Ad Soyad
  - Ä°ÅŸletme TÃ¼rÃ¼
  - Åehir
  - Paket (badge)
  - Telefon (tÄ±klanabilir tel: link)
  - Mesaj (truncated)
- Responsive tablo

## ğŸš€ Ã‡alÄ±ÅŸtÄ±rma

### Backend (Port 8000)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

### Frontend (Port 3000)
```powershell
cd frontend
npm run dev
```

### EriÅŸim
- Ana sayfa: http://localhost:3000
- Admin panel: http://localhost:3000/admin
- Backend API: http://localhost:8000
- API dokÃ¼mantasyonu: http://localhost:8000/docs

### Admin GiriÅŸi
- KullanÄ±cÄ± adÄ±: `admin`
- Åifre: `Arslan Danışmanlık2024`

## ğŸ“‹ Kalite Kontrol

### TÃ¼rkÃ§e Dil
- âœ… TÃ¼m metinler TÃ¼rkÃ§e
- âœ… Ä°ngilizce kelime yok
- âœ… YazÄ±m hatasÄ± kontrolÃ¼ yapÄ±ldÄ±

### TasarÄ±m Kalitesi
- âœ… Premium gÃ¶rÃ¼nÃ¼m
- âœ… AbartÄ±sÄ±z animasyonlar
- âœ… TutarlÄ± renk kullanÄ±mÄ±
- âœ… Kurumsal ve ciddi ton
- âœ… GÃ¶rsel filigransÄ±z ve markasÄ±z (SVG placeholderlar)

### Teknik
- âœ… TypeScript kullanÄ±mÄ±
- âœ… Responsive tasarÄ±m
- âœ… SEO metadata
- âœ… CORS yapÄ±landÄ±rmasÄ±
- âœ… Form validasyonu
- âœ… Error handling
- âœ… Loading states

## ğŸ“ Dosya YapÄ±sÄ±

```
DanÄ±ÅŸman_web/
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ main.py                 # FastAPI uygulama
â”‚   â”œâ”€â”€ requirements.txt        # Python baÄŸÄ±mlÄ±lÄ±klar
â”‚   â”œâ”€â”€ .env.example           # Ortam deÄŸiÅŸkenleri Ã¶rneÄŸi
â”‚   â”œâ”€â”€ .gitignore
â”‚   â””â”€â”€ leads.db               # SQLite veritabanÄ± (otomatik oluÅŸur)
â”‚
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ layout.tsx         # Root layout (SEO, font)
â”‚   â”‚   â”œâ”€â”€ page.tsx          # Ana sayfa
â”‚   â”‚   â”œâ”€â”€ globals.css       # Global stiller
â”‚   â”‚   â””â”€â”€ admin/
â”‚   â”‚       â””â”€â”€ page.tsx      # Admin paneli
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ Hero.tsx          # Hero bÃ¶lÃ¼mÃ¼
â”‚   â”‚   â”œâ”€â”€ Problems.tsx      # Sorunlar bÃ¶lÃ¼mÃ¼
â”‚   â”‚   â”œâ”€â”€ Deliverables.tsx  # Teslim edilenler
â”‚   â”‚   â”œâ”€â”€ Portfolio.tsx     # PortfÃ¶y
â”‚   â”‚   â”œâ”€â”€ Packages.tsx      # Paketler
â”‚   â”‚   â”œâ”€â”€ About.tsx         # HakkÄ±mda
â”‚   â”‚   â”œâ”€â”€ FAQ.tsx          # SSS
â”‚   â”‚   â”œâ”€â”€ Contact.tsx      # Ä°letiÅŸim formu
â”‚   â”‚   â””â”€â”€ Footer.tsx       # Footer + WhatsApp
â”‚   â”œâ”€â”€ public/
â”‚   â”‚   â””â”€â”€ portfolio/
â”‚   â”‚       â”œâ”€â”€ 01.png       # SVG placeholder
â”‚   â”‚       â”œâ”€â”€ 02.png       # SVG placeholder
â”‚   â”‚       â”œâ”€â”€ 03.png       # SVG placeholder
â”‚   â”‚       â””â”€â”€ 04.png       # SVG placeholder
â”‚   â”œâ”€â”€ package.json
â”‚   â”œâ”€â”€ next.config.ts
â”‚   â””â”€â”€ .gitignore
â”‚
â””â”€â”€ README.md                  # Proje dokÃ¼mantasyonu
```

## ğŸ¨ GÃ¶rsel Placeholderlar

PortfÃ¶y bÃ¶lÃ¼mÃ¼ndeki 4 gÃ¶rsel ÅŸu an SVG placeholderlar olarak hazÄ±rlandÄ±:
1. **01.png** - Operasyon kontrol listeleri (checklist gÃ¶rÃ¼nÃ¼mÃ¼)
2. **02.png** - COGS analizi (spreadsheet + bar chart)
3. **03.png** - 30/60/90 aksiyon planÄ± (timeline)
4. **04.png** - SÃ¼reÃ§ akÄ±ÅŸÄ± (flowchart)

Bu dosyalarÄ± gerÃ§ek proje gÃ¶rselleriyle deÄŸiÅŸtirin.

## ğŸ” GÃ¼venlik

- Basic Auth (admin paneli)
- Form validasyonu (frontend + backend)
- CORS konfigÃ¼rasyonu
- Environment variables iÃ§in .env kullanÄ±mÄ±

## ğŸ“¦ Ãœretim (Production)

### Backend
```powershell
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```powershell
npm run build
npm run start
```

## ğŸ¯ Åartname Uyumu

âœ… Tek sayfa kurumsal danÄ±ÅŸmanlÄ±k sitesi
âœ… Next.js + Tailwind (App Router)
âœ… FastAPI + SQLite
âœ… Premium tasarÄ±m (abartÄ±sÄ±z)
âœ… TÃ¼rkÃ§e metinler (Ä°ngilizce kelime yok)
âœ… Renk paleti doÄŸru
âœ… Inter font
âœ… Lucide ikonlar
âœ… Minimal animasyonlar
âœ… TÃ¼m bÃ¶lÃ¼mler tamamlandÄ±
âœ… Form + UTM tracking
âœ… Admin paneli + Basic Auth
âœ… WhatsApp entegrasyonu
âœ… CORS ayarlarÄ±
âœ… README dokÃ¼mantasyonu

