'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Download, DollarSign, BarChart3, Flame, ShieldCheck, ClipboardList, Coffee, Users, Calculator, TrendingUp, AlertTriangle, CheckCircle2, FileSpreadsheet, FileText, Utensils, Thermometer, Clock, Loader2, GraduationCap, Target } from 'lucide-react';
import {
    generateKasaRaporu,
    generateStokSayim,
    generateHijyenExcel,
    generateHijyenPDF,
    generateVardiyaDevir,
    generateAcilisKapanisPDF,
    generateMusteriSikayet,
    generateKPIDashboard,
    generateCepKartiPDF,
    generateRedFlagPDF,
    generateZiyaretAkisPDF,
} from '../utils/templateGenerators';

/* ------------------------------------------------------------------ */
/*  Kavram Verileri                                                     */
/* ------------------------------------------------------------------ */
interface Kavram {
    id: string;
    baslik: string;
    icon: any;
    color: string;
    kisaAciklama: string;
    detayliAciklama: string;
    ornekler: string[];
    musteriCevap: string;
    ipuclari: string[];
    kategori: 'temel' | 'maliyet' | 'operasyon' | 'kalite';
}

const KAVRAMLAR: Kavram[] = [
    {
        id: 'kpi',
        baslik: 'KPI (Temel Performans Göstergesi)',
        icon: BarChart3,
        color: '#3b82f6',
        kisaAciklama: 'İşletmenizin performansını ölçen sayısal hedefler.',
        detayliAciklama: 'KPI (Key Performance Indicator), işletmenizin belirli bir alandaki başarısını ölçmek için kullanılan sayısal göstergelerdir. Her KPI\'ın bir hedef değeri olmalı ve düzenli takip edilmelidir. KPI\'lar karar verme sürecinizi hızlandırır ve eksiklikleri tespit etmenizi kolaylaştırır.',
        ornekler: [
            'Günlük Ciro: Hedef ₺15.000, Gerçekleşen ₺12.800 → %85 başarı',
            'COGS Oranı: Hedef %28-32, Gerçekleşen %38 → Düzeltme gerekli',
            'Müşteri Memnuniyeti: Hedef 4.5/5, Gerçekleşen 4.2/5',
            'Masa Devir Hızı: Hedef 3x/gün, mevcut 2x → Servis süresi optimize edilmeli',
            'Personel Devir Oranı: Hedef <%10/yıl, %25 → İK stratejisi gerekli',
        ],
        musteriCevap: '"KPI\'lar işletmenizin nabzını tutan sayısal göstergelerdir. Bir doktor nasıl kan tahlili sonuçlarına bakarsa, biz de KPI\'lara bakarak işletmenizin sağlığını ölçeriz. Haftalık/aylık dashboard ile hangi alanlarda iyi olduğunuzu, hangi alanlarda iyileştirme gerektiğini net görürsünüz."',
        ipuclari: [
            '5-7 adet ana KPI yeterlidir, daha fazlası kafa karıştırır',
            'Her KPI\'ın bir sorumlusu ve takip periyodu olmalı',
            'KPI dashboard\'u haftada en az 1 kez incelenmeli',
            'Hedefler gerçekçi ama zorlayıcı olmalı (SMART ilkesi)',
        ],
        kategori: 'temel',
    },
    {
        id: 'cogs',
        baslik: 'COGS (Satılan Malın Maliyeti)',
        icon: DollarSign,
        color: '#C4803D',
        kisaAciklama: 'Sattığınız ürünlerin hammadde maliyetinin ciroya oranı.',
        detayliAciklama: 'COGS (Cost of Goods Sold), bir dönemde satılan ürünlerin doğrudan hammadde maliyetinin toplam satış gelirine oranıdır. Sektörde ideal COGS oranı coffee shop için %25-30, restoran için %28-35 arasındadır. COGS oranınız yüksekse ya fiyatlarınız düşük ya da maliyetleriniz kontrol dışı demektir.',
        ornekler: [
            'Aylık Satış: ₺300.000 | Hammadde Maliyeti: ₺96.000 → COGS = %32',
            'Bir latte: Satış ₺80, Malzeme maliyeti ₺18 → Ürün COGS = %22.5',
            'Burger menü: Satış ₺250, Malzeme ₺90 → Ürün COGS = %36',
            'Hedef: %28-32 arası (coffee shop), %30-35 (restoran)',
        ],
        musteriCevap: '"COGS, her 100 TL satıştan ne kadarının hammaddeye gittiğini gösterir. Yani siz 100 TL satış yaptığınızda bunun 38 TL\'si sadece malzemeye gidiyorsa, kalan 62 TL\'den kira, personel, elektrik ve karınızı karşılamanız gerekir. Hedefiniz bunu %28-32 bandına çekmektir."',
        ipuclari: [
            'COGS hesaplamak için düzenli stok sayımı şart',
            'Formül: (Dönem Başı Stok + Alımlar - Dönem Sonu Stok) / Satış × 100',
            'Her ürünün ayrı COGS\'u hesaplanmalı (reçete maliyetleme)',
            'COGS çok düşükse de sorun: porsiyon küçük veya kalite düşük olabilir',
            'Haftalık COGS takibi yapılmalı, aylık yetersiz kalır',
        ],
        kategori: 'maliyet',
    },
    {
        id: 'fire',
        baslik: 'Fire Oranı (Waste Rate)',
        icon: Flame,
        color: '#ef4444',
        kisaAciklama: 'Kullanılamaz hale gelen hammadde kayıplarının oranı.',
        detayliAciklama: 'Fire oranı, satın aldığınız hammaddelerin ne kadarının çöpe gittiğini gösterir. Buna son kullanma tarihi geçmiş ürünler, hazırlık sırasındaki kayıplar, hatalı siparişler, depolama hataları ve müşteri iadesi dahildir. Sektörde kabul edilebilir fire oranı %2-4\'tür. %5 üzeri acil müdahale gerektirir.',
        ornekler: [
            'Günlük ₺1.000 alım yapılıyor, ₺80 çöpe gidiyor → Fire = %8 (Yüksek!)',
            'Süt firesi: 50 lt alım, 45 lt kullanım → %10 fire (Depolama sorunu)',
            'Ekmek firesi: 100 adet üretim, 15 atık → %15 (Üretim planlaması gerekli)',
            'Sebze-meyve doğrama firesi: Normal trim %8-12, düzensiz %20+',
        ],
        musteriCevap: '"Fire, paranızı çöpe atmanız demek. Günde 80 TL gibi görünür ama ayda 2.400 TL, yılda 29.000 TL kaybediyorsunuz. Bu kayıpları FIFO sistemi, doğru depolama, porsiyon standardı ve üretim planlaması ile %2-4 bandına çekebiliriz."',
        ipuclari: [
            'Fire günlüğü tutulmalı — ne, neden, ne kadar',
            'FIFO kuralı (İlk Giren İlk Çıkar) mutlaka uygulanmalı',
            'Sıcaklık takibi ile soğuk zincir kırılmaları önlenmeli',
            'Hazırlık (prep) miktarları satış verilerine göre ayarlanmalı',
            'Menü mühendisliği ile düşük satışlı ürünler elenmeli',
        ],
        kategori: 'maliyet',
    },
    {
        id: 'haccp',
        baslik: 'HACCP (Gıda Güvenliği Sistemi)',
        icon: ShieldCheck,
        color: '#22c55e',
        kisaAciklama: 'Gıda güvenliğini sistematik olarak sağlayan uluslararası standart.',
        detayliAciklama: 'HACCP (Hazard Analysis and Critical Control Points), gıda üretim ve servis süreçlerinde tehlikeleri tanımlayan, kritik kontrol noktalarını belirleyen ve bu noktaları izleyen uluslararası bir gıda güvenliği sistemidir. Türkiye\'de yasal zorunluluktur. 7 temel prensibe dayanır: tehlike analizi, kritik kontrol noktası belirleme, kritik limitleri belirleme, izleme, düzeltici faaliyetler, doğrulama ve kayıt tutma.',
        ornekler: [
            'Kritik Kontrol Noktası 1: Soğuk depo sıcaklığı → 0-4°C arası olmalı',
            'KKN 2: Et pişirme iç sıcaklığı → min 72°C, 2 dakika',
            'KKN 3: Sıcak servis sıcaklığı → min 63°C üzerinde tutulmalı',
            'KKN 4: Bulaşık makinesi son durulama → min 82°C',
        ],
        musteriCevap: '"HACCP, müşterilerinizin güvenli gıda tüketmesini garanti eden bir sistemdir. Hem yasal zorunluluk hem de marka güvenilirliğiniz açısından kritiktir. Biz bu sistemi basitleştirip günlük kontrol listelerine dönüştürüyoruz. Personel ne yapacağını net bilir, siz de kayıtlarınız ile denetimlere hazır olursunuz."',
        ipuclari: [
            'Her gün sıcaklık kayıtları tutulmalı',
            'El yıkama prosedürü tüm personele öğretilmeli',
            'Çapraz kontaminasyon önlenmeli (renk kodlu kesme tahtaları)',
            'Haşere kontrol raporu yılda en az 4 kez alınmalı',
            'Personel hijyen eğitimi yılda 1 kez yenilenmeli',
        ],
        kategori: 'kalite',
    },
    {
        id: 'sop',
        baslik: 'SOP (Standart Operasyon Prosedürü)',
        icon: ClipboardList,
        color: '#8b5cf6',
        kisaAciklama: 'Her işin aynı kalitede yapılmasını sağlayan yazılı kurallar.',
        detayliAciklama: 'SOP (Standard Operating Procedure), işletmedeki her sürecin adım adım nasıl yapılacağını tanımlayan yazılı belgelerdir. Açılış-kapanış prosedürü, sipariş alma, ürün hazırlama, temizlik prosedürleri gibi tüm süreçleri kapsar. SOP\'lar sayesinde kim çalışırsa çalışsın, aynı standart sürdürülür. Yeni personelin uyumu hızlanır.',
        ornekler: [
            'Açılış SOP: 07:00 Makineleri aç → 07:15 Malzeme kontrolü → 07:30 Temizlik → 08:00 Açılış',
            'Kapanış SOP: Son sipariş → Kasa sayımı → Temizlik → Buzdolabı kontrol → Kilit',
            'Latte hazırlama SOP: 18g espresso → 200ml süt → 65°C buhar → Latte Art',
            'Müşteri şikayet SOP: Dinle → Özür dile → Çözüm sun → Kayıt et → Takip',
        ],
        musteriCevap: '"SOP, işletmenizin \'hafızasıdır\'. Personel değişse bile standart düşmez. McDonald\'s dünyada aynı tadı SOP\'lar sayesinde verir. Biz sizin işletmenize özel prosedürler yazar, personeli eğitir ve takip sistemini kurarız."',
        ipuclari: [
            'Her SOP en fazla 1 sayfa olmalı, görseller kullanılmalı',
            'Personel mutlaka eğitilmeli ve imza altına alınmalı',
            'SOP\'lar çalışma alanında görünür yerde asılmalı',
            '3-6 ayda bir gözden geçirilip güncellenmeli',
        ],
        kategori: 'operasyon',
    },
    {
        id: 'porsiyon',
        baslik: 'Porsiyon Standardı & Reçete Maliyetleme',
        icon: Utensils,
        color: '#f59e0b',
        kisaAciklama: 'Her ürünün standart gramaj ve maliyet hesabı.',
        detayliAciklama: 'Porsiyon standardı, her menü kaleminin tam olarak kaç gram/ml hammaddeden oluştuğunun belirlenmesidir. Reçete maliyetleme ise bu standart porsiyonun TL bazında maliyetinin hesaplanmasıdır. Bu iki kavram birlikte çalışır: standart porsiyon → tutarlı maliyet → doğru fiyatlama → kar garantisi.',
        ornekler: [
            'Americano: 18g kahve + 200ml su → Maliyet: ₺8.50 | Satış: ₺65 | Kar marjı: %87',
            'Avokado Toast: 80g avo + 2 dilim ekmek + 30g feta → Maliyet: ₺42 | Satış: ₺140',
            'Caesar Salata: 120g marul + 80g tavuk + 30ml sos + 20g parmesan → ₺38 maliyet',
            'Cheesecake dilimi: 130g → ₺28 maliyet | Satış: ₺110 | %75 kar marjı',
        ],
        musteriCevap: '"Porsiyon standardı olmadan maliyetinizi bilemezsiniz. Personel A 80 gram sos koyarken B 150 gram koyuyorsa, aynı ürünün maliyeti %50 değişir. Biz her ürünün reçetesini gram gram yazıp maliyetini hesaplarız. Sonra karlılığa göre menü fiyatlandırma yaparız."',
        ipuclari: [
            'Mutlaka dijital terazi kullanılmalı (0.1g hassasiyet)',
            'Her reçete fotoğraflı ve adım adım yazılmalı',
            'Fiyat güncellemelerinde reçete maliyetleri yeniden hesaplanmalı',
            'Mevsimsel ürünlerde maliyet dalgalanmasına dikkat',
        ],
        kategori: 'maliyet',
    },
    {
        id: 'menu_muhendisligi',
        baslik: 'Menü Mühendisliği',
        icon: TrendingUp,
        color: '#06b6d4',
        kisaAciklama: 'Menüdeki her ürünün karlılık ve popülerlik analizine göre konumlandırılması.',
        detayliAciklama: 'Menü mühendisliği, her menü kalemini popülerlik (satış adedi) ve karlılık (kar marjı) ekseninde analiz ederek 4 kategoriye ayırır: Yıldızlar (yüksek satış + yüksek kar), İnek (yüksek satış + düşük kar), Bulmaca (düşük satış + yüksek kar), Köpek (düşük satış + düşük kar). Bu analize göre menü optimizasyonu yapılır.',
        ornekler: [
            '⭐ Yıldız: Latte — yüksek satış, yüksek kar → Menüde öne çıkar',
            '🐄 İnek: Filtre Kahve — çok satılır ama kar düşük → Fiyat artışı veya maliyeti düşür',
            '🧩 Bulmaca: Affogato — az satılır ama karı yüksek → Tanıtımı artır',
            '🐕 Köpek: Sıcak Çikolata (yaz) — az satış, düşük kar → Menüden çıkar',
        ],
        musteriCevap: '"Menünüzdeki her ürün eşit para kazandırmaz. Bazı ürünler çok satılır ama kar bırakmaz, bazıları az satılır ama çok karlıdır. Biz her ürünü bu matrise yerleştirip, menünüzü karı maksimize edecek şekilde yeniden yapılandırırız."',
        ipuclari: [
            'En az 3 aylık satış verisi gereklidir',
            'Menü tasarımında yıldız ürünler göz hizasına/sağ üst köşeye',
            'Köpek ürünler çıkarılmalı veya dönüştürülmeli',
            'Mevsimsel menü rotasyonu karlılığı artırır',
        ],
        kategori: 'maliyet',
    },
    {
        id: 'vardiya',
        baslik: 'Vardiya Yönetimi & Devir Teslim',
        icon: Clock,
        color: '#64748b',
        kisaAciklama: 'Personel vardiya planlaması ve devir teslim prosedürleri.',
        detayliAciklama: 'Etkin vardiya yönetimi, doğru sayıda personelin doğru zamanda çalışmasını sağlar. Vardiya değişimlerinde devir teslim formu kullanılması, bilgi kaybını önler. Peak (yoğun) saatlere göre personel planlaması yapılır. Bu sistem personel maliyetini optimize ederken hizmet kalitesini korur.',
        ornekler: [
            'Sabah vardiyası: 07:00-15:00 (2 barista + 1 kasiyer) → Peak: 08:00-10:00',
            'Akşam vardiyası: 15:00-23:00 (3 barista + 1 kasiyer + 1 temizlik)',
            'Devir teslim kontrol: Kasa sayımı ✓ Stok durumu ✓ Açık siparişler ✓ Bilgi notu ✓',
            'Haftalık plan: Pazartesi hafif kadro, Cuma-Cumartesi tam kadro',
        ],
        musteriCevap: '"Doğru vardiya planlaması hem personel maliyetinizi düşürür hem de yoğun saatlerde müşteri memnuniyetinizi artırır. Devir teslim formu ile vardiya değişimlerinde hiçbir bilgi kaybolmaz."',
        ipuclari: [
            'Satış verisine göre yoğunluk haritası çıkarılmalı',
            'Devir teslim formu zorunlu, sözlü aktarım yetersiz',
            'Ani devamsızlık planı (Plan B listesi) hazırlanmalı',
            'Fazla mesai takibi titizlikle yapılmalı',
        ],
        kategori: 'operasyon',
    },
    {
        id: 'kasa',
        baslik: 'Günlük Kasa Kapanışı & Nakit Akış',
        icon: Calculator,
        color: '#10b981',
        kisaAciklama: 'Her gün sonunda gelir-gider mutabakatı ve kasa sayımı.',
        detayliAciklama: 'Günlük kasa kapanışı, günün sonunda tüm nakit ve kartlı satışların sayılması, toplam cironun POS sistemiyle mutabakat edilmesi ve kasa farkının tespitini kapsar. Bu, finansal kontrolün temelidir. Düzenli kasa kapanışı yapılmayan işletmelerde kayıplar tespit edilemez.',
        ornekler: [
            'POS Toplam: ₺12.500 | Nakit: ₺4.200 | Kart: ₺8.100 | Fark: +₺200 (İncelenmeli)',
            'Z Raporu: ₺15.800 | Fiili sayım: ₺15.750 | Fark: -₺50 → Kabul edilebilir',
            'Günlük giderler: Süt ₺800 + Temizlik ₺200 + Personel yemek ₺300 = ₺1.300',
            'Net kasa: ₺12.500 - ₺1.300 = ₺11.200 → Kasaya teslim',
        ],
        musteriCevap: '"Günlük kasa kapanışı işletmenizin günlük sağlık kontrolüdür. Bunu yapmayan işletmeler ay sonunda nereye para gittiğini bulamaz. Biz size hazır Excel şablonu vereceğiz: her gün 5 dakikada doldurun, ay sonunda otomatik rapor oluşsun."',
        ipuclari: [
            'Her gün mutlaka Z raporu alınmalı',
            'Kasa farkı ±₺50 üzerinde ise araştırılmalı',
            'Günlük gider fişleri mutlaka saklanmalı',
            'Kasa sorumlusu belirlenip imza altına alınmalı',
            'Haftalık ve aylık trend analizi yapılmalı',
        ],
        kategori: 'maliyet',
    },
    {
        id: 'stok_sayim',
        baslik: 'Stok Sayım & FIFO Kuralı',
        icon: ClipboardList,
        color: '#a855f7',
        kisaAciklama: 'Düzenli stok sayımı ve İlk Giren İlk Çıkar prensibi.',
        detayliAciklama: 'Stok sayımı, deponuzdaki tüm hammaddelerin fiziksel olarak sayılmasıdır. FIFO (First In, First Out), daha eski tarihteki ürünlerin önce kullanılmasını sağlayan temel kuraldır. Düzenli stok sayımı COGS hesabının, fire tespitinin ve satın alma planlamasının temelidir.',
        ornekler: [
            'Haftalık sayım: Süt 45lt (önceki hafta 50lt alım, 40lt kullanım → 5lt fire)',
            'FIFO uygulaması: Yeni gelen sütler ARKAYA, eski sütler ÖNE yerleştirilir',
            'Etiketleme: Her ürüne "Açılış tarihi" ve "Son kullanma" etiketi',
            'Par-level sistemi: Süt minimum 20lt → düşünce otomatik sipariş',
        ],
        musteriCevap: '"Stok sayımı yapmadan maliyetinizi bilemezsiniz. Firenizi göremezsiniz, hırsızlığı tespit edemezsiniz. Haftada 30 dakika stok sayımı size ayda binlerce TL kazandırır. Excel şablonumuzu kullanarak kolayca yapabilirsiniz."',
        ipuclari: [
            'Haftada en az 1 kez fiziksel sayım yapılmalı',
            'Yüksek maliyetli ürünler (et, peynir, deniz ürünleri) günlük sayılmalı',
            'FIFO için raf düzeni ve etiketleme zorunlu',
            'Sayım sonuçları POS verisi ile karşılaştırılmalı',
        ],
        kategori: 'operasyon',
    },
    {
        id: 'hijyen_kontrolu',
        baslik: 'Hijyen Protokolleri & Sıcaklık Takibi',
        icon: Thermometer,
        color: '#f43f5e',
        kisaAciklama: 'Günlük hijyen kontrolleri ve sıcaklık kayıt sistemi.',
        detayliAciklama: 'Gıda güvenliği için sıcaklık takibi, el hijyeni, yüzey temizliği ve çapraz kontaminasyon önleme kritik önem taşır. Buzdolabı, dondurucu ve servis sıcaklıkları günde en az 2 kez kaydedilmeli. Temizlik çizelgesi oluşturulmalı ve her alan sorumlusuna atanmalıdır.',
        ornekler: [
            'Buzdolabı: 0-4°C (günde 2x ölçüm) → 5°C üzeri = ALARM',
            'Dondurucu: -18°C veya altı → -15°C üzeri = ACİL müdahale',
            'Sıcak servis: 63°C üzeri tutulmalı → altı = Gıda güvenliği riski',
            'El yıkama: 20 saniye + sabun + kağıt havlu (minimum standart)',
        ],
        musteriCevap: '"Bir gıda zehirlenmesi vakası işletmenizi kapatabilir. Günlük sıcaklık kaydı ve hijyen kontrolü hem yasal zorunluluk hem de markanızın sigortasıdır. Hazır kontrol listemiz sayesinde personel sadece doldurup imzalar."',
        ipuclari: [
            'Dijital termometre kullanın (hassas ölçüm)',
            'Sıcaklık kayıtlarını en az 1 yıl saklayın',
            'Temizlik kimyasalları gıdalardan uzak depolanmalı',
            'Renk kodlu kesme tahtaları: Kırmızı=Et, Yeşil=Sebze, Beyaz=Ekmek',
        ],
        kategori: 'kalite',
    },
];

