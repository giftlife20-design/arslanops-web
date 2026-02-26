'use client';

import { useState } from 'react';
import { Plus, Trash2, Download, ClipboardList, Calendar, User, Flag } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface AksiyonItem {
    gorev: string;
    kategori: string;
    oncelik: 'yuksek' | 'orta' | 'dusuk';
    sorumlu: string;
    baslangic: string;
    bitis: string;
    durum: 'bekliyor' | 'devam' | 'tamamlandi';
    notlar: string;
}

const KATEGORILER = [
    'Maliyet Kontrolü',
    'Stok Yönetimi',
    'Operasyon',
    'Personel',
    'Hijyen & Kalite',
    'Müşteri Deneyimi',
    'Menü & Ürün',
    'Pazarlama',
    'Genel',
];

const ONCELIK_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    yuksek: { label: 'Yüksek', color: '#ef4444', bg: '#fef2f2' },
    orta: { label: 'Orta', color: '#f59e0b', bg: '#fffbeb' },
    dusuk: { label: 'Düşük', color: '#22c55e', bg: '#f0fdf4' },
};

const DURUM_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    bekliyor: { label: 'Bekliyor', color: '#6b7280', bg: '#f3f4f6' },
    devam: { label: 'Devam Ediyor', color: '#3b82f6', bg: '#eff6ff' },
    tamamlandi: { label: 'Tamamlandı', color: '#22c55e', bg: '#f0fdf4' },
};

const EMPTY_ITEM: AksiyonItem = {
    gorev: '',
    kategori: 'Genel',
    oncelik: 'orta',
    sorumlu: '',
    baslangic: new Date().toISOString().split('T')[0],
    bitis: '',
    durum: 'bekliyor',
    notlar: '',
};

