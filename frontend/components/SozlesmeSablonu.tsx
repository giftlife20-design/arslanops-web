'use client';

import { useState } from 'react';
import { FileText, Download, Building2, Phone, Shield, Calendar, Loader2, Scale, Lock } from 'lucide-react';
import { loadTurkishFont } from '../utils/pdfFontLoader';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface SozlesmeData {
    // Danışman
    danisman_adi: string;
    danisman_unvan: string;
    danisman_telefon: string;
    danisman_email: string;
    danisman_adres: string;
    danisman_vergi_dairesi: string;
    danisman_vergi_no: string;
    // Müşteri
    musteri_adi: string;
    musteri_isletme: string;
    musteri_telefon: string;
    musteri_email: string;
    musteri_adres: string;
    musteri_vergi_dairesi: string;
    musteri_vergi_no: string;
    // Sözleşme
    sozlesme_no: string;
    sozlesme_tarihi: string;
    baslangic_tarihi: string;
    bitis_tarihi: string;
    sure: string;
    // Hizmet Kapsamı
    hizmet_kapsami: string;
    // Ödeme
    toplam_ucret: string;
    pesin_oran: string;
    kalan_oran: string;
    odeme_notu: string;
    // NDA
    gizlilik_suresi: string;
    cezai_sart: string;
}

type SozlesmeTipi = 'hizmet' | 'gizlilik';

