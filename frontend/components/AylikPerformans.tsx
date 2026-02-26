'use client';

import { useState } from 'react';
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign, Users, Star, Calendar, Plus, Trash2, Loader2 } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface HaftalikVeri {
    hafta: string;
    ciro: string;
    cogs_oran: string;
    musteri_sayisi: string;
    ortalama_hesap: string;
}

interface AylikData {
    isletme_adi: string;
    donem: string;
    danisman_adi: string;
    // Haftalık KPI verileri
    haftalik: HaftalikVeri[];
    // Genel metrikler
    personel_devir: string;
    memnuniyet_skoru: string;
    hedef_ciro: string;
    hedef_cogs: string;
    // Değerlendirme
    basarilar: string[];
    sorunlar: string[];
    oneri_ve_hedefler: string[];
    genel_yorum: string;
}

const EMPTY_HAFTA: HaftalikVeri = { hafta: '', ciro: '', cogs_oran: '', musteri_sayisi: '', ortalama_hesap: '' };

const INITIAL: AylikData = {
    isletme_adi: '',
    donem: new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
    danisman_adi: 'İlhan Arslan',
    haftalik: [
        { hafta: '1. Hafta', ciro: '', cogs_oran: '', musteri_sayisi: '', ortalama_hesap: '' },
        { hafta: '2. Hafta', ciro: '', cogs_oran: '', musteri_sayisi: '', ortalama_hesap: '' },
        { hafta: '3. Hafta', ciro: '', cogs_oran: '', musteri_sayisi: '', ortalama_hesap: '' },
        { hafta: '4. Hafta', ciro: '', cogs_oran: '', musteri_sayisi: '', ortalama_hesap: '' },
    ],
    personel_devir: '',
    memnuniyet_skoru: '',
    hedef_ciro: '',
    hedef_cogs: '',
    basarilar: [''],
    sorunlar: [''],
    oneri_ve_hedefler: [''],
    genel_yorum: '',
};

