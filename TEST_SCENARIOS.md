# Test SenaryolarÄ±

## Manuel Test Listesi

### 1. Ana Sayfa GÃ¶rÃ¼nÃ¼m Testi
- [ ] http://localhost:3000 adresine git
- [ ] Hero bÃ¶lÃ¼mÃ¼nde "Arslan Danışmanlık" ve "Ä°lhan Arslan DanÄ±ÅŸmanlÄ±k" gÃ¶rÃ¼nÃ¼yor mu?
- [ ] Kelime dÃ¶ngÃ¼sÃ¼ Ã§alÄ±ÅŸÄ±yor mu? (maliyet â†’ stok â†’ kasa)
- [ ] "Ã–n GÃ¶rÃ¼ÅŸme" ve "Teklif Ä°ste" butonlarÄ± gÃ¶rÃ¼nÃ¼yor mu?
- [ ] Scroll indicator (aÅŸaÄŸÄ± ok) animasyonlu mu?

### 2. Responsif Test
- [ ] TarayÄ±cÄ± penceresini kÃ¼Ã§Ã¼lt/bÃ¼yÃ¼lt
- [ ] Mobil gÃ¶rÃ¼nÃ¼m (< 768px) doÄŸru mu?
- [ ] Tablet gÃ¶rÃ¼nÃ¼m (768-1024px) doÄŸru mu?
- [ ] Desktop gÃ¶rÃ¼nÃ¼m (> 1024px) doÄŸru mu?

### 3. Scroll ve Animasyon Testi
- [ ] SayfayÄ± aÅŸaÄŸÄ± kaydÄ±r
- [ ] Sorunlar bÃ¶lÃ¼mÃ¼ kartlarÄ± yumuÅŸak giriyor mu?
- [ ] Kartlara hover yaptÄ±ÄŸÄ±nda hafif yÃ¼kseliyor mu?
- [ ] Smooth scroll Ã§alÄ±ÅŸÄ±yor mu? (CTA butonlarÄ±na tÄ±kla)

### 4. Form Testi

#### Zorunlu Alan KontrolÃ¼
- [ ] Formu boÅŸ gÃ¶ndermeye Ã§alÄ±ÅŸ
- [ ] TarayÄ±cÄ± validasyonu Ã§alÄ±ÅŸÄ±yor mu?

#### BaÅŸarÄ±lÄ± GÃ¶nderim
1. Formu doldur:
   - Ad Soyad: `Test KullanÄ±cÄ±`
   - Ä°ÅŸletme TÃ¼rÃ¼: `coffee`
   - Åehir: `Ä°stanbul`
   - Telefon: `5551234567`
   - E-posta: `test@example.com`
   - Paket: `standart`
   - Mesaj: `Test mesajÄ±`
2. "GÃ¶nder" butonuna tÄ±kla
3. [ ] Loading state gÃ¶rÃ¼nÃ¼yor mu?
4. [ ] BaÅŸarÄ± mesajÄ± gÃ¶rÃ¼nÃ¼yor mu?
5. [ ] Form temizleniyor mu?

#### HatalÄ± E-posta
- [ ] E-posta alanÄ±na "testtest" yaz
- [ ] Form gÃ¶nderilmeye Ã§alÄ±ÅŸÄ±ldÄ±ÄŸÄ±nda hata veriyor mu?

#### KÄ±sa Telefon
- [ ] Telefon alanÄ±na "123" yaz
- [ ] Backend validasyonu Ã§alÄ±ÅŸÄ±yor mu?

### 5. WhatsApp Button Testi
- [ ] SaÄŸ altta yeÅŸil WhatsApp butonu gÃ¶rÃ¼nÃ¼yor mu?
- [ ] Sabit pozisyonda mÄ±? (scroll etsene bile aynÄ± yerde)
- [ ] Hover yapÄ±nca geniÅŸliyor mu?
- [ ] TÄ±klayÄ±nca WhatsApp linki aÃ§Ä±lÄ±yor mu?
- [ ] Link doÄŸru mu? (9053923311474)

### 6. Admin Panel Testi

#### EriÅŸim
1. http://localhost:3000/admin adresine git
2. [ ] Basic auth prompt aÃ§Ä±lÄ±yor mu?

#### YanlÄ±ÅŸ Kimlik
1. KullanÄ±cÄ± adÄ±: `wrong`
2. Åifre: `wrong`
3. [ ] Hata mesajÄ± gÃ¶rÃ¼nÃ¼yor mu?

#### DoÄŸru Kimlik
1. KullanÄ±cÄ± adÄ±: `admin`
2. Åifre: `Arslan Danışmanlık2024`
3. [ ] Lead tablosu gÃ¶rÃ¼nÃ¼yor mu?
4. [ ] Daha Ã¶nce gÃ¶nderilen test lead gÃ¶rÃ¼nÃ¼yor mu?
5. [ ] Tarih formatÄ± TÃ¼rkÃ§e mi?
6. [ ] Paket badge'i gÃ¶rÃ¼nÃ¼yor mu?
7. [ ] Telefon linkine tÄ±klanabiliyor mu?