const INITIAL: SozlesmeData = {
    danisman_adi: 'İlhan Arslan',
    danisman_unvan: 'Coffee & Restoran Operasyon Danışmanı',
    danisman_telefon: '+90 539 233 11 474',
    danisman_email: 'info@arslanops.com',
    danisman_adres: '',
    danisman_vergi_dairesi: '',
    danisman_vergi_no: '',
    musteri_adi: '',
    musteri_isletme: '',
    musteri_telefon: '',
    musteri_email: '',
    musteri_adres: '',
    musteri_vergi_dairesi: '',
    musteri_vergi_no: '',
    sozlesme_no: `SOZ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    sozlesme_tarihi: new Date().toISOString().split('T')[0],
    baslangic_tarihi: '',
    bitis_tarihi: '',
    sure: '3 ay',
    hizmet_kapsami: `1. Operasyonel Analiz & Durum Tespiti
  - Isletme ziyareti, gozlem, mevcut durum analizi
  - SWOT analizi ve risk degerlendirmesi

2. Sistem Kurulumu & Iyilestirme
  - Stok takip ve satin alma surecleri
  - Kasa yonetimi ve mali kontrol
  - Personel verimlilik analizi

3. Raporlama & Takip
  - Haftalik ilerleme raporu
  - KPI dashboard kurulumu
  - Aksiyon plani ve kontrol listeleri`,
    toplam_ucret: '',
    pesin_oran: '50',
    kalan_oran: '50',
    odeme_notu: 'Sozlesme imzalandiginda toplam ucretin %50\'si pesin odenir. Kalan %50 hizmet tamamlandiginda odenir.',
    gizlilik_suresi: '2 yil',
    cezai_sart: '50000',
};

/* ------------------------------------------------------------------ */
/*  Transliteration (fallback if font fails)                           */
/* ------------------------------------------------------------------ */
function tr(text: string, hasTurkishFont: boolean): string {
    if (hasTurkishFont) return text;
    return text
        .replace(/ş/g, 's').replace(/Ş/g, 'S')
        .replace(/ı/g, 'i').replace(/İ/g, 'I')
        .replace(/ç/g, 'c').replace(/Ç/g, 'C')
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
        .replace(/ö/g, 'o').replace(/Ö/g, 'O')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/—/g, '--').replace(/–/g, '-')
        .replace(/°/g, ' derece ')
        .replace(/'/g, "'");
}

/* ------------------------------------------------------------------ */
/*  Hizmet Sözleşmesi PDF                                             */
/* ------------------------------------------------------------------ */
async function generateHizmetSozlesmesi(data: SozlesmeData) {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF('p', 'mm', 'a4');
    const hasTR = await loadTurkishFont(doc);
    const t = (s: string) => tr(s, hasTR);
    const fontName = hasTR ? 'Roboto' : 'Helvetica';
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentW = pageW - margin * 2;
    let y = 15;

    const navy: [number, number, number] = [11, 31, 59];
    const gold: [number, number, number] = [196, 128, 61];
    const textDark: [number, number, number] = [30, 30, 30];
    const textGray: [number, number, number] = [120, 120, 120];

    const checkPage = (needed: number) => {
        if (y + needed > pageH - 25) {
            doc.addPage();
            y = 20;
        }
    };

    const sectionTitle = (title: string) => {
        checkPage(20);
        doc.setFillColor(...gold);
        doc.rect(margin, y, 3, 8, 'F');
        doc.setTextColor(...navy);
        doc.setFontSize(11);
        doc.setFont(fontName, 'bold');
        doc.text(t(title), margin + 7, y + 6);
        y += 14;
    };

    const addParagraph = (text: string, fontSize = 9) => {
        doc.setFont(fontName, 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(...textDark);
        const lines = doc.splitTextToSize(t(text), contentW - 10);
        checkPage(lines.length * 4.5 + 5);
        doc.text(lines, margin + 5, y);
        y += lines.length * 4.5 + 5;
    };

    // ---- HEADER ----
    doc.setFillColor(...navy);
    doc.rect(0, 0, pageW, 42, 'F');
    doc.setFillColor(...gold);
    doc.rect(0, 42, pageW, 2.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(fontName, 'bold');
    doc.text(t('DANIŞMANLIK HİZMET SÖZLEŞMESİ'), pageW / 2, 16, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont(fontName, 'normal');
    doc.text(t(`Sözleşme No: ${data.sozlesme_no}`), pageW / 2, 25, { align: 'center' });
    doc.setFontSize(8);
    doc.text(t(`Tarih: ${data.sozlesme_tarihi}`), pageW / 2, 31, { align: 'center' });
    doc.text('ArslanOps', pageW / 2, 37, { align: 'center' });

    y = 52;

    // ---- MADDE 1: TARAFLAR ----
    sectionTitle('MADDE 1 - TARAFLAR');

    // Danışman kutusu
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentW / 2 - 3, 44, 2, 2, 'F');
    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont(fontName, 'bold');
    doc.text(t('DANIŞMAN (Hizmet Veren)'), margin + 4, y + 7);
    doc.setFont(fontName, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    doc.text(t(data.danisman_adi), margin + 4, y + 14);
    doc.text(t(data.danisman_unvan), margin + 4, y + 19);
    doc.text(data.danisman_telefon, margin + 4, y + 24);
    doc.text(data.danisman_email, margin + 4, y + 29);
    if (data.danisman_vergi_dairesi) doc.text(t(`VD: ${data.danisman_vergi_dairesi} - ${data.danisman_vergi_no}`), margin + 4, y + 34);
    if (data.danisman_adres) doc.text(t(data.danisman_adres).substring(0, 50), margin + 4, y + 39);

    // Müşteri kutusu
    const rightX = margin + contentW / 2 + 3;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(rightX, y, contentW / 2 - 3, 44, 2, 2, 'F');
    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont(fontName, 'bold');
    doc.text(t('MÜŞTERİ (Hizmet Alan)'), rightX + 4, y + 7);
    doc.setFont(fontName, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    doc.text(t(data.musteri_adi || '(Ad Soyad)'), rightX + 4, y + 14);
    doc.text(t(data.musteri_isletme || '(İşletme Adı)'), rightX + 4, y + 19);
    doc.text(data.musteri_telefon || '(Telefon)', rightX + 4, y + 24);
    doc.text(data.musteri_email || '(E-posta)', rightX + 4, y + 29);
    if (data.musteri_vergi_dairesi) doc.text(t(`VD: ${data.musteri_vergi_dairesi} - ${data.musteri_vergi_no}`), rightX + 4, y + 34);
    if (data.musteri_adres) doc.text(t(data.musteri_adres).substring(0, 50), rightX + 4, y + 39);

    y += 52;

    // ---- MADDE 2: KONU ----
    sectionTitle('MADDE 2 - SÖZLEŞMENİN KONUSU');
    addParagraph('Bu sözleşme, Danışman\'ın Müşteri\'ye aşağıda belirtilen danışmanlık hizmetlerini vermesine ilişkin tarafların hak ve yükümlülüklerini düzenlemektedir.');

    // ---- MADDE 3: HİZMET KAPSAMI ----
    sectionTitle('MADDE 3 - HİZMET KAPSAMI');
    addParagraph(data.hizmet_kapsami);

    // ---- MADDE 4: SÜRE ----
    sectionTitle('MADDE 4 - SÖZLEŞME SÜRESİ');
    const sureRows = [
        [t('Başlangıç Tarihi'), t(data.baslangic_tarihi || '(Belirlenmedi)')],
        [t('Bitiş Tarihi'), t(data.bitis_tarihi || '(Belirlenmedi)')],
        [t('Toplam Süre'), t(data.sure || '(Belirlenmedi)')],
    ];
    checkPage(30);
    autoTable(doc, {
        startY: y,
        body: sureRows,
        theme: 'plain',
        bodyStyles: { fontSize: 9, font: fontName, textColor: textDark },
        columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold', textColor: navy }, 1: { cellWidth: contentW - 45 } },
        styles: { cellPadding: 3 },
        margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 5;
    addParagraph('Sözleşme süresi, tarafların karşılıklı yazılı mutabakatı ile uzatılabilir. Erken fesih durumunda Madde 9 hükümleri geçerlidir.');

    // ---- MADDE 5: ÜCRET VE ÖDEME ----
    sectionTitle('MADDE 5 - ÜCRET VE ÖDEME KOŞULLARI');

    const ucret = data.toplam_ucret ? `${Number(data.toplam_ucret).toLocaleString('tr-TR')} TL` : '(Belirlenmedi)';
    const pesinTutar = data.toplam_ucret ? `${Math.round(Number(data.toplam_ucret) * Number(data.pesin_oran) / 100).toLocaleString('tr-TR')} TL` : '-';
    const kalanTutar = data.toplam_ucret ? `${Math.round(Number(data.toplam_ucret) * Number(data.kalan_oran) / 100).toLocaleString('tr-TR')} TL` : '-';

    const odemeRows = [
        [t('Toplam Danışmanlık Ücreti'), ucret],
        [t(`Peşin Ödeme (%${data.pesin_oran})`), t(`${pesinTutar} - Sözleşme imzalandığında`)],
        [t(`Kalan Ödeme (%${data.kalan_oran})`), t(`${kalanTutar} - Hizmet tamamlandığında`)],
    ];
    checkPage(30);
    autoTable(doc, {
        startY: y,
        body: odemeRows,
        theme: 'striped',
        bodyStyles: { fontSize: 9, font: fontName, textColor: textDark },
        columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold', textColor: navy }, 1: { cellWidth: contentW - 55 } },
        styles: { cellPadding: 3.5 },
        margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 5;
    if (data.odeme_notu) addParagraph(data.odeme_notu);
    addParagraph('Ödemeler banka havalesi veya EFT yoluyla yapılır. Fatura, ödeme tarihinden itibaren 7 iş günü içinde kesilir. KDV (%20) ücrete dahil değildir ve ayrıca faturalandırılır.');

    // ---- MADDE 6: TARAFLARIN YÜKÜMLÜLÜKLERİ ----
    sectionTitle('MADDE 6 - TARAFLARIN YÜKÜMLÜLÜKLERİ');
    addParagraph('6.1 Danışman\'ın Yükümlülükleri:\n- Hizmeti profesyonel standartlarda, özenle ve zamanında sunmak\n- Müşteri\'nin ticari sırlarını ve gizli bilgilerini korumak\n- İlerleme raporlarını zamanında teslim etmek\n- Sözleşme kapsamındaki tüm çalışmaları bizzat veya onay alınmış ekibi ile yürütmek\n- Danışmanlık niteliğinde hizmet vermek (uygulama sorumluluğu Müşteri\'ye aittir)');
    addParagraph('6.2 Müşteri\'nin Yükümlülükleri:\n- Hizmetin yürütülmesi için gerekli bilgi, belge, veri ve erişimi zamanında sağlamak\n- Ödeme yükümlülüklerini zamanında yerine getirmek\n- Danışman\'ın önerilerini makul sürede değerlendirmek\n- Danışman\'a gerekli çalışma ortamını ve işbirliği imkanını sunmak\n- Sözleşme kapsamında bir İrtibat/Sorumlu Kişi atamak (bkz. Madde 7)');

    // ---- MADDE 7: SORUMLU KİŞİ VE VERİ SAĞLAMA ----
    sectionTitle('MADDE 7 - SORUMLU KİŞİ ATAMASI VE VERİ SAĞLAMA');
    addParagraph('7.1 Müşteri, sözleşme imzalandıktan sonra en geç 3 (üç) iş günü içinde danışmanlık sürecinde Danışman ile iletişim kuracak ve gerekli bilgi/veri akışını sağlayacak bir "Sorumlu Kişi" (İrtibat Kişisi) belirlemelidir.');
    addParagraph('7.2 Sorumlu Kişi\'nin görevleri:\n- Danışman tarafından talep edilen veri, belge ve bilgileri zamanında temin etmek\n- İşletme içi koordinasyonu sağlamak\n- Haftalık toplantılara katılmak veya temsilci göndermek\n- Danışman\'ın erişim ihtiyaçlarını (sistem, personel, alan) karşılamak');
    addParagraph('7.3 Müşteri tarafından talep edilen bilgi ve verilerin sözleşmede belirtilen sürelerde sağlanmaması durumunda, bu gecikmeden kaynaklanan teslimat aksaklıklarından Danışman sorumlu tutulamaz. Geciken süre, teslimat takviminin sonuna eklenir.');
    addParagraph('7.4 Veri sağlama gecikmesi 15 (on beş) iş gününü aşarsa Danışman, sözleşmeyi askıya alma veya fesih hakkına sahiptir. Bu durumda yapılmış ödemeler iade edilmez.');

    // ---- MADDE 8: DANIŞMANLIK NİTELİĞİ VE SORUMLULUK SINIRI ----
    sectionTitle('MADDE 8 - DANIŞMANLIK NİTELİĞİ VE SORUMLULUK SINIRI');
    addParagraph('8.1 Danışman yalnızca danışmanlık, analiz, raporlama ve öneri hizmeti vermektedir. Önerilerin uygulanması, personel yönetimi ve işletme operasyonlarının yürütülmesi tamamen Müşteri\'nin sorumluluğundadır.');
    addParagraph('8.2 Danışman\'ın sunduğu önerilerin Müşteri tarafından uygulanıp uygulanmaması Müşteri\'nin takdirindedir. Uygulama sonuçlarından Danışman sorumlu tutulamaz.');
    addParagraph('8.3 Danışman\'ın sorumluluğu, her halükarda alınan toplam danışmanlık ücreti ile sınırlıdır.');

    // ---- MADDE 7: FESİH ----
    sectionTitle('MADDE 9 - FESİH KOŞULLARI');
    addParagraph('9.1 Taraflardan her biri, 15 (on beş) gün önceden yazılı bildirimde bulunarak sözleşmeyi feshedebilir.');
    addParagraph('9.2 Müşteri tarafından erken fesih halinde, fesih tarihine kadar verilen hizmetlerin bedeli ve yapılan masraflar Müşteri tarafından ödenir. Peşin ödenen tutar iade edilmez.');
    addParagraph('9.3 Danışman tarafından erken fesih halinde, tamamlanmamış hizmetlere ait peşin alınan ücret iade edilir.');

    // ---- MADDE 10: GİZLİLİK ----
    sectionTitle('MADDE 10 - GİZLİLİK');
    addParagraph('Taraflar, bu sözleşme kapsamında edindikleri tüm ticari, mali ve operasyonel bilgileri gizli tutmayı, üçüncü şahıslarla paylaşmamayı ve yalnızca sözleşme amacı doğrultusunda kullanmayı taahhüt eder. Bu yükümlülük sözleşmenin sona ermesinden sonra da 2 (iki) yıl süreyle yürürlükte kalır.');

    // ---- MADDE 11: MÜCBİR SEBEP ----
    sectionTitle('MADDE 11 - MÜCBİR SEBEP');
    addParagraph('Doğal afet, salgın hastalık, savaş, hükümet kararları, internet/altyapı kesintileri gibi tarafların kontrolü dışındaki olaylar nedeniyle yükümlülüklerin yerine getirilememesi halinde, etkilenen taraf sorumluluktan muaf tutulur. Mücbir sebep 30 günü aşarsa taraflar sözleşmeyi feshedebilir.');

    // ---- MADDE 12: FİKRİ MÜLKİYET ----
    sectionTitle('MADDE 12 - FİKRİ MÜLKİYET');
    addParagraph('12.1 Danışman tarafından bu sözleşme kapsamında üretilen raporlar, analizler, şablonlar ve dokümanlar, ücretin tam olarak ödenmesi koşuluyla Müşteri\'nin kullanımına sunulur.');
    addParagraph('12.2 Danışman\'ın genel bilgi birikimi, metodolojisi ve araçları üzerindeki fikri mülkiyet hakları saklıdır.');

    // ---- MADDE 13: İLETİŞİM PROTOKOLÜ ----
    sectionTitle('MADDE 13 - İLETİŞİM PROTOKOLÜ');
    addParagraph('13.1 Taraflar arasındaki iletişim; e-posta, telefon ve mesajlaşma uygulamaları üzerinden yürütülür.');
    addParagraph('13.2 Resmi bildirimler (fesih, değişiklik vb.) yazılı olarak (e-posta dahil) yapılır.');
    addParagraph('13.3 Danışman, haftalık ilerleme raporu sunar. Müşteri, talep edilen bilgilere en geç 3 iş günü içinde yanıt verir.');

    // ---- MADDE 14: UYUŞMAZLIK ----
    sectionTitle('MADDE 14 - UYUŞMAZLIK ÇÖZÜMÜ');
    addParagraph('Bu sözleşmeden doğan uyuşmazlıklarda önce dostane çözüm yolu aranacaktır. Çözüme ulaşılamaması halinde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.');

    // ---- MADDE 15: GENEL HÜKÜMLER ----
    sectionTitle('MADDE 15 - GENEL HÜKÜMLER');
    addParagraph('15.1 Bu sözleşme, tarafların serbest iradeleri ile tanzim edilmiş olup, imza tarihinden itibaren yürürlüğe girer.');
    addParagraph('15.2 Sözleşmede yapılacak değişiklikler, tarafların yazılı mutabakatı ile geçerlilik kazanır.');
    addParagraph('15.3 Bu sözleşme 2 (iki) nüsha olarak hazırlanmış ve her iki tarafça imzalanmıştır.');

    // ---- İMZA ALANI ----
    checkPage(50);
    y += 8;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentW / 2 - 5, 40, 2, 2, 'F');
    doc.roundedRect(margin + contentW / 2 + 5, y, contentW / 2 - 5, 40, 2, 2, 'F');

    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont(fontName, 'bold');
    doc.text(t('DANIŞMAN'), margin + 4, y + 7);
    doc.text(t('MÜŞTERİ'), margin + contentW / 2 + 9, y + 7);

    doc.setFont(fontName, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textGray);
    doc.text(t(data.danisman_adi), margin + 4, y + 14);
    doc.text(t('İmza: _________________'), margin + 4, y + 26);
    doc.text('Tarih: _________________', margin + 4, y + 32);
    doc.text(t('Kaşe / Mühür'), margin + 4, y + 38);

    doc.text(t(data.musteri_adi || '(Ad Soyad)'), margin + contentW / 2 + 9, y + 14);
    doc.text(t('İmza: _________________'), margin + contentW / 2 + 9, y + 26);
    doc.text('Tarih: _________________', margin + contentW / 2 + 9, y + 32);
    doc.text(t('Kaşe / Mühür'), margin + contentW / 2 + 9, y + 38);

    // ---- FOOTER (all pages) ----
    const totalPages = doc.internal.pages.length - 1;
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.5);
        doc.line(margin, pageH - 15, pageW - margin, pageH - 15);
        doc.setTextColor(...textGray);
        doc.setFontSize(7);
        doc.setFont(fontName, 'normal');
        doc.text(t('ArslanOps Danışmanlık | info@arslanops.com | +90 539 233 11 474'), margin, pageH - 10);
        doc.text(`Sayfa ${p} / ${totalPages}`, pageW - margin, pageH - 10, { align: 'right' });
        doc.setFontSize(6);
        doc.setTextColor(180, 180, 180);
        doc.text(t('Bu sözleşme gizli olup yalnızca tarafların kullanımına mahsustur.'), pageW / 2, pageH - 6, { align: 'center' });
    }

    const fileName = t(`Hizmet_Sözleşmesi_${data.musteri_isletme.replace(/\s+/g, '_') || 'Müşteri'}_${data.sozlesme_no}.pdf`);
    doc.save(fileName);
}

/* ------------------------------------------------------------------ */
/*  Gizlilik Sözleşmesi (NDA) PDF                                     */
/* ------------------------------------------------------------------ */
async function generateGizlilikSozlesmesi(data: SozlesmeData) {
    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF('p', 'mm', 'a4');
    const hasTR = await loadTurkishFont(doc);
    const t = (s: string) => tr(s, hasTR);
    const fontName = hasTR ? 'Roboto' : 'Helvetica';
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentW = pageW - margin * 2;
    let y = 15;

    const navy: [number, number, number] = [11, 31, 59];
    const gold: [number, number, number] = [196, 128, 61];
    const textDark: [number, number, number] = [30, 30, 30];
    const textGray: [number, number, number] = [120, 120, 120];

    const checkPage = (needed: number) => {
        if (y + needed > pageH - 25) { doc.addPage(); y = 20; }
    };

    const sectionTitle = (title: string) => {
        checkPage(20);
        doc.setFillColor(...gold);
        doc.rect(margin, y, 3, 8, 'F');
        doc.setTextColor(...navy);
        doc.setFontSize(11);
        doc.setFont(fontName, 'bold');
        doc.text(t(title), margin + 7, y + 6);
        y += 14;
    };

    const addParagraph = (text: string, fontSize = 9) => {
        doc.setFont(fontName, 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(...textDark);
        const lines = doc.splitTextToSize(t(text), contentW - 10);
        checkPage(lines.length * 4.5 + 5);
        doc.text(lines, margin + 5, y);
        y += lines.length * 4.5 + 5;
    };

    // ---- HEADER ----
    doc.setFillColor(40, 40, 60);
    doc.rect(0, 0, pageW, 42, 'F');
    doc.setFillColor(...gold);
    doc.rect(0, 42, pageW, 2.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(fontName, 'bold');
    doc.text(t('GİZLİLİK SÖZLEŞMESİ (NDA)'), pageW / 2, 16, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont(fontName, 'normal');
    doc.text(t('Karşılıklı Gizlilik Taahhütnamesi'), pageW / 2, 25, { align: 'center' });
    doc.setFontSize(8);
    doc.text(t(`Tarih: ${data.sozlesme_tarihi}`), pageW / 2, 31, { align: 'center' });
    doc.text('ArslanOps', pageW / 2, 37, { align: 'center' });

    y = 52;

    sectionTitle('MADDE 1 - TARAFLAR');

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentW / 2 - 3, 35, 2, 2, 'F');
    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont(fontName, 'bold');
    doc.text(t('TARAF A (Danışman)'), margin + 4, y + 7);
    doc.setFont(fontName, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    doc.text(t(data.danisman_adi), margin + 4, y + 14);
    doc.text(t(data.danisman_unvan), margin + 4, y + 19);
    doc.text(data.danisman_email, margin + 4, y + 24);
    doc.text(data.danisman_telefon, margin + 4, y + 29);

    const rightX = margin + contentW / 2 + 3;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(rightX, y, contentW / 2 - 3, 35, 2, 2, 'F');
    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont(fontName, 'bold');
    doc.text(t('TARAF B (Müşteri)'), rightX + 4, y + 7);
    doc.setFont(fontName, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    doc.text(t(data.musteri_adi || '(Ad Soyad)'), rightX + 4, y + 14);
    doc.text(t(data.musteri_isletme || '(İşletme Adı)'), rightX + 4, y + 19);
    doc.text(data.musteri_email || '(E-posta)', rightX + 4, y + 24);
    doc.text(data.musteri_telefon || '(Telefon)', rightX + 4, y + 29);

    y += 42;

    sectionTitle('MADDE 2 - AMAÇ');
    addParagraph('Bu sözleşme, tarafların danışmanlık hizmeti kapsamında birbirlerine açıklayacakları gizli bilgilerin korunmasını sağlamak amacıyla düzenlenmiştir. Her iki taraf da karşılıklı olarak gizlilik yükümlülüğü altındadır.');

    sectionTitle('MADDE 3 - GİZLİ BİLGİ TANIMI');
    addParagraph('Gizli bilgi, taraflardan birinin diğerine yazılı, sözlü, elektronik veya herhangi bir yolla iletilen aşağıdaki nitelikteki tüm bilgileri kapsar:');
    addParagraph('a) Ticari sırlar, iş planları, stratejiler, mali veriler\nb) Müşteri listeleri, tedarikçi bilgileri, fiyatlandırma politikaları\nc) Operasyonel süreçler, reçeteler, formüller, üretim yöntemleri\nd) Çalışan bilgileri, maaş verileri, organizasyon yapısı\ne) IT altyapısı, yazılım bilgileri, kullanıcı verileri\nf) Danışmanlık raporları, analiz sonuçları, öneriler ve aksiyon planları\ng) Sözleşme detayları ve ticari ilişkiyle ilgili her türlü bilgi');

    sectionTitle('MADDE 4 - GİZLİLİK YÜKÜMLÜLÜKLERİ');
    addParagraph('4.1 Taraflar, gizli bilgileri yalnızca sözleşme amacı doğrultusunda kullanacaktır.');
    addParagraph('4.2 Gizli bilgiler, karşı tarafın yazılı izni olmaksızın üçüncü şahıslarla paylaşılmayacaktır.');
    addParagraph('4.3 Taraflar, gizli bilgileri en az kendi gizli bilgilerini koruduğu ölçüde koruyacaktır.');
    addParagraph('4.4 Gizli bilgilere erişim, yalnızca "bilmesi gereken" kişilere sınırlı tutulacaktır.');
    addParagraph('4.5 Gizli bilgilerin kopyalanması, çoğaltılması veya kaydedilmesi yalnızca iş gereği gerekli olduğunca yapılabilir.');

    sectionTitle('MADDE 5 - İSTİSNALAR');
    addParagraph('Aşağıdaki durumlar gizlilik kapsamında değildir:\na) Kamuya açık olan veya tarafın kusuru olmaksızın kamuya açık hale gelen bilgiler\nb) Alıcı tarafın gizlilik yükümlülüğü olmaksızın üçüncü bir şahıstan yasal yollarla edindiği bilgiler\nc) Alıcı tarafın bağımsız olarak geliştirdiği bilgiler\nd) Yasal zorunluluk nedeniyle ifşa edilmesi gereken bilgiler (bu durumda diğer taraf derhal bilgilendirilecektir)');

    sectionTitle('MADDE 6 - SÜRE');
    addParagraph(`Bu gizlilik sözleşmesi, imza tarihinden itibaren geçerli olup, danışmanlık sözleşmesinin sona ermesinden sonra ${data.gizlilik_suresi} süre ile yürürlükte kalmaya devam eder.`);

    sectionTitle('MADDE 7 - İHLAL VE CEZAİ ŞART');
    addParagraph(`7.1 Gizlilik yükümlülüğünü ihlal eden taraf, diğer tarafa ${data.cezai_sart ? Number(data.cezai_sart).toLocaleString('tr-TR') + ' TL' : '(Belirlenmedi)'} tutarında cezai şart ödemeyi kabul ve taahhüt eder.`);
    addParagraph('7.2 Cezai şartın ödenmesi, zarar gören tarafın genel hükümlere göre tazminat talep etme hakkını ortadan kaldırmaz.');
    addParagraph('7.3 İhlal halinde zarar gören taraf, ihtiyati tedbir ve diğer yasal yollara başvurma hakkını saklı tutar.');

    sectionTitle('MADDE 8 - İADE YÜKÜMLÜLÜĞÜ');
    addParagraph('Sözleşmenin sona ermesi veya feshi halinde, taraflar birbirlerine ait tüm gizli bilgileri, kopyaları ve türevlerini iade edecek veya imha edecek ve bunu yazılı olarak teyit edecektir.');

    sectionTitle('MADDE 9 - UYGULANACAK HUKUK VE YETKİ');
    addParagraph('Bu sözleşme Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.');

    // ---- İMZA ALANI ----
    checkPage(55);
    y += 8;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentW / 2 - 5, 40, 2, 2, 'F');
    doc.roundedRect(margin + contentW / 2 + 5, y, contentW / 2 - 5, 40, 2, 2, 'F');

    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont(fontName, 'bold');
    doc.text(t('TARAF A (Danışman)'), margin + 4, y + 7);
    doc.text(t('TARAF B (Müşteri)'), margin + contentW / 2 + 9, y + 7);

    doc.setFont(fontName, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textGray);
    doc.text(t(data.danisman_adi), margin + 4, y + 14);
    doc.text(t('İmza: _________________'), margin + 4, y + 26);
    doc.text('Tarih: _________________', margin + 4, y + 32);
    doc.text(t('Kaşe / Mühür'), margin + 4, y + 38);

    doc.text(t(data.musteri_adi || '(Ad Soyad)'), margin + contentW / 2 + 9, y + 14);
    doc.text(t('İmza: _________________'), margin + contentW / 2 + 9, y + 26);
    doc.text('Tarih: _________________', margin + contentW / 2 + 9, y + 32);
    doc.text(t('Kaşe / Mühür'), margin + contentW / 2 + 9, y + 38);

    // ---- FOOTER ----
    const totalPages = doc.internal.pages.length - 1;
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.5);
        doc.line(margin, pageH - 15, pageW - margin, pageH - 15);
        doc.setTextColor(...textGray);
        doc.setFontSize(7);
        doc.setFont(fontName, 'normal');
        doc.text(t('ArslanOps Danışmanlık | info@arslanops.com | +90 539 233 11 474'), margin, pageH - 10);
        doc.text(`Sayfa ${p} / ${totalPages}`, pageW - margin, pageH - 10, { align: 'right' });
        doc.setFontSize(6);
        doc.setTextColor(180, 180, 180);
        doc.text(t('GİZLİ - Bu belge yalnızca imza sahibi tarafların kullanımına mahsustur.'), pageW / 2, pageH - 6, { align: 'center' });
    }

    const fileName = t(`Gizlilik_Sözleşmesi_NDA_${data.musteri_isletme.replace(/\s+/g, '_') || 'Müşteri'}_${data.sozlesme_tarihi}.pdf`);
    doc.save(fileName);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function SozlesmeSablonu() {
    const [data, setData] = useState<SozlesmeData>(INITIAL);
    const [generating, setGenerating] = useState(false);
    const [tip, setTip] = useState<SozlesmeTipi>('hizmet');

    const update = (field: keyof SozlesmeData, value: string) => setData(prev => ({ ...prev, [field]: value }));

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            if (tip === 'hizmet') await generateHizmetSozlesmesi(data);
            else await generateGizlilikSozlesmesi(data);
        } catch (e) { console.error(e); }
        setGenerating(false);
    };

    const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none';
    const labelCls = 'text-xs font-medium text-gray-600 mb-1 block';

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-xl font-bold text-[#0B1F3B] flex items-center gap-2">
                    <Scale className="w-5 h-5 text-[#C4803D]" />
                    Sözleşme Şablonları
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Hizmet sözleşmesi ve gizlilik sözleşmesi (NDA) oluşturun — profesyonel PDF çıktısı
                </p>
            </div>

            {/* Sözleşme Tipi Seçimi */}
            <div className="flex gap-3">
                <button
                    onClick={() => setTip('hizmet')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${tip === 'hizmet'
                        ? 'border-[#C4803D] bg-[#C4803D]/10 text-[#C4803D]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                >
                    <FileText className="w-4 h-4" /> Hizmet Sözleşmesi
                </button>
                <button
                    onClick={() => setTip('gizlilik')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${tip === 'gizlilik'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                >
                    <Lock className="w-4 h-4" /> Gizlilik Sözleşmesi (NDA)
                </button>
            </div>

            {/* Danışman Bilgileri */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#C4803D]" /> Danışman Bilgileri
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Ad Soyad</label><input value={data.danisman_adi} onChange={e => update('danisman_adi', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Ünvan</label><input value={data.danisman_unvan} onChange={e => update('danisman_unvan', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Telefon</label><input value={data.danisman_telefon} onChange={e => update('danisman_telefon', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>E-posta</label><input value={data.danisman_email} onChange={e => update('danisman_email', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Vergi Dairesi</label><input value={data.danisman_vergi_dairesi} onChange={e => update('danisman_vergi_dairesi', e.target.value)} className={inputCls} placeholder="Opsiyonel" /></div>
                    <div><label className={labelCls}>Vergi No</label><input value={data.danisman_vergi_no} onChange={e => update('danisman_vergi_no', e.target.value)} className={inputCls} placeholder="Opsiyonel" /></div>
                </div>
                <div><label className={labelCls}>Adres</label><input value={data.danisman_adres} onChange={e => update('danisman_adres', e.target.value)} className={inputCls} placeholder="İşyeri adresi (opsiyonel)" /></div>
            </div>

            {/* Müşteri Bilgileri */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#C4803D]" /> Müşteri Bilgileri
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Ad Soyad</label><input value={data.musteri_adi} onChange={e => update('musteri_adi', e.target.value)} className={inputCls} placeholder="Ahmet Yılmaz" /></div>
                    <div><label className={labelCls}>İşletme Adı</label><input value={data.musteri_isletme} onChange={e => update('musteri_isletme', e.target.value)} className={inputCls} placeholder="Kahve Durağı" /></div>
                    <div><label className={labelCls}>Telefon</label><input value={data.musteri_telefon} onChange={e => update('musteri_telefon', e.target.value)} className={inputCls} placeholder="+90 5xx xxx xx xx" /></div>
                    <div><label className={labelCls}>E-posta</label><input value={data.musteri_email} onChange={e => update('musteri_email', e.target.value)} className={inputCls} placeholder="musteri@example.com" /></div>
                    <div><label className={labelCls}>Vergi Dairesi</label><input value={data.musteri_vergi_dairesi} onChange={e => update('musteri_vergi_dairesi', e.target.value)} className={inputCls} placeholder="Opsiyonel" /></div>
                    <div><label className={labelCls}>Vergi No</label><input value={data.musteri_vergi_no} onChange={e => update('musteri_vergi_no', e.target.value)} className={inputCls} placeholder="Opsiyonel" /></div>
                </div>
                <div><label className={labelCls}>Adres</label><input value={data.musteri_adres} onChange={e => update('musteri_adres', e.target.value)} className={inputCls} placeholder="İşletme adresi" /></div>
            </div>

            {/* Sözleşme Bilgileri */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C4803D]" /> Sözleşme Bilgileri
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className={labelCls}>Sözleşme No</label><input value={data.sozlesme_no} onChange={e => update('sozlesme_no', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Sözleşme Tarihi</label><input type="date" value={data.sozlesme_tarihi} onChange={e => update('sozlesme_tarihi', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Süre</label><input value={data.sure} onChange={e => update('sure', e.target.value)} className={inputCls} /></div>
                </div>
                {tip === 'hizmet' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className={labelCls}>Başlangıç Tarihi</label><input type="date" value={data.baslangic_tarihi} onChange={e => update('baslangic_tarihi', e.target.value)} className={inputCls} /></div>
                        <div><label className={labelCls}>Bitiş Tarihi</label><input type="date" value={data.bitis_tarihi} onChange={e => update('bitis_tarihi', e.target.value)} className={inputCls} /></div>
                    </div>
                )}
            </div>

            {/* Hizmet Sözleşmesine Özel */}
            {tip === 'hizmet' && (
                <>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#C4803D]" /> Hizmet Kapsamı
                        </h3>
                        <textarea
                            value={data.hizmet_kapsami}
                            onChange={e => update('hizmet_kapsami', e.target.value)}
                            rows={10}
                            className={`${inputCls} resize-none font-mono text-xs`}
                        />
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                            <Scale className="w-4 h-4 text-[#C4803D]" /> Ücret & Ödeme Koşulları
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div><label className={labelCls}>Toplam Ücret (₺)</label><input type="number" value={data.toplam_ucret} onChange={e => update('toplam_ucret', e.target.value)} className={inputCls} placeholder="50000" /></div>
                            <div><label className={labelCls}>Peşin Oran (%)</label><input type="number" value={data.pesin_oran} onChange={e => update('pesin_oran', e.target.value)} className={inputCls} /></div>
                            <div><label className={labelCls}>Kalan Oran (%)</label><input type="number" value={data.kalan_oran} onChange={e => update('kalan_oran', e.target.value)} className={inputCls} /></div>
                        </div>
                        {data.toplam_ucret && (
                            <div className="bg-amber-50 rounded-xl p-4 text-sm">
                                <div className="flex justify-between text-amber-800">
                                    <span>Peşin ({data.pesin_oran}%):</span>
                                    <span className="font-bold">{Math.round(Number(data.toplam_ucret) * Number(data.pesin_oran) / 100).toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="flex justify-between text-amber-800 mt-1">
                                    <span>İş bitiminde ({data.kalan_oran}%):</span>
                                    <span className="font-bold">{Math.round(Number(data.toplam_ucret) * Number(data.kalan_oran) / 100).toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="flex justify-between text-amber-900 mt-2 pt-2 border-t border-amber-200">
                                    <span className="font-bold">Toplam:</span>
                                    <span className="font-bold">{Number(data.toplam_ucret).toLocaleString('tr-TR')} ₺ + KDV</span>
                                </div>
                            </div>
                        )}
                        <div><label className={labelCls}>Ödeme Notu</label><textarea value={data.odeme_notu} onChange={e => update('odeme_notu', e.target.value)} rows={2} className={`${inputCls} resize-none`} /></div>
                    </div>
                </>
            )}

            {/* NDA'ya Özel */}
            {tip === 'gizlilik' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                        <Lock className="w-4 h-4 text-purple-500" /> Gizlilik Koşulları
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className={labelCls}>Gizlilik Süresi (sözleşme bitiminden sonra)</label><input value={data.gizlilik_suresi} onChange={e => update('gizlilik_suresi', e.target.value)} className={inputCls} /></div>
                        <div><label className={labelCls}>Cezai Şart (₺)</label><input type="number" value={data.cezai_sart} onChange={e => update('cezai_sart', e.target.value)} className={inputCls} /></div>
                    </div>
                </div>
            )}

            {/* PDF İndir */}
            <button
                onClick={handleGenerate}
                disabled={generating}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 ${tip === 'hizmet'
                    ? 'bg-gradient-to-r from-[#0B1F3B] to-[#1a365d]'
                    : 'bg-gradient-to-r from-purple-700 to-purple-900'
                    }`}
            >
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {generating
                    ? 'PDF oluşturuluyor...'
                    : tip === 'hizmet'
                        ? 'Hizmet Sözleşmesi (PDF) İndir'
                        : 'Gizlilik Sözleşmesi NDA (PDF) İndir'
                }
            </button>
        </div>
    );
}