/* ------------------------------------------------------------------ */
/*  Excel Export                                                        */
/* ------------------------------------------------------------------ */
async function exportExcel(isletmeAdi: string, items: AksiyonItem[]) {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    wb.creator = 'ArslanOps';
    wb.created = new Date();

    const ws = wb.addWorksheet('Aksiyon Planı', {
        properties: { tabColor: { argb: 'FFC4803D' } },
    });

    // ---- HEADER ROW (merged title) ----
    ws.mergeCells('A1:H1');
    const titleCell = ws.getCell('A1');
    titleCell.value = `ArslanOps — Aksiyon Planı: ${isletmeAdi || 'İşletme'}`;
    titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1F3B' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 40;

    // ---- DATE ROW ----
    ws.mergeCells('A2:H2');
    const dateCell = ws.getCell('A2');
    dateCell.value = `Oluşturma Tarihi: ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    dateCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF666666' } };
    dateCell.alignment = { horizontal: 'center' };
    ws.getRow(2).height = 22;

    // ---- COLUMN HEADERS ----
    const headers = ['#', 'Görev / Aksiyon', 'Kategori', 'Öncelik', 'Sorumlu', 'Başlangıç', 'Bitiş', 'Durum'];
    const headerRow = ws.addRow(headers);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC4803D' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
            bottom: { style: 'medium', color: { argb: 'FF996633' } },
        };
    });

    // ---- DATA ROWS ----
    items.forEach((item, i) => {
        const row = ws.addRow([
            i + 1,
            item.gorev,
            item.kategori,
            ONCELIK_LABELS[item.oncelik]?.label || item.oncelik,
            item.sorumlu,
            item.baslangic,
            item.bitis || '-',
            DURUM_LABELS[item.durum]?.label || item.durum,
        ]);

        row.height = 24;
        row.eachCell((cell, colNumber) => {
            cell.font = { name: 'Calibri', size: 10 };
            cell.alignment = { vertical: 'middle', wrapText: true };
            cell.border = {
                bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            };

            // Zebra striping
            if (i % 2 === 1) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            }

            // Center number column
            if (colNumber === 1) {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.font = { name: 'Calibri', size: 10, bold: true };
            }

            // Priority color
            if (colNumber === 4) {
                const p = ONCELIK_LABELS[item.oncelik];
                if (p) {
                    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF' + p.color.slice(1) } };
                }
            }

            // Status color
            if (colNumber === 8) {
                const d = DURUM_LABELS[item.durum];
                if (d) {
                    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF' + d.color.slice(1) } };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + d.bg.slice(1) } };
                }
            }
        });
    });

    // ---- NOTLAR satırları (ayrı sheet) ----
    const hasNotes = items.some(it => it.notlar.trim());
    if (hasNotes) {
        const ns = wb.addWorksheet('Notlar');
        ns.mergeCells('A1:C1');
        const nt = ns.getCell('A1');
        nt.value = 'Aksiyon Notları';
        nt.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0B1F3B' } };
        ns.getRow(1).height = 32;

        const nh = ns.addRow(['#', 'Görev', 'Notlar']);
        nh.eachCell(c => {
            c.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1F3B' } };
        });

        items.forEach((item, i) => {
            if (item.notlar.trim()) {
                ns.addRow([i + 1, item.gorev, item.notlar]);
            }
        });

        ns.columns = [
            { width: 6 },
            { width: 40 },
            { width: 60 },
        ];
    }

    // ---- COLUMN WIDTHS ----
    ws.columns = [
        { width: 6 },   // #
        { width: 45 },  // Görev
        { width: 18 },  // Kategori
        { width: 12 },  // Öncelik
        { width: 18 },  // Sorumlu
        { width: 14 },  // Başlangıç
        { width: 14 },  // Bitiş
        { width: 16 },  // Durum
    ];

    // ---- SUMMARY ROW ----
    const summaryRowIdx = items.length + 4;
    ws.mergeCells(`A${summaryRowIdx}:H${summaryRowIdx}`);
    const sc = ws.getCell(`A${summaryRowIdx}`);
    const bekleyen = items.filter(i => i.durum === 'bekliyor').length;
    const devam = items.filter(i => i.durum === 'devam').length;
    const tamam = items.filter(i => i.durum === 'tamamlandi').length;
    sc.value = `Toplam: ${items.length} aksiyon | Bekliyor: ${bekleyen} | Devam: ${devam} | Tamamlandı: ${tamam}`;
    sc.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF666666' } };
    sc.alignment = { horizontal: 'center' };

    // ---- DOWNLOAD ----
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aksiyon_Plani_${isletmeAdi.replace(/\s+/g, '_') || 'Isletme'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function AksiyonPlani() {
    const [isletmeAdi, setIsletmeAdi] = useState('');
    const [items, setItems] = useState<AksiyonItem[]>([{ ...EMPTY_ITEM }]);
    const [exporting, setExporting] = useState(false);

    const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }]);

    const removeItem = (index: number) => {
        setItems(prev => prev.length === 1 ? [{ ...EMPTY_ITEM }] : prev.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof AksiyonItem, value: string) => {
        setItems(prev => {
            const list = [...prev];
            list[index] = { ...list[index], [field]: value };
            return list;
        });
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await exportExcel(isletmeAdi, items.filter(it => it.gorev.trim()));
        } catch (err) {
            console.error('Excel hatası:', err);
            alert('Excel oluşturulurken hata oluştu.');
        }
        setExporting(false);
    };

    const tamamlanan = items.filter(i => i.durum === 'tamamlandi').length;
    const toplam = items.filter(i => i.gorev.trim()).length;
    const ilerleme = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0;

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Başlık */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-bold text-[#0B1F3B] flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-[#C4803D]" />
                        Aksiyon Planı
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Danışmanlık sonrası görev ve aksiyonları planlayın, Excel olarak indirin</p>
                </div>
                <div className="flex items-center gap-3">
                    {toplam > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-[#22c55e] rounded-full transition-all" style={{ width: `${ilerleme}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-gray-500">{ilerleme}%</span>
                        </div>
                    )}
                    <button
                        onClick={handleExport}
                        disabled={exporting || !isletmeAdi || toplam === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0B1F3B] text-white rounded-xl font-semibold text-sm hover:bg-[#0B1F3B]/90 disabled:opacity-50 transition-all shadow-lg"
                    >
                        <Download className="w-4 h-4" />
                        {exporting ? 'Oluşturuluyor...' : 'Excel İndir'}
                    </button>
                </div>
            </div>

            {/* İşletme Adı */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <label className="block text-xs font-semibold text-gray-600 mb-1">İşletme Adı *</label>
                <input
                    type="text" value={isletmeAdi} onChange={(e) => setIsletmeAdi(e.target.value)}
                    placeholder="Cafe Noir"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none"
                />
            </div>

            {/* Aksiyon Listesi */}
            <div className="space-y-4">
                {items.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#C4803D] text-white text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                                <select value={item.durum} onChange={(e) => updateItem(idx, 'durum', e.target.value)}
                                    className="text-xs font-semibold px-2 py-1 rounded-full border-0 outline-none"
                                    style={{
                                        color: DURUM_LABELS[item.durum]?.color,
                                        backgroundColor: DURUM_LABELS[item.durum]?.bg,
                                    }}>
                                    {Object.entries(DURUM_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    ))}
                                </select>
                                <select value={item.oncelik} onChange={(e) => updateItem(idx, 'oncelik', e.target.value)}
                                    className="text-xs font-semibold px-2 py-1 rounded-full border-0 outline-none"
                                    style={{
                                        color: ONCELIK_LABELS[item.oncelik]?.color,
                                        backgroundColor: ONCELIK_LABELS[item.oncelik]?.bg,
                                    }}>
                                    {Object.entries(ONCELIK_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    ))}
                                </select>
                            </div>
                            <button onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-500 p-1 transition">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            <input type="text" value={item.gorev} onChange={(e) => updateItem(idx, 'gorev', e.target.value)}
                                placeholder="Görev / Aksiyon tanımı..."
                                className="w-full px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none" />

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                    <label className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 mb-1">
                                        <Flag className="w-3 h-3" /> Kategori
                                    </label>
                                    <select value={item.kategori} onChange={(e) => updateItem(idx, 'kategori', e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none">
                                        {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 mb-1">
                                        <User className="w-3 h-3" /> Sorumlu
                                    </label>
                                    <input type="text" value={item.sorumlu} onChange={(e) => updateItem(idx, 'sorumlu', e.target.value)}
                                        placeholder="İsim..."
                                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none" />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 mb-1">
                                        <Calendar className="w-3 h-3" /> Başlangıç
                                    </label>
                                    <input type="date" value={item.baslangic} onChange={(e) => updateItem(idx, 'baslangic', e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none" />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 mb-1">
                                        <Calendar className="w-3 h-3" /> Bitiş
                                    </label>
                                    <input type="date" value={item.bitis} onChange={(e) => updateItem(idx, 'bitis', e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none" />
                                </div>
                            </div>

                            <textarea value={item.notlar} onChange={(e) => updateItem(idx, 'notlar', e.target.value)}
                                placeholder="Notlar (opsiyonel)..."
                                rows={2}
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none resize-none" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Aksiyon Ekle */}
            <button onClick={addItem}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-400 hover:border-[#C4803D] hover:text-[#C4803D] transition">
                <Plus className="w-4 h-4" /> Yeni Aksiyon Ekle
            </button>

            {/* Alt Excel Butonu */}
            <div className="flex justify-end pt-2 pb-8">
                <button
                    onClick={handleExport}
                    disabled={exporting || !isletmeAdi || toplam === 0}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white text-sm shadow-xl disabled:opacity-50 transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #0B1F3B 0%, #1a3a5c 100%)' }}
                >
                    <Download className="w-5 h-5" />
                    {exporting ? 'Excel Oluşturuluyor...' : 'Aksiyon Planı Excel İndir'}
                </button>
            </div>
        </div>
    );
}
