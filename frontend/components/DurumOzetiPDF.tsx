'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Building2, Calendar, BarChart3, AlertTriangle, CheckCircle, Lightbulb, Plus, Trash2, Star, Save, FolderOpen, Image, X, TrendingUp, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface PhotoItem {
    url: string;
    caption: string;
}

interface ReportSummary {
    id: string;
    isletme_adi: string;
    isletme_turu: string;
    ziyaret_tarihi: string;
    toplam_skor: number;
    created_at: string;
}

interface DurumOzetiData {
    id?: string;
    isletme_adi: string;
    isletme_turu: string;
    konum: string;
    kapasite: string;
    personel_sayisi: string;
    isletme_sahibi: string;
    ziyaret_tarihi: string;
    gozlem_suresi: string;
    danisman_adi: string;
    skor_maliyet: number;
    skor_stok: number;
    skor_operasyon: number;
    skor_personel: number;
    skor_hijyen: number;
    skor_musteri: number;
    mevcut_cogs: string;
    hedef_cogs: string;
    fire_orani: string;
    personel_maliyet: string;
    guclu_yanlar: string[];
    kritik_tespitler: string[];
    oneriler: string[];
    sonraki_adimlar: string[];
    genel_degerlendirme: string;
    photos: PhotoItem[];
}

const INITIAL_DATA: DurumOzetiData = {
    isletme_adi: '',
    isletme_turu: 'coffee',
    konum: '',
    kapasite: '',
    personel_sayisi: '',
    isletme_sahibi: '',
    ziyaret_tarihi: new Date().toISOString().split('T')[0],
    gozlem_suresi: '4',
    danisman_adi: 'İlhan Arslan',
    skor_maliyet: 5,
    skor_stok: 5,
    skor_operasyon: 5,
    skor_personel: 5,
    skor_hijyen: 5,
    skor_musteri: 5,
    mevcut_cogs: '',
    hedef_cogs: '28-32',
    fire_orani: '',
    personel_maliyet: '',
    guclu_yanlar: [''],
    kritik_tespitler: [''],
    oneriler: [''],
    sonraki_adimlar: [''],
    genel_degerlendirme: '',
    photos: [],
};

const ISLETME_TURLERI: Record<string, string> = {
    coffee: 'Coffee Shop / Kafe',
    restoran: 'Restoran',
    pastane: 'Pastane / Fırın',
    bar: 'Bar / Pub',
    otel: 'Otel F&B',
    franchise: 'Franchise / Zincir',
    catering: 'Catering',
    kiosk: 'Kiosk / Küçük İşletme',
};

/* ------------------------------------------------------------------ */
/*  Helper: Skor rengi                                                 */
/* ------------------------------------------------------------------ */
function skorRenk(skor: number): string {
    if (skor >= 8) return '#22c55e';
    if (skor >= 6) return '#C4803D';
    if (skor >= 4) return '#f59e0b';
    return '#ef4444';
}

function skorLabel(skor: number): string {
    if (skor >= 9) return 'Mükemmel';
    if (skor >= 7) return 'İyi';
    if (skor >= 5) return 'Orta';
    if (skor >= 3) return 'Zayıf';
    return 'Kritik';
}