/* ------------------------------------------------------------------ */
/*  Operasyonel Şablonlar                                               */
/* ------------------------------------------------------------------ */
interface Sablon {
    id: string;
    baslik: string;
    aciklama: string;
    icon: any;
    color: string;
    icerik: string[];
    format: string;
}

const SABLONLAR: Sablon[] = [
    {
        id: 'kasa_raporu',
        baslik: 'Günlük Kasa Raporu',
        aciklama: 'Günlük gelir-gider ve kasa mutabakat şablonu',
        icon: Calculator,
        color: '#10b981',
        icerik: [
            'Tarih ve Vardiya Bilgisi',
            'POS Z Raporu Toplamı (Nakit / Kart / Online)',
            'Fiili Kasa Sayımı (Banknot ve bozuk para detayı)',
            'Kasa Farkı Hesaplama',
            'Günlük Giderler (Alımlar, personel yemek, vb.)',
            'Net Kasa Teslim Tutarı',
            'Kasa Sorumlusu İmza',
        ],
        format: 'Excel',
    },
    {
        id: 'stok_sayim_formu',
        baslik: 'Stok Sayım Formu',
        aciklama: 'Haftalık fiziksel stok sayım şablonu',
        icon: ClipboardList,
        color: '#a855f7',
        icerik: [
            'Ürün Adı / Kodu',
            'Birim (kg, lt, adet)',
            'Beklenen Miktar (Sistem)',
            'Fiili Sayım Miktarı',
            'Fark ve Fark Nedeni',
            'Son Kullanma Tarihi Kontrolü',
            'Sayımı Yapan / Onaylayan İmza',
        ],
        format: 'Excel',
    },
    {
        id: 'hijyen_kontrol',
        baslik: 'Günlük Hijyen Kontrol Listesi',
        aciklama: 'HACCP uyumlu günlük hijyen ve sıcaklık kontrol formu',
        icon: ShieldCheck,
        color: '#22c55e',
        icerik: [
            'Buzdolabı Sıcaklıkları (Sabah/Akşam)',
            'Dondurucu Sıcaklıkları',
            'Personel Hijyen Kontrolü (Kıyafet, tırnak, saç)',
            'El Yıkama İstasyonu Kontrolü',
            'Yüzey Temizlik Kontrolü',
            'Çöp ve Atık Yönetimi',
            'Haşere İzleme Noktaları',
        ],
        format: 'PDF & Excel',
    },
    {
        id: 'vardiya_devir',
        baslik: 'Vardiya Devir Teslim Formu',
        aciklama: 'Vardiya değişimlerinde kullanılacak kontrol formu',
        icon: Clock,
        color: '#64748b',
        icerik: [
            'Devir Eden / Alan Personel',
            'Kasa Durumu ve Sayım',
            'Açık Siparişler ve Bekleyenler',
            'Stok Eksikleri ve Notlar',
            'Ekipman Durumu',
            'Müşteri Şikayetleri / Özel Notlar',
            'İmza ve Saat',
        ],
        format: 'Excel',
    },
    {
        id: 'acilis_kapanis',
        baslik: 'Açılış / Kapanış Prosedürü',
        aciklama: 'Günlük açılış ve kapanış adımlarını içeren kontrol listesi',
        icon: Coffee,
        color: '#C4803D',
        icerik: [
            'Makineleri Aç / Isınma Süresi',
            'Malzeme Stok Kontrolü',
            'Tezgah ve Ekipman Temizliği',
            'Kasa Açılış Sayımı',
            'Personel Hazırlık Kontrolü',
            'Kapanışta: Son Sipariş → Temizlik → Kasa Sayım → Kilit',
            'Sorumluluk Dağılımı ve İmza',
        ],
        format: 'PDF',
    },
    {
        id: 'musteri_sikayet',
        baslik: 'Müşteri Şikayet Takip Formu',
        aciklama: 'Müşteri geri bildirimlerini kayıt altına alma formu',
        icon: Users,
        color: '#3b82f6',
        icerik: [
            'Tarih / Saat / Şube',
            'Müşteri Adı (Opsiyonel)',
            'Şikayet Kategorisi (Ürün / Servis / Hijyen / Fiyat)',
            'Şikayet Detayı',
            'Yapılan Müdahale',
            'Sonuç ve Takeaway',
            'Takip Sorumlusu',
        ],
        format: 'Excel',
    },
    {
        id: 'kpi_dashboard',
        baslik: 'KPI Dashboard (6 Sayfa)',
        aciklama: 'Formüllü, otomatik hesaplamalı kapsamlı KPI takip sistemi',
        icon: BarChart3,
        color: '#0B1F3B',
        icerik: [
            'KPI Dashboard — 7 adet temel KPI özet ekranı',
            'Günlük Ciro Takip — 31 günlük formüllü takip',
            'COGS Hesaplama — Kategori bazlı maliyet analizi',
            'Müşteri Memnuniyet — Puan takip ve analiz',
            'Masa Devir Hızı — Kapasite kullanım verimlilik',
            'Personel Takip — Devir oranı ve İK metrikleri',
            'Otomatik renk kodlama (Yeşil/Sarı/Kırmızı)',
        ],
        format: 'Excel (6 Sayfa)',
    },
];