/* ------------------------------------------------------------------ */
/*  Transliteration (Helvetica doesn't support Turkish chars)          */
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
async function generatePDF(data: AylikData) {
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
    doc.rect(0, 0, pageW, 32, 'F');
    doc.setFillColor(...gold);
    doc.rect(0, 32, pageW, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    doc.text(tr('AYLIK PERFORMANS RAPORU'), pageW / 2, 14, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(tr(`${data.isletme_adi || 'Isletme'} | ${data.donem}`), pageW / 2, 22, { align: 'center' });
    doc.setFontSize(8);
    doc.text(tr(`Danisman: ${data.danisman_adi} | ArslanOps`), pageW / 2, 28, { align: 'center' });

    y = 40;

    // ---- SECTION HELPER ----
    const sectionTitle = (title: string) => {
        if (y > 255) { doc.addPage(); y = 20; }
        doc.setFillColor(...gold);
        doc.rect(margin, y, 3, 8, 'F');
        doc.setTextColor(...navy);
        doc.setFontSize(12);
        doc.setFont('Helvetica', 'bold');
        doc.text(tr(title), margin + 7, y + 6);
        y += 12;
    };

    // ---- 1. HAFTALIK KPI TABLOSU ----
    sectionTitle('Haftalik KPI Takibi');

    const haftalikRows = data.haftalik.map(h => [
        tr(h.hafta),
        h.ciro ? `${Number(h.ciro).toLocaleString('tr-TR')} TL` : '-',
        h.cogs_oran ? `%${h.cogs_oran}` : '-',
        h.musteri_sayisi || '-',
        h.ortalama_hesap ? `${h.ortalama_hesap} TL` : '-',
    ]);

    // Ortalama satırı
    const nums = (field: keyof HaftalikVeri) => data.haftalik.map(h => Number(h[field]) || 0).filter(n => n > 0);
    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    const totalCiro = nums('ciro').reduce((a, b) => a + b, 0);
    const avgCogs = avg(nums('cogs_oran'));
    const totalMusteri = nums('musteri_sayisi').reduce((a, b) => a + b, 0);
    const avgHesap = avg(nums('ortalama_hesap'));

    haftalikRows.push([
        'TOPLAM / ORT.',
        `${totalCiro.toLocaleString('tr-TR')} TL`,
        avgCogs ? `%${avgCogs}` : '-',
        totalMusteri.toString(),
        avgHesap ? `${avgHesap} TL` : '-',
    ]);

    autoTable(doc, {
        startY: y,
        head: [['Donem', 'Ciro (TL)', 'COGS (%)', tr('Musteri Sayisi'), tr('Ort. Hesap')]],
        body: haftalikRows,
        theme: 'grid',
        headStyles: { fillColor: navy, textColor: [255, 255, 255], fontSize: 9, font: 'Helvetica', fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 9, font: 'Helvetica', halign: 'center', textColor: textDark },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { cellPadding: 3 },
        margin: { left: margin, right: margin },
        didParseCell: (hookData: any) => {
            // Son satır (toplam) stilini farklı yap
            if (hookData.row.index === haftalikRows.length - 1 && hookData.section === 'body') {
                hookData.cell.styles.fontStyle = 'bold';
                hookData.cell.styles.fillColor = [255, 251, 235];
                hookData.cell.styles.textColor = navy;
            }
        },
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    // ---- 2. HEDEF KARSILASTIRMA ----
    sectionTitle('Hedef Karsilastirma');

    const hedefRows: string[][] = [];
    if (data.hedef_ciro && totalCiro > 0) {
        const hedefC = Number(data.hedef_ciro) || 0;
        const pct = hedefC > 0 ? Math.round((totalCiro / hedefC) * 100) : 0;
        hedefRows.push([tr('Aylik Ciro'), `${hedefC.toLocaleString('tr-TR')} TL`, `${totalCiro.toLocaleString('tr-TR')} TL`, `%${pct}`, pct >= 100 ? 'BASARILI' : pct >= 80 ? 'YAKIN' : 'DUSUK']);
    }
    if (data.hedef_cogs && avgCogs > 0) {
        const hedefCogs = Number(data.hedef_cogs) || 0;
        const durum = avgCogs <= hedefCogs ? 'BASARILI' : avgCogs <= hedefCogs + 3 ? 'YAKIN' : 'YUKSEK';
        hedefRows.push(['COGS', `%${hedefCogs}`, `%${avgCogs}`, avgCogs <= hedefCogs ? 'OK' : `+%${avgCogs - hedefCogs}`, durum]);
    }
    if (data.personel_devir) {
        hedefRows.push([tr('Personel Devir'), '%10 (ideal)', `%${data.personel_devir}`, '', Number(data.personel_devir) <= 10 ? 'IYI' : 'YUKSEK']);
    }
    if (data.memnuniyet_skoru) {
        hedefRows.push([tr('Musteri Memnuniyeti'), '4.5 / 5', `${data.memnuniyet_skoru} / 5`, '', Number(data.memnuniyet_skoru) >= 4.5 ? 'MUKEMMEL' : Number(data.memnuniyet_skoru) >= 4 ? 'IYI' : 'GELISTIRILMELI']);
    }

    if (hedefRows.length > 0) {
        autoTable(doc, {
            startY: y,
            head: [['Metrik', 'Hedef', tr('Gerceklesen'), tr('Fark / Oran'), 'Durum']],
            body: hedefRows,
            theme: 'grid',
            headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 9, font: 'Helvetica', fontStyle: 'bold', halign: 'center' },
            bodyStyles: { fontSize: 9, font: 'Helvetica', halign: 'center', textColor: textDark },
            styles: { cellPadding: 3 },
            margin: { left: margin, right: margin },
            didParseCell: (hookData: any) => {
                if (hookData.column.index === 4 && hookData.section === 'body') {
                    const val = hookData.cell.raw as string;
                    if (val === 'BASARILI' || val === 'MUKEMMEL' || val === 'IYI' || val === 'OK') {
                        hookData.cell.styles.textColor = [34, 197, 94];
                        hookData.cell.styles.fontStyle = 'bold';
                    } else if (val === 'YAKIN') {
                        hookData.cell.styles.textColor = [245, 158, 11];
                        hookData.cell.styles.fontStyle = 'bold';
                    } else {
                        hookData.cell.styles.textColor = [239, 68, 68];
                        hookData.cell.styles.fontStyle = 'bold';
                    }
                }
            },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ---- 3. BASARILAR ----
    const nonEmpty = (arr: string[]) => arr.filter(s => s.trim());

    if (nonEmpty(data.basarilar).length > 0) {
        sectionTitle('Bu Ayin Basarilari');
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textDark);
        nonEmpty(data.basarilar).forEach(item => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFillColor(34, 197, 94);
            doc.circle(margin + 2, y - 1, 1, 'F');
            const lines = doc.splitTextToSize(tr(item), contentW - 10);
            doc.text(lines, margin + 6, y);
            y += lines.length * 4.5 + 2;
        });
        y += 4;
    }

    // ---- 4. SORUNLAR ----
    if (nonEmpty(data.sorunlar).length > 0) {
        sectionTitle('Tespit Edilen Sorunlar');
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textDark);
        nonEmpty(data.sorunlar).forEach(item => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFillColor(239, 68, 68);
            doc.circle(margin + 2, y - 1, 1, 'F');
            const lines = doc.splitTextToSize(tr(item), contentW - 10);
            doc.text(lines, margin + 6, y);
            y += lines.length * 4.5 + 2;
        });
        y += 4;
    }

    // ---- 5. ÖNERİLER ----
    if (nonEmpty(data.oneri_ve_hedefler).length > 0) {
        sectionTitle(tr('Gelecek Ay Onerileri & Hedefler'));
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textDark);
        nonEmpty(data.oneri_ve_hedefler).forEach((item, i) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFont('Helvetica', 'bold');
            doc.setTextColor(...gold);
            doc.text(`${i + 1}.`, margin, y);
            doc.setFont('Helvetica', 'normal');
            doc.setTextColor(...textDark);
            const lines = doc.splitTextToSize(tr(item), contentW - 10);
            doc.text(lines, margin + 6, y);
            y += lines.length * 4.5 + 2;
        });
        y += 4;
    }

    // ---- 6. GENEL YORUM ----
    if (data.genel_yorum.trim()) {
        sectionTitle('Genel Degerlendirme');
        doc.setFillColor(248, 250, 252);
        const yLines = doc.splitTextToSize(tr(data.genel_yorum), contentW - 16);
        const boxH = yLines.length * 4.5 + 10;
        if (y + boxH > 270) { doc.addPage(); y = 20; }
        doc.roundedRect(margin, y - 2, contentW, boxH, 2, 2, 'F');
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textDark);
        doc.text(yLines, margin + 8, y + 4);
        y += boxH + 6;
    }

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
        doc.text(tr('Bu rapor gizlidir ve yalnizca ilgili isletme yonetimi ile paylasilmalidir.'), pageW / 2, pH - 6, { align: 'center' });
    }

    const fileName = tr(`Aylik_Performans_${data.isletme_adi.replace(/\s+/g, '_') || 'Rapor'}_${data.donem.replace(/\s+/g, '_')}.pdf`);
    doc.save(fileName);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function AylikPerformans() {
    const [data, setData] = useState<AylikData>(INITIAL);
    const [generating, setGenerating] = useState(false);

    const update = (field: keyof AylikData, value: any) => setData(prev => ({ ...prev, [field]: value }));

    const updateHafta = (idx: number, field: keyof HaftalikVeri, value: string) => {
        setData(prev => {
            const h = [...prev.haftalik];
            h[idx] = { ...h[idx], [field]: value };
            return { ...prev, haftalik: h };
        });
    };

    const updateList = (field: 'basarilar' | 'sorunlar' | 'oneri_ve_hedefler', idx: number, value: string) => {
        setData(prev => {
            const arr = [...prev[field]];
            arr[idx] = value;
            return { ...prev, [field]: arr };
        });
    };
    const addToList = (field: 'basarilar' | 'sorunlar' | 'oneri_ve_hedefler') => {
        setData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };
    const removeFromList = (field: 'basarilar' | 'sorunlar' | 'oneri_ve_hedefler', idx: number) => {
        setData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try { await generatePDF(data); } catch (e) { console.error(e); }
        setGenerating(false);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-xl font-bold text-[#0B1F3B] flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#C4803D]" />
                    Aylık Performans Raporu
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Ay sonunda müşteriye sunacağınız KPI özet raporu — ciro trendi, COGS, personel devir, memnuniyet
                </p>
            </div>

            {/* İşletme Bilgileri */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C4803D]" /> İşletme & Dönem
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">İşletme Adı</label>
                        <input value={data.isletme_adi} onChange={e => update('isletme_adi', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder="Kahve Durağı" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Dönem</label>
                        <input value={data.donem} onChange={e => update('donem', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder="Şubat 2026" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Danışman Adı</label>
                        <input value={data.danisman_adi} onChange={e => update('danisman_adi', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" />
                    </div>
                </div>
            </div>

            {/* Haftalık KPI */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#C4803D]" /> Haftalık KPI Verileri
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-gray-500 border-b">
                                <th className="py-2 text-left font-medium">Hafta</th>
                                <th className="py-2 text-left font-medium">Ciro (₺)</th>
                                <th className="py-2 text-left font-medium">COGS (%)</th>
                                <th className="py-2 text-left font-medium">Müşteri Sayısı</th>
                                <th className="py-2 text-left font-medium">Ort. Hesap (₺)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.haftalik.map((h, i) => (
                                <tr key={i} className="border-b border-gray-50">
                                    <td className="py-2 pr-2"><input value={h.hafta} onChange={e => updateHafta(i, 'hafta', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg" /></td>
                                    <td className="py-2 pr-2"><input type="number" value={h.ciro} onChange={e => updateHafta(i, 'ciro', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="0" /></td>
                                    <td className="py-2 pr-2"><input type="number" value={h.cogs_oran} onChange={e => updateHafta(i, 'cogs_oran', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="0" /></td>
                                    <td className="py-2 pr-2"><input type="number" value={h.musteri_sayisi} onChange={e => updateHafta(i, 'musteri_sayisi', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="0" /></td>
                                    <td className="py-2"><input type="number" value={h.ortalama_hesap} onChange={e => updateHafta(i, 'ortalama_hesap', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="0" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hedefler & Ek Metrikler */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#C4803D]" /> Hedefler & Ek Metrikler
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Hedef Ciro (₺)</label>
                        <input type="number" value={data.hedef_ciro} onChange={e => update('hedef_ciro', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder="500000" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Hedef COGS (%)</label>
                        <input type="number" value={data.hedef_cogs} onChange={e => update('hedef_cogs', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder="30" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Personel Devir (%)</label>
                        <input type="number" value={data.personel_devir} onChange={e => update('personel_devir', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder="0" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Memnuniyet (x/5)</label>
                        <input type="number" step="0.1" max="5" value={data.memnuniyet_skoru} onChange={e => update('memnuniyet_skoru', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder="4.5" />
                    </div>
                </div>
            </div>

            {/* Başarılar / Sorunlar / Öneriler */}
            {(['basarilar', 'sorunlar', 'oneri_ve_hedefler'] as const).map(field => {
                const labels = {
                    basarilar: { title: 'Bu Ayın Başarıları', icon: Star, color: '#22c55e', placeholder: 'Başarı maddesi...' },
                    sorunlar: { title: 'Tespit Edilen Sorunlar', icon: TrendingDown, color: '#ef4444', placeholder: 'Sorun maddesi...' },
                    oneri_ve_hedefler: { title: 'Gelecek Ay Önerileri & Hedefler', icon: TrendingUp, color: '#3b82f6', placeholder: 'Öneri veya hedef...' },
                };
                const { title, icon: Icon, color, placeholder } = labels[field];
                return (
                    <div key={field} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                        <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color }} /> {title}
                        </h3>
                        {data[field].map((item, i) => (
                            <div key={i} className="flex gap-2">
                                <input value={item} onChange={e => updateList(field, i, e.target.value)} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder={placeholder} />
                                {data[field].length > 1 && (
                                    <button onClick={() => removeFromList(field, i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                                )}
                            </div>
                        ))}
                        <button onClick={() => addToList(field)} className="flex items-center gap-1 text-xs text-[#C4803D] hover:text-[#a06830] font-medium">
                            <Plus className="w-3 h-3" /> Ekle
                        </button>
                    </div>
                );
            })}

            {/* Genel Yorum */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-[#0B1F3B] mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#C4803D]" /> Genel Değerlendirme
                </h3>
                <textarea value={data.genel_yorum} onChange={e => update('genel_yorum', e.target.value)} rows={4} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none resize-none" placeholder="Ay geneli hakkında genel değerlendirmenizi yazın..." />
            </div>

            {/* PDF İndir Butonu */}
            <button onClick={handleGenerate} disabled={generating} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#0B1F3B] to-[#1a365d] text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {generating ? 'PDF oluşturuluyor...' : 'Aylık Performans Raporu (PDF) İndir'}
            </button>
        </div>
    );
}
