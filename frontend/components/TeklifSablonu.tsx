'use client';

import { useState } from 'react';
import { FileText, Download, Building2, Phone, Mail, Calendar, DollarSign, CheckCircle, Loader2 } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface HizmetSatir {
    hizmet: string;
    aciklama: string;
    fiyat: string;
}

interface TeklifData {
    // Danışman Bilgileri
    danisman_adi: string;
    danisman_unvan: string;
    danisman_telefon: string;
    danisman_email: string;
    // Müşteri Bilgileri
    musteri_adi: string;
    musteri_isletme: string;
    musteri_telefon: string;
    musteri_email: string;
    musteri_adres: string;
    // Teklif Detayları
    teklif_no: string;
    teklif_tarihi: string;
    gecerlilik_suresi: string;
    // Hizmetler
    hizmetler: HizmetSatir[];
    // Süre & Koşullar
    baslangic_tarihi: string;
    sure: string;
    odeme_kosullari: string;
    ozel_notlar: string;
}

const INITIAL: TeklifData = {
    danisman_adi: 'İlhan Arslan',
    danisman_unvan: 'Coffee & Restoran Operasyon Danışmanı',
    danisman_telefon: '+90 539 233 11 474',
    danisman_email: 'info@arslanops.com',
    musteri_adi: '',
    musteri_isletme: '',
    musteri_telefon: '',
    musteri_email: '',
    musteri_adres: '',
    teklif_no: `TEK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    teklif_tarihi: new Date().toISOString().split('T')[0],
    gecerlilik_suresi: '15 gün',
    hizmetler: [
        { hizmet: 'Operasyonel Analiz & Durum Tespiti', aciklama: 'Isletme ziyareti, gozlem, mevcut durum analizi, SWOT', fiyat: '' },
        { hizmet: 'KPI Dashboard Kurulumu', aciklama: 'Ciro, COGS, personel, musteri metrikleri takip sistemi', fiyat: '' },
        { hizmet: 'Menu Muhendisligi', aciklama: 'Recete maliyetleme, BCG analizi, fiyatlandirma optimizasyonu', fiyat: '' },
        { hizmet: 'Hijyen & HACCP Denetimi', aciklama: 'Gida guvenligi kontrolu, sicaklik takip sistemi, egitim', fiyat: '' },
    ],
    baslangic_tarihi: '',
    sure: '3 ay',
    odeme_kosullari: 'Aylık eşit taksitler halinde, her ayın 1\'inde fatura kesilir.',
    ozel_notlar: '',
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
        .replace(/°/g, ' derece ');
}

/* ------------------------------------------------------------------ */
/*  PDF Generation                                                     */
/* ------------------------------------------------------------------ */
async function generatePDF(data: TeklifData) {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentW = pageW - margin * 2;
    let y = 15;

    const navy: [number, number, number] = [11, 31, 59];
    const gold: [number, number, number] = [196, 128, 61];
    const textDark: [number, number, number] = [30, 30, 30];
    const textGray: [number, number, number] = [120, 120, 120];

    // ---- HEADER ----
    doc.setFillColor(...navy);
    doc.rect(0, 0, pageW, 38, 'F');
    doc.setFillColor(...gold);
    doc.rect(0, 38, pageW, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('Helvetica', 'bold');
    doc.text(tr('DANISMANLIK TEKLIFI'), pageW / 2, 16, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(tr(`Teklif No: ${data.teklif_no}`), pageW / 2, 24, { align: 'center' });
    doc.setFontSize(8);
    doc.text(tr(`Tarih: ${data.teklif_tarihi} | Gecerlilik: ${data.gecerlilik_suresi}`), pageW / 2, 30, { align: 'center' });
    doc.text('ArslanOps', pageW / 2, 35, { align: 'center' });

    y = 46;

    // ---- TARAFLAR ----
    // Sol: Danışman
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentW / 2 - 3, 40, 2, 2, 'F');
    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.text('DANISMAN', margin + 4, y + 7);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    doc.text(tr(data.danisman_adi), margin + 4, y + 14);
    doc.text(tr(data.danisman_unvan), margin + 4, y + 19);
    doc.text(data.danisman_telefon, margin + 4, y + 24);
    doc.text(data.danisman_email, margin + 4, y + 29);

    // Sağ: Müşteri
    const rightX = margin + contentW / 2 + 3;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(rightX, y, contentW / 2 - 3, 40, 2, 2, 'F');
    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.text(tr('MUSTERI'), rightX + 4, y + 7);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    doc.text(tr(data.musteri_adi || '(Ad Soyad)'), rightX + 4, y + 14);
    doc.text(tr(data.musteri_isletme || '(Isletme Adi)'), rightX + 4, y + 19);
    doc.text(data.musteri_telefon || '(Telefon)', rightX + 4, y + 24);
    doc.text(data.musteri_email || '(E-posta)', rightX + 4, y + 29);
    if (data.musteri_adres) {
        doc.text(tr(data.musteri_adres).substring(0, 45), rightX + 4, y + 34);
    }

    y += 48;

    // ---- HİZMETLER TABLOSU ----
    doc.setFillColor(...gold);
    doc.rect(margin, y, 3, 8, 'F');
    doc.setTextColor(...navy);
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text(tr('Sunulan Hizmetler'), margin + 7, y + 6);
    y += 12;

    const hizmetRows = data.hizmetler.filter(h => h.hizmet.trim()).map((h, i) => [
        String(i + 1),
        tr(h.hizmet),
        tr(h.aciklama),
        h.fiyat ? `${Number(h.fiyat).toLocaleString('tr-TR')} TL` : '-',
    ]);

    const toplam = data.hizmetler.reduce((sum, h) => sum + (Number(h.fiyat) || 0), 0);
    if (toplam > 0) {
        hizmetRows.push(['', '', 'TOPLAM', `${toplam.toLocaleString('tr-TR')} TL`]);
    }

    autoTable(doc, {
        startY: y,
        head: [['#', 'Hizmet', tr('Aciklama'), tr('Ucret')]],
        body: hizmetRows,
        theme: 'grid',
        headStyles: { fillColor: navy, textColor: [255, 255, 255], fontSize: 9, font: 'Helvetica', fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 8, font: 'Helvetica', textColor: textDark },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 50, fontStyle: 'bold' },
            2: { cellWidth: 80 },
            3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        },
        styles: { cellPadding: 3 },
        margin: { left: margin, right: margin },
        didParseCell: (hookData: any) => {
            if (toplam > 0 && hookData.row.index === hizmetRows.length - 1 && hookData.section === 'body') {
                hookData.cell.styles.fontStyle = 'bold';
                hookData.cell.styles.fillColor = [255, 251, 235];
                hookData.cell.styles.textColor = navy;
                hookData.cell.styles.fontSize = 10;
            }
        },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // ---- SÜRE & ÖDEME KOŞULLARI ----
    if (y > 240) { doc.addPage(); y = 20; }

    doc.setFillColor(...gold);
    doc.rect(margin, y, 3, 8, 'F');
    doc.setTextColor(...navy);
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text(tr('Sure & Odeme Kosullari'), margin + 7, y + 6);
    y += 14;

    const kosList = [
        [tr('Baslangic Tarihi'), tr(data.baslangic_tarihi || '(Belirlenmedi)')],
        [tr('Danismanlik Suresi'), tr(data.sure || '(Belirlenmedi)')],
        [tr('Odeme Kosullari'), tr(data.odeme_kosullari || '-')],
    ];
    autoTable(doc, {
        startY: y,
        body: kosList,
        theme: 'plain',
        bodyStyles: { fontSize: 9, font: 'Helvetica', textColor: textDark },
        columnStyles: {
            0: { cellWidth: 45, fontStyle: 'bold', textColor: navy },
            1: { cellWidth: contentW - 45 },
        },
        styles: { cellPadding: 3 },
        margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    // ---- ÖZEL NOTLAR ----
    if (data.ozel_notlar.trim()) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFillColor(...gold);
        doc.rect(margin, y, 3, 8, 'F');
        doc.setTextColor(...navy);
        doc.setFontSize(12);
        doc.setFont('Helvetica', 'bold');
        doc.text(tr('Ozel Notlar'), margin + 7, y + 6);
        y += 12;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textDark);
        const notLines = doc.splitTextToSize(tr(data.ozel_notlar), contentW - 10);
        doc.text(notLines, margin + 5, y);
        y += notLines.length * 4.5 + 8;
    }

    // ---- İMZA ALANI ----
    if (y > 230) { doc.addPage(); y = 20; }
    y += 10;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentW / 2 - 5, 35, 2, 2, 'F');
    doc.roundedRect(margin + contentW / 2 + 5, y, contentW / 2 - 5, 35, 2, 2, 'F');

    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.text('DANISMAN', margin + 4, y + 7);
    doc.text(tr('MUSTERI'), margin + contentW / 2 + 9, y + 7);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textGray);
    doc.text(tr(data.danisman_adi), margin + 4, y + 14);
    doc.text('Imza: _________________', margin + 4, y + 25);
    doc.text('Tarih: _________________', margin + 4, y + 30);

    doc.text(tr(data.musteri_adi || '(Ad Soyad)'), margin + contentW / 2 + 9, y + 14);
    doc.text('Imza: _________________', margin + contentW / 2 + 9, y + 25);
    doc.text('Tarih: _________________', margin + contentW / 2 + 9, y + 30);

    // ---- FOOTER ----
    const totalPages = doc.internal.pages.length - 1;
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        const pH = doc.internal.pageSize.getHeight();
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.5);
        doc.line(margin, pH - 15, pageW - margin, pH - 15);
        doc.setTextColor(...textGray);
        doc.setFontSize(7);
        doc.setFont('Helvetica', 'normal');
        doc.text(tr('ArslanOps | info@arslanops.com | +90 539 233 11 474'), margin, pH - 10);
        doc.text(`Sayfa ${p} / ${totalPages}`, pageW - margin, pH - 10, { align: 'right' });
        doc.setFontSize(6);
        doc.setTextColor(180, 180, 180);
        doc.text(tr('Bu teklif gizlidir ve yalnizca muhatap tarafindan kullanilabilir.'), pageW / 2, pH - 6, { align: 'center' });
    }

    const fileName = tr(`Teklif_${data.musteri_isletme.replace(/\s+/g, '_') || 'Musteri'}_${data.teklif_no}.pdf`);
    doc.save(fileName);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function TeklifSablonu() {
    const [data, setData] = useState<TeklifData>(INITIAL);
    const [generating, setGenerating] = useState(false);

    const update = (field: keyof TeklifData, value: any) => setData(prev => ({ ...prev, [field]: value }));

    const updateHizmet = (idx: number, field: keyof HizmetSatir, value: string) => {
        setData(prev => {
            const h = [...prev.hizmetler];
            h[idx] = { ...h[idx], [field]: value };
            return { ...prev, hizmetler: h };
        });
    };

    const addHizmet = () => setData(prev => ({ ...prev, hizmetler: [...prev.hizmetler, { hizmet: '', aciklama: '', fiyat: '' }] }));
    const removeHizmet = (idx: number) => setData(prev => ({ ...prev, hizmetler: prev.hizmetler.filter((_, i) => i !== idx) }));

    const handleGenerate = async () => {
        setGenerating(true);
        try { await generatePDF(data); } catch (e) { console.error(e); }
        setGenerating(false);
    };

    const toplam = data.hizmetler.reduce((sum, h) => sum + (Number(h.fiyat) || 0), 0);

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-xl font-bold text-[#0B1F3B] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#C4803D]" />
                    Müşteri Teklif / Sözleşme Şablonu
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Yeni müşteriye sunulacak profesyonel danışmanlık teklif formu — hizmetler, fiyat, süre, imza alanı
                </p>
            </div>

            {/* Danışman Bilgileri */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#C4803D]" /> Danışman Bilgileri
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Ad Soyad</label><input value={data.danisman_adi} onChange={e => update('danisman_adi', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" /></div>
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Ünvan</label><input value={data.danisman_unvan} onChange={e => update('danisman_unvan', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" /></div>
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Telefon</label><input value={data.danisman_telefon} onChange={e => update('danisman_telefon', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" /></div>
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">E-posta</label><input value={data.danisman_email} onChange={e => update('danisman_email', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" /></div>
                </div>
            </div>

            {/* Müşteri Bilgileri */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#C4803D]" /> Müşteri Bilgileri
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Ad Soyad</label><input value={data.musteri_adi} onChange={e => update('musteri_adi', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder="Ahmet Yılmaz" /></div>
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">İşletme Adı</label><input value={data.musteri_isletme} onChange={e => update('musteri_isletme', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder="Kahve Durağı" /></div>
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Telefon</label><input value={data.musteri_telefon} onChange={e => update('musteri_telefon', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder="+90 5xx xxx xx xx" /></div>
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">E-posta</label><input value={data.musteri_email} onChange={e => update('musteri_email', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder="musteri@example.com" /></div>
                </div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Adres</label><input value={data.musteri_adres} onChange={e => update('musteri_adres', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder="İşletme adresi" /></div>
            </div>

            {/* Teklif Bilgileri */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C4803D]" /> Teklif Bilgileri
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Teklif No</label><input value={data.teklif_no} onChange={e => update('teklif_no', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" /></div>
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Teklif Tarihi</label><input type="date" value={data.teklif_tarihi} onChange={e => update('teklif_tarihi', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" /></div>
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Geçerlilik</label><input value={data.gecerlilik_suresi} onChange={e => update('gecerlilik_suresi', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" /></div>
                </div>
            </div>

            {/* Hizmetler */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#C4803D]" /> Sunulan Hizmetler
                </h3>
                {data.hizmetler.map((h, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 rounded-xl">
                        <div className="col-span-3">
                            <label className="text-[10px] font-medium text-gray-500 mb-1 block">Hizmet Adı</label>
                            <input value={h.hizmet} onChange={e => updateHizmet(i, 'hizmet', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg" />
                        </div>
                        <div className="col-span-5">
                            <label className="text-[10px] font-medium text-gray-500 mb-1 block">Açıklama</label>
                            <input value={h.aciklama} onChange={e => updateHizmet(i, 'aciklama', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg" />
                        </div>
                        <div className="col-span-3">
                            <label className="text-[10px] font-medium text-gray-500 mb-1 block">Ücret (₺)</label>
                            <input type="number" value={h.fiyat} onChange={e => updateHizmet(i, 'fiyat', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="0" />
                        </div>
                        <div className="col-span-1 pt-5">
                            <button onClick={() => removeHizmet(i)} className="text-red-400 hover:text-red-600"><FileText className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
                <div className="flex justify-between items-center">
                    <button onClick={addHizmet} className="flex items-center gap-1 text-xs text-[#C4803D] hover:text-[#a06830] font-medium">
                        <DollarSign className="w-3 h-3" /> Hizmet Ekle
                    </button>
                    {toplam > 0 && (
                        <span className="text-sm font-bold text-[#0B1F3B]">
                            Toplam: {toplam.toLocaleString('tr-TR')} ₺
                        </span>
                    )}
                </div>
            </div>

            {/* Süre & Ödeme */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C4803D]" /> Süre & Ödeme Koşulları
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Başlangıç Tarihi</label><input type="date" value={data.baslangic_tarihi} onChange={e => update('baslangic_tarihi', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" /></div>
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Danışmanlık Süresi</label><input value={data.sure} onChange={e => update('sure', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder="3 ay" /></div>
                </div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Ödeme Koşulları</label><textarea value={data.odeme_kosullari} onChange={e => update('odeme_kosullari', e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none resize-none" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Özel Notlar</label><textarea value={data.ozel_notlar} onChange={e => update('ozel_notlar', e.target.value)} rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none resize-none" placeholder="Ek koşullar veya notlar..." /></div>
            </div>

            {/* PDF İndir */}
            <button onClick={handleGenerate} disabled={generating} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#0B1F3B] to-[#1a365d] text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {generating ? 'PDF oluşturuluyor...' : 'Teklif / Sözleşme (PDF) İndir'}
            </button>
        </div>
    );
}