/* ------------------------------------------------------------------ */
/*  PDF Oluşturma                                                      */
/* ------------------------------------------------------------------ */
async function generatePDF(data: DurumOzetiData) {
    const { jsPDF } = await import('jspdf');
    // Import autoTable and register it with jsPDF
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF('p', 'mm', 'a4');

    // ---- LOAD TURKISH-COMPATIBLE FONTS ----
    const fontBaseUrl = window.location.origin;
    try {
        const [regBuf, boldBuf] = await Promise.all([
            fetch(`${fontBaseUrl}/fonts/Roboto-Regular.ttf`).then(r => r.arrayBuffer()),
            fetch(`${fontBaseUrl}/fonts/Roboto-Bold.ttf`).then(r => r.arrayBuffer()),
        ]);

        // Convert ArrayBuffer to base64
        const toBase64 = (buf: ArrayBuffer) => {
            const bytes = new Uint8Array(buf);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
            return btoa(binary);
        };

        doc.addFileToVFS('Roboto-Regular.ttf', toBase64(regBuf));
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

        doc.addFileToVFS('Roboto-Bold.ttf', toBase64(boldBuf));
        doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

        doc.setFont('Roboto', 'normal');
    } catch (e) {
        console.warn('Roboto font yüklenemedi, Helvetica kullanılacak:', e);
    }

    const FONT = doc.getFont().fontName; // 'Roboto' or fallback 'helvetica'

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;

    // ---- COLORS ----
    const primary: [number, number, number] = [11, 31, 59];       // #0B1F3B
    const accent: [number, number, number] = [196, 128, 61];      // #C4803D
    const lightBg: [number, number, number] = [245, 247, 250];    // #F5F7FA
    const white: [number, number, number] = [255, 255, 255];
    const textDark: [number, number, number] = [30, 30, 30];
    const textGray: [number, number, number] = [120, 120, 120];

    // ---- HEADER BAR ----
    doc.setFillColor(...primary);
    doc.rect(0, 0, pageWidth, 38, 'F');

    // Logo circle
    doc.setFillColor(...accent);
    doc.circle(margin + 8, 19, 8, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(14);
    doc.setFont(FONT, 'bold');
    doc.text('A', margin + 5.2, 23);

    // Brand name
    doc.setFontSize(18);
    doc.text('ArslanOps', margin + 20, 18);
    doc.setFontSize(8);
    doc.setFont(FONT, 'normal');
    doc.text('DANIŞMANLIK', margin + 20, 24);

    // Report title (right side)
    doc.setFontSize(12);
    doc.setFont(FONT, 'bold');
    doc.text('DURUM ÖZETİ RAPORU', pageWidth - margin, 18, { align: 'right' });
    doc.setFontSize(8);
    doc.setFont(FONT, 'normal');
    const tarih = new Date(data.ziyaret_tarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(tarih, pageWidth - margin, 24, { align: 'right' });

    y = 46;

    // ---- İŞLETME BİLGİLERİ ----
    doc.setFillColor(...lightBg);
    doc.roundedRect(margin, y, contentWidth, 32, 3, 3, 'F');

    doc.setTextColor(...primary);
    doc.setFontSize(11);
    doc.setFont(FONT, 'bold');
    doc.text('İşletme Bilgileri', margin + 5, y + 8);

    doc.setFont(FONT, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textDark);

    const col1 = margin + 5;
    const col2 = margin + contentWidth / 2 + 5;

    doc.setFont(FONT, 'bold');
    doc.text('İşletme:', col1, y + 16);
    doc.setFont(FONT, 'normal');
    doc.text(data.isletme_adi || '-', col1 + 25, y + 16);

    doc.setFont(FONT, 'bold');
    doc.text('Tür:', col2, y + 16);
    doc.setFont(FONT, 'normal');
    doc.text(ISLETME_TURLERI[data.isletme_turu] || data.isletme_turu, col2 + 15, y + 16);

    doc.setFont(FONT, 'bold');
    doc.text('Konum:', col1, y + 23);
    doc.setFont(FONT, 'normal');
    doc.text(data.konum || '-', col1 + 25, y + 23);

    doc.setFont(FONT, 'bold');
    doc.text('Kapasite:', col2, y + 23);
    doc.setFont(FONT, 'normal');
    doc.text(`${data.kapasite || '-'} kişi / ${data.personel_sayisi || '-'} personel`, col2 + 25, y + 23);

    doc.setFont(FONT, 'bold');
    doc.text('Sahip:', col1, y + 30);
    doc.setFont(FONT, 'normal');
    doc.text(data.isletme_sahibi || '-', col1 + 25, y + 30);

    doc.setFont(FONT, 'bold');
    doc.text('Gözlem:', col2, y + 30);
    doc.setFont(FONT, 'normal');
    doc.text(`${data.gozlem_suresi} saat`, col2 + 25, y + 30);

    y += 40;

    // ---- GENEL PUAN ----
    const skorlar = [
        { label: 'Maliyet Kontrolü', skor: data.skor_maliyet },
        { label: 'Stok Yönetimi', skor: data.skor_stok },
        { label: 'Operasyon Düzeni', skor: data.skor_operasyon },
        { label: 'Personel Yönetimi', skor: data.skor_personel },
        { label: 'Hijyen & Kalite', skor: data.skor_hijyen },
        { label: 'Müşteri Deneyimi', skor: data.skor_musteri },
    ];
    const toplamSkor = Math.round(skorlar.reduce((a, s) => a + s.skor, 0) / skorlar.length * 10);

    // Section title
    doc.setFillColor(...accent);
    doc.rect(margin, y, 3, 8, 'F');
    doc.setTextColor(...primary);
    doc.setFontSize(12);
    doc.setFont(FONT, 'bold');
    doc.text('Genel Değerlendirme Puanı', margin + 7, y + 6);
    y += 14;

    // Score circle
    const circleX = margin + 20;
    const circleY = y + 18;
    doc.setFillColor(...primary);
    doc.circle(circleX, circleY, 14, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(22);
    doc.setFont(FONT, 'bold');
    doc.text(`${toplamSkor}`, circleX, circleY + 3, { align: 'center' });
    doc.setFontSize(7);
    doc.text('/ 100', circleX, circleY + 9, { align: 'center' });

    // Score bars
    const barStartX = margin + 45;
    const barWidth = contentWidth - 50;
    skorlar.forEach((s, i) => {
        const barY = y + i * 7;
        doc.setTextColor(...textDark);
        doc.setFontSize(8);
        doc.setFont(FONT, 'normal');
        doc.text(s.label, barStartX, barY + 4);

        // Background bar
        const bx = barStartX + 45;
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(bx, barY, barWidth - 65, 4, 2, 2, 'F');

        // Fill bar
        const fillW = (barWidth - 65) * (s.skor / 10);
        const clr = skorRenk(s.skor);
        const r = parseInt(clr.slice(1, 3), 16);
        const g = parseInt(clr.slice(3, 5), 16);
        const b = parseInt(clr.slice(5, 7), 16);
        doc.setFillColor(r, g, b);
        doc.roundedRect(bx, barY, fillW, 4, 2, 2, 'F');

        // Score text
        doc.setFont(FONT, 'bold');
        doc.setFontSize(8);
        doc.text(`${s.skor}/10`, bx + barWidth - 60, barY + 4);
    });

    y += 50;

    // ---- MALİYET ANALİZİ ----
    doc.setFillColor(...accent);
    doc.rect(margin, y, 3, 8, 'F');
    doc.setTextColor(...primary);
    doc.setFontSize(12);
    doc.setFont(FONT, 'bold');
    doc.text('Maliyet Analizi', margin + 7, y + 6);
    y += 12;

    const maliyetData = [
        ['Gösterge', 'Mevcut', 'Hedef', 'Durum'],
        ['COGS Oranı', `%${data.mevcut_cogs || '-'}`, `%${data.hedef_cogs || '-'}`, Number(data.mevcut_cogs) > 35 ? '[!] Yüksek' : Number(data.mevcut_cogs) > 30 ? '[!] Dikkat' : '[OK] Normal'],
        ['Fire Oranı', `%${data.fire_orani || '-'}`, '%2-4', Number(data.fire_orani) > 5 ? '[!] Yüksek' : '[OK] Normal'],
        ['Personel Maliyeti', `%${data.personel_maliyet || '-'}`, '%25-30', Number(data.personel_maliyet) > 32 ? '[!] Yüksek' : '[OK] Normal'],
    ];

    autoTable(doc, {
        startY: y,
        head: [maliyetData[0]],
        body: maliyetData.slice(1),
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 3, font: FONT },
        headStyles: { fillColor: primary, textColor: white, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: lightBg },
        columnStyles: {
            0: { fontStyle: 'bold' },
            3: { halign: 'center' },
        },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // ---- GÜÇLÜ YANLAR ----
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFillColor(34, 197, 94);
    doc.rect(margin, y, 3, 8, 'F');
    doc.setTextColor(...primary);
    doc.setFontSize(12);
    doc.setFont(FONT, 'bold');
    doc.text('Güçlü Yanlar', margin + 7, y + 6);
    y += 12;

    doc.setFontSize(9);
    doc.setFont(FONT, 'normal');
    doc.setTextColor(...textDark);
    data.guclu_yanlar.filter(g => g.trim()).forEach((g) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFillColor(34, 197, 94);
        doc.circle(margin + 4, y + 1, 1.5, 'F');
        const lines = doc.splitTextToSize(g, contentWidth - 15);
        doc.text(lines, margin + 10, y + 3);
        y += lines.length * 5 + 3;
    });

    y += 5;

    // ---- KRİTİK TESPİTLER ----
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFillColor(239, 68, 68);
    doc.rect(margin, y, 3, 8, 'F');
    doc.setTextColor(...primary);
    doc.setFontSize(12);
    doc.setFont(FONT, 'bold');
    doc.text('Kritik Tespitler', margin + 7, y + 6);
    y += 12;

    doc.setFontSize(9);
    doc.setFont(FONT, 'normal');
    doc.setTextColor(...textDark);
    data.kritik_tespitler.filter(k => k.trim()).forEach((k) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFillColor(239, 68, 68);
        doc.circle(margin + 4, y + 1, 1.5, 'F');
        const lines = doc.splitTextToSize(k, contentWidth - 15);
        doc.text(lines, margin + 10, y + 3);
        y += lines.length * 5 + 3;
    });

    y += 5;

    // ---- ÖNERİLER ----
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFillColor(...accent);
    doc.rect(margin, y, 3, 8, 'F');
    doc.setTextColor(...primary);
    doc.setFontSize(12);
    doc.setFont(FONT, 'bold');
    doc.text('Öneriler', margin + 7, y + 6);
    y += 12;

    doc.setFontSize(9);
    doc.setFont(FONT, 'normal');
    doc.setTextColor(...textDark);
    data.oneriler.filter(o => o.trim()).forEach((o, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFillColor(...accent);
        doc.circle(margin + 4, y + 1, 1.5, 'F');
        doc.setFont(FONT, 'bold');
        doc.text(`${i + 1}.`, margin + 9, y + 3);
        doc.setFont(FONT, 'normal');
        const lines = doc.splitTextToSize(o, contentWidth - 20);
        doc.text(lines, margin + 15, y + 3);
        y += lines.length * 5 + 3;
    });

    y += 5;

    // ---- SONRAKİ ADIMLAR ----
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFillColor(...primary);
    doc.rect(margin, y, 3, 8, 'F');
    doc.setTextColor(...primary);
    doc.setFontSize(12);
    doc.setFont(FONT, 'bold');
    doc.text('Sonraki Adımlar', margin + 7, y + 6);
    y += 12;

    const adimlarData = data.sonraki_adimlar.filter(a => a.trim()).map((a, i) => [
        `${i + 1}`,
        a,
        '[ ] Bekliyor'
    ]);

    if (adimlarData.length > 0) {
        autoTable(doc, {
            startY: y,
            head: [['#', 'Adım', 'Durum']],
            body: adimlarData,
            margin: { left: margin, right: margin },
            styles: { fontSize: 9, cellPadding: 3, font: FONT },
            headStyles: { fillColor: primary, textColor: white, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: lightBg },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
                2: { cellWidth: 25, halign: 'center' },
            },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
    }

    // ---- GENEL DEĞERLENDİRME ----
    if (data.genel_degerlendirme.trim()) {
        if (y > 230) { doc.addPage(); y = 20; }

        doc.setFillColor(...lightBg);
        doc.roundedRect(margin, y, contentWidth, 5 + Math.ceil(data.genel_degerlendirme.length / 80) * 5 + 5, 3, 3, 'F');

        doc.setTextColor(...primary);
        doc.setFontSize(10);
        doc.setFont(FONT, 'bold');
        doc.text('Genel Değerlendirme', margin + 5, y + 7);

        doc.setFont(FONT, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textDark);
        const gLines = doc.splitTextToSize(data.genel_degerlendirme, contentWidth - 10);
        doc.text(gLines, margin + 5, y + 14);
        y += gLines.length * 5 + 20;
    }

    // ---- FOTOĞRAFLAR ----
    const photos = (data.photos || []).filter(p => p.url);
    if (photos.length > 0) {
        doc.addPage();
        y = 20;

        doc.setFillColor(...accent);
        doc.rect(margin, y, 3, 8, 'F');
        doc.setTextColor(...primary);
        doc.setFontSize(12);
        doc.setFont(FONT, 'bold');
        doc.text('Ziyaret Fotoğrafları', margin + 7, y + 6);
        y += 14;

        const imgW = (contentWidth - 6) / 2;
        const imgH = 60;

        for (let i = 0; i < photos.length; i++) {
            const col = i % 2;
            if (col === 0 && i > 0) y += imgH + 14;
            if (y + imgH > 260) { doc.addPage(); y = 20; }

            const px = margin + col * (imgW + 6);
            try {
                const photoUrl = photos[i].url.startsWith('http') ? photos[i].url : `${API_URL}${photos[i].url}`;
                const resp = await fetch(photoUrl);
                const blob = await resp.blob();
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
                doc.addImage(base64, 'JPEG', px, y, imgW, imgH);
            } catch {
                doc.setFillColor(230, 230, 230);
                doc.roundedRect(px, y, imgW, imgH, 2, 2, 'F');
                doc.setTextColor(150, 150, 150);
                doc.setFontSize(8);
                doc.text('Foto yüklenemedi', px + imgW / 2, y + imgH / 2, { align: 'center' });
            }
            if (photos[i].caption) {
                doc.setFont(FONT, 'normal');
                doc.setFontSize(7);
                doc.setTextColor(...textDark);
                doc.text(photos[i].caption, px, y + imgH + 4);
            }
        }
        y += imgH + 14;
    }

    // ---- FOOTER ----
    const totalPages = doc.internal.pages.length - 1;
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        const pageH = doc.internal.pageSize.getHeight();

        // Footer line
        doc.setDrawColor(...accent);
        doc.setLineWidth(0.5);
        doc.line(margin, pageH - 15, pageWidth - margin, pageH - 15);

        // Footer text
        doc.setTextColor(...textGray);
        doc.setFontSize(7);
        doc.setFont(FONT, 'normal');
        doc.text('ArslanOps | info@arslanops.com | +90 539 233 11 474', margin, pageH - 10);
        doc.text(`Sayfa ${p} / ${totalPages}`, pageWidth - margin, pageH - 10, { align: 'right' });

        // Confidential text
        doc.setFontSize(6);
        doc.setTextColor(180, 180, 180);
        doc.text('Bu rapor gizlidir ve yalnızca ilgili işletme yönetimi ile paylaşılmalıdır.', pageWidth / 2, pageH - 6, { align: 'center' });
    }

    // Save — manual blob download to guarantee correct filename
    const fileName = `Durum_Ozeti_${data.isletme_adi.replace(/\s+/g, '_') || 'Rapor'}_${data.ziyaret_tarihi}.pdf`;
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
}


/* ------------------------------------------------------------------ */
/*  UI Sub-components (OUTSIDE the main form to prevent focus loss)     */
/* ------------------------------------------------------------------ */

type ListField = 'guclu_yanlar' | 'kritik_tespitler' | 'oneriler' | 'sonraki_adimlar';

function SectionCard({ title, icon: Icon, color, children }: { title: string; icon: any; color: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100" style={{ background: `linear-gradient(135deg, ${color}10, ${color}05)` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <h3 className="font-bold text-[#0B1F3B] text-sm">{title}</h3>
            </div>
            <div className="p-6 space-y-4">{children}</div>
        </div>
    );
}

function ListEditor({ items, field, placeholder, color, onUpdateItem, onAddItem, onRemoveItem }: {
    items: string[];
    field: ListField;
    placeholder: string;
    color: string;
    onUpdateItem: (field: ListField, index: number, value: string) => void;
    onAddItem: (field: ListField) => void;
    onRemoveItem: (field: ListField, index: number) => void;
}) {
    return (
        <div className="space-y-2">
            {items.map((item, i) => (
                <div key={`${field}-${i}`} className="flex gap-2">
                    <div className="w-2 h-2 rounded-full mt-3 flex-shrink-0" style={{ backgroundColor: color }} />
                    <input
                        type="text"
                        value={item}
                        onChange={(e) => onUpdateItem(field, i, e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none"
                    />
                    <button onClick={() => onRemoveItem(field, i)} className="text-gray-400 hover:text-red-500 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            ))}
            <button onClick={() => onAddItem(field)} className="flex items-center gap-1.5 text-xs text-[#C4803D] hover:text-[#A66A30] font-medium mt-1">
                <Plus className="w-3.5 h-3.5" /> Madde Ekle
            </button>
        </div>
    );
}

function SkorSlider({ label, field, value, onUpdate }: { label: string; field: keyof DurumOzetiData; value: number; onUpdate: (field: keyof DurumOzetiData, value: any) => void }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${skorRenk(value)}20`, color: skorRenk(value) }}>
                    {value}/10 — {skorLabel(value)}
                </span>
            </div>
            <input
                type="range"
                min={0}
                max={10}
                value={value}
                onChange={(e) => onUpdate(field, Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                    background: `linear-gradient(to right, ${skorRenk(value)} 0%, ${skorRenk(value)} ${value * 10}%, #e5e7eb ${value * 10}%, #e5e7eb 100%)`,
                }}
            />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Form Bileşeni                                                      */
/* ------------------------------------------------------------------ */
export default function DurumOzetiForm() {
    const [data, setData] = useState<DurumOzetiData>(INITIAL_DATA);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [reports, setReports] = useState<ReportSummary[]>([]);
    const [showReports, setShowReports] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [comparison, setComparison] = useState<any[]>([]);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const authHeader = 'Basic ' + btoa('admin:arslanops2024');

    // Raporları yükle
    const fetchReports = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/reports`, { headers: { Authorization: authHeader } });
            if (res.ok) setReports(await res.json());
        } catch { /* silent */ }
    }, []);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    // Aynı işletmenin önceki raporlarını yükle (karşılaştırma)
    useEffect(() => {
        if (!data.isletme_adi || data.isletme_adi.length < 2) { setComparison([]); return; }
        const t = setTimeout(async () => {
            try {
                const res = await fetch(`${API_URL}/api/reports/business/${encodeURIComponent(data.isletme_adi)}`, { headers: { Authorization: authHeader } });
                if (res.ok) {
                    const prev = await res.json();
                    setComparison(prev.filter((r: any) => r.id !== data.id));
                }
            } catch { /* silent */ }
        }, 500);
        return () => clearTimeout(t);
    }, [data.isletme_adi, data.id]);

    const update = (field: keyof DurumOzetiData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const updateList = (field: ListField, index: number, value: string) => {
        setData(prev => {
            const list = [...prev[field]];
            list[index] = value;
            return { ...prev, [field]: list };
        });
    };

    const addListItem = (field: ListField) => {
        setData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeListItem = (field: ListField, index: number) => {
        setData(prev => {
            const list = prev[field].filter((_: any, i: number) => i !== index);
            return { ...prev, [field]: list.length === 0 ? [''] : list };
        });
    };

    // Fotoğraf yükle
    const uploadPhoto = async (file: File) => {
        setUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'report_photos');
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST', headers: { Authorization: authHeader }, body: formData,
            });
            if (res.ok) {
                const { url } = await res.json();
                setData(prev => ({ ...prev, photos: [...prev.photos, { url, caption: '' }] }));
            }
        } catch (e) { console.error(e); }
        setUploadingPhoto(false);
    };

    const removePhoto = (index: number) => {
        setData(prev => ({ ...prev, photos: prev.photos.filter((_: any, i: number) => i !== index) }));
    };

    const updatePhotoCaption = (index: number, caption: string) => {
        setData(prev => {
            const photos = [...prev.photos];
            photos[index] = { ...photos[index], caption };
            return { ...prev, photos };
        });
    };

    // Rapor kaydet
    const saveReport = async () => {
        setSaving(true);
        try {
            const method = data.id ? 'PUT' : 'POST';
            const url = data.id ? `${API_URL}/api/reports/${data.id}` : `${API_URL}/api/reports`;
            const res = await fetch(url, {
                method, headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                const result = await res.json();
                if (!data.id && result.id) setData(prev => ({ ...prev, id: result.id }));
                setStatusMsg('✓ Rapor kaydedildi!');
                fetchReports();
            } else { setStatusMsg('✗ Kaydetme hatası'); }
        } catch { setStatusMsg('✗ Bağlantı hatası'); }
        setSaving(false);
        setTimeout(() => setStatusMsg(''), 3000);
    };

    // Rapor yükle
    const loadReport = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/api/reports/${id}`, { headers: { Authorization: authHeader } });
            if (res.ok) {
                const report = await res.json();
                setData({ ...INITIAL_DATA, ...report });
                setShowReports(false);
                setStatusMsg('✓ Rapor yüklendi');
                setTimeout(() => setStatusMsg(''), 3000);
            }
        } catch { /* silent */ }
    };

    // Rapor sil
    const deleteReport = async (id: string) => {
        if (!confirm('Bu raporu silmek istediğinizden emin misiniz?')) return;
        try {
            await fetch(`${API_URL}/api/reports/${id}`, { method: 'DELETE', headers: { Authorization: authHeader } });
            fetchReports();
            if (data.id === id) setData(INITIAL_DATA);
        } catch { /* silent */ }
    };

    // Yeni rapor
    const newReport = () => {
        setData(INITIAL_DATA);
        setComparison([]);
        setStatusMsg('');
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try { await generatePDF(data); }
        catch (err) { console.error('PDF hatası:', err); alert('PDF oluşturulurken hata oluştu.'); }
        finally { setGenerating(false); }
    };

    const toplamSkor = Math.round(
        [data.skor_maliyet, data.skor_stok, data.skor_operasyon, data.skor_personel, data.skor_hijyen, data.skor_musteri]
            .reduce((a, b) => a + b, 0) / 6 * 10
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Durum mesajı */}
            {statusMsg && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${statusMsg.startsWith('✓') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {statusMsg}
                </div>
            )}

            {/* Başlık + Aksiyonlar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-bold text-[#0B1F3B] flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#C4803D]" />
                        Durum Özeti Raporu
                        {data.id && <span className="text-xs font-normal text-gray-400 ml-2">#{data.id.slice(0, 6)}</span>}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Formu doldurun, profesyonel PDF rapor otomatik oluşturulsun</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-center mr-2">
                        <div className="text-2xl font-bold" style={{ color: skorRenk(toplamSkor / 10) }}>{toplamSkor}</div>
                        <div className="text-xs text-gray-500">/ 100</div>
                    </div>
                    <button onClick={newReport} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
                        <Plus className="w-3.5 h-3.5" /> Yeni
                    </button>
                    <button onClick={() => setShowReports(!showReports)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
                        <FolderOpen className="w-3.5 h-3.5" /> Raporlar {reports.length > 0 && `(${reports.length})`}
                    </button>
                    <button onClick={saveReport} disabled={saving || !data.isletme_adi}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#C4803D] text-white rounded-lg text-xs font-semibold hover:bg-[#A66A30] disabled:opacity-50 transition">
                        <Save className="w-3.5 h-3.5" /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    <button onClick={handleGenerate} disabled={generating || !data.isletme_adi}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0B1F3B] text-white rounded-xl font-semibold text-sm hover:bg-[#0B1F3B]/90 disabled:opacity-50 transition-all shadow-lg">
                        <Download className="w-4 h-4" /> {generating ? 'Oluşturuluyor...' : 'PDF İndir'}
                    </button>
                </div>
            </div>

            {/* Kayıtlı Raporlar Paneli */}
            {showReports && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 space-y-2">
                    <h3 className="font-bold text-sm text-[#0B1F3B] flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-[#C4803D]" /> Kayıtlı Raporlar
                    </h3>
                    {reports.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">Henüz kayıtlı rapor yok</p>
                    ) : (
                        <div className="grid gap-2 max-h-60 overflow-y-auto">
                            {reports.map(r => (
                                <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition ${data.id === r.id ? 'border-[#C4803D] bg-[#C4803D]/5' : 'border-gray-100'}`}>
                                    <div className="flex-1" onClick={() => loadReport(r.id)}>
                                        <span className="font-semibold text-sm text-[#0B1F3B]">{r.isletme_adi || 'İsimsiz'}</span>
                                        <span className="text-xs text-gray-400 ml-2">{r.ziyaret_tarihi}</span>
                                        <span className="text-xs font-bold ml-2" style={{ color: skorRenk(r.toplam_skor / 10) }}>{r.toplam_skor}/100</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); deleteReport(r.id); }} className="text-gray-300 hover:text-red-500 p-1">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Karşılaştırma Grafiği */}
            {comparison.length > 0 && (
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                    <h3 className="font-bold text-sm text-[#0B1F3B] flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-blue-500" /> Önceki Ziyaretlerle Karşılaştırma — {data.isletme_adi}
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 text-gray-500">Tarih</th>
                                    <th className="text-center py-2 text-gray-500">Maliyet</th>
                                    <th className="text-center py-2 text-gray-500">Stok</th>
                                    <th className="text-center py-2 text-gray-500">Operasyon</th>
                                    <th className="text-center py-2 text-gray-500">Personel</th>
                                    <th className="text-center py-2 text-gray-500">Hijyen</th>
                                    <th className="text-center py-2 text-gray-500">Müşteri</th>
                                    <th className="text-center py-2 font-bold text-[#0B1F3B]">Toplam</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparison.map((r: any) => (
                                    <tr key={r.id} className="border-b border-gray-50">
                                        <td className="py-2 text-gray-600">{r.ziyaret_tarihi}</td>
                                        <td className="py-2 text-center">{r.skor_maliyet}</td>
                                        <td className="py-2 text-center">{r.skor_stok}</td>
                                        <td className="py-2 text-center">{r.skor_operasyon}</td>
                                        <td className="py-2 text-center">{r.skor_personel}</td>
                                        <td className="py-2 text-center">{r.skor_hijyen}</td>
                                        <td className="py-2 text-center">{r.skor_musteri}</td>
                                        <td className="py-2 text-center font-bold" style={{ color: skorRenk(r.toplam_skor / 10) }}>{r.toplam_skor}</td>
                                    </tr>
                                ))}
                                <tr className="bg-[#C4803D]/5 font-bold">
                                    <td className="py-2 text-[#C4803D]">Şimdi</td>
                                    <td className="py-2 text-center">{data.skor_maliyet}</td>
                                    <td className="py-2 text-center">{data.skor_stok}</td>
                                    <td className="py-2 text-center">{data.skor_operasyon}</td>
                                    <td className="py-2 text-center">{data.skor_personel}</td>
                                    <td className="py-2 text-center">{data.skor_hijyen}</td>
                                    <td className="py-2 text-center">{data.skor_musteri}</td>
                                    <td className="py-2 text-center" style={{ color: skorRenk(toplamSkor / 10) }}>{toplamSkor}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 1. İşletme Bilgileri */}
            <SectionCard title="İşletme Bilgileri" icon={Building2} color="#0B1F3B" >
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">İşletme Adı *</label>
                        <input type="text" value={data.isletme_adi} onChange={(e) => update('isletme_adi', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none"
                            placeholder="Cafe Noir" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">İşletme Türü</label>
                        <select value={data.isletme_turu} onChange={(e) => update('isletme_turu', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none">
                            {Object.entries(ISLETME_TURLERI).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Konum</label>
                        <input type="text" value={data.konum} onChange={(e) => update('konum', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none"
                            placeholder="İstanbul, Kadıköy" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">İşletme Sahibi</label>
                        <input type="text" value={data.isletme_sahibi} onChange={(e) => update('isletme_sahibi', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none"
                            placeholder="Ahmet Yılmaz" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Kapasite (Kişi)</label>
                        <input type="number" value={data.kapasite} onChange={(e) => update('kapasite', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none"
                            placeholder="60" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Personel Sayısı</label>
                        <input type="number" value={data.personel_sayisi} onChange={(e) => update('personel_sayisi', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none"
                            placeholder="8" />
                    </div>
                </div>
            </SectionCard >

            {/* 2. Ziyaret Bilgileri */}
            < SectionCard title="Ziyaret Bilgileri" icon={Calendar} color="#2B4C7E" >
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Ziyaret Tarihi</label>
                        <input type="date" value={data.ziyaret_tarihi} onChange={(e) => update('ziyaret_tarihi', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Gözlem Süresi (Saat)</label>
                        <input type="number" value={data.gozlem_suresi} onChange={(e) => update('gozlem_suresi', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none"
                            placeholder="4" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Danışman</label>
                        <input type="text" value={data.danisman_adi} onChange={(e) => update('danisman_adi', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none"
                            placeholder="İlhan Arslan" />
                    </div>
                </div>
            </SectionCard >

            {/* 3. Skorlama */}
            < SectionCard title={`Performans Skorlaması — Genel: ${toplamSkor}/100`
            } icon={Star} color="#C4803D" >
                <div className="space-y-4">
                    <SkorSlider label="Maliyet Kontrolü" field="skor_maliyet" value={data.skor_maliyet} onUpdate={update} />
                    <SkorSlider label="Stok Yönetimi" field="skor_stok" value={data.skor_stok} onUpdate={update} />
                    <SkorSlider label="Operasyon Düzeni" field="skor_operasyon" value={data.skor_operasyon} onUpdate={update} />
                    <SkorSlider label="Personel Yönetimi" field="skor_personel" value={data.skor_personel} onUpdate={update} />
                    <SkorSlider label="Hijyen & Kalite" field="skor_hijyen" value={data.skor_hijyen} onUpdate={update} />
                    <SkorSlider label="Müşteri Deneyimi" field="skor_musteri" value={data.skor_musteri} onUpdate={update} />
                </div>
            </SectionCard >

            {/* 4. Maliyet Analizi */}
            < SectionCard title="Maliyet Analizi" icon={BarChart3} color="#ef4444" >
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Mevcut COGS Oranı (%)</label>
                        <input type="number" value={data.mevcut_cogs} onChange={(e) => update('mevcut_cogs', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none"
                            placeholder="38" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Hedef COGS (%)</label>
                        <input type="text" value={data.hedef_cogs} onChange={(e) => update('hedef_cogs', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none"
                            placeholder="28-32" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Fire Oranı (%)</label>
                        <input type="number" value={data.fire_orani} onChange={(e) => update('fire_orani', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none"
                            placeholder="5" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Personel Maliyet Oranı (%)</label>
                        <input type="number" value={data.personel_maliyet} onChange={(e) => update('personel_maliyet', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none"
                            placeholder="28" />
                    </div>
                </div>
            </SectionCard >

            {/* 5. Güçlü Yanlar */}
            < SectionCard title="Güçlü Yanlar" icon={CheckCircle} color="#22c55e" >
                <ListEditor items={data.guclu_yanlar} field="guclu_yanlar" placeholder="Örn: Ürün kalitesi yüksek, müşteri memnuniyeti iyi" color="#22c55e" onUpdateItem={updateList} onAddItem={addListItem} onRemoveItem={removeListItem} />
            </SectionCard >

            {/* 6. Kritik Tespitler */}
            < SectionCard title="Kritik Tespitler" icon={AlertTriangle} color="#ef4444" >
                <ListEditor items={data.kritik_tespitler} field="kritik_tespitler" placeholder="Örn: COGS takibi yapılmıyor, kasa-stok uyuşmazlığı var" color="#ef4444" onUpdateItem={updateList} onAddItem={addListItem} onRemoveItem={removeListItem} />
            </SectionCard >

            {/* 7. Öneriler */}
            < SectionCard title="Öneriler" icon={Lightbulb} color="#C4803D" >
                <ListEditor items={data.oneriler} field="oneriler" placeholder="Örn: Günlük sayım sistemi kurulmalı, reçete kartları oluşturulmalı" color="#C4803D" onUpdateItem={updateList} onAddItem={addListItem} onRemoveItem={removeListItem} />
            </SectionCard >

            {/* 8. Sonraki Adımlar */}
            < SectionCard title="Sonraki Adımlar" icon={FileText} color="#0B1F3B" >
                <ListEditor items={data.sonraki_adimlar} field="sonraki_adimlar" placeholder="Örn: 1. hafta — Reçete kartlarını oluştur" color="#0B1F3B" onUpdateItem={updateList} onAddItem={addListItem} onRemoveItem={removeListItem} />
            </SectionCard >

            {/* 9. Genel Değerlendirme */}
            < div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" >
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="font-bold text-[#0B1F3B] text-sm">Genel Değerlendirme (Serbest Not)</h3>
                </div>
                <div className="p-6">
                    <textarea
                        value={data.genel_degerlendirme}
                        onChange={(e) => update('genel_degerlendirme', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none resize-none"
                        placeholder="İşletmenin genel durumu hakkında özet notlarınızı yazın..."
                    />
                </div>
            </div>

            {/* 9.5 Fotoğraflar */}
            <SectionCard title="Ziyaret Fotoğrafları" icon={Image} color="#6366f1">
                <div className="space-y-3">
                    {data.photos.map((photo, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <img src={`${API_URL}${photo.url}`} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                            <div className="flex-1">
                                <input
                                    type="text" value={photo.caption}
                                    onChange={(e) => updatePhotoCaption(i, e.target.value)}
                                    placeholder="Fotoğraf açıklaması..."
                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none"
                                />
                            </div>
                            <button onClick={() => removePhoto(i)} className="text-gray-400 hover:text-red-500 p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#C4803D] hover:bg-[#C4803D]/5 transition">
                        <input type="file" accept="image/*" multiple className="hidden"
                            onChange={(e) => { Array.from(e.target.files || []).forEach(f => uploadPhoto(f)); e.target.value = ''; }} />
                        <Image className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500">{uploadingPhoto ? 'Yükleniyor...' : 'Fotoğraf Ekle (tıkla veya sürükle)'}</span>
                    </label>
                </div>
            </SectionCard>

            {/* PDF İndir Butonu (Alt) */}
            <div className="flex justify-end gap-3 pt-4 pb-8">
                <button onClick={saveReport} disabled={saving || !data.isletme_adi}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 border-[#C4803D] text-[#C4803D] hover:bg-[#C4803D]/10 disabled:opacity-50 transition-all">
                    <Save className="w-5 h-5" />
                    {saving ? 'Kaydediliyor...' : 'Raporu Kaydet'}
                </button>
                <button
                    onClick={handleGenerate}
                    disabled={generating || !data.isletme_adi}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white text-sm shadow-xl disabled:opacity-50 transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #0B1F3B 0%, #1a3a5c 100%)' }}
                >
                    <Download className="w-5 h-5" />
                    {generating ? 'PDF Oluşturuluyor...' : 'Durum Özeti PDF İndir'}
                </button>
            </div>
        </div>
    );
}
