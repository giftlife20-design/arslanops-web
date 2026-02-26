'use client';

import { useState } from 'react';
import { ClipboardList, Download, Calendar, Building2, User, AlertTriangle, CheckCircle, ArrowRight, Plus, Trash2, Loader2, Clock, MapPin } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ZiyaretNotuData {
    isletme_adi: string;
    isletme_turu: string;
    konum: string;
    ziyaret_tarihi: string;
    ziyaret_saati: string;
    ziyaret_suresi: string;
    danisman_adi: string;
    ziyaret_turu: 'ilk' | 'takip' | 'acil' | 'rutin';
    // Bulgular
    olumlu_bulgular: string[];
    olumsuz_bulgular: string[];
    // Yapılan İşler
    yapilan_isler: string[];
    // Sonraki Adımlar
    sonraki_adimlar: { gorev: string; sorumlu: string; tarih: string }[];
    // Genel
    genel_not: string;
    sonraki_ziyaret: string;
}

const INITIAL: ZiyaretNotuData = {
    isletme_adi: '',
    isletme_turu: 'coffee',
    konum: '',
    ziyaret_tarihi: new Date().toISOString().split('T')[0],
    ziyaret_saati: '10:00',
    ziyaret_suresi: '3 saat',
    danisman_adi: 'İlhan Arslan',
    ziyaret_turu: 'takip',
    olumlu_bulgular: [''],
    olumsuz_bulgular: [''],
    yapilan_isler: [''],
    sonraki_adimlar: [{ gorev: '', sorumlu: '', tarih: '' }],
    genel_not: '',
    sonraki_ziyaret: '',
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

const ZIYARET_TURLERI: Record<string, { label: string; color: string }> = {
    ilk: { label: 'İlk Ziyaret', color: '#3b82f6' },
    takip: { label: 'Takip Ziyareti', color: '#22c55e' },
    acil: { label: 'Acil Müdahale', color: '#ef4444' },
    rutin: { label: 'Rutin Kontrol', color: '#8b5cf6' },
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
async function generatePDF(data: ZiyaretNotuData) {
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
    const green: [number, number, number] = [34, 197, 94];
    const red: [number, number, number] = [239, 68, 68];

    // ---- HEADER ----
    doc.setFillColor(...navy);
    doc.rect(0, 0, pageW, 32, 'F');
    doc.setFillColor(...gold);
    doc.rect(0, 32, pageW, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    doc.text(tr('ZIYARET NOTU FORMU'), pageW / 2, 14, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(tr(`${data.isletme_adi || 'Isletme'} | ${data.ziyaret_tarihi}`), pageW / 2, 22, { align: 'center' });

    const zt = ZIYARET_TURLERI[data.ziyaret_turu];
    doc.setFontSize(8);
    doc.text(tr(`Ziyaret Turu: ${zt.label} | Danisman: ${data.danisman_adi}`), pageW / 2, 28, { align: 'center' });

    y = 40;

    // ---- ZIYARET BILGILERı ----
    const infoRows = [
        [tr('Isletme Adi'), tr(data.isletme_adi || '-'), tr('Isletme Turu'), tr(ISLETME_TURLERI[data.isletme_turu] || '-')],
        ['Konum', tr(data.konum || '-'), tr('Ziyaret Turu'), tr(zt.label)],
        ['Tarih', data.ziyaret_tarihi, 'Saat', data.ziyaret_saati],
        [tr('Sure'), tr(data.ziyaret_suresi), tr('Danisman'), tr(data.danisman_adi)],
    ];

    autoTable(doc, {
        startY: y,
        body: infoRows,
        theme: 'grid',
        bodyStyles: { fontSize: 8, font: 'Helvetica', textColor: textDark },
        columnStyles: {
            0: { cellWidth: 30, fontStyle: 'bold', textColor: navy, fillColor: [248, 250, 252] },
            1: { cellWidth: contentW / 2 - 30 },
            2: { cellWidth: 30, fontStyle: 'bold', textColor: navy, fillColor: [248, 250, 252] },
            3: { cellWidth: contentW / 2 - 30 },
        },
        styles: { cellPadding: 3 },
        margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    // ---- SECTION HELPER ----
    const sectionTitle = (title: string, color: [number, number, number] = gold) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFillColor(...color);
        doc.rect(margin, y, 3, 8, 'F');
        doc.setTextColor(...navy);
        doc.setFontSize(11);
        doc.setFont('Helvetica', 'bold');
        doc.text(tr(title), margin + 7, y + 6);
        y += 12;
    };

    const nonEmpty = (arr: string[]) => arr.filter(s => s.trim());

    // ---- OLUMLU BULGULAR ----
    if (nonEmpty(data.olumlu_bulgular).length > 0) {
        sectionTitle('Olumlu Bulgular', green);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textDark);
        nonEmpty(data.olumlu_bulgular).forEach(item => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFillColor(...green);
            doc.circle(margin + 2, y - 1, 1, 'F');
            const lines = doc.splitTextToSize(tr(item), contentW - 10);
            doc.text(lines, margin + 6, y);
            y += lines.length * 4.5 + 2;
        });
        y += 4;
    }

    // ---- OLUMSUZ BULGULAR ----
    if (nonEmpty(data.olumsuz_bulgular).length > 0) {
        sectionTitle('Olumsuz Bulgular / Eksiklikler', red);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textDark);
        nonEmpty(data.olumsuz_bulgular).forEach(item => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFillColor(...red);
            doc.circle(margin + 2, y - 1, 1, 'F');
            const lines = doc.splitTextToSize(tr(item), contentW - 10);
            doc.text(lines, margin + 6, y);
            y += lines.length * 4.5 + 2;
        });
        y += 4;
    }

    // ---- YAPILAN İŞLER ----
    if (nonEmpty(data.yapilan_isler).length > 0) {
        sectionTitle(tr('Bu Ziyarette Yapilan Isler'));
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textDark);
        nonEmpty(data.yapilan_isler).forEach((item, i) => {
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

    // ---- SONRAKİ ADIMLAR ----
    const validAdimlar = data.sonraki_adimlar.filter(a => a.gorev.trim());
    if (validAdimlar.length > 0) {
        sectionTitle(tr('Sonraki Adimlar & Gorev Atama'));

        const adimRows = validAdimlar.map((a, i) => [
            String(i + 1),
            tr(a.gorev),
            tr(a.sorumlu || '-'),
            a.tarih || '-',
        ]);

        autoTable(doc, {
            startY: y,
            head: [['#', tr('Gorev'), 'Sorumlu', tr('Hedef Tarih')]],
            body: adimRows,
            theme: 'grid',
            headStyles: { fillColor: navy, textColor: [255, 255, 255], fontSize: 9, font: 'Helvetica', fontStyle: 'bold', halign: 'center' },
            bodyStyles: { fontSize: 8, font: 'Helvetica', textColor: textDark },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 90 },
                2: { cellWidth: 35, halign: 'center' },
                3: { cellWidth: 30, halign: 'center' },
            },
            styles: { cellPadding: 3 },
            margin: { left: margin, right: margin },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ---- GENEL NOT ----
    if (data.genel_not.trim()) {
        sectionTitle('Genel Not');
        doc.setFillColor(248, 250, 252);
        const nLines = doc.splitTextToSize(tr(data.genel_not), contentW - 16);
        const boxH = nLines.length * 4.5 + 10;
        if (y + boxH > 270) { doc.addPage(); y = 20; }
        doc.roundedRect(margin, y - 2, contentW, boxH, 2, 2, 'F');
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textDark);
        doc.text(nLines, margin + 8, y + 4);
        y += boxH + 6;
    }

    // ---- SONRAKİ ZİYARET ----
    if (data.sonraki_ziyaret) {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFillColor(255, 251, 235);
        doc.roundedRect(margin, y, contentW, 14, 2, 2, 'F');
        doc.setTextColor(...navy);
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'bold');
        doc.text(tr(`Sonraki Ziyaret: ${data.sonraki_ziyaret}`), margin + 5, y + 9);
        y += 20;
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
        doc.text(tr('Bu form gizlidir ve yalnizca ilgili isletme yonetimi ile paylasilmalidir.'), pageW / 2, pH - 6, { align: 'center' });
    }

    const fileName = tr(`Ziyaret_Notu_${data.isletme_adi.replace(/\s+/g, '_') || 'Isletme'}_${data.ziyaret_tarihi}.pdf`);
    doc.save(fileName);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function ZiyaretNotu() {
    const [data, setData] = useState<ZiyaretNotuData>(INITIAL);
    const [generating, setGenerating] = useState(false);

    const update = (field: keyof ZiyaretNotuData, value: any) => setData(prev => ({ ...prev, [field]: value }));

    const updateList = (field: 'olumlu_bulgular' | 'olumsuz_bulgular' | 'yapilan_isler', idx: number, value: string) => {
        setData(prev => {
            const arr = [...prev[field]];
            arr[idx] = value;
            return { ...prev, [field]: arr };
        });
    };
    const addToList = (field: 'olumlu_bulgular' | 'olumsuz_bulgular' | 'yapilan_isler') => {
        setData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };
    const removeFromList = (field: 'olumlu_bulgular' | 'olumsuz_bulgular' | 'yapilan_isler', idx: number) => {
        setData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
    };

    const updateAdim = (idx: number, field: keyof ZiyaretNotuData['sonraki_adimlar'][0], value: string) => {
        setData(prev => {
            const adimlar = [...prev.sonraki_adimlar];
            adimlar[idx] = { ...adimlar[idx], [field]: value };
            return { ...prev, sonraki_adimlar: adimlar };
        });
    };
    const addAdim = () => setData(prev => ({ ...prev, sonraki_adimlar: [...prev.sonraki_adimlar, { gorev: '', sorumlu: '', tarih: '' }] }));
    const removeAdim = (idx: number) => setData(prev => ({ ...prev, sonraki_adimlar: prev.sonraki_adimlar.filter((_, i) => i !== idx) }));

    const handleGenerate = async () => {
        setGenerating(true);
        try { await generatePDF(data); } catch (e) { console.error(e); }
        setGenerating(false);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-xl font-bold text-[#0B1F3B] flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-[#C4803D]" />
                    Ziyaret Notu Formu
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Her ziyaret sonrası doldurulan kısa rapor — bulgular, yapılanlar, bir sonraki adımlar
                </p>
            </div>

            {/* Ziyaret Bilgileri */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#C4803D]" /> Ziyaret Bilgileri
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">İşletme Adı</label><input value={data.isletme_adi} onChange={e => update('isletme_adi', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder="Kahve Durağı" /></div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">İşletme Türü</label>
                        <select value={data.isletme_turu} onChange={e => update('isletme_turu', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none">
                            {Object.entries(ISLETME_TURLERI).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Konum</label><input value={data.konum} onChange={e => update('konum', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder="İstanbul, Kadıköy" /></div>
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Danışman</label><input value={data.danisman_adi} onChange={e => update('danisman_adi', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Tarih</label><input type="date" value={data.ziyaret_tarihi} onChange={e => update('ziyaret_tarihi', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" /></div>
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Saat</label><input type="time" value={data.ziyaret_saati} onChange={e => update('ziyaret_saati', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" /></div>
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Süre</label><input value={data.ziyaret_suresi} onChange={e => update('ziyaret_suresi', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" placeholder="3 saat" /></div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Ziyaret Türü</label>
                        <select value={data.ziyaret_turu} onChange={e => update('ziyaret_turu', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none">
                            {Object.entries(ZIYARET_TURLERI).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Olumlu Bulgular */}
            {(['olumlu_bulgular', 'olumsuz_bulgular', 'yapilan_isler'] as const).map(field => {
                const config = {
                    olumlu_bulgular: { title: 'Olumlu Bulgular', icon: CheckCircle, color: '#22c55e', placeholder: 'Olumlu tespit...' },
                    olumsuz_bulgular: { title: 'Olumsuz Bulgular / Eksiklikler', icon: AlertTriangle, color: '#ef4444', placeholder: 'Sorun veya eksiklik...' },
                    yapilan_isler: { title: 'Bu Ziyarette Yapılan İşler', icon: ArrowRight, color: '#C4803D', placeholder: 'Yapılan iş...' },
                };
                const { title, icon: Icon, color, placeholder } = config[field];
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

            {/* Sonraki Adımlar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-[#3b82f6]" /> Sonraki Adımlar & Görev Atama
                </h3>
                {data.sonraki_adimlar.map((adim, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 rounded-xl">
                        <div className="col-span-5">
                            <label className="text-[10px] font-medium text-gray-500 mb-1 block">Görev</label>
                            <input value={adim.gorev} onChange={e => updateAdim(i, 'gorev', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="Yapılacak iş..." />
                        </div>
                        <div className="col-span-3">
                            <label className="text-[10px] font-medium text-gray-500 mb-1 block">Sorumlu</label>
                            <input value={adim.sorumlu} onChange={e => updateAdim(i, 'sorumlu', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="Kim yapacak?" />
                        </div>
                        <div className="col-span-3">
                            <label className="text-[10px] font-medium text-gray-500 mb-1 block">Hedef Tarih</label>
                            <input type="date" value={adim.tarih} onChange={e => updateAdim(i, 'tarih', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg" />
                        </div>
                        <div className="col-span-1 pt-5">
                            {data.sonraki_adimlar.length > 1 && (
                                <button onClick={() => removeAdim(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                            )}
                        </div>
                    </div>
                ))}
                <button onClick={addAdim} className="flex items-center gap-1 text-xs text-[#C4803D] hover:text-[#a06830] font-medium">
                    <Plus className="w-3 h-3" /> Adım Ekle
                </button>
            </div>

            {/* Genel Not & Sonraki Ziyaret */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0B1F3B] flex items-center gap-2">
                    <User className="w-4 h-4 text-[#C4803D]" /> Genel Not & Sonraki Ziyaret
                </h3>
                <textarea value={data.genel_not} onChange={e => update('genel_not', e.target.value)} rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none resize-none" placeholder="Ziyaret hakkında genel notlarınız..." />
                <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Sonraki Planlanan Ziyaret</label>
                    <input type="date" value={data.sonraki_ziyaret} onChange={e => update('sonraki_ziyaret', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" />
                </div>
            </div>

            {/* PDF İndir */}
            <button onClick={handleGenerate} disabled={generating} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#0B1F3B] to-[#1a365d] text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {generating ? 'PDF oluşturuluyor...' : 'Ziyaret Notu (PDF) İndir'}
            </button>
        </div>
    );
}
