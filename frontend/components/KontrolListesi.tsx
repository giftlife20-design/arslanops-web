'use client';

import { useState, useMemo } from 'react';
import { Download, ClipboardCheck, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, MessageSquare, Camera, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */
interface CheckItem {
    id: string;
    text: string;
    checked: boolean;
    not: string;
    onem: 'kritik' | 'onemli' | 'normal';
    photo: string;
}

interface CheckCategory {
    id: string;
    title: string;
    emoji: string;
    color: string;
    items: CheckItem[];
    collapsed: boolean;
}

const ONEM_STYLES: Record<string, { label: string; color: string; bg: string }> = {
    kritik: { label: 'Kritik', color: '#ef4444', bg: '#fef2f2' },
    onemli: { label: 'Önemli', color: '#f59e0b', bg: '#fffbeb' },
    normal: { label: 'Normal', color: '#6b7280', bg: '#f3f4f6' },
};

function makeItem(text: string, onem: 'kritik' | 'onemli' | 'normal' = 'normal'): CheckItem {
    return { id: Math.random().toString(36).slice(2, 8), text, checked: false, not: '', onem, photo: '' };
}

const DEFAULT_CATEGORIES: CheckCategory[] = [
    {
        id: 'hijyen', title: 'Hijyen & Temizlik', emoji: '🧹', color: '#10b981', collapsed: false,
        items: [
            makeItem('Personel el yıkama prosedürüne uyuyor mu?', 'kritik'),
            makeItem('Personel bone, eldiven ve önlük kullanıyor mu?', 'kritik'),
            makeItem('Mutfak yüzeyleri temiz ve dezenfekte mi?', 'kritik'),
            makeItem('Bulaşık yıkama süreci hijyenik mi?', 'onemli'),
            makeItem('Çöp kovaları kapaklı ve düzenli boşaltılıyor mu?', 'onemli'),
            makeItem('Tuvalet ve lavabolar temiz mi?', 'onemli'),
            makeItem('Haşere kontrolü yapılıyor mu? (Son rapor tarihi)', 'kritik'),
            makeItem('Temizlik çizelgesi mevcut ve güncel mi?', 'onemli'),
            makeItem('Kimyasal temizlik malzemeleri uygun depolanıyor mu?', 'normal'),
            makeItem('Salon ve masalar düzenli temizleniyor mu?', 'normal'),
        ],
    },
    {
        id: 'mutfak', title: 'Mutfak & Depolama', emoji: '🍳', color: '#f59e0b', collapsed: false,
        items: [
            makeItem('Soğuk zincir sıcaklıkları uygun mu? (Buzdolabı ≤4°C)', 'kritik'),
            makeItem('Dondurucular uygun sıcaklıkta mı? (≤-18°C)', 'kritik'),
            makeItem('Hammadde FIFO (İlk Giren İlk Çıkar) kuralına uyuluyor mu?', 'kritik'),
            makeItem('Ürün etiketleme ve tarih takibi yapılıyor mu?', 'onemli'),
            makeItem('Kuru depo düzenli ve yerden yüksekte mi?', 'onemli'),
            makeItem('Çapraz kontaminasyon önlemleri alınmış mı?', 'kritik'),
            makeItem('Pişirme sıcaklıkları kontrol ediliyor mu?', 'onemli'),
            makeItem('Reçete/porsiyon standartları belirlenmiş mi?', 'onemli'),
            makeItem('Mutfak ekipmanları çalışır ve bakımlı mı?', 'normal'),
            makeItem('Gıda atıkları ayrıştırılıyor mu?', 'normal'),
        ],
    },
    {
        id: 'servis', title: 'Servis & Müşteri Deneyimi', emoji: '☕', color: '#3b82f6', collapsed: false,
        items: [
            makeItem('Menü güncel ve fiyatlar doğru mu?', 'onemli'),
            makeItem('Sipariş alma süresi makul mü? (≤3dk)', 'onemli'),
            makeItem('Servis süresi makul mü? (Sıcak ≤12dk, Soğuk ≤5dk)', 'onemli'),
            makeItem('Personel müşteriye güler yüzlü yaklaşıyor mu?', 'onemli'),
            makeItem('Sunum standartlarına uyuluyor mu?', 'normal'),
            makeItem('Ürün bilgisi personel tarafından biliniyor mu?', 'normal'),
            makeItem('Müşteri şikayetleri kayıt altına alınıyor mu?', 'onemli'),
            makeItem('Masa düzeni ve ambiyans uygun mu?', 'normal'),
            makeItem('Alerjen bilgilendirme yapılıyor mu?', 'kritik'),
            makeItem('Paket servis/gel-al düzenli mi?', 'normal'),
        ],
    },
    {
        id: 'personel', title: 'Personel Yönetimi', emoji: '👥', color: '#8b5cf6', collapsed: false,
        items: [
            makeItem('Personel hijyen eğitimi almış mı?', 'kritik'),
            makeItem('Çalışma saatleri ve vardiya düzeni uygun mu?', 'onemli'),
            makeItem('Personel kıyafetleri temiz ve düzenli mi?', 'onemli'),
            makeItem('Görev tanımları belirlenmiş mi?', 'normal'),
            makeItem('İletişim ve koordinasyon yeterli mi?', 'normal'),
            makeItem('Personel motivasyonu ve memnuniyeti iyi mi?', 'normal'),
            makeItem('Yeni personel oryantasyon süreci var mı?', 'normal'),
            makeItem('Sağlık muayene belgeleri güncel mi?', 'kritik'),
        ],
    },
    {
        id: 'maliyet', title: 'Maliyet & Stok Kontrolü', emoji: '💰', color: '#C4803D', collapsed: false,
        items: [
            makeItem('Günlük/haftalık stok sayımı yapılıyor mu?', 'onemli'),
            makeItem('Fire ve kayıp takibi yapılıyor mu?', 'onemli'),
            makeItem('Tedarikçi fiyat karşılaştırması yapılıyor mu?', 'onemli'),
            makeItem('Maliyet analizi (COGS) hesaplanıyor mu?', 'kritik'),
            makeItem('Nakit akış takibi düzenli mi?', 'onemli'),
            makeItem('Kasa kapanışları günlük yapılıyor mu?', 'onemli'),
            makeItem('Satış raporları düzenli inceleniyor mu?', 'normal'),
            makeItem('Menü mühendisliği (kar marjı analizi) yapılmış mı?', 'normal'),
        ],
    },
    {
        id: 'guvenlik', title: 'Güvenlik & Yasal Uyumluluk', emoji: '🔒', color: '#ef4444', collapsed: false,
        items: [
            makeItem('İşyeri açma ve çalışma ruhsatı mevcut mu?', 'kritik'),
            makeItem('Yangın söndürme cihazları dolu ve erişilebilir mi?', 'kritik'),
            makeItem('Acil çıkış yolları açık ve işaretli mi?', 'kritik'),
            makeItem('İlk yardım çantası mevcut ve dolu mu?', 'onemli'),
            makeItem('Elektrik tesisatı güvenli mi?', 'onemli'),
            makeItem('Sigorta poliçeleri güncel mi?', 'onemli'),
            makeItem('Gıda güvenliği sertifikası var mı?', 'kritik'),
            makeItem('Kamera sistemi çalışıyor mu?', 'normal'),
        ],
    },
];

/* ------------------------------------------------------------------ */
/*  Excel Export                                                        */
/* ------------------------------------------------------------------ */
async function exportChecklist(isletmeAdi: string, tarih: string, categories: CheckCategory[]) {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    wb.creator = 'ArslanOps';
    wb.created = new Date();

    // ---- ÖZET SHEET ----
    const ozet = wb.addWorksheet('Özet', { properties: { tabColor: { argb: 'FFC4803D' } } });

    ozet.mergeCells('A1:E1');
    const tc = ozet.getCell('A1');
    tc.value = `ArslanOps — Kontrol Listesi: ${isletmeAdi || 'İşletme'}`;
    tc.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    tc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1F3B' } };
    tc.alignment = { horizontal: 'center', vertical: 'middle' };
    ozet.getRow(1).height = 40;

    ozet.mergeCells('A2:E2');
    const dc = ozet.getCell('A2');
    dc.value = `Ziyaret Tarihi: ${tarih} | Oluşturulma: ${new Date().toLocaleDateString('tr-TR')}`;
    dc.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF666666' } };
    dc.alignment = { horizontal: 'center' };
    ozet.getRow(2).height = 22;

    // Summary table
    const sh = ozet.addRow(['Kategori', 'Toplam', 'Tamam', 'Eksik', 'Oran']);
    sh.height = 28;
    sh.eachCell(cell => {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC4803D' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    let totalAll = 0, checkedAll = 0;
    categories.forEach(cat => {
        const total = cat.items.length;
        const checked = cat.items.filter(i => i.checked).length;
        totalAll += total;
        checkedAll += checked;
        const pct = Math.round((checked / total) * 100);
        const row = ozet.addRow([cat.title, total, checked, total - checked, `%${pct}`]);
        row.eachCell((cell, col) => {
            cell.font = { name: 'Calibri', size: 10 };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            if (col === 1) cell.alignment = { horizontal: 'left', vertical: 'middle' };
            if (col === 5) {
                cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: pct >= 80 ? 'FF22c55e' : pct >= 50 ? 'FFf59e0b' : 'FFef4444' } };
            }
            cell.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
        });
    });

    // Total row
    const totalPct = totalAll > 0 ? Math.round((checkedAll / totalAll) * 100) : 0;
    const totalRow = ozet.addRow(['TOPLAM', totalAll, checkedAll, totalAll - checkedAll, `%${totalPct}`]);
    totalRow.eachCell(cell => {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0B1F3B' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { top: { style: 'medium', color: { argb: 'FF0B1F3B' } } };
    });

    ozet.columns = [{ width: 32 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }];

    // ---- DETAY SHEET ----
    const detay = wb.addWorksheet('Detay');

    detay.mergeCells('A1:G1');
    const dt = detay.getCell('A1');
    dt.value = 'Kontrol Listesi — Detaylı Sonuçlar';
    dt.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0B1F3B' } };
    detay.getRow(1).height = 32;

    const dh = detay.addRow(['Kategori', 'Madde', 'Önem', 'Durum', 'Not', 'Fotoğraf']);
    dh.height = 26;
    dh.eachCell(cell => {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1F3B' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Fotoğrafları paralel yükle
    const allItems: { cat: string; item: CheckItem }[] = [];
    categories.forEach(cat => cat.items.forEach(item => allItems.push({ cat: cat.title, item })));

    const photoBase64: Map<string, string> = new Map();
    const photoExts: Map<string, string> = new Map();
    const photoItems = allItems.filter(a => a.item.photo);
    if (photoItems.length > 0) {
        const apiBase = typeof window !== 'undefined'
            ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
            : 'http://localhost:8000';
        const results = await Promise.allSettled(
            photoItems.map(async (a) => {
                const photoUrl = a.item.photo.startsWith('http') ? a.item.photo : `${apiBase}${a.item.photo}`;
                const res = await fetch(photoUrl);
                const blob = await res.blob();
                const arrBuf = await blob.arrayBuffer();
                const bytes = new Uint8Array(arrBuf);
                let binary = '';
                for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
                const b64 = btoa(binary);
                const ext = blob.type.includes('png') ? 'png' : 'jpeg';
                return { id: a.item.id, b64, ext };
            })
        );
        results.forEach(r => {
            if (r.status === 'fulfilled') {
                photoBase64.set(r.value.id, r.value.b64);
                photoExts.set(r.value.id, r.value.ext);
            }
        });
    }

    for (const { cat, item } of allItems) {
        const row = detay.addRow([
            cat,
            item.text,
            ONEM_STYLES[item.onem]?.label || item.onem,
            item.checked ? 'TAMAM' : 'EKSİK',
            item.not || '-',
            item.photo ? '' : '-',
        ]);
        row.eachCell((cell, col) => {
            cell.font = { name: 'Calibri', size: 9 };
            cell.alignment = { vertical: 'middle', wrapText: true };
            cell.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };

            if (col === 4) {
                cell.font = {
                    name: 'Calibri', size: 9, bold: true,
                    color: { argb: item.checked ? 'FF22c55e' : 'FFef4444' },
                };
            }
            if (col === 3) {
                const s = ONEM_STYLES[item.onem];
                if (s) cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF' + s.color.slice(1) } };
            }
        });

        // Fotoğraf ekle
        const b64 = photoBase64.get(item.id);
        if (b64) {
            const ext = (photoExts.get(item.id) || 'jpeg') as 'jpeg' | 'png';
            const imageId = wb.addImage({ base64: b64, extension: ext });
            const rowNum = row.number;
            row.height = 85;
            detay.addImage(imageId, {
                tl: { col: 5, row: rowNum - 1 },
                ext: { width: 140, height: 105 },
            });
        }
    }

    detay.columns = [{ width: 26 }, { width: 50 }, { width: 10 }, { width: 10 }, { width: 30 }, { width: 22 }];

    // ---- EKSİKLER SHEET ----
    const eksikItems = categories.flatMap(cat =>
        cat.items.filter(i => !i.checked).map(i => ({ ...i, kategori: cat.title }))
    );
    if (eksikItems.length > 0) {
        const es = wb.addWorksheet('Eksikler', { properties: { tabColor: { argb: 'FFef4444' } } });
        es.mergeCells('A1:D1');
        const et = es.getCell('A1');
        et.value = `Tamamlanmamış Maddeler (${eksikItems.length} adet)`;
        et.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFef4444' } };
        es.getRow(1).height = 30;

        const eh = es.addRow(['Kategori', 'Madde', 'Önem', 'Not']);
        eh.eachCell(cell => {
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFef4444' } };
        });

        eksikItems.forEach(item => {
            const row = es.addRow([item.kategori, item.text, ONEM_STYLES[item.onem]?.label, item.not || '-']);
            row.eachCell((cell, col) => {
                cell.font = { name: 'Calibri', size: 9 };
                cell.alignment = { wrapText: true, vertical: 'middle' };
                if (col === 3) {
                    const s = ONEM_STYLES[item.onem];
                    if (s) cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF' + s.color.slice(1) } };
                }
            });
        });

        es.columns = [{ width: 26 }, { width: 50 }, { width: 10 }, { width: 30 }];
    }

    // ---- DOWNLOAD ----
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kontrol_Listesi_${isletmeAdi.replace(/\s+/g, '_') || 'Isletme'}_${tarih}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function KontrolListesi() {
    const [isletmeAdi, setIsletmeAdi] = useState('');
    const [tarih, setTarih] = useState(new Date().toISOString().split('T')[0]);
    const [categories, setCategories] = useState<CheckCategory[]>(() =>
        DEFAULT_CATEGORIES.map(c => ({ ...c, items: c.items.map(i => ({ ...i })) }))
    );
    const [exporting, setExporting] = useState(false);
    const [uploadingId, setUploadingId] = useState('');

    const authHeader = 'Basic ' + btoa('admin:arslanops2024');

    const uploadPhoto = async (catId: string, itemId: string, file: File) => {
        setUploadingId(itemId);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'checklist_photos');
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST', headers: { Authorization: authHeader }, body: formData,
            });
            if (res.ok) {
                const { url } = await res.json();
                setCategories(prev => prev.map(c =>
                    c.id === catId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, photo: url } : i) } : c
                ));
            }
        } catch (e) { console.error(e); }
        setUploadingId('');
    };

    const removePhoto = (catId: string, itemId: string) => {
        setCategories(prev => prev.map(c =>
            c.id === catId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, photo: '' } : i) } : c
        ));
    };

    const toggleCategory = (catId: string) => {
        setCategories(prev => prev.map(c => c.id === catId ? { ...c, collapsed: !c.collapsed } : c));
    };

    const toggleItem = (catId: string, itemId: string) => {
        setCategories(prev => prev.map(c =>
            c.id === catId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i) } : c
        ));
    };

    const toggleAllInCategory = (catId: string) => {
        setCategories(prev => prev.map(c => {
            if (c.id !== catId) return c;
            const allChecked = c.items.every(i => i.checked);
            return { ...c, items: c.items.map(i => ({ ...i, checked: !allChecked })) };
        }));
    };

    const updateNote = (catId: string, itemId: string, not: string) => {
        setCategories(prev => prev.map(c =>
            c.id === catId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, not } : i) } : c
        ));
    };

    const stats = useMemo(() => {
        let total = 0, checked = 0, kritikTotal = 0, kritikChecked = 0;
        categories.forEach(c => {
            c.items.forEach(i => {
                total++;
                if (i.checked) checked++;
                if (i.onem === 'kritik') { kritikTotal++; if (i.checked) kritikChecked++; }
            });
        });
        return { total, checked, kritikTotal, kritikChecked, pct: total > 0 ? Math.round((checked / total) * 100) : 0 };
    }, [categories]);

    const handleExport = async () => {
        setExporting(true);
        try { await exportChecklist(isletmeAdi, tarih, categories); }
        catch (e) { console.error(e); alert('Excel hatası'); }
        setExporting(false);
    };

    // Skor rengi
    const pctColor = stats.pct >= 80 ? '#22c55e' : stats.pct >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Başlık */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-bold text-[#0B1F3B] flex items-center gap-2">
                        <ClipboardCheck className="w-5 h-5 text-[#C4803D]" />
                        Kontrol Listesi
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Ziyaret sırasında maddeleri işaretleyin, Excel rapor oluşturun</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Genel İlerleme */}
                    <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: pctColor }}>%{stats.pct}</div>
                        <div className="text-[10px] text-gray-500">{stats.checked}/{stats.total}</div>
                    </div>
                    <button onClick={handleExport} disabled={exporting || !isletmeAdi}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0B1F3B] text-white rounded-xl font-semibold text-sm hover:bg-[#0B1F3B]/90 disabled:opacity-50 transition-all shadow-lg">
                        <Download className="w-4 h-4" />
                        {exporting ? 'Oluşturuluyor...' : 'Excel İndir'}
                    </button>
                </div>
            </div>

            {/* İşletme + Tarih */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">İşletme Adı *</label>
                        <input type="text" value={isletmeAdi} onChange={(e) => setIsletmeAdi(e.target.value)}
                            placeholder="Cafe Noir"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Ziyaret Tarihi</label>
                        <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] outline-none" />
                    </div>
                </div>
            </div>

            {/* Kritik Uyarı */}
            {stats.kritikTotal > 0 && stats.kritikChecked < stats.kritikTotal && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-700 font-medium">
                        {stats.kritikTotal - stats.kritikChecked} kritik madde henüz tamamlanmadı!
                    </span>
                </div>
            )}

            {/* Kategoriler */}
            {categories.map(cat => {
                const catChecked = cat.items.filter(i => i.checked).length;
                const catTotal = cat.items.length;
                const catPct = Math.round((catChecked / catTotal) * 100);
                const catColor = catPct >= 80 ? '#22c55e' : catPct >= 50 ? '#f59e0b' : '#ef4444';

                return (
                    <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Kategori Başlığı */}
                        <div
                            className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                            onClick={() => toggleCategory(cat.id)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{cat.emoji}</span>
                                <h3 className="font-bold text-sm text-[#0B1F3B]">{cat.title}</h3>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: catColor, backgroundColor: `${catColor}15` }}>
                                    {catChecked}/{catTotal}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Mini progress bar */}
                                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${catPct}%`, backgroundColor: catColor }} />
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); toggleAllInCategory(cat.id); }}
                                    className="text-[10px] font-semibold text-[#C4803D] hover:text-[#A66A30] px-2 py-1 rounded hover:bg-[#C4803D]/10 transition">
                                    {cat.items.every(i => i.checked) ? 'Hepsini Kaldır' : 'Hepsini İşaretle'}
                                </button>
                                {cat.collapsed ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
                            </div>
                        </div>

                        {/* Maddeler */}
                        {!cat.collapsed && (
                            <div className="border-t border-gray-100">
                                {cat.items.map((item) => (
                                    <div key={item.id} className={`flex items-start gap-3 px-5 py-3 border-b border-gray-50 last:border-0 transition ${item.checked ? 'bg-green-50/50' : ''}`}>
                                        <button onClick={() => toggleItem(cat.id, item.id)}
                                            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${item.checked ? 'bg-[#22c55e] border-[#22c55e]' : 'border-gray-300 hover:border-[#C4803D]'}`}>
                                            {item.checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm ${item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.text}</span>
                                                {item.onem !== 'normal' && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                                        style={{ color: ONEM_STYLES[item.onem].color, backgroundColor: ONEM_STYLES[item.onem].bg }}>
                                                        {ONEM_STYLES[item.onem].label}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <input
                                                    type="text"
                                                    value={item.not}
                                                    onChange={(e) => updateNote(cat.id, item.id, e.target.value)}
                                                    placeholder="Not ekle..."
                                                    className="flex-1 px-2 py-1 text-[11px] text-gray-500 border-0 border-b border-transparent focus:border-gray-200 outline-none bg-transparent"
                                                />
                                                {/* Fotoğraf Butonu */}
                                                {!item.photo ? (
                                                    <label className="flex items-center gap-1 px-2 py-1 text-[10px] text-gray-400 hover:text-[#C4803D] cursor-pointer rounded hover:bg-gray-100 transition">
                                                        <Camera className="w-3 h-3" />
                                                        <span>{uploadingId === item.id ? '...' : 'Foto'}</span>
                                                        <input type="file" accept="image/*" className="hidden"
                                                            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(cat.id, item.id, f); e.target.value = ''; }} />
                                                    </label>
                                                ) : (
                                                    <div className="relative group">
                                                        <img src={`${API_URL}${item.photo}`} alt="" className="w-10 h-10 object-cover rounded border border-gray-200 cursor-pointer" />
                                                        <button onClick={() => removePhoto(cat.id, item.id)}
                                                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                            <X className="w-2.5 h-2.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Alt Excel Butonu */}
            <div className="flex justify-end pt-2 pb-8">
                <button onClick={handleExport} disabled={exporting || !isletmeAdi}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white text-sm shadow-xl disabled:opacity-50 transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #0B1F3B 0%, #1a3a5c 100%)' }}>
                    <Download className="w-5 h-5" />
                    {exporting ? 'Excel Oluşturuluyor...' : 'Kontrol Listesi Excel İndir'}
                </button>
            </div>
        </div>
    );
}