/* ------------------------------------------------------------------ */
/*  Adım Adım Eğitim Rehberi (tüm kavramlar)                           */
/* ------------------------------------------------------------------ */
const EGITIM_ADIMLARI: Record<string, { adim: number; baslik: string; aciklama: string }[]> = {
    kpi: [
        { adim: 1, baslik: 'POS verilerini toplayın', aciklama: 'POS sisteminizden günlük Z raporu çekin. Günlük ciro, sipariş sayısı, ödeme türü dağılımını kaydedin.' },
        { adim: 2, baslik: 'KPI Dashboard Excel\'i açın', aciklama: 'Aşağıdan indirdiğiniz KPI Dashboard dosyasına Hedef ve Gerçekleşen değerleri girin. Formüller otomatik hesaplasın.' },
        { adim: 3, baslik: 'SMART hedefler belirleyin', aciklama: 'Spesifik, Ölçülebilir, Ulaşılabilir, İlgili, Zamanlı hedefler koyun. Örn: "Mart ayı günlük ciro ortalaması ₺15.000"' },
        { adim: 4, baslik: 'Sorumluluk dağıtın', aciklama: 'Her KPI\'ın bir takipçisi olmalı: Ciro→Müdür, COGS→Şef, Hijyen→Personel, Kasa→Kasiyer' },
        { adim: 5, baslik: 'Haftalık dashboard toplantısı', aciklama: 'Her Pazartesi 15 dk dashboard gözden geçirme yapın. Kırmızı olan KPI\'lar için aksiyon kararı alın.' },
        { adim: 6, baslik: 'Aksiyon planı yazın', aciklama: 'Düşük performanslı her KPI için 1-2 haftalık aksiyon planı oluşturun ve takipçi atayın.' },
        { adim: 7, baslik: 'Aylık trend raporu', aciklama: '4 haftalık verileri karşılaştırın. Trend yükseliyor mu düşüyor mu? Mevsimsellik etkisi var mı?' },
    ],
    cogs: [
        { adim: 1, baslik: 'Reçete maliyetlendirmesi yapın', aciklama: 'Her menü ürününü gram gram tartarak hammadde maliyetini hesaplayın. Espresso: 18g kahve, 200ml süt, bardak, kapak...' },
        { adim: 2, baslik: 'Tedarikçi fiyat listesi oluşturun', aciklama: 'Tüm hammaddelerin birim fiyatlarını güncel tutun. 3 farklı tedarikçiden fiyat teklifi alın.' },
        { adim: 3, baslik: 'Haftalık stok sayımı yapın', aciklama: 'Her Pazar veya Pazartesi fiziksel stok sayın. Stok Sayım Formunu kullanın. Farkları not edin.' },
        { adim: 4, baslik: 'COGS formülünü uygulayın', aciklama: 'KPI Dashboard → COGS sayfası açın. Dönem başı stok + alımlar - dönem sonu stok = COGS tutarı' },
        { adim: 5, baslik: 'Yüksek COGS ürünleri tespit edin', aciklama: 'COGS > %35 olan ürünleri listeleyin. Bu ürünler ya fiyatlanmalı ya porsiyon kontrol edilmeli ya da menüden çıkarılmalı.' },
        { adim: 6, baslik: 'Düzeltme aksiyonlarını başlatın', aciklama: '3 strateji: (a) Porsiyon standardizasyonu (b) Tedarikçi pazarlığı/değişimi (c) Menü fiyat güncelleme' },
        { adim: 7, baslik: 'Trend takibi yapın', aciklama: 'Her hafta COGS oranını karşılaştırın. Hedef: %28-32 bandına 4-6 hafta içinde ulaşmak.' },
    ],
    fire: [
        { adim: 1, baslik: 'Fire günlüğü başlatın', aciklama: 'Her atılan ürünü kaydedin: Ne, ne kadar (gram/adet), neden (SKT, bozulma, hata, porsiyon fazlası)' },
        { adim: 2, baslik: 'FIFO kuralını uygulayın', aciklama: 'İlk Giren İlk Çıkar: Yeni gelen ürünleri arkaya, eskileri öne yerleştirin. Her rafta tarih etiketi olmalı.' },
        { adim: 3, baslik: 'Sıcaklık takibini sıkılaştırın', aciklama: 'Buzdolabı: 0-4°C, Dondurucu: ≤ -18°C. Günde 2 kez kontrol, hijyen formuna kayıt.' },
        { adim: 4, baslik: 'Prep miktarlarını ayarlayın', aciklama: 'Son 2 haftanın satış verisine bakarak günlük hazırlık miktarlarını belirleyin. Az hazırla, tükendikçe yenile.' },
        { adim: 5, baslik: 'SKT kontrolünü rutin hale getirin', aciklama: 'Haftada 1 tüm rafları tarayın. 3 gün içinde bitecek ürünleri "Önce Kullan" etiketiyle işaretleyin.' },
        { adim: 6, baslik: 'Personeli eğitin', aciklama: 'Fire maliyetini parasal olarak gösterin: "Günde 80 TL fire = Yılda 29.000 TL = 1 personelin 4 aylık maaşı"' },
    ],
    haccp: [
        { adim: 1, baslik: 'HACCP prensiplerini öğrenin', aciklama: '7 prensip: Tehlike analizi, Kritik kontrol noktaları (CCP), Kritik limitler, İzleme, Düzeltme, Doğrulama, Kayıt' },
        { adim: 2, baslik: 'Mutfak akış şemasını çizin', aciklama: 'Mal kabul → Depolama → Hazırlık → Pişirme → Servis. Her aşamada kontaminasyon riskini belirleyin.' },
        { adim: 3, baslik: 'Hijyen kontrol formunu kullanın', aciklama: 'Günlük hijyen formumuzu basıp doldurun: Sıcaklık, personel hijyen, yüzey temizlik kontrolleri.' },
        { adim: 4, baslik: 'Sıcaklık kayıtlarını tutun', aciklama: 'Buzdolabı, dondurucu, pişirme iç sıcaklık, sıcak servis. Günde 2 kez sabah/akşam kayıt.' },
        { adim: 5, baslik: 'Temizlik planı oluşturun', aciklama: 'Günlük/haftalık/aylık temizlik takvimi yapın. Her alan için sorumlu ve yöntem belirleyin.' },
        { adim: 6, baslik: 'Personel hijyen eğitimi verin', aciklama: 'El yıkama 20 sn, saç bonesi, kısa tırnak, takı yasağı. 6 ayda 1 tazeleme eğitimi.' },
    ],
    sop: [
        { adim: 1, baslik: 'Kritik süreçleri listeleyin', aciklama: 'Açılış, kapanış, sipariş alma, espresso hazırlama, kasa sayım, stok teslim alma, temizlik...' },
        { adim: 2, baslik: 'Her süreç için adımları yazın', aciklama: 'Adım adım, net, herkesin anlayacağı dilde. Fotoğraflı olması idealdir.' },
        { adim: 3, baslik: 'Standart süreleri belirleyin', aciklama: 'Her adımın ne kadar sürmesi gerektiğini yazın. Espresso: 25-30 sn extraction.' },
        { adim: 4, baslik: 'Lokasyona asın veya dosyalayın', aciklama: 'İlgili SOP\'u ilgili alana asın: Bar SOP barın yanında, kasa SOP kasanın yanında.' },
        { adim: 5, baslik: 'Eğitim ve pratik yaptırın', aciklama: 'Yeni personel SOP\'u okusun, yanında biri gözetiminde 3 kez uygulasın, sonra tek başına yapsın.' },
        { adim: 6, baslik: 'Periyodik güncelleme yapın', aciklama: '3 ayda 1 SOP\'ları gözden geçirin. Değişen süreçleri güncelleyin. Versiyon numarası verin.' },
    ],
    break_even: [
        { adim: 1, baslik: 'Sabit giderleri hesaplayın', aciklama: 'Kira, personel, sigorta, elektrik/su/doğalgaz, internet, muhasebe, kredi taksidi... Aylık toplam sabit gider.' },
        { adim: 2, baslik: 'Değişken gider oranını bulun', aciklama: 'COGS (hammadde) + paketleme = toplam değişken gider. Bu genelde cironun %30-40\'ı.' },
        { adim: 3, baslik: 'Katkı payı oranını hesaplayın', aciklama: 'Katkı Payı = 1 - (Değişken Gider Oranı). COGS %30 ise, katkı payı %70 (0.70).' },
        { adim: 4, baslik: 'Başabaş noktasını hesaplayın', aciklama: 'Başabaş Cirosu = Sabit Giderler / Katkı Payı. Örn: ₺90.000 / 0.70 = ₺128.571/ay' },
        { adim: 5, baslik: 'Günlük hedefe çevirin', aciklama: 'Aylık başabaş / 30 gün = Günlük minimum ciro. Örn: ₺128.571 / 30 = ₺4.286/gün' },
        { adim: 6, baslik: 'Kar hedefi ekleyin', aciklama: '%15 kar hedefi? Başabaş × 1.15 = hedef ciro. Bu sayıyı KPI Dashboard\'a hedef olarak girin.' },
    ],
    menu_engineering: [
        { adim: 1, baslik: 'Ürün bazlı maliyet çıkarın', aciklama: 'Her menü ürünün COGS\'unu hesaplayın: Hammadde maliyeti / Satış fiyatı × 100' },
        { adim: 2, baslik: 'Satış adetlerini çıkarın', aciklama: 'Son 30 günün POS verisinden her ürünün satış adedini çekin.' },
        { adim: 3, baslik: 'BCG matrisini oluşturun', aciklama: '4 kategori: Yıldız (çok satılan+karlı), İnek (karlı ama az satılan), Merak (çok satılan ama karsız), Köpek (az satılan+karsız)' },
        { adim: 4, baslik: 'Stratejileri uygulayın', aciklama: 'Yıldız→Öne çıkar, İnek→Pazarlama yap, Merak→Fiyat artır/maliyet düşür, Köpek→Menüden çıkar' },
        { adim: 5, baslik: 'Menü tasarımını optimize edin', aciklama: 'Yıldız ürünleri menünün sağ üst köşesine (göz ilk oraya bakar). Fiyatları hizalamayın (₺ işareti koyma).' },
    ],
    labor_cost: [
        { adim: 1, baslik: 'Toplam personel maliyetini hesaplayın', aciklama: 'Maaş + SGK + yemek + ulaşım + kıyafet + fazla mesai = Toplam personel maliyeti' },
        { adim: 2, baslik: 'Labor Cost %\'yi hesaplayın', aciklama: 'Toplam personel maliyeti / Toplam ciro × 100. Hedef: %25-30' },
        { adim: 3, baslik: 'Saat bazlı planla', aciklama: 'Yoğun saatlerde (12:00-14:00, 18:00-21:00) tam kadro, sakin saatlerde minimum kadro çalıştırın.' },
        { adim: 4, baslik: 'Verimlilik metrikleri koyun', aciklama: 'Personel başına ciro = Toplam ciro / çalışan sayısı. Hedef: Günlük personel başı ₺2.000-3.000' },
        { adim: 5, baslik: 'Çapraz eğitim verin', aciklama: 'Her personel en az 2 pozisyon bilmeli: Barista+kasiyer, garson+bar yardımcısı. Esneklik sağlar.' },
    ],
    inventory: [
        { adim: 1, baslik: 'Par-level sistemi kurun', aciklama: 'Her ürünün minimum stok seviyesini belirleyin. Bu seviyeye düşünce otomatik sipariş verin.' },
        { adim: 2, baslik: 'Haftalık stok sayımı', aciklama: 'Her Pazar akşamı fiziksel sayım. Stok Sayım Formunu kullanın. Sistem stoku ile karşılaştırın.' },
        { adim: 3, baslik: 'Fark analizi yapın', aciklama: '%3 üzeri fark varsa soruşturma başlatın. Olası nedenler: Hırsızlık, fire kaydedilmemiş, yanlış sayım.' },
        { adim: 4, baslik: 'Tedarikçi mal kabul prosedürü', aciklama: 'Her teslimatı kontrol edin: Miktar, kalite, SKT, sıcaklık. Uygun olmayanı iade edin. Kayıt tutun.' },
        { adim: 5, baslik: 'ABC analizi yapın', aciklama: 'A items (%20 ürün, %80 maliyet): Günlük kontrol. B items: Haftalık. C items: Aylık.' },
    ],
    prime_cost: [
        { adim: 1, baslik: 'COGS + Labor Cost = Prime Cost', aciklama: 'İki maliyeti toplayın. Formül: Prime Cost = COGS (₺) + Personel Maliyeti (₺)' },
        { adim: 2, baslik: 'Prime Cost %\'yi hesaplayın', aciklama: 'Prime Cost / Toplam Ciro × 100. Hedef: %55-65 arası.' },
        { adim: 3, baslik: 'Haftalık takip yapın', aciklama: 'Her hafta sonu hesap yapın. KPI Dashboard\'a işleyin. Trend çizgisini takip edin.' },
        { adim: 4, baslik: 'Denge noktasını bulun', aciklama: 'COGS düştüğünde Labor artmasın. İkisi birlikte optimize edilmeli. Birini düşürürken diğerini izleyin.' },
        { adim: 5, baslik: 'Optimizasyon kararları', aciklama: 'Prime Cost > %65 ise: (a) COGS düşür (reçete revize) (b) Labor düşür (verimlilik artır) (c) Fiyat artır' },
    ],
    table_turnover: [
        { adim: 1, baslik: 'Masa sayınızı ve kapasiteyi bilin', aciklama: 'Kaç masa, masa başı kaç kişi. Toplam oturma kapasitesi = Masa × Ortalama kişi sayısı' },
        { adim: 2, baslik: 'Günlük müşteri sayısını kaydedin', aciklama: 'KPI Dashboard → Masa Devir sayfası: Öğle ve akşam müşteri sayılarını girin.' },
        { adim: 3, baslik: 'Devir hızını hesaplayın', aciklama: 'Devir = Toplam müşteri / (Masa × Ort. kişi). Formül Excel\'de otomatik. Hedef: 3x/gün' },
        { adim: 4, baslik: 'Darboğazları tespit edin', aciklama: 'Yavaş servis mi? Uzun menü mü? Ödeme süreci mi? Zamanlama yaparak hangi aşamada zaman kaybını bulun.' },
        { adim: 5, baslik: 'Hız optimizasyonu yapın', aciklama: 'Sipariş alma: max 3 dk. Mutfak çıkış: max 12 dk. QR menü/sipariş kullanın. Menü item\'ı azaltın.' },
    ],
};

