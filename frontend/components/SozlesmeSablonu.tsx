'use client';

import { useState } from 'react';
import { FileText, Download, Building2, Phone, Shield, Calendar, Loader2, Scale, Lock } from 'lucide-react';

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
    cezai_sart: '50.000',
};

/* ------------------------------------------------------------------ */
/*  Transliteration                                                    */
/* ------------------------------------------------------------------ */
function tr(text: string): string {
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
        doc.setFont('Helvetica', 'bold');
        doc.text(tr(title), margin + 7, y + 6);
        y += 14;
    };

    const addParagraph = (text: string, fontSize = 9) => {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(...textDark);
        const lines = doc.splitTextToSize(tr(text), contentW - 10);
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
    doc.setFont('Helvetica', 'bold');
    doc.text(tr('DANISMANLIK HIZMET SOZLESMESI'), pageW / 2, 16, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(tr(`Sozlesme No: ${data.sozlesme_no}`), pageW / 2, 25, { align: 'center' });
    doc.setFontSize(8);
    doc.text(tr(`Tarih: ${data.sozlesme_tarihi}`), pageW / 2, 31, { align: 'center' });
    doc.text('ArslanOps', pageW / 2, 37, { align: 'center' });

    y = 52;

    // ---- MADDE 1: TARAFLAR ----
    sectionTitle('MADDE 1 - TARAFLAR');

    // Danışman kutusu
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentW / 2 - 3, 44, 2, 2, 'F');
    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.text('DANISMAN (Hizmet Veren)', margin + 4, y + 7);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    doc.text(tr(data.danisman_adi), margin + 4, y + 14);
    doc.text(tr(data.danisman_unvan), margin + 4, y + 19);
    doc.text(data.danisman_telefon, margin + 4, y + 24);
    doc.text(data.danisman_email, margin + 4, y + 29);
    if (data.danisman_vergi_dairesi) doc.text(tr(`VD: ${data.danisman_vergi_dairesi} - ${data.danisman_vergi_no}`), margin + 4, y + 34);
    if (data.danisman_adres) doc.text(tr(data.danisman_adres).substring(0, 50), margin + 4, y + 39);

    // Müşteri kutusu
    const rightX = margin + contentW / 2 + 3;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(rightX, y, contentW / 2 - 3, 44, 2, 2, 'F');
    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.text(tr('MUSTERI (Hizmet Alan)'), rightX + 4, y + 7);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    doc.text(tr(data.musteri_adi || '(Ad Soyad)'), rightX + 4, y + 14);
    doc.text(tr(data.musteri_isletme || '(Isletme Adi)'), rightX + 4, y + 19);
    doc.text(data.musteri_telefon || '(Telefon)', rightX + 4, y + 24);
    doc.text(data.musteri_email || '(E-posta)', rightX + 4, y + 29);
    if (data.musteri_vergi_dairesi) doc.text(tr(`VD: ${data.musteri_vergi_dairesi} - ${data.musteri_vergi_no}`), rightX + 4, y + 34);
    if (data.musteri_adres) doc.text(tr(data.musteri_adres).substring(0, 50), rightX + 4, y + 39);

    y += 52;

    // ---- MADDE 2: KONU ----
    sectionTitle('MADDE 2 - SOZLESMENIN KONUSU');
    addParagraph('Bu sozlesme, Danisman\'in Musteri\'ye asagida belirtilen danismanlik hizmetlerini vermesine iliskin taraflarin hak ve yukumluluklerini duzenlemektedir.');

    // ---- MADDE 3: HİZMET KAPSAMI ----
    sectionTitle('MADDE 3 - HIZMET KAPSAMI');
    addParagraph(data.hizmet_kapsami);

    // ---- MADDE 4: SÜRE ----
    sectionTitle('MADDE 4 - SOZLESME SURESI');
    const sureRows = [
        [tr('Baslangic Tarihi'), tr(data.baslangic_tarihi || '(Belirlenmedi)')],
        [tr('Bitis Tarihi'), tr(data.bitis_tarihi || '(Belirlenmedi)')],
        [tr('Toplam Sure'), tr(data.sure || '(Belirlenmedi)')],
    ];
    checkPage(30);
    autoTable(doc, {
        startY: y,
        body: sureRows,
        theme: 'plain',
        bodyStyles: { fontSize: 9, font: 'Helvetica', textColor: textDark },
        columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold', textColor: navy }, 1: { cellWidth: contentW - 45 } },
        styles: { cellPadding: 3 },
        margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 5;
    addParagraph('Sozlesme suresi, taraflarin karsilikli yazili mutabakati ile uzatilabilir. Erken fesih durumunda Madde 7 hukumleri gecerlidir.');

    // ---- MADDE 5: ÜCRET VE ÖDEME ----
    sectionTitle('MADDE 5 - UCRET VE ODEME KOSULLARI');

    const ucret = data.toplam_ucret ? `${Number(data.toplam_ucret).toLocaleString('tr-TR')} TL` : '(Belirlenmedi)';
    const pesinTutar = data.toplam_ucret ? `${Math.round(Number(data.toplam_ucret) * Number(data.pesin_oran) / 100).toLocaleString('tr-TR')} TL` : '-';
    const kalanTutar = data.toplam_ucret ? `${Math.round(Number(data.toplam_ucret) * Number(data.kalan_oran) / 100).toLocaleString('tr-TR')} TL` : '-';

    const odemeRows = [
        [tr('Toplam Danismanlik Ucreti'), ucret],
        [tr(`Pesin Odeme (%${data.pesin_oran})`), tr(`${pesinTutar} - Sozlesme imzalandiginda`)],
        [tr(`Kalan Odeme (%${data.kalan_oran})`), tr(`${kalanTutar} - Hizmet tamamlandiginda`)],
    ];
    checkPage(30);
    autoTable(doc, {
        startY: y,
        body: odemeRows,
        theme: 'striped',
        bodyStyles: { fontSize: 9, font: 'Helvetica', textColor: textDark },
        columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold', textColor: navy }, 1: { cellWidth: contentW - 55 } },
        styles: { cellPadding: 3.5 },
        margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 5;
    if (data.odeme_notu) addParagraph(data.odeme_notu);
    addParagraph('Odemeler banka havalesi veya EFT yoluyla yapilir. Fatura, odeme tarihinden itibaren 7 is gunu icinde kesilir. KDV (% 20) ucrete dahil degildir ve ayrica faturalandirilir.');

    // ---- MADDE 6: TARAFLARIN YÜKÜMLÜLÜKLERİ ----
    sectionTitle('MADDE 6 - TARAFLARIN YUKUMLULUKLERI');
    addParagraph('6.1 Danisman\'in Yukumlulukleri:\n- Hizmeti profesyonel standartlarda, ozenle ve zamanlica sunmak\n- Musteri\'nin ticari sirlarini ve gizli bilgilerini korumak\n- Ilerleme raporlarini zamaninda teslim etmek\n- Sozlesme kapsamindaki tum calismalari bizzat veya onay alinmis ekibi ile yurutmek');
    addParagraph('6.2 Musteri\'nin Yukumlulukleri:\n- Hizmetin yurutulmesi icin gerekli bilgi, belge ve erisimi saglamak\n- Odeme yukukumluluklerin zamaninda yerine getirmek\n- Danisman\'in onerilerini makul surede degerlendirmek\n- Danisman\'a gerekli calisma ortamini ve isbirligi imkanini sunmak');

    // ---- MADDE 7: FESİH ----
    sectionTitle('MADDE 7 - FESIH KOSULLARI');
    addParagraph('7.1 Taraflardan her biri, 15 (on bes) gun onceden yazili bildirimde bulunarak sozlesmeyi feshedebilir.');
    addParagraph('7.2 Musteri tarafindan erken fesih halinde, fesih tarihine kadar verilen hizmetlerin bedeli ve yapilan masraflar Musteri tarafindan odenir. Pesin odenen tutar iade edilmez.');
    addParagraph('7.3 Danisman tarafindan erken fesih halinde, tamamlanmamis hizmetlere ait pesin alinan ucret iade edilir.');

    // ---- MADDE 8: GİZLİLİK ----
    sectionTitle('MADDE 8 - GIZLILIK');
    addParagraph('Taraflar, bu sozlesme kapsaminda edindikleri tum ticari, mali ve operasyonel bilgileri gizli tutmayi, ucuncu sahislarla paylasmamayi ve yalnizca sozlesme amaci dogrultusunda kullanmayi taahhut eder. Bu yukumluluk sozlesmenin sona ermesinden sonra da 2 (iki) yil sureyle gecerlidir.');

    // ---- MADDE 9: UYUŞMAZLIK ----
    sectionTitle('MADDE 9 - UYUSMAZLIK COZUMU');
    addParagraph('Bu sozlesmeden dogan uyusmazliklarda once dostane cozum yolu aranacaktir. Cozume ulasilamamasi halinde Istanbul Mahkemeleri ve Icra Daireleri yetkilidir.');

    // ---- MADDE 10: GENEL HÜKÜMLER ----
    sectionTitle('MADDE 10 - GENEL HUKUMLER');
    addParagraph('10.1 Bu sozlesme, taraflarin serbest iradeleri ile tanzim edilmis olup, imza tarihinden itibaren yururluge girer.');
    addParagraph('10.2 Sozlesmede yapilacak degisiklikler, taraflarin yazili mutabakati ile gecerlilik kazanir.');
    addParagraph('10.3 Bu sozlesme 2 (iki) nusha olarak hazirlanmis ve her iki tarafca imzalanmistir.');

    // ---- İMZA ALANI ----
    checkPage(50);
    y += 8;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentW / 2 - 5, 40, 2, 2, 'F');
    doc.roundedRect(margin + contentW / 2 + 5, y, contentW / 2 - 5, 40, 2, 2, 'F');

    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.text('DANISMAN', margin + 4, y + 7);
    doc.text(tr('MUSTERI'), margin + contentW / 2 + 9, y + 7);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textGray);
    doc.text(tr(data.danisman_adi), margin + 4, y + 14);
    doc.text('Imza: _________________', margin + 4, y + 26);
    doc.text('Tarih: _________________', margin + 4, y + 32);
    doc.text(tr('Kase / Muhur'), margin + 4, y + 38);

    doc.text(tr(data.musteri_adi || '(Ad Soyad)'), margin + contentW / 2 + 9, y + 14);
    doc.text('Imza: _________________', margin + contentW / 2 + 9, y + 26);
    doc.text('Tarih: _________________', margin + contentW / 2 + 9, y + 32);
    doc.text(tr('Kase / Muhur'), margin + contentW / 2 + 9, y + 38);

    // ---- FOOTER (all pages) ----
    const totalPages = doc.internal.pages.length - 1;
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.5);
        doc.line(margin, pageH - 15, pageW - margin, pageH - 15);
        doc.setTextColor(...textGray);
        doc.setFontSize(7);
        doc.setFont('Helvetica', 'normal');
        doc.text(tr('ArslanOps Danismanlik | info@arslanops.com | +90 539 233 11 474'), margin, pageH - 10);
        doc.text(`Sayfa ${p} / ${totalPages}`, pageW - margin, pageH - 10, { align: 'right' });
        doc.setFontSize(6);
        doc.setTextColor(180, 180, 180);
        doc.text(tr('Bu sozlesme gizli olup yalnizca taraflarin kullanimina mahsustur.'), pageW / 2, pageH - 6, { align: 'center' });
    }

    const fileName = tr(`Hizmet_Sozlesmesi_${data.musteri_isletme.replace(/\s+/g, '_') || 'Musteri'}_${data.sozlesme_no}.pdf`);
    doc.save(fileName);
}