### 7. Backend API Testi

#### Health Check
```powershell
Invoke-RestMethod -Uri http://localhost:8000/api/health -Method GET
```
- [ ] `{status: "ok"}` dÃ¶nÃ¼yor mu?

#### Lead OluÅŸturma
```powershell
$body = @{
    ad_soyad = "API Test"
    isletme_turu = "restoran"
    sehir = "Ankara"
    telefon = "5559876543"
    email = "api@test.com"
    mesaj = "API Ã¼zerinden test"
    paket = "pro"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/api/leads -Method POST -Body $body -ContentType "application/json"
```
- [ ] BaÅŸarÄ± mesajÄ± dÃ¶nÃ¼yor mu?

#### Leads Listesi (Auth Gerekli)
```powershell
$cred = "admin:Arslan Danışmanlık2024"
$encoded = [System.Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes($cred))
$headers = @{
    Authorization = "Basic $encoded"
}

Invoke-RestMethod -Uri http://localhost:8000/api/leads -Method GET -Headers $headers
```
- [ ] Lead listesi dÃ¶nÃ¼yor mu?
- [ ] Az Ã¶nce oluÅŸturulan "API Test" kaydÄ± var mÄ±?

### 8. UTM Tracking Testi
1. TarayÄ±cÄ±da ÅŸu URL'yi aÃ§:
   ```
   http://localhost:3000?utm_source=google&utm_campaign=test_campaign
   ```
2. Ä°letiÅŸim formunu doldur ve gÃ¶nder
3. Admin panelinden kontrol et
4. [ ] utm_source ve utm_campaign kaydedilmiÅŸ mi?

### 9. SEO ve Metadata
1. TarayÄ±cÄ±da sayfa kaynaÄŸÄ±nÄ± gÃ¶rÃ¼ntÃ¼le (Ctrl+U)
2. [ ] `<title>` elementi doÄŸru mu?
3. [ ] `<meta name="description">` var mÄ±?
4. [ ] Open Graph etiketleri var mÄ±?
5. [ ] `lang="tr"` ayarlanmÄ±ÅŸ mÄ±?

### 10. GÃ¶rsel ve Ä°kon Testi
- [ ] PortfÃ¶y gÃ¶rsellerinin 4'Ã¼ de yÃ¼kleniyor mu?
- [ ] Ä°konlar (Lucide) dÃ¼zgÃ¼n gÃ¶rÃ¼nÃ¼yor mu?
- [ ] Hover efektleri Ã§alÄ±ÅŸÄ±yor mu?

### 11. Cross-browser Test (Opsiyonel)
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari (Mac varsa)

## Otomatik Test (API)

### Backend Health
```powershell
# BaÅŸarÄ±lÄ± olmalÄ±
Invoke-RestMethod http://localhost:8000/api/health
```

### Lead CRUD
```powershell
# Create
$testLead = @{
    ad_soyad = "Automated Test"
    isletme_turu = "coffee"
    sehir = "Ä°zmir"
    telefon = "5551112233"
    mesaj = "Otomatik test mesajÄ±"
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri http://localhost:8000/api/leads -Method POST -Body $testLead -ContentType "application/json"
Write-Host "Lead ID: $($result.id)"

# Read (with auth)
$auth = [System.Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes("admin:Arslan Danışmanlık2024"))
$headers = @{ Authorization = "Basic $auth" }
$leads = Invoke-RestMethod -Uri http://localhost:8000/api/leads -Headers $headers
Write-Host "Toplam lead sayÄ±sÄ±: $($leads.Count)"
```

## Performans Testi

### Sayfa YÃ¼kleme
1. GeliÅŸtirici araÃ§larÄ±nÄ± aÃ§ (F12)
2. Network sekmesine git
3. SayfayÄ± yenile (Ctrl+R)
4. [ ] Ä°lk render < 2 saniye mi?
5. [ ] Toplam yÃ¼kleme < 5 saniye mi?

### Lighthouse Skoru (Chrome DevTools)
1. GeliÅŸtirici araÃ§larÄ±nÄ± aÃ§
2. Lighthouse sekmesine git
3. "Generate report" tÄ±kla
4. [ ] Performance > 80?
5. [ ] Accessibility > 90?
6. [ ] SEO > 90?

## Hata SenaryolarÄ±

### Backend KapalÄ±yken
1. Backend'i kapat (Ctrl+C)
2. Formu gÃ¶ndermeye Ã§alÄ±ÅŸ
3. [ ] "BaÄŸlantÄ± hatasÄ±" mesajÄ± gÃ¶rÃ¼nÃ¼yor mu?

### AÄŸ HatasÄ± SimÃ¼lasyonu
1. Chrome DevTools â†’ Network â†’ Offline
2. Formu gÃ¶nder
3. [ ] Uygun hata mesajÄ± gÃ¶rÃ¼nÃ¼yor mu?

## SonuÃ§
- TÃ¼m testler baÅŸarÄ±lÄ± mÄ±?
- BulduÄŸun hatalar:
  - [ ] ...
  - [ ] ...