/* ------------------------------------------------------------------ */
/*  Ana Bileşen                                                         */
/* ------------------------------------------------------------------ */
const KATEGORI_LABELS: Record<string, { label: string; color: string }> = {
    temel: { label: 'Temel Kavramlar', color: '#3b82f6' },
    maliyet: { label: 'Maliyet & Finansal', color: '#C4803D' },
    operasyon: { label: 'Operasyon & Süreç', color: '#8b5cf6' },
    kalite: { label: 'Kalite & Güvenlik', color: '#22c55e' },
};

const DOWNLOAD_MAP: Record<string, { fn: () => Promise<void> | void; label: string }[]> = {
    kasa_raporu: [{ fn: generateKasaRaporu, label: 'Excel İndir' }],
    stok_sayim_formu: [{ fn: generateStokSayim, label: 'Excel İndir' }],
    hijyen_kontrol: [
        { fn: generateHijyenExcel, label: 'Excel İndir' },
        { fn: generateHijyenPDF, label: 'PDF İndir' },
    ],
    vardiya_devir: [{ fn: generateVardiyaDevir, label: 'Excel İndir' }],
    acilis_kapanis: [{ fn: generateAcilisKapanisPDF, label: 'PDF İndir' }],
    musteri_sikayet: [{ fn: generateMusteriSikayet, label: 'Excel İndir' }],
    kpi_dashboard: [{ fn: generateKPIDashboard, label: '📊 KPI Dashboard İndir (6 Sayfa)' }],
};