/* ------------------------------------------------------------------ */
/*  Gizlilik Sözleşmesi (NDA) PDF                                     */
/* ------------------------------------------------------------------ */
async function generateGizlilikSozlesmesi(data: SozlesmeData) {
    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF('p', 'mm', 'a4');
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
        doc.setFont('Helvetica', 'bold');
        doc.text(tr(title), margin + 7, y + 6);
        y += 14;
    };

    const addParagraph = (text: string, fontSize = 9) => {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(...textDark);
        const lines = doc.splitTextToSize(tr(text), contentW - 10);
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
    doc.setFont('Helvetica', 'bold');
    doc.text(tr('GIZLILIK SOZLESMESI (NDA)'), pageW / 2, 16, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(tr('Karsilikli Gizlilik Taahhutnamesi'), pageW / 2, 25, { align: 'center' });
    doc.setFontSize(8);
    doc.text(tr(`Tarih: ${data.sozlesme_tarihi}`), pageW / 2, 31, { align: 'center' });
    doc.text('ArslanOps', pageW / 2, 37, { align: 'center' });

    y = 52;

    // ---- MADDE 1: TARAFLAR ----
    sectionTitle('MADDE 1 - TARAFLAR');

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentW / 2 - 3, 35, 2, 2, 'F');
    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.text('TARAF A (Danisman)', margin + 4, y + 7);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    doc.text(tr(data.danisman_adi), margin + 4, y + 14);
    doc.text(tr(data.danisman_unvan), margin + 4, y + 19);
    doc.text(data.danisman_email, margin + 4, y + 24);
    doc.text(data.danisman_telefon, margin + 4, y + 29);

    const rightX = margin + contentW / 2 + 3;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(rightX, y, contentW / 2 - 3, 35, 2, 2, 'F');
    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.text(tr('TARAF B (Musteri)'), rightX + 4, y + 7);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    doc.text(tr(data.musteri_adi || '(Ad Soyad)'), rightX + 4, y + 14);
    doc.text(tr(data.musteri_isletme || '(Isletme Adi)'), rightX + 4, y + 19);
    doc.text(data.musteri_email || '(E-posta)', rightX + 4, y + 24);
    doc.text(data.musteri_telefon || '(Telefon)', rightX + 4, y + 29);

    y += 42;

    // ---- MADDE 2 ----
    sectionTitle('MADDE 2 - AMAC');
    addParagraph('Bu sozlesme, taraflarin danismanlik hizmeti kapsaminda birbirlerine aciklayacaklari gizli bilgilerin korunmasini saglamak amaciyla duzenlenmistir. Her iki taraf da karsilikli olarak gizlilik yukumlulugu altindadir.');

    // ---- MADDE 3 ----
    sectionTitle('MADDE 3 - GIZLI BILGI TANIMI');
    addParagraph('Gizli bilgi, taraflardan birinin digerine yazili, sozlu, elektronik veya herhangi bir yolla iletilen asagidaki nitelikteki tum bilgileri kapsar:');
    addParagraph('a) Ticari sirlar, is planlari, stratejiler, mali veriler\nb) Musteri listeleri, tedarikci bilgileri, fiyatlandirma politikalari\nc) Operasyonel surecler, receteler, formüller, uretim yontemleri\nd) Calisan bilgileri, maas verileri, organizasyon yapisi\ne) IT altyapisi, yazilim bilgileri, kullanici verileri\nf) Danismanlik raporlari, analiz sonuclari, oneriler ve aksiyon planlari\ng) Sozlesme detaylari ve ticari iliskiyle ilgili her turlu bilgi');

    // ---- MADDE 4 ----
    sectionTitle('MADDE 4 - GIZLILIK YUKUMLULUKLERI');
    addParagraph('4.1 Taraflar, gizli bilgileri yalnizca sozlesme amaci dogrultusunda kullanacaktir.');
    addParagraph('4.2 Gizli bilgiler, karsi tarafin yazili izni olmaksizin ucuncu sahislarla paylasilmayacaktir.');
    addParagraph('4.3 Taraflar, gizli bilgileri en az kendi gizli bilgilerini korudugu olcude koruyacaktir.');
    addParagraph('4.4 Gizli bilgilere erisim, yalnizca "bilmesi gereken" kisilere sinirli tutulacaktir.');
    addParagraph('4.5 Gizli bilgilerin kopyalanmasi, cogaltilmasi veya kaydedilmesi yalnizca is geregi gerekli oldugunce yapilabilir.');

    // ---- MADDE 5 ----
    sectionTitle('MADDE 5 - ISTISNALAR');
    addParagraph('Asagidaki durumlar gizlilik kapsaminda degildir:\na) Kamuya acik olan veya tarafin kusuru olmaksizin kamuya acik hale gelen bilgiler\nb) Alici tarafin gizlilik yukumlulugu olmaksizin ucuncu bir sahistan yasal yollarla edindigi bilgiler\nc) Alici tarafin bagimsiz olarak gelistirdigi bilgiler\nd) Yasal zorunluluk nedeniyle ifsa edilmesi gereken bilgiler (bu durumda diger taraf derhal bilgilendirilecektir)');

    // ---- MADDE 6 ----
    sectionTitle('MADDE 6 - SURE');
    addParagraph(`Bu gizlilik sozlesmesi, imza tarihinden itibaren gecerli olup, danismanlik sozlesmesinin sona ermesinden sonra ${data.gizlilik_suresi} sure ile yururlukte kalmaya devam eder.`);

    // ---- MADDE 7 ----
    sectionTitle('MADDE 7 - IHLAL VE CEZAI SART');
    addParagraph(`7.1 Gizlilik yukumlulugunu ihlal eden taraf, diger tarafa ${data.cezai_sart ? Number(data.cezai_sart).toLocaleString('tr-TR') + ' TL' : '(Belirlenmedi)'} tutarinda cezai sart odemeyi kabul ve taahhut eder.`);
    addParagraph('7.2 Cezai sartin odenmesi, zarar goren tarafin genel hukumlere gore tazminat talep etme hakkini ortadan kaldirmaz.');
    addParagraph('7.3 Ihlal halinde zarar goren taraf, ihtiyati tedbir ve diger yasal yollara basvurma hakkini sakli tutar.');

    // ---- MADDE 8 ----
    sectionTitle('MADDE 8 - IADE YUKUMLULUGU');
    addParagraph('Sozlesmenin sona ermesi veya feshi halinde, taraflar birbirlerine ait tum gizli bilgileri, kopyalari ve turevlerini iade edecek veya imha edecek ve bunu yazili olarak teyit edecektir.');

    // ---- MADDE 9 ----
    sectionTitle('MADDE 9 - UYGULANACAK HUKUK VE YETKI');
    addParagraph('Bu sozlesme Turkiye Cumhuriyeti hukukuna tabidir. Uyusmazliklarda Istanbul Mahkemeleri ve Icra Daireleri yetkilidir.');

    // ---- İMZA ALANI ----
    checkPage(55);
    y += 8;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentW / 2 - 5, 40, 2, 2, 'F');
    doc.roundedRect(margin + contentW / 2 + 5, y, contentW / 2 - 5, 40, 2, 2, 'F');

    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.text('TARAF A (Danisman)', margin + 4, y + 7);
    doc.text(tr('TARAF B (Musteri)'), margin + contentW / 2 + 9, y + 7);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textGray);
    doc.text(tr(data.danisman_adi), margin + 4, y + 14);
    doc.text('Imza: _________________', margin + 4, y + 26);
    doc.text('Tarih: _________________', margin + 4, y + 32);
    doc.text(tr('Kase / Muhur'), margin + 4, y + 38);

    doc.text(tr(data.musteri_adi || '(Ad Soyad)'), margin + contentW / 2 + 9, y + 14);
    doc.text('Imza: _________________', margin + contentW / 2 + 9, y + 26);
    doc.text('Tarih: _________________', margin + contentW / 2 + 9, y + 32);
    doc.text(tr('Kase / Muhur'), margin + contentW / 2 + 9, y + 38);

    // ---- FOOTER ----
    const totalPages = doc.internal.pages.length - 1;
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.5);
        doc.line(margin, pageH - 15, pageW - margin, pageH - 15);
        doc.setTextColor(...textGray);
        doc.setFontSize(7);
        doc.setFont('Helvetica', 'normal');
        doc.text(tr('ArslanOps Danismanlik | info@arslanops.com | +90 539 233 11 474'), margin, pageH - 10);
        doc.text(`Sayfa ${p} / ${totalPages}`, pageW - margin, pageH - 10, { align: 'right' });
        doc.setFontSize(6);
        doc.setTextColor(180, 180, 180);
        doc.text(tr('GIZLI - Bu belge yalnizca imza sahibi taraflarin kullanimina mahsustur.'), pageW / 2, pageH - 6, { align: 'center' });
    }

    const fileName = tr(`Gizlilik_Sozlesmesi_NDA_${data.musteri_isletme.replace(/\s+/g, '_') || 'Musteri'}_${data.sozlesme_tarihi}.pdf`);
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