export default function EgitimSeti() {
    const [openKavram, setOpenKavram] = useState<string | null>(null);
    const [activeKategori, setActiveKategori] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [downloading, setDownloading] = useState<string | null>(null);

    const handleDownload = async (sablonId: string, fn: () => Promise<void> | void) => {
        setDownloading(sablonId);
        try {
            await fn();
        } catch (e) {
            console.error('Download error:', e);
        } finally {
            setTimeout(() => setDownloading(null), 500);
        }
    };

    const filteredKavramlar = KAVRAMLAR.filter(k => {
        const matchKategori = activeKategori === 'all' || k.kategori === activeKategori;
        const matchSearch = searchTerm === '' ||
            k.baslik.toLowerCase().includes(searchTerm.toLowerCase()) ||
            k.kisaAciklama.toLowerCase().includes(searchTerm.toLowerCase());
        return matchKategori && matchSearch;
    });

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Başlık */}
            <div>
                <h2 className="text-xl font-bold text-[#0B1F3B] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#C4803D]" />
                    Eğitim Seti & Bilgi Bankası
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Müşterilerinize profesyonel cevaplar verebileceğiniz kapsamlı bilgi kaynağı ve operasyonel şablonlar
                </p>
            </div>

            {/* Arama */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Kavram ara... (KPI, COGS, fire, hijyen...)"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none"
                />
            </div>

            {/* Kategori Filtre */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setActiveKategori('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeKategori === 'all'
                        ? 'bg-[#0B1F3B] text-white shadow-lg'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#C4803D]'
                        }`}
                >
                    Tümü ({KAVRAMLAR.length})
                </button>
                {Object.entries(KATEGORI_LABELS).map(([key, { label, color }]) => {
                    const count = KAVRAMLAR.filter(k => k.kategori === key).length;
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveKategori(key)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeKategori === key
                                ? 'text-white shadow-lg'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                                }`}
                            style={activeKategori === key ? { backgroundColor: color } : {}}
                        >
                            {label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Kavram Kartları */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#0B1F3B] flex items-center gap-2">
                    📖 Kavramlar & Müşteri Cevapları
                </h3>

                {filteredKavramlar.map(kavram => {
                    const isOpen = openKavram === kavram.id;
                    const Icon = kavram.icon;
                    return (
                        <div key={kavram.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
                            {/* Başlık */}
                            <button
                                onClick={() => setOpenKavram(isOpen ? null : kavram.id)}
                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${kavram.color}15` }}>
                                        <Icon className="w-5 h-5" style={{ color: kavram.color }} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-sm text-[#0B1F3B]">{kavram.baslik}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{kavram.kisaAciklama}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ color: KATEGORI_LABELS[kavram.kategori].color, backgroundColor: `${KATEGORI_LABELS[kavram.kategori].color}15` }}>
                                        {KATEGORI_LABELS[kavram.kategori].label}
                                    </span>
                                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                </div>
                            </button>

                            {/* İçerik */}
                            {isOpen && (
                                <div className="border-t border-gray-100 px-6 py-5 space-y-5">
                                    {/* Detaylı Açıklama */}
                                    <div>
                                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">📋 Detaylı Açıklama</h5>
                                        <p className="text-sm text-gray-700 leading-relaxed">{kavram.detayliAciklama}</p>
                                    </div>

                                    {/* Örnekler */}
                                    <div className="bg-blue-50/50 rounded-xl p-4">
                                        <h5 className="text-xs font-bold text-blue-600 uppercase mb-2">📊 Örnekler</h5>
                                        <ul className="space-y-1.5">
                                            {kavram.ornekler.map((ornek, i) => (
                                                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                    <span className="text-blue-400 mt-1">•</span>
                                                    {ornek}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Müşteriye Nasıl Anlat */}
                                    <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                                        <h5 className="text-xs font-bold text-[#C4803D] uppercase mb-2">💬 Müşteriye Nasıl Anlatırsın?</h5>
                                        <p className="text-sm text-gray-700 italic leading-relaxed">{kavram.musteriCevap}</p>
                                    </div>

                                    {/* İpuçları */}
                                    <div>
                                        <h5 className="text-xs font-bold text-green-600 uppercase mb-2">💡 İpuçları & Hatırlatmalar</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {kavram.ipuclari.map((tip, i) => (
                                                <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    {tip}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Adım Adım Uygulama Rehberi */}
                                    {EGITIM_ADIMLARI[kavram.id] && (
                                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                                            <h5 className="text-xs font-bold text-indigo-700 uppercase mb-3 flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4" />
                                                📝 Adım Adım Uygulama Rehberi — Nasıl Yapılır?
                                            </h5>
                                            <div className="space-y-3">
                                                {EGITIM_ADIMLARI[kavram.id].map((step) => (
                                                    <div key={step.adim} className="flex gap-3 bg-white/70 rounded-lg p-3 border border-indigo-100/50">
                                                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                                            {step.adim}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-indigo-900">{step.baslik}</p>
                                                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{step.aciklama}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredKavramlar.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Aradığınız kavram bulunamadı</p>
                    </div>
                )}
            </div>

            {/* Operasyonel Şablonlar */}
            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-[#0B1F3B] flex items-center gap-2">
                    📁 Operasyonel Şablonlar — Müşteriye Vereceğin Belgeler
                </h3>
                <p className="text-sm text-gray-500">
                    Bu şablonları müşterilerinize işletme operasyonlarında kullanmaları için verebilirsiniz.
                    Admin panelindeki <strong>Belgeler</strong> sekmesinden doldurup Excel/PDF olarak indirebilirsiniz.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SABLONLAR.map(sablon => {
                        const Icon = sablon.icon;
                        const downloads = DOWNLOAD_MAP[sablon.id] || [];
                        const isDownloading = downloading === sablon.id;
                        return (
                            <div key={sablon.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${sablon.color}15` }}>
                                        <Icon className="w-5 h-5" style={{ color: sablon.color }} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-sm text-[#0B1F3B]">{sablon.baslik}</h4>
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{sablon.format}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{sablon.aciklama}</p>
                                        <div className="mt-3 space-y-1">
                                            {sablon.icerik.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                                    <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: sablon.color }} />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                        {/* Download Buttons */}
                                        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                                            {downloads.map((dl, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleDownload(sablon.id, dl.fn)}
                                                    disabled={isDownloading}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:shadow-md active:scale-95 disabled:opacity-60"
                                                    style={{ backgroundColor: sablon.color }}
                                                >
                                                    {isDownloading
                                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        : <Download className="w-3.5 h-3.5" />
                                                    }
                                                    {dl.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Hızlı Referans */}
            <div className="bg-gradient-to-br from-[#0B1F3B] to-[#1a3a5c] rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    ⚡ Hızlı Referans — Sektör Standartları
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'İdeal COGS (Coffee)', value: '%25-30', icon: '☕' },
                        { label: 'İdeal COGS (Restoran)', value: '%28-35', icon: '🍽️' },
                        { label: 'Kabul Edilebilir Fire', value: '%2-4', icon: '🔥' },
                        { label: 'Personel Maliyet Oranı', value: '%25-30', icon: '👥' },
                        { label: 'Buzdolabı Sıcaklığı', value: '0-4°C', icon: '❄️' },
                        { label: 'Dondurucu Sıcaklığı', value: '≤ -18°C', icon: '🧊' },
                        { label: 'Et Pişirme İç Sıcaklık', value: '≥ 72°C', icon: '🥩' },
                        { label: 'Sıcak Servis Sıcaklığı', value: '≥ 63°C', icon: '🍲' },
                        { label: 'Masa Devir Hızı (Hedef)', value: '3x/gün', icon: '🔄' },
                        { label: 'Sipariş Alma Süresi', value: '≤ 3 dk', icon: '⏱️' },
                        { label: 'Servis Süresi (Sıcak)', value: '≤ 12 dk', icon: '🍳' },
                        { label: 'Kasa Farkı Toleransı', value: '±₺50', icon: '💰' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                            <div className="text-lg mb-1">{item.icon}</div>
                            <div className="text-lg font-bold text-[#C4803D]">{item.value}</div>
                            <div className="text-[10px] text-gray-300 mt-0.5">{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Danışman Kişisel Araçları */}
            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-[#0B1F3B] flex items-center gap-2">
                    🎯 Danışman Kişisel Araçları — Senin İçin
                </h3>
                <p className="text-sm text-gray-500">
                    Bu araçlar sadece sana özel. Ziyaret öncesi hazırlık, ziyaret sırası kontrol ve unuttuğun formüller için cebinde taşı.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Cep Kartı */}
                    <div className="bg-gradient-to-br from-[#0B1F3B] to-[#1a3a5c] rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
                        <div className="text-2xl mb-2">🃏</div>
                        <h4 className="font-bold text-sm">Danışman Cep Kartı</h4>
                        <p className="text-xs text-gray-300 mt-1">Tek sayfada tüm formüller, sektör standartları, kritik sıcaklıklar ve müşteriye sorulacak 10 soru.</p>
                        <ul className="text-xs text-gray-400 mt-2 space-y-0.5">
                            <li>• 8 Temel Formül + Örnekler</li>
                            <li>• 4 İşletme Tipi × 9 Metrik</li>
                            <li>• HACCP Sıcaklık Tablosu</li>
                            <li>• 10 Kritik Müşteri Sorusu</li>
                        </ul>
                        <button
                            onClick={() => handleDownload('cep_karti', generateCepKartiPDF)}
                            disabled={downloading === 'cep_karti'}
                            className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#C4803D] text-white hover:bg-[#b0702f] transition-all active:scale-95 disabled:opacity-60"
                        >
                            {downloading === 'cep_karti' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            PDF İndir (Yazdır & Cebine Koy)
                        </button>
                    </div>

                    {/* Red Flag */}
                    <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
                        <div className="text-2xl mb-2">🔴</div>
                        <h4 className="font-bold text-sm">Kırmızı Bayrak Listesi</h4>
                        <p className="text-xs text-red-200 mt-1">Ziyarette anında alarm çalması gereken 26 kritik işaret. Bunları görürsen müdahale et.</p>
                        <ul className="text-xs text-red-300 mt-2 space-y-0.5">
                            <li>• 10 Gıda Güvenliği İhlali</li>
                            <li>• 8 Finansal Kırmızı Bayrak</li>
                            <li>• 8 Operasyonel Alarm</li>
                            <li>• Öncelik Rehberi (ACİL/YÜKSEK/ORTA)</li>
                        </ul>
                        <button
                            onClick={() => handleDownload('red_flag', generateRedFlagPDF)}
                            disabled={downloading === 'red_flag'}
                            className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-red-700 hover:bg-red-50 transition-all active:scale-95 disabled:opacity-60"
                        >
                            {downloading === 'red_flag' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            PDF İndir (Her Ziyarette Kontrol Et)
                        </button>
                    </div>

                    {/* Ziyaret Akışı */}
                    <div className="bg-gradient-to-br from-[#C4803D] to-[#9a5f2e] rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all">
                        <div className="text-2xl mb-2">📋</div>
                        <h4 className="font-bold text-sm">Ziyaret Akış Şeması</h4>
                        <p className="text-xs text-amber-200 mt-1">İlk ziyaret 10 adım + takip ziyareti 8 adım + aylık danışmanlık takvimi.</p>
                        <ul className="text-xs text-amber-300 mt-2 space-y-0.5">
                            <li>• İlk Ziyaret: 2-3 saat rehberi</li>
                            <li>• Takip Ziyareti: 1-1.5 saat</li>
                            <li>• Aylık 4 Haftalık Takvim</li>
                            <li>• Her adımda araç önerisi</li>
                        </ul>
                        <button
                            onClick={() => handleDownload('ziyaret_akis', generateZiyaretAkisPDF)}
                            disabled={downloading === 'ziyaret_akis'}
                            className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-[#9a5f2e] hover:bg-amber-50 transition-all active:scale-95 disabled:opacity-60"
                        >
                            {downloading === 'ziyaret_akis' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            PDF İndir (Ziyaret Öncesi Oku)
                        </button>
                    </div>
                </div>
            </div>

            {/* Alert: Belgeler sekmesine yönlendirme */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-blue-800">📌 Hatırlatma</p>
                    <p className="text-sm text-blue-700 mt-1">
                        Müşterilerinize verebileceğiniz doldurulabilir belgeler için sol menüdeki <strong>Belgeler</strong> grubunu kullanın:
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• <strong>Durum Özeti (PDF)</strong> — İşletme analiz raporu oluşturun</li>
                        <li>• <strong>Aksiyon Planı (Excel)</strong> — Danışmanlık sonrası görev planı</li>
                        <li>• <strong>Kontrol Listesi</strong> — Ziyaret sırasında kullanacağınız checklist</li>
                        <li>• <strong>Aylık Performans</strong> — Ay sonu KPI özet raporu (ciro, COGS, memnuniyet)</li>
                        <li>• <strong>Teklif / Sözleşme</strong> — Yeni müşteriye profesyonel teklif formu</li>
                        <li>• <strong>Ziyaret Notu</strong> — Her ziyaret sonrası kısa rapor formu</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
