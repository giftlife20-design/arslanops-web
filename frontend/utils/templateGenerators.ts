/**
 * Template Generators — ArslanOps Danışman Araçları
 * Premium Excel & PDF şablonları
 */

import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ─── Renk Paleti ─── */
const C = {
    brand: 'C4803D',
    brandDark: '9a5f2e',
    navy: '0B1F3B',
    white: 'FFFFFF',
    light: 'FFF8F0',
    lightGray: 'F5F5F5',
    midGray: 'D1D5DB',
    darkGray: '6B7280',
    green: '22C55E',
    greenLight: 'F0FDF4',
    red: 'EF4444',
    redLight: 'FEF2F2',
    blue: '3B82F6',
    blueLight: 'EFF6FF',
    purple: '8B5CF6',
    purpleLight: 'F5F3FF',
};

/* ─── Yardımcılar ─── */
function saveBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function today(): string {
    return new Date().toLocaleDateString('tr-TR');
}

function addBrandHeader(ws: ExcelJS.Worksheet, title: string, subtitle: string, colCount: number) {
    // Row 1: Brand header
    ws.mergeCells(1, 1, 1, colCount);
    const h1 = ws.getCell('A1');
    h1.value = 'ArslanOps — Operasyon Danışmanlık';
    h1.font = { name: 'Calibri', size: 14, bold: true, color: { argb: C.white } };
    h1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.navy } };
    h1.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 36;

    // Row 2: Title
    ws.mergeCells(2, 1, 2, colCount);
    const h2 = ws.getCell('A2');
    h2.value = title;
    h2.font = { name: 'Calibri', size: 12, bold: true, color: { argb: C.white } };
    h2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.brand } };
    h2.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 30;

    // Row 3: Subtitle & date
    ws.mergeCells(3, 1, 3, colCount);
    const h3 = ws.getCell('A3');
    h3.value = `${subtitle}  |  Tarih: ……/……/……  |  Hazırlayan: ……………………`;
    h3.font = { name: 'Calibri', size: 9, italic: true, color: { argb: C.darkGray } };
    h3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.light } };
    h3.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(3).height = 24;

    // Row 4: empty spacer
    ws.getRow(4).height = 8;
}

function styleHeaderRow(ws: ExcelJS.Worksheet, rowNum: number, colCount: number) {
    const row = ws.getRow(rowNum);
    row.height = 28;
    for (let c = 1; c <= colCount; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: C.white } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.navy } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
            top: { style: 'thin', color: { argb: C.midGray } },
            bottom: { style: 'thin', color: { argb: C.midGray } },
            left: { style: 'thin', color: { argb: C.midGray } },
            right: { style: 'thin', color: { argb: C.midGray } },
        };
    }
}

function styleDataRows(ws: ExcelJS.Worksheet, startRow: number, endRow: number, colCount: number) {
    for (let r = startRow; r <= endRow; r++) {
        const row = ws.getRow(r);
        row.height = 26;
        for (let c = 1; c <= colCount; c++) {
            const cell = row.getCell(c);
            cell.font = { name: 'Calibri', size: 10 };
            cell.alignment = { vertical: 'middle', wrapText: true };
            cell.fill = {
                type: 'pattern', pattern: 'solid',
                fgColor: { argb: (r - startRow) % 2 === 0 ? C.white : C.lightGray },
            };
            cell.border = {
                top: { style: 'thin', color: { argb: C.midGray } },
                bottom: { style: 'thin', color: { argb: C.midGray } },
                left: { style: 'thin', color: { argb: C.midGray } },
                right: { style: 'thin', color: { argb: C.midGray } },
            };
        }
    }
}

function addFooter(ws: ExcelJS.Worksheet, rowNum: number, colCount: number, text: string) {
    ws.mergeCells(rowNum, 1, rowNum, colCount);
    const cell = ws.getCell(rowNum, 1);
    cell.value = text;
    cell.font = { name: 'Calibri', size: 8, italic: true, color: { argb: C.darkGray } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.light } };
    ws.getRow(rowNum).height = 22;
}

async function saveWorkbook(wb: ExcelJS.Workbook, filename: string) {
    const buf = await wb.xlsx.writeBuffer();
    saveBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  1. GÜNLÜK KASA RAPORU                                              */
/* ═══════════════════════════════════════════════════════════════════ */
export async function generateKasaRaporu() {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'ArslanOps';
    const ws = wb.addWorksheet('Günlük Kasa', {
        properties: { defaultColWidth: 18 },
        pageSetup: { orientation: 'portrait', fitToPage: true },
    });

    const cols = 5;
    addBrandHeader(ws, '💰 GÜNLÜK KASA RAPORU', 'Vardiya sonu kasa mutabakat belgesi', cols);

    ws.columns = [
        { width: 6 },
        { width: 32 },
        { width: 20 },
        { width: 20 },
        { width: 24 },
    ];

    // Meta info row
    const metaRow = 5;
    ws.mergeCells(metaRow, 1, metaRow, 2);
    ws.getCell(metaRow, 1).value = 'İşletme: ……………………';
    ws.getCell(metaRow, 1).font = { name: 'Calibri', size: 10, bold: true };
    ws.mergeCells(metaRow, 3, metaRow, 4);
    ws.getCell(metaRow, 3).value = 'Şube: ……………………';
    ws.getCell(metaRow, 3).font = { name: 'Calibri', size: 10, bold: true };
    ws.getCell(metaRow, 5).value = 'Vardiya: ☐ Sabah  ☐ Akşam';
    ws.getCell(metaRow, 5).font = { name: 'Calibri', size: 10, bold: true };
    ws.getRow(metaRow).height = 26;

    // Section A: Satış Özeti
    const secA = 7;
    ws.mergeCells(secA, 1, secA, cols);
    ws.getCell(secA, 1).value = 'A. SATIŞ ÖZETİ';
    ws.getCell(secA, 1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.brand } };
    ws.getCell(secA, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.light } };
    ws.getRow(secA).height = 28;

    const hdrA = secA + 1;
    ws.getRow(hdrA).values = ['#', 'Açıklama', 'Tutar (₺)', 'Adet', 'Not'];
    styleHeaderRow(ws, hdrA, cols);

    const salesItems = [
        'POS Z Raporu Toplam',
        'Nakit Satış',
        'Kredi Kartı Satış',
        'Online Sipariş (Getir/Yemeksepeti)',
        'Açık Hesap / Veresiye',
        'İndirim / İkram Toplam',
    ];
    salesItems.forEach((item, i) => {
        const r = hdrA + 1 + i;
        ws.getRow(r).values = [i + 1, item, '', '', ''];
    });
    styleDataRows(ws, hdrA + 1, hdrA + salesItems.length, cols);

    // Section B: Kasa Sayımı
    const secB = hdrA + salesItems.length + 2;
    ws.mergeCells(secB, 1, secB, cols);
    ws.getCell(secB, 1).value = 'B. FİİLİ KASA SAYIMI';
    ws.getCell(secB, 1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.brand } };
    ws.getCell(secB, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.light } };
    ws.getRow(secB).height = 28;

    const hdrB = secB + 1;
    ws.getRow(hdrB).values = ['#', 'Banknot / Bozuk', 'Adet', 'Tutar (₺)', 'Not'];
    styleHeaderRow(ws, hdrB, cols);

    const cashItems = ['200 ₺', '100 ₺', '50 ₺', '20 ₺', '10 ₺', '5 ₺', '1 ₺ ve Kuruş', 'TOPLAM NAKİT'];
    cashItems.forEach((item, i) => {
        const r = hdrB + 1 + i;
        ws.getRow(r).values = [i + 1, item, '', '', ''];
        if (item === 'TOPLAM NAKİT') {
            ws.getRow(r).getCell(2).font = { name: 'Calibri', size: 10, bold: true, color: { argb: C.brand } };
        }
    });
    styleDataRows(ws, hdrB + 1, hdrB + cashItems.length, cols);

    // Section C: Kasa Farkı
    const secC = hdrB + cashItems.length + 2;
    ws.mergeCells(secC, 1, secC, cols);
    ws.getCell(secC, 1).value = 'C. KASA FARKI';
    ws.getCell(secC, 1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.brand } };
    ws.getCell(secC, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.light } };
    ws.getRow(secC).height = 28;

    const hdrC = secC + 1;
    ws.getRow(hdrC).values = ['#', 'Kalem', 'Tutar (₺)', 'Durum', 'Açıklama'];
    styleHeaderRow(ws, hdrC, cols);

    const diffItems = ['POS Z Raporu Toplam (A)', 'Fiili Kasa Toplam (B)', 'FARK (A-B)', 'Karar: ☐ Kabul  ☐ İnceleme'];
    diffItems.forEach((item, i) => {
        const r = hdrC + 1 + i;
        ws.getRow(r).values = [i + 1, item, '', '', ''];
    });
    styleDataRows(ws, hdrC + 1, hdrC + diffItems.length, cols);

    // Section D: Günlük Giderler
    const secD = hdrC + diffItems.length + 2;
    ws.mergeCells(secD, 1, secD, cols);
    ws.getCell(secD, 1).value = 'D. GÜNLÜK GİDERLER';
    ws.getCell(secD, 1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.brand } };
    ws.getCell(secD, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.light } };
    ws.getRow(secD).height = 28;

    const hdrD = secD + 1;
    ws.getRow(hdrD).values = ['#', 'Gider Kalemi', 'Tutar (₺)', 'Fiş No', 'Not'];
    styleHeaderRow(ws, hdrD, cols);

    for (let i = 0; i < 8; i++) {
        const r = hdrD + 1 + i;
        ws.getRow(r).values = [i + 1, '', '', '', ''];
    }
    const totalRow = hdrD + 9;
    ws.getRow(totalRow).values = ['', 'TOPLAM GİDER', '', '', ''];
    ws.getRow(totalRow).getCell(2).font = { name: 'Calibri', size: 10, bold: true, color: { argb: C.brand } };
    styleDataRows(ws, hdrD + 1, totalRow, cols);

    // İmza alanı
    const sigRow = totalRow + 3;
    ws.mergeCells(sigRow, 1, sigRow, 2);
    ws.getCell(sigRow, 1).value = 'Kasa Sorumlusu: ……………………\nİmza:';
    ws.getCell(sigRow, 1).font = { name: 'Calibri', size: 10 };
    ws.getCell(sigRow, 1).alignment = { wrapText: true };
    ws.mergeCells(sigRow, 3, sigRow, 4);
    ws.getCell(sigRow, 3).value = 'Yönetici Onay: ……………………\nİmza:';
    ws.getCell(sigRow, 3).font = { name: 'Calibri', size: 10 };
    ws.getCell(sigRow, 3).alignment = { wrapText: true };
    ws.getRow(sigRow).height = 40;

    addFooter(ws, sigRow + 2, cols, '© ArslanOps Operasyon Danışmanlık — Bu belge günlük kasa mutabakatı için kullanılır. Tolerans: ±₺50');

    /* ─── SAYFA 2: AYLIK ÖZET ─── */
    const wsM = wb.addWorksheet('Aylık Özet', {
        properties: { defaultColWidth: 14 },
        pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    const mCols = 9;
    addBrandHeader(wsM, '📊 AYLIK KASA ÖZETİ', 'Günlük girişlerin aylık toplam ve analiz tablosu', mCols);

    wsM.columns = [
        { width: 6 },   // A — #
        { width: 14 },  // B — Tarih
        { width: 16 },  // C — POS Z Raporu
        { width: 16 },  // D — Nakit Satış
        { width: 16 },  // E — Kredi Kartı
        { width: 16 },  // F — Online Sipariş
        { width: 16 },  // G — İndirim/İkram
        { width: 16 },  // H — Toplam Gider
        { width: 18 },  // I — Net Kasa
    ];

    // Meta bilgi
    const mMeta = 5;
    wsM.mergeCells(mMeta, 1, mMeta, 4);
    wsM.getCell(mMeta, 1).value = 'İşletme: ……………………';
    wsM.getCell(mMeta, 1).font = { name: 'Calibri', size: 10, bold: true };
    wsM.mergeCells(mMeta, 5, mMeta, 7);
    wsM.getCell(mMeta, 5).value = 'Şube: ……………………';
    wsM.getCell(mMeta, 5).font = { name: 'Calibri', size: 10, bold: true };
    wsM.mergeCells(mMeta, 8, mMeta, 9);
    wsM.getCell(mMeta, 8).value = 'Ay / Yıl: ……/……';
    wsM.getCell(mMeta, 8).font = { name: 'Calibri', size: 10, bold: true };
    wsM.getRow(mMeta).height = 26;

    // Tablo başlığı
    const mHdr = 7;
    wsM.getRow(mHdr).values = [
        '#', 'Tarih', 'POS Z Raporu (₺)', 'Nakit Satış (₺)',
        'Kredi Kartı (₺)', 'Online Sipariş (₺)', 'İndirim/İkram (₺)',
        'Toplam Gider (₺)', 'Net Kasa (₺)',
    ];
    styleHeaderRow(wsM, mHdr, mCols);

    // 31 günlük veri satırları
    for (let day = 1; day <= 31; day++) {
        const r = mHdr + day;
        const row = wsM.getRow(r);
        row.values = [day, `${day}.`, '', '', '', '', '', '', ''];
        // Net Kasa formülü: Nakit Satış - Toplam Gider
        // I sütunu = D - H  (kasadaki nakit eksi kasadan yapılan ödemeler)
        // Kredi kartı ve online satışlar kasada oturmaz, bankaya gider
        row.getCell(9).value = { formula: `IF(D${r}="","",D${r}-H${r})` } as any;
        row.getCell(9).font = { name: 'Calibri', size: 10, bold: true };
    }
    styleDataRows(wsM, mHdr + 1, mHdr + 31, mCols);

    // TOPLAM satırı
    const totalRowM = mHdr + 32;
    const totRow = wsM.getRow(totalRowM);
    totRow.values = ['', 'TOPLAM', '', '', '', '', '', '', ''];

    // SUM formülleri: C, D, E, F, G, H, I sütunları
    const sumCols = ['C', 'D', 'E', 'F', 'G', 'H', 'I'];
    sumCols.forEach((col, idx) => {
        const colNum = idx + 3; // C=3, D=4, ...
        totRow.getCell(colNum).value = { formula: `SUM(${col}${mHdr + 1}:${col}${mHdr + 31})` } as any;
    });

    // TOPLAM satırı stili
    for (let c = 1; c <= mCols; c++) {
        const cell = totRow.getCell(c);
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.white } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.navy } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'medium', color: { argb: C.brand } },
            bottom: { style: 'medium', color: { argb: C.brand } },
            left: { style: 'thin', color: { argb: C.midGray } },
            right: { style: 'thin', color: { argb: C.midGray } },
        };
        // Sayısal sütunlar için format
        if (c >= 3) {
            cell.numFmt = '#,##0.00 ₺';
        }
    }
    totRow.height = 32;

    // İSTATİSTİK bölümü
    const statStart = totalRowM + 2;
    wsM.mergeCells(statStart, 1, statStart, mCols);
    wsM.getCell(statStart, 1).value = '📈 AYLIK İSTATİSTİKLER';
    wsM.getCell(statStart, 1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.brand } };
    wsM.getCell(statStart, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.light } };
    wsM.getRow(statStart).height = 28;

    const statHdr = statStart + 1;
    wsM.getRow(statHdr).values = [
        '', 'İstatistik', 'POS Z Raporu', 'Nakit Satış',
        'Kredi Kartı', 'Online Sipariş', 'İndirim/İkram',
        'Toplam Gider', 'Net Kasa',
    ];
    styleHeaderRow(wsM, statHdr, mCols);

    // Ortalama satırı
    const avgRow = statHdr + 1;
    wsM.getRow(avgRow).values = ['', 'Günlük Ortalama', '', '', '', '', '', '', ''];
    sumCols.forEach((col, idx) => {
        const colNum = idx + 3;
        wsM.getRow(avgRow).getCell(colNum).value = {
            formula: `IF(COUNTA(${col}${mHdr + 1}:${col}${mHdr + 31})=0,"",AVERAGE(${col}${mHdr + 1}:${col}${mHdr + 31}))`,
        } as any;
    });

    // En Yüksek Gün
    const maxRow = avgRow + 1;
    wsM.getRow(maxRow).values = ['', 'En Yüksek Gün', '', '', '', '', '', '', ''];
    sumCols.forEach((col, idx) => {
        const colNum = idx + 3;
        wsM.getRow(maxRow).getCell(colNum).value = {
            formula: `IF(COUNTA(${col}${mHdr + 1}:${col}${mHdr + 31})=0,"",MAX(${col}${mHdr + 1}:${col}${mHdr + 31}))`,
        } as any;
    });

    // En Düşük Gün
    const minRow = maxRow + 1;
    wsM.getRow(minRow).values = ['', 'En Düşük Gün', '', '', '', '', '', '', ''];
    sumCols.forEach((col, idx) => {
        const colNum = idx + 3;
        wsM.getRow(minRow).getCell(colNum).value = {
            formula: `IF(COUNTA(${col}${mHdr + 1}:${col}${mHdr + 31})=0,"",MIN(${col}${mHdr + 1}:${col}${mHdr + 31}))`,
        } as any;
    });

    // Doluluk (kaç gün veri girilmiş)
    const countRow = minRow + 1;
    wsM.getRow(countRow).values = ['', 'Veri Giren Gün', '', '', '', '', '', '', ''];
    sumCols.forEach((col, idx) => {
        const colNum = idx + 3;
        wsM.getRow(countRow).getCell(colNum).value = {
            formula: `COUNTA(${col}${mHdr + 1}:${col}${mHdr + 31})`,
        } as any;
    });

    styleDataRows(wsM, avgRow, countRow, mCols);

    // İstatistik satırlarını biraz vurgula
    for (let r = avgRow; r <= countRow; r++) {
        wsM.getRow(r).getCell(2).font = { name: 'Calibri', size: 10, bold: true, color: { argb: C.brand } };
        for (let c = 3; c <= mCols; c++) {
            wsM.getRow(r).getCell(c).numFmt = '#,##0.00 ₺';
        }
    }
    // Veri giren gün sayısı formatlı olmasın
    for (let c = 3; c <= mCols; c++) {
        wsM.getRow(countRow).getCell(c).numFmt = '0';
    }

    // Açıklama notu
    const noteRow = countRow + 2;
    wsM.mergeCells(noteRow, 1, noteRow, mCols);
    wsM.getCell(noteRow, 1).value = '💡 Nasıl Kullanılır: Her gün "Günlük Kasa" sayfasını doldurun, ardından bu sayfadaki ilgili günün satırına ana rakamları aktarın. Ay sonunda toplam ve istatistikler otomatik hesaplanır.';
    wsM.getCell(noteRow, 1).font = { name: 'Calibri', size: 9, italic: true, color: { argb: C.darkGray } };
    wsM.getCell(noteRow, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.blueLight } };
    wsM.getCell(noteRow, 1).alignment = { wrapText: true, vertical: 'middle' };
    wsM.getRow(noteRow).height = 36;

    // İmza alanı
    const mSigRow = noteRow + 2;
    wsM.mergeCells(mSigRow, 1, mSigRow, 3);
    wsM.getCell(mSigRow, 1).value = 'Hazırlayan: ……………………\nİmza:';
    wsM.getCell(mSigRow, 1).font = { name: 'Calibri', size: 10 };
    wsM.getCell(mSigRow, 1).alignment = { wrapText: true };
    wsM.mergeCells(mSigRow, 4, mSigRow, 6);
    wsM.getCell(mSigRow, 4).value = 'Kontrol Eden: ……………………\nİmza:';
    wsM.getCell(mSigRow, 4).font = { name: 'Calibri', size: 10 };
    wsM.getCell(mSigRow, 4).alignment = { wrapText: true };
    wsM.mergeCells(mSigRow, 7, mSigRow, 9);
    wsM.getCell(mSigRow, 7).value = 'Yönetici Onay: ……………………\nİmza:';
    wsM.getCell(mSigRow, 7).font = { name: 'Calibri', size: 10 };
    wsM.getCell(mSigRow, 7).alignment = { wrapText: true };
    wsM.getRow(mSigRow).height = 40;

    addFooter(wsM, mSigRow + 2, mCols, '© ArslanOps Operasyon Danışmanlık — Her gün 5 dakikada doldurun, ay sonunda otomatik raporunuz hazır olsun.');

    // Sayısal sütunlara para formatı uygula
    for (let day = 1; day <= 31; day++) {
        const r = mHdr + day;
        for (let c = 3; c <= mCols; c++) {
            wsM.getRow(r).getCell(c).numFmt = '#,##0.00 ₺';
        }
    }

    await saveWorkbook(wb, `Gunluk_Kasa_Raporu_${today()}.xlsx`);
}


/* ═══════════════════════════════════════════════════════════════════ */
/*  2. STOK SAYIM FORMU                                                */
/* ═══════════════════════════════════════════════════════════════════ */
export async function generateStokSayim() {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'ArslanOps';
    const ws = wb.addWorksheet('Stok Sayım', {
        pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    const cols = 8;
    addBrandHeader(ws, '📦 HAFTALIK STOK SAYIM FORMU', 'FIFO kontrollü fiziksel stok sayım belgesi', cols);

    ws.columns = [
        { width: 6 },
        { width: 24 },
        { width: 12 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 16 },
        { width: 22 },
    ];

    const hdr = 5;
    ws.getRow(hdr).values = ['#', 'Ürün Adı', 'Birim', 'Sistem Stoku', 'Fiili Sayım', 'Fark', 'SKT Kontrol', 'Fark Nedeni / Not'];
    styleHeaderRow(ws, hdr, cols);

    // Kategorili bölümler
    const categories = [
        { name: '☕ İÇECEK HAMMADDELERİ', items: ['Espresso Çekirdeği (kg)', 'Filtre Kahve (kg)', 'Süt (lt)', 'Bitkisel Süt (lt)', 'Çay (kg)', 'Şurup (lt)', 'Whipped Cream (lt)'] },
        { name: '🥗 GIDA HAMMADDELERİ', items: ['Ekmek (adet)', 'Peynir (kg)', 'Tereyağı (kg)', 'Avokado (kg)', 'Domates (kg)', 'Yeşillik (kg)', 'Tavuk (kg)', 'Yumurta (adet)'] },
        { name: '📦 AMBALAJ & SARF', items: ['Takeaway Bardak S (adet)', 'Takeaway Bardak L (adet)', 'Kapak (adet)', 'Peçete (paket)', 'Poşet (adet)', 'Temizlik Malz. (adet)'] },
    ];

    let currentRow = hdr + 1;
    categories.forEach(cat => {
        // Category header
        ws.mergeCells(currentRow, 1, currentRow, cols);
        const catCell = ws.getCell(currentRow, 1);
        catCell.value = cat.name;
        catCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: C.brand } };
        catCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.light } };
        ws.getRow(currentRow).height = 24;
        currentRow++;

        cat.items.forEach((item, i) => {
            ws.getRow(currentRow).values = [i + 1, item, '', '', '', '', '☐ OK  ☐ Dikkat', ''];
            currentRow++;
        });
        styleDataRows(ws, currentRow - cat.items.length, currentRow - 1, cols);
    });

    // İmza
    currentRow += 2;
    ws.mergeCells(currentRow, 1, currentRow, 3);
    ws.getCell(currentRow, 1).value = 'Sayımı Yapan: ……………………  İmza:';
    ws.getCell(currentRow, 1).font = { name: 'Calibri', size: 10 };
    ws.mergeCells(currentRow, 5, currentRow, 7);
    ws.getCell(currentRow, 5).value = 'Onaylayan: ……………………  İmza:';
    ws.getCell(currentRow, 5).font = { name: 'Calibri', size: 10 };
    ws.getRow(currentRow).height = 36;

    addFooter(ws, currentRow + 2, cols, '© ArslanOps — FIFO: İlk Giren İlk Çıkar. Yüksek maliyetli ürünler günlük sayılmalı. Fark %3 üzeri ise soruşturma başlatılmalı.');

    await saveWorkbook(wb, `Stok_Sayim_Formu_${today()}.xlsx`);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  3. HİJYEN KONTROL LİSTESİ (Excel)                                */
/* ═══════════════════════════════════════════════════════════════════ */
export async function generateHijyenExcel() {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'ArslanOps';
    const ws = wb.addWorksheet('Hijyen Kontrol', {
        pageSetup: { orientation: 'portrait', fitToPage: true },
    });

    const cols = 6;
    addBrandHeader(ws, '🛡️ GÜNLÜK HİJYEN KONTROL LİSTESİ', 'HACCP Uyumlu — Günlük Sıcaklık & Hijyen Takip Formu', cols);

    ws.columns = [
        { width: 6 },
        { width: 30 },
        { width: 14 },
        { width: 14 },
        { width: 10 },
        { width: 22 },
    ];

    // Sıcaklık kayıtları
    const secA = 5;
    ws.mergeCells(secA, 1, secA, cols);
    ws.getCell(secA, 1).value = '🌡️ A. SICAKLIK KAYITLARI';
    ws.getCell(secA, 1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.red } };
    ws.getCell(secA, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.redLight } };
    ws.getRow(secA).height = 28;

    const hdrA = secA + 1;
    ws.getRow(hdrA).values = ['#', 'Ekipman', 'Sabah (°C)', 'Akşam (°C)', 'Uygun?', 'Not / Aksiyon'];
    styleHeaderRow(ws, hdrA, cols);

    const tempItems = [
        ['Buzdolabı 1 (Ana)', '0-4°C'],
        ['Buzdolabı 2 (İçecek)', '0-4°C'],
        ['Dondurucu', '≤ -18°C'],
        ['Sıcak Servis Tezgahı', '≥ 63°C'],
        ['Bulaşık Mak. Son Dur.', '≥ 82°C'],
    ];
    tempItems.forEach((item, i) => {
        const r = hdrA + 1 + i;
        ws.getRow(r).values = [i + 1, `${item[0]} (Hedef: ${item[1]})`, '', '', '☐', ''];
    });
    styleDataRows(ws, hdrA + 1, hdrA + tempItems.length, cols);

    // Personel Hijyen
    const secB = hdrA + tempItems.length + 2;
    ws.mergeCells(secB, 1, secB, cols);
    ws.getCell(secB, 1).value = '👤 B. PERSONEL HİJYEN KONTROLÜ';
    ws.getCell(secB, 1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.blue } };
    ws.getCell(secB, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.blueLight } };
    ws.getRow(secB).height = 28;

    const hdrB = secB + 1;
    ws.getRow(hdrB).values = ['#', 'Kontrol Maddesi', 'Uygun', 'Uygun Değil', 'Kim?', 'Aksiyon'];
    styleHeaderRow(ws, hdrB, cols);

    const hygItems = [
        'Temiz iş kıyafeti giyilmiş',
        'Saç bonesi / başlık takılmış',
        'Tırnaklar kısa ve ojesi yok',
        'El yıkama yapılıyor (20 sn)',
        'Yara/kesik varsa eldiven giyilmiş',
        'Takı/yüzük çıkarılmış',
    ];
    hygItems.forEach((item, i) => {
        const r = hdrB + 1 + i;
        ws.getRow(r).values = [i + 1, item, '☐', '☐', '', ''];
    });
    styleDataRows(ws, hdrB + 1, hdrB + hygItems.length, cols);

    // Yüzey & Alan
    const secC = hdrB + hygItems.length + 2;
    ws.mergeCells(secC, 1, secC, cols);
    ws.getCell(secC, 1).value = '🧹 C. YÜZEY & ALAN TEMİZLİK KONTROLÜ';
    ws.getCell(secC, 1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.green } };
    ws.getCell(secC, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.greenLight } };
    ws.getRow(secC).height = 28;

    const hdrC = secC + 1;
    ws.getRow(hdrC).values = ['#', 'Alan / Yüzey', 'Temiz', 'Kirli', 'Sorumlu', 'Aksiyon'];
    styleHeaderRow(ws, hdrC, cols);

    const cleanItems = [
        'Hazırlık tezgahları', 'Kesme tahtaları (renk kodlu)', 'Bar makineleri',
        'Zemin', 'Lavabolar', 'Çöp alanı', 'Depo / Raf düzeni', 'WC alanları',
    ];
    cleanItems.forEach((item, i) => {
        const r = hdrC + 1 + i;
        ws.getRow(r).values = [i + 1, item, '☐', '☐', '', ''];
    });
    styleDataRows(ws, hdrC + 1, hdrC + cleanItems.length, cols);

    const sigRow = hdrC + cleanItems.length + 3;
    ws.mergeCells(sigRow, 1, sigRow, 3);
    ws.getCell(sigRow, 1).value = 'Kontrol Eden: ……………………  İmza:';
    ws.getCell(sigRow, 1).font = { name: 'Calibri', size: 10 };
    ws.mergeCells(sigRow, 4, sigRow, 6);
    ws.getCell(sigRow, 4).value = 'Yönetici Onay: ……………………  İmza:';
    ws.getCell(sigRow, 4).font = { name: 'Calibri', size: 10 };
    ws.getRow(sigRow).height = 36;

    addFooter(ws, sigRow + 2, cols, '© ArslanOps — HACCP Uyumlu. Uygun değil işaretlemelerde aynı gün düzeltici faaliyet başlatılmalıdır.');

    await saveWorkbook(wb, `Hijyen_Kontrol_Listesi_${today()}.xlsx`);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  3b. HİJYEN KONTROL LİSTESİ (PDF)                                  */
/* ═══════════════════════════════════════════════════════════════════ */
export function generateHijyenPDF() {
    const doc = new jsPDF('p', 'mm', 'a4');

    // Brand header
    doc.setFillColor(11, 31, 59);
    doc.rect(0, 0, 210, 18, 'F');
    doc.setTextColor(255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ArslanOps — Operasyon Danışmanlık', 105, 12, { align: 'center' });

    doc.setFillColor(196, 128, 61);
    doc.rect(0, 18, 210, 12, 'F');
    doc.setFontSize(11);
    doc.text('GÜNLÜK HİJYEN KONTROL LİSTESİ (HACCP)', 105, 26, { align: 'center' });

    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tarih: ……/……/……    Isletme: ……………………    Sube: ……………………    Vardiya: ☐ Sabah  ☐ Aksam`, 105, 36, { align: 'center' });

    // Sıcaklık Tablosu
    autoTable(doc, {
        startY: 42,
        head: [['#', 'Ekipman', 'Hedef', 'Sabah (°C)', 'Aksam (°C)', 'Uygun?', 'Not']],
        body: [
            ['1', 'Buzdolabi 1', '0-4°C', '', '', '☐', ''],
            ['2', 'Buzdolabi 2', '0-4°C', '', '', '☐', ''],
            ['3', 'Dondurucu', '<= -18°C', '', '', '☐', ''],
            ['4', 'Sicak Servis', '>= 63°C', '', '', '☐', ''],
            ['5', 'Bulasik Mak.', '>= 82°C', '', '', '☐', ''],
        ],
        headStyles: { fillColor: [11, 31, 59], fontSize: 8, halign: 'center' },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        theme: 'grid',
        margin: { left: 10, right: 10 },
    });

    // Personel Hijyen Tablosu
    const y1 = (doc as any).lastAutoTable.finalY + 8;
    doc.setFillColor(59, 130, 246);
    doc.rect(10, y1, 190, 8, 'F');
    doc.setTextColor(255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PERSONEL HIJYEN KONTROLU', 105, y1 + 6, { align: 'center' });

    autoTable(doc, {
        startY: y1 + 10,
        head: [['#', 'Kontrol Maddesi', 'Uygun', 'Uygun Degil', 'Aksiyon']],
        body: [
            ['1', 'Temiz is kiyafeti', '☐', '☐', ''],
            ['2', 'Sac bonesi / baslik', '☐', '☐', ''],
            ['3', 'Tirnaklar kisa, oje yok', '☐', '☐', ''],
            ['4', 'El yikama (20 sn)', '☐', '☐', ''],
            ['5', 'Yara/kesik -> eldiven', '☐', '☐', ''],
            ['6', 'Taki/yuzuk cikarilmis', '☐', '☐', ''],
        ],
        headStyles: { fillColor: [59, 130, 246], fontSize: 8, halign: 'center' },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [239, 246, 255] },
        theme: 'grid',
        margin: { left: 10, right: 10 },
    });

    // Yüzey Temizlik
    const y2 = (doc as any).lastAutoTable.finalY + 8;
    doc.setFillColor(34, 197, 94);
    doc.rect(10, y2, 190, 8, 'F');
    doc.setTextColor(255);
    doc.setFontSize(9);
    doc.text('YUZEY & ALAN TEMIZLIK KONTROLU', 105, y2 + 6, { align: 'center' });

    autoTable(doc, {
        startY: y2 + 10,
        head: [['#', 'Alan / Yuzey', 'Temiz', 'Kirli', 'Sorumlu', 'Aksiyon']],
        body: [
            ['1', 'Hazirlik tezgahlari', '☐', '☐', '', ''],
            ['2', 'Kesme tahtalari', '☐', '☐', '', ''],
            ['3', 'Bar makineleri', '☐', '☐', '', ''],
            ['4', 'Zemin', '☐', '☐', '', ''],
            ['5', 'Lavabolar', '☐', '☐', '', ''],
            ['6', 'Cop alani', '☐', '☐', '', ''],
            ['7', 'Depo / Raf duzeni', '☐', '☐', '', ''],
            ['8', 'WC alanlari', '☐', '☐', '', ''],
        ],
        headStyles: { fillColor: [34, 197, 94], fontSize: 8, halign: 'center' },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        theme: 'grid',
        margin: { left: 10, right: 10 },
    });

    const y3 = (doc as any).lastAutoTable.finalY + 12;
    doc.setTextColor(80);
    doc.setFontSize(9);
    doc.text('Kontrol Eden: ……………………   Imza:', 15, y3);
    doc.text('Yonetici Onay: ……………………   Imza:', 120, y3);

    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text('© ArslanOps Operasyon Danismanlik — HACCP Uyumlu Gunluk Kontrol Belgesi', 105, 290, { align: 'center' });

    doc.save(`Hijyen_Kontrol_Listesi_${today()}.pdf`);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  4. VARDİYA DEVİR TESLİM FORMU                                     */
/* ═══════════════════════════════════════════════════════════════════ */
export async function generateVardiyaDevir() {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'ArslanOps';
    const ws = wb.addWorksheet('Vardiya Devir', {
        pageSetup: { orientation: 'portrait', fitToPage: true },
    });

    const cols = 5;
    addBrandHeader(ws, '🔄 VARDİYA DEVİR TESLİM FORMU', 'Vardiya değişimlerinde bilgi aktarım belgesi', cols);

    ws.columns = [
        { width: 6 },
        { width: 28 },
        { width: 22 },
        { width: 14 },
        { width: 24 },
    ];

    // Vardiya bilgi
    const metaR = 5;
    ws.mergeCells(metaR, 1, metaR, 2);
    ws.getCell(metaR, 1).value = 'Devir Eden: ……………………';
    ws.getCell(metaR, 1).font = { name: 'Calibri', size: 10, bold: true };
    ws.mergeCells(metaR, 3, metaR, 4);
    ws.getCell(metaR, 3).value = 'Devir Alan: ……………………';
    ws.getCell(metaR, 3).font = { name: 'Calibri', size: 10, bold: true };
    ws.getCell(metaR, 5).value = 'Saat: ……:……';
    ws.getCell(metaR, 5).font = { name: 'Calibri', size: 10, bold: true };
    ws.getRow(metaR).height = 26;

    const hdr = 7;
    ws.getRow(hdr).values = ['#', 'Kontrol Maddesi', 'Detay / Bilgi', 'Durum', 'Not / Aksiyon'];
    styleHeaderRow(ws, hdr, cols);

    const items = [
        ['Kasa Sayımı', 'Nakit + POS mutabakatı'],
        ['Açık Siparişler', 'Bekleyen masa / paket'],
        ['Stok Durumu', 'Kritik eksikler'],
        ['Ekipman Durumu', 'Arızalı cihaz var mı?'],
        ['Müşteri Notu', 'VIP / şikayet / özel istek'],
        ['Temizlik Durumu', 'Biten alanlar / kalan görevler'],
        ['Personel Notu', 'İzin / geç gelen / görev değişikliği'],
        ['Sipariş Beklenen', 'Tedarikçi teslimatı var mı?'],
        ['Özel Etkinlik', 'Rezervasyon / organizasyon'],
        ['Diğer Notlar', ''],
    ];

    items.forEach((item, i) => {
        const r = hdr + 1 + i;
        ws.getRow(r).values = [i + 1, item[0], item[1], '☐ OK', ''];
    });
    styleDataRows(ws, hdr + 1, hdr + items.length, cols);

    const sigRow = hdr + items.length + 3;
    ws.mergeCells(sigRow, 1, sigRow, 2);
    ws.getCell(sigRow, 1).value = 'Devir Eden İmza:\n\n……………………';
    ws.getCell(sigRow, 1).font = { name: 'Calibri', size: 10 };
    ws.getCell(sigRow, 1).alignment = { wrapText: true, vertical: 'top' };
    ws.mergeCells(sigRow, 3, sigRow, 5);
    ws.getCell(sigRow, 3).value = 'Devir Alan İmza:\n\n……………………';
    ws.getCell(sigRow, 3).font = { name: 'Calibri', size: 10 };
    ws.getCell(sigRow, 3).alignment = { wrapText: true, vertical: 'top' };
    ws.getRow(sigRow).height = 50;

    addFooter(ws, sigRow + 2, cols, '© ArslanOps — Devir teslim her vardiya değişiminde zorunludur. Sözlü aktarım kabul edilmez.');

    await saveWorkbook(wb, `Vardiya_Devir_Teslim_${today()}.xlsx`);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  5. AÇILIŞ / KAPANIŞ PROSEDÜRÜ (PDF)                               */
/* ═══════════════════════════════════════════════════════════════════ */
export function generateAcilisKapanisPDF() {
    const doc = new jsPDF('p', 'mm', 'a4');

    // Header
    doc.setFillColor(11, 31, 59);
    doc.rect(0, 0, 210, 18, 'F');
    doc.setTextColor(255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ArslanOps — Operasyon Danismanlik', 105, 12, { align: 'center' });

    doc.setFillColor(196, 128, 61);
    doc.rect(0, 18, 210, 12, 'F');
    doc.setFontSize(11);
    doc.text('ACILIS / KAPANIS PROSEDURU', 105, 26, { align: 'center' });

    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tarih: ……/……/……    Isletme: ……………………    Sorumlu: ……………………`, 105, 36, { align: 'center' });

    // AÇILIŞ TABLOSU
    doc.setFillColor(34, 197, 94);
    doc.rect(10, 42, 190, 8, 'F');
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ACILIS PROSEDURU (Saat: ……:……)', 105, 48, { align: 'center' });

    autoTable(doc, {
        startY: 52,
        head: [['#', 'Gorev', 'Saat', 'Yapildi?', 'Sorumlu', 'Not']],
        body: [
            ['1', 'Isiklari ac, alarm kapat', '', '☐', '', ''],
            ['2', 'Makineleri ac (Espresso, POS, vb.)', '', '☐', '', ''],
            ['3', 'Buzdolabi sicakliklari kontrol', '', '☐', '', ''],
            ['4', 'Malzeme ve stok kontrolu', '', '☐', '', ''],
            ['5', 'Eksik malzeme siparisi', '', '☐', '', ''],
            ['6', 'Tezgah ve ekipman temizligi', '', '☐', '', ''],
            ['7', 'Kasa acilis sayimi', '', '☐', '', ''],
            ['8', 'Personel hazirlik kontrolu', '', '☐', '', ''],
            ['9', 'Dis alan / menu tahtalari', '', '☐', '', ''],
            ['10', 'Muzik ve aydinlatma ayari', '', '☐', '', ''],
        ],
        headStyles: { fillColor: [34, 197, 94], fontSize: 8, halign: 'center' },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        theme: 'grid',
        margin: { left: 10, right: 10 },
    });

    // KAPANIŞ TABLOSU
    const y1 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFillColor(239, 68, 68);
    doc.rect(10, y1, 190, 8, 'F');
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('KAPANIS PROSEDURU (Saat: ……:……)', 105, y1 + 6, { align: 'center' });

    autoTable(doc, {
        startY: y1 + 10,
        head: [['#', 'Gorev', 'Saat', 'Yapildi?', 'Sorumlu', 'Not']],
        body: [
            ['1', 'Son siparis kontrolu', '', '☐', '', ''],
            ['2', 'Tum masalar temizlendi', '', '☐', '', ''],
            ['3', 'Kasa kapanis sayimi + Z raporu', '', '☐', '', ''],
            ['4', 'POS mutabakati', '', '☐', '', ''],
            ['5', 'Buzdolabi duzeni + FIFO', '', '☐', '', ''],
            ['6', 'Tezgah ve ekipman temizligi', '', '☐', '', ''],
            ['7', 'Zemin temizligi', '', '☐', '', ''],
            ['8', 'Cop ve atik cikarma', '', '☐', '', ''],
            ['9', 'Tum cihazlar kapatildi', '', '☐', '', ''],
            ['10', 'Kapilar / pencereler kilitlendi', '', '☐', '', ''],
            ['11', 'Alarm aktif edildi', '', '☐', '', ''],
        ],
        headStyles: { fillColor: [239, 68, 68], fontSize: 8, halign: 'center' },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [254, 242, 242] },
        theme: 'grid',
        margin: { left: 10, right: 10 },
    });

    const y2 = (doc as any).lastAutoTable.finalY + 12;
    doc.setTextColor(80);
    doc.setFontSize(9);
    doc.text('Acilis Sorumlusu: ……………………   Imza:', 15, y2);
    doc.text('Kapanis Sorumlusu: ……………………   Imza:', 15, y2 + 8);
    doc.text('Yonetici Onay: ……………………   Imza:', 120, y2 + 4);

    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text('© ArslanOps — Bu belge her gun basılip doldurulmalidir. Eksik adim = disiplin uyarisi.', 105, 290, { align: 'center' });

    doc.save(`Acilis_Kapanis_Proseduru_${today()}.pdf`);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  6. MÜŞTERİ ŞİKAYET TAKİP FORMU                                   */
/* ═══════════════════════════════════════════════════════════════════ */
export async function generateMusteriSikayet() {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'ArslanOps';
    const ws = wb.addWorksheet('Sikayet Takip', {
        pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    const cols = 9;
    addBrandHeader(ws, '📋 MÜŞTERİ ŞİKAYET & GERİ BİLDİRİM TAKİP FORMU', 'Tüm müşteri geri bildirimlerini kayıt altına alın', cols);

    ws.columns = [
        { width: 6 },
        { width: 14 },
        { width: 10 },
        { width: 16 },
        { width: 18 },
        { width: 28 },
        { width: 24 },
        { width: 16 },
        { width: 18 },
    ];

    const hdr = 5;
    ws.getRow(hdr).values = ['#', 'Tarih', 'Saat', 'Müşteri', 'Kategori', 'Şikayet Detayı', 'Yapılan Müdahale', 'Sonuç', 'Takip Sorumlusu'];
    styleHeaderRow(ws, hdr, cols);

    // Kategori açıklaması
    const catRow = 6;
    ws.mergeCells(catRow, 1, catRow, cols);
    ws.getCell(catRow, 1).value = 'Kategoriler:  🍽️ Ürün Kalitesi  |  ⏱️ Servis Hızı  |  🧹 Hijyen  |  💰 Fiyat  |  👤 Personel  |  📦 Paket / Teslimat  |  🏠 Mekan';
    ws.getCell(catRow, 1).font = { name: 'Calibri', size: 8, italic: true, color: { argb: C.darkGray } };
    ws.getCell(catRow, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.light } };
    ws.getRow(catRow).height = 22;

    for (let i = 0; i < 15; i++) {
        const r = catRow + 1 + i;
        ws.getRow(r).values = [i + 1, '', '', '', '', '', '', '', ''];
    }
    styleDataRows(ws, catRow + 1, catRow + 15, cols);

    // Özet
    const sumRow = catRow + 17;
    ws.mergeCells(sumRow, 1, sumRow, cols);
    ws.getCell(sumRow, 1).value = 'AYLIK ÖZET';
    ws.getCell(sumRow, 1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.brand } };
    ws.getCell(sumRow, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.light } };
    ws.getRow(sumRow).height = 26;

    const sumHdr = sumRow + 1;
    ws.getRow(sumHdr).values = ['', 'Toplam Şikayet', 'Çözülen', 'Bekleyen', 'En Sık Kategori', 'Trend', '', '', ''];
    styleHeaderRow(ws, sumHdr, cols);
    ws.getRow(sumHdr + 1).values = ['', '', '', '', '', '', '', '', ''];
    styleDataRows(ws, sumHdr + 1, sumHdr + 1, cols);

    addFooter(ws, sumHdr + 3, cols, '© ArslanOps — Her şikayet bir fırsattır. 24 saat içinde çözülmeli ve takip edilmelidir.');

    await saveWorkbook(wb, `Musteri_Sikayet_Takip_${today()}.xlsx`);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  7. KPI DASHBOARD — Formüllü, Çok Sayfalı KPI Takip Sistemi        */
/* ═══════════════════════════════════════════════════════════════════ */

function sectionHeader(ws: ExcelJS.Worksheet, row: number, colCount: number, text: string, color: string, bgColor: string) {
    ws.mergeCells(row, 1, row, colCount);
    const cell = ws.getCell(row, 1);
    cell.value = text;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: color } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    ws.getRow(row).height = 28;
}

function instructionRow(ws: ExcelJS.Worksheet, row: number, colCount: number, text: string) {
    ws.mergeCells(row, 1, row, colCount);
    const cell = ws.getCell(row, 1);
    cell.value = text;
    cell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF6B7280' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
    ws.getRow(row).height = 22;
}

export async function generateKPIDashboard() {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'ArslanOps';

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  SAYFA 1: KPI DASHBOARD — Özet Görünüm
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const dash = wb.addWorksheet('KPI Dashboard', {
        properties: { tabColor: { argb: 'FF0B1F3B' } },
        pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    const DC = 8;
    addBrandHeader(dash, '📊 KPI DASHBOARD — Haftalık Performans Özeti', 'Tüm KPI\'ları tek ekranda takip edin', DC);

    dash.columns = [
        { width: 5 },
        { width: 28 },
        { width: 16 },
        { width: 16 },
        { width: 14 },
        { width: 14 },
        { width: 16 },
        { width: 16 },
    ];

    // Meta
    const dm = 5;
    dash.mergeCells(dm, 1, dm, 4);
    dash.getCell(dm, 1).value = 'Isletme: ……………………   Sube: ……………………';
    dash.getCell(dm, 1).font = { name: 'Calibri', size: 10, bold: true };
    dash.mergeCells(dm, 5, dm, 8);
    dash.getCell(dm, 5).value = 'Dönem: ……/……/…… — ……/……/……   Hazırlayan: ……………………';
    dash.getCell(dm, 5).font = { name: 'Calibri', size: 10, bold: true };
    dash.getRow(dm).height = 26;

    instructionRow(dash, 6, DC, '💡 Sadece C ve D sütunlarını doldurun. Diğer sütunlar otomatik hesaplanır. Yeşil=İyi, Sarı=Dikkat, Kırmızı=Kritik');

    // Dashboard Header
    const dh = 7;
    dash.getRow(dh).values = ['#', 'KPI Göstergesi', 'Hedef', 'Gerçekleşen', 'Başarı %', 'Durum', 'Sorumlu', 'Takip Periyodu'];
    styleHeaderRow(dash, dh, DC);

    // 7 KPI rows with formulas
    const kpiDefs = [
        ['Günlük Ortalama Ciro (₺)', 15000, '', 'Haftalık', 'Müdür'],
        ['COGS Oranı (%)', 30, '', 'Haftalık', 'Şef'],
        ['Fire Oranı (%)', 3, '', 'Haftalık', 'Depo Sorumlusu'],
        ['Müşteri Memnuniyeti (1-5)', 4.5, '', 'Haftalık', 'Müdür'],
        ['Masa Devir Hızı (x/gün)', 3, '', 'Haftalık', 'Kaptan'],
        ['Personel Devir Oranı (%/yıl)', 10, '', 'Aylık', 'İK'],
        ['Kasa Fark Oranı (₺)', 50, '', 'Günlük', 'Kasiyer'],
    ];

    kpiDefs.forEach((kpi, i) => {
        const r = dh + 1 + i;
        const row = dash.getRow(r);
        row.values = [i + 1, kpi[0], kpi[1], '', '', '', kpi[4], kpi[3]];

        // Başarı % formülü (E = D / C * 100)
        const eCell = row.getCell(5);
        eCell.value = { formula: `IF(C${r}=0,"",IF(B${r}="COGS Oranı (%)",IF(D${r}=0,"",(1-(D${r}-C${r})/C${r})*100),IF(B${r}="Fire Oranı (%)",IF(D${r}=0,"",(1-(D${r}-C${r})/C${r})*100),IF(D${r}=0,"",D${r}/C${r}*100))))` };
        eCell.numFmt = '0.0"%"';

        // Durum formülü
        const fCell = row.getCell(6);
        fCell.value = { formula: `IF(E${r}="","",IF(E${r}>=90,"✓ İyi",IF(E${r}>=70,"⚠ Dikkat","✗ Kritik")))` };
    });
    styleDataRows(dash, dh + 1, dh + 7, DC);

    // Conditional formatting for status column
    const statusRange = `F${dh + 1}:F${dh + 7}`;
    dash.addConditionalFormatting({
        ref: statusRange,
        rules: [
            {
                type: 'containsText',
                operator: 'containsText',
                text: 'İyi',
                priority: 1,
                style: { font: { color: { argb: 'FF16A34A' }, bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } } },
            },
            {
                type: 'containsText',
                operator: 'containsText',
                text: 'Dikkat',
                priority: 2,
                style: { font: { color: { argb: 'FFD97706' }, bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } } },
            },
            {
                type: 'containsText',
                operator: 'containsText',
                text: 'Kritik',
                priority: 3,
                style: { font: { color: { argb: 'FFDC2626' }, bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } } },
            },
        ],
    } as any);

    // Genel Skor
    const scoreRow = dh + 9;
    sectionHeader(dash, scoreRow, DC, '📈 GENEL PERFORMANS SKORU', C.brand, C.light);
    const scoreCalcRow = scoreRow + 1;
    dash.mergeCells(scoreCalcRow, 1, scoreCalcRow, 3);
    dash.getCell(scoreCalcRow, 1).value = 'Ortalama Başarı Oranı:';
    dash.getCell(scoreCalcRow, 1).font = { name: 'Calibri', size: 12, bold: true };
    dash.getCell(scoreCalcRow, 4).value = { formula: `IFERROR(AVERAGE(E${dh + 1}:E${dh + 7}),0)` };
    dash.getCell(scoreCalcRow, 4).numFmt = '0.0"%"';
    dash.getCell(scoreCalcRow, 4).font = { name: 'Calibri', size: 16, bold: true, color: { argb: C.brand } };
    dash.mergeCells(scoreCalcRow, 5, scoreCalcRow, 8);
    dash.getCell(scoreCalcRow, 5).value = { formula: `IF(D${scoreCalcRow}>=90,"🟢 Mükemmel Performans!",IF(D${scoreCalcRow}>=70,"🟡 İyileştirme Alanları Var",IF(D${scoreCalcRow}>0,"🔴 Acil Müdahale Gerekli","")))` };
    dash.getCell(scoreCalcRow, 5).font = { name: 'Calibri', size: 11, bold: true };
    dash.getRow(scoreCalcRow).height = 32;

    // Aksiyon Notu alanı
    const actRow = scoreCalcRow + 2;
    sectionHeader(dash, actRow, DC, '📝 HAFTALIK AKSİYON NOTLARI', C.navy, C.lightGray);
    for (let i = 1; i <= 5; i++) {
        const r = actRow + i;
        dash.getRow(r).values = [i, '', '', '', '', '', '', ''];
        dash.mergeCells(r, 2, r, 8);
        dash.getCell(r, 2).font = { name: 'Calibri', size: 10 };
        dash.getCell(r, 2).alignment = { wrapText: true };
    }
    styleDataRows(dash, actRow + 1, actRow + 5, DC);

    addFooter(dash, actRow + 7, DC, '© ArslanOps — Bu dashboard haftada en az 1 kez gözden geçirilmelidir. Hedefler SMART ilkesine göre belirlenmiştir.');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  SAYFA 2: GÜNLÜK CİRO TAKİP (30 Gün)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const ciro = wb.addWorksheet('Günlük Ciro', {
        properties: { tabColor: { argb: 'FF3B82F6' } },
        pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    const CC = 8;
    addBrandHeader(ciro, '💰 GÜNLÜK CİRO TAKİP TABLOSU', '30 günlük satış performansı izleme', CC);

    ciro.columns = [
        { width: 5 },
        { width: 14 },
        { width: 16 },
        { width: 16 },
        { width: 14 },
        { width: 18 },
        { width: 18 },
        { width: 14 },
    ];

    instructionRow(ciro, 5, CC, '💡 B, C, D sütunlarını doldurun. Diğer sütunlardaki formüller otomatik çalışır. Ay sonunda toplam ve ortalama otomatik hesaplanır.');

    const ch = 6;
    ciro.getRow(ch).values = ['#', 'Tarih', 'Hedef (₺)', 'Gerçekleşen (₺)', 'Başarı %', 'Küm. Hedef (₺)', 'Küm. Gerçekleşen (₺)', 'Küm. %'];
    styleHeaderRow(ciro, ch, CC);

    for (let i = 1; i <= 31; i++) {
        const r = ch + i;
        const row = ciro.getRow(r);
        row.values = [i, '', '', '', '', '', '', ''];

        // Başarı % = Gerçekleşen / Hedef * 100
        row.getCell(5).value = { formula: `IF(OR(C${r}=0,C${r}=""),"",D${r}/C${r}*100)` };
        row.getCell(5).numFmt = '0.0"%"';

        // Kümülatif Hedef
        row.getCell(6).value = { formula: `IF(C${r}="","",SUM(C${ch + 1}:C${r}))` };
        row.getCell(6).numFmt = '#,##0" ₺"';

        // Kümülatif Gerçekleşen
        row.getCell(7).value = { formula: `IF(D${r}="","",SUM(D${ch + 1}:D${r}))` };
        row.getCell(7).numFmt = '#,##0" ₺"';

        // Kümülatif %
        row.getCell(8).value = { formula: `IF(OR(F${r}=0,F${r}=""),"",G${r}/F${r}*100)` };
        row.getCell(8).numFmt = '0.0"%"';
    }
    styleDataRows(ciro, ch + 1, ch + 31, CC);

    // Conditional formatting for Başarı %
    ciro.addConditionalFormatting({
        ref: `E${ch + 1}:E${ch + 31}`,
        rules: [
            { type: 'cellIs', operator: 'greaterThanOrEqual' as any, formulae: [90], style: { font: { color: { argb: 'FF16A34A' }, bold: true } }, priority: 1 },
            { type: 'cellIs', operator: 'greaterThanOrEqual' as any, formulae: [70], style: { font: { color: { argb: 'FFD97706' }, bold: true } }, priority: 2 },
            { type: 'cellIs', operator: 'lessThan' as any, formulae: [70], style: { font: { color: { argb: 'FFDC2626' }, bold: true } }, priority: 3 },
        ],
    });

    // Toplam satırı
    const totR = ch + 33;
    sectionHeader(ciro, totR, CC, '📊 AYLIK ÖZET', C.brand, C.light);
    const sumR = totR + 1;
    ciro.getRow(sumR).values = ['', 'TOPLAM', '', '', '', '', '', ''];
    ciro.getCell(sumR, 3).value = { formula: `SUM(C${ch + 1}:C${ch + 31})` };
    ciro.getCell(sumR, 3).numFmt = '#,##0" ₺"';
    ciro.getCell(sumR, 4).value = { formula: `SUM(D${ch + 1}:D${ch + 31})` };
    ciro.getCell(sumR, 4).numFmt = '#,##0" ₺"';
    ciro.getCell(sumR, 5).value = { formula: `IF(C${sumR}=0,"",D${sumR}/C${sumR}*100)` };
    ciro.getCell(sumR, 5).numFmt = '0.0"%"';
    ciro.getRow(sumR).font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.brand } };
    ciro.getRow(sumR).height = 30;

    const avgR = sumR + 1;
    ciro.getRow(avgR).values = ['', 'GÜNLÜK ORT.', '', '', '', '', '', ''];
    ciro.getCell(avgR, 3).value = { formula: `IFERROR(AVERAGE(C${ch + 1}:C${ch + 31}),"")` };
    ciro.getCell(avgR, 3).numFmt = '#,##0" ₺"';
    ciro.getCell(avgR, 4).value = { formula: `IFERROR(AVERAGE(D${ch + 1}:D${ch + 31}),"")` };
    ciro.getCell(avgR, 4).numFmt = '#,##0" ₺"';
    styleDataRows(ciro, sumR, avgR, CC);

    addFooter(ciro, avgR + 2, CC, '© ArslanOps — Günlük ciro verisi POS Z raporundan alınmalıdır. Hedef aylık bütçenin güne bölünmesiyle belirlenir.');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  SAYFA 3: COGS HESAPLAMA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const cogs = wb.addWorksheet('COGS Hesaplama', {
        properties: { tabColor: { argb: 'FFC4803D' } },
        pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    const COC = 8;
    addBrandHeader(cogs, '🧮 COGS HESAPLAMA & TAKİP', 'Satılan Malın Maliyeti — Aylık Detaylı Hesaplama', COC);

    cogs.columns = [
        { width: 5 },
        { width: 24 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 14 },
        { width: 22 },
    ];

    instructionRow(cogs, 5, COC, '💡 FORMÜL: COGS = (Dönem Başı Stok + Alımlar - Dönem Sonu Stok) / Toplam Satış × 100. C-E sütunlarını girin, F-G otomatik hesaplanır.');

    // Satış bilgisi
    sectionHeader(cogs, 6, COC, 'A. DÖNEM SATIŞ BİLGİSİ', C.blue, C.blueLight);
    cogs.getRow(7).values = ['', 'Dönem Toplam Satış (₺):', '', '', '', '', '', ''];
    cogs.getCell(7, 1).font = { name: 'Calibri', size: 11, bold: true };
    cogs.mergeCells(7, 1, 7, 2);
    cogs.getCell(7, 1).alignment = { horizontal: 'right', vertical: 'middle' };
    // C7: Kullanıcı buraya TOPLAM SATIŞI girecek — VURGULU!
    cogs.getCell('C7').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
    cogs.getCell('C7').font = { name: 'Calibri', size: 14, bold: true, color: { argb: C.brand } };
    cogs.getCell('C7').alignment = { horizontal: 'center', vertical: 'middle' };
    cogs.getCell('C7').border = {
        top: { style: 'medium', color: { argb: C.brand } },
        bottom: { style: 'medium', color: { argb: C.brand } },
        left: { style: 'medium', color: { argb: C.brand } },
        right: { style: 'medium', color: { argb: C.brand } },
    };
    cogs.getCell('C7').numFmt = '#,##0" ₺"';
    // D7: ipucu
    cogs.mergeCells(7, 4, 7, 8);
    cogs.getCell(7, 4).value = '← Ay sonu toplam ciro buraya girilecek (COGS % hesabı için zorunlu)';
    cogs.getCell(7, 4).font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FFDC2626' } };
    cogs.getRow(7).height = 30;
    const salesCell = 'C7';

    // Kategori bazlı COGS
    sectionHeader(cogs, 9, COC, 'B. KATEGORİ BAZLI MALİYET HESABI', C.brand, C.light);
    const cogsH = 10;
    cogs.getRow(cogsH).values = ['#', 'Kategori', 'Dönem Başı Stok (₺)', 'Dönem Alımları (₺)', 'Dönem Sonu Stok (₺)', 'COGS (₺)', 'COGS %', 'Not / Aksiyon'];
    styleHeaderRow(cogs, cogsH, COC);

    const cogsCategories = [
        'Kahve & Çay Hammaddeleri',
        'Süt & Süt Ürünleri',
        'Gıda Hammaddeleri (Et, Sebze)',
        'Ekmek & Unlu Mamuller',
        'İçecek (Şurup, Meyve Suyu)',
        'Ambalaj & Sarf Malzeme',
        'Temizlik Malzemeleri',
        'Diğer',
    ];

    cogsCategories.forEach((cat, i) => {
        const r = cogsH + 1 + i;
        const row = cogs.getRow(r);
        row.values = [i + 1, cat, '', '', '', '', '', ''];

        // COGS (₺) = Dönem Başı + Alımlar - Dönem Sonu
        row.getCell(6).value = { formula: `IF(OR(C${r}="",D${r}=""),"",C${r}+D${r}-E${r})` };
        row.getCell(6).numFmt = '#,##0" ₺"';

        // COGS % = COGS / Satış * 100
        row.getCell(7).value = { formula: `IF(OR(F${r}="",${salesCell}=0,${salesCell}=""),"",F${r}/${salesCell}*100)` };
        row.getCell(7).numFmt = '0.0"%"';
    });
    styleDataRows(cogs, cogsH + 1, cogsH + cogsCategories.length, COC);

    // Toplam COGS
    const cogsTotR = cogsH + cogsCategories.length + 1;
    cogs.getRow(cogsTotR).values = ['', 'TOPLAM', '', '', '', '', '', ''];
    cogs.getCell(cogsTotR, 3).value = { formula: `SUM(C${cogsH + 1}:C${cogsH + cogsCategories.length})` };
    cogs.getCell(cogsTotR, 3).numFmt = '#,##0" ₺"';
    cogs.getCell(cogsTotR, 4).value = { formula: `SUM(D${cogsH + 1}:D${cogsH + cogsCategories.length})` };
    cogs.getCell(cogsTotR, 4).numFmt = '#,##0" ₺"';
    cogs.getCell(cogsTotR, 5).value = { formula: `SUM(E${cogsH + 1}:E${cogsH + cogsCategories.length})` };
    cogs.getCell(cogsTotR, 5).numFmt = '#,##0" ₺"';
    cogs.getCell(cogsTotR, 6).value = { formula: `SUM(F${cogsH + 1}:F${cogsH + cogsCategories.length})` };
    cogs.getCell(cogsTotR, 6).numFmt = '#,##0" ₺"';
    cogs.getCell(cogsTotR, 7).value = { formula: `IF(OR(F${cogsTotR}="",${salesCell}=0,${salesCell}=""),"",F${cogsTotR}/${salesCell}*100)` };
    cogs.getCell(cogsTotR, 7).numFmt = '0.0"%"';
    cogs.getRow(cogsTotR).font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.brand } };
    cogs.getRow(cogsTotR).height = 30;

    // COGS Durum
    const cogsStatusR = cogsTotR + 2;
    sectionHeader(cogs, cogsStatusR, COC, 'C. COGS DEĞERLENDİRME', C.navy, C.lightGray);
    const evalR = cogsStatusR + 1;
    cogs.mergeCells(evalR, 1, evalR, 3);
    cogs.getCell(evalR, 1).value = 'Genel COGS Durumu:';
    cogs.getCell(evalR, 1).font = { name: 'Calibri', size: 11, bold: true };
    cogs.mergeCells(evalR, 4, evalR, 8);
    cogs.getCell(evalR, 4).value = { formula: `IF(G${cogsTotR}="","Veri giriniz",IF(G${cogsTotR}<=30,"✅ İdeal Aralıkta (%25-30)",IF(G${cogsTotR}<=35,"⚠️ Dikkat: Sınırda (%30-35)","🔴 KRİTİK: Acil düzeltme gerekli (>%35)")))` };
    cogs.getCell(evalR, 4).font = { name: 'Calibri', size: 11, bold: true };
    cogs.getRow(evalR).height = 30;

    // Düzeltme önerileri
    const fixR = evalR + 2;
    sectionHeader(cogs, fixR, COC, 'D. COGS YÜKSEKSE → DÜZELTME PLANI', C.red, C.redLight);
    const fixes = [
        ['1. Porsiyon Kontrolü', 'Tüm ürünlerin gramajlarını kontrol edin. Standart reçetelere uyuluyor mu?'],
        ['2. Tedarikçi Pazarlığı', '3 farklı tedarikçiden teklif alın. Toplu alım indirimi isteyin.'],
        ['3. Menü Fiyat Güncelleme', 'COGS>%35 olan ürünlerin fiyatlarını %10-15 artırın.'],
        ['4. Fire Azaltma', 'FIFO kuralını sıkılaştırın. Prep miktarlarını satışa göre ayarlayın.'],
        ['5. Menü Mühendisliği', 'Düşük karlı ürünleri çıkarın veya dönüştürün. Yıldız ürünleri öne çıkarın.'],
        ['6. Stok Yönetimi', 'Haftalık sayım yapın. Par-level sistemi kurun. Aşırı stoktan kaçının.'],
    ];
    fixes.forEach((fix, i) => {
        const r = fixR + 1 + i;
        cogs.getRow(r).values = ['', fix[0], '', '', '', fix[1], '', ''];
        cogs.mergeCells(r, 2, r, 4);
        cogs.getCell(r, 2).font = { name: 'Calibri', size: 10, bold: true, color: { argb: C.navy } };
        cogs.mergeCells(r, 5, r, 8);
        cogs.getCell(r, 5).font = { name: 'Calibri', size: 9 };
    });
    styleDataRows(cogs, fixR + 1, fixR + fixes.length, COC);

    addFooter(cogs, fixR + fixes.length + 2, COC, '© ArslanOps — İdeal COGS: Coffee Shop %25-30, Restoran %28-35. Haftalık stok sayımı zorunludur.');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  SAYFA 4: MÜŞTERİ MEMNUNİYET TAKİP
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const memn = wb.addWorksheet('Müşteri Memnuniyet', {
        properties: { tabColor: { argb: 'FF22C55E' } },
        pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    const MC = 7;
    addBrandHeader(memn, '⭐ MÜŞTERİ MEMNUNİYET TAKİP', 'Google Reviews, QR Anket, Direkt Geri Bildirim Kayıtları', MC);

    memn.columns = [
        { width: 5 }, { width: 14 }, { width: 20 }, { width: 12 },
        { width: 18 }, { width: 30 }, { width: 24 },
    ];

    instructionRow(memn, 5, MC, '💡 Her geri bildirimi kaydedin. D sütununa 1-5 arası puan girin. Alt kısımdaki formüller otomatik ortalama ve dağılım hesaplar.');

    const mh = 6;
    memn.getRow(mh).values = ['#', 'Tarih', 'Müşteri / Kaynak', 'Puan (1-5)', 'Kategori', 'Geri Bildirim Detayı', 'Yapılan Aksiyon'];
    styleHeaderRow(memn, mh, MC);

    for (let i = 1; i <= 20; i++) {
        const r = mh + i;
        memn.getRow(r).values = [i, '', '', '', '', '', ''];
    }
    styleDataRows(memn, mh + 1, mh + 20, MC);

    // Puan conditional formatting
    memn.addConditionalFormatting({
        ref: `D${mh + 1}:D${mh + 20}`,
        rules: [
            { type: 'cellIs', operator: 'greaterThanOrEqual' as any, formulae: [4], style: { font: { color: { argb: 'FF16A34A' }, bold: true } }, priority: 1 },
            { type: 'cellIs', operator: 'greaterThanOrEqual' as any, formulae: [3], style: { font: { color: { argb: 'FFD97706' }, bold: true } }, priority: 2 },
            { type: 'cellIs', operator: 'lessThan' as any, formulae: [3], style: { font: { color: { argb: 'FFDC2626' }, bold: true } }, priority: 3 },
        ],
    });

    // Özet
    const msumR = mh + 22;
    sectionHeader(memn, msumR, MC, '📊 MEMNUNİYET ANALİZİ', C.green, C.greenLight);
    const metrics = [
        ['Ortalama Puan', `IFERROR(AVERAGE(D${mh + 1}:D${mh + 20}),0)`, '/ 5.0'],
        ['Toplam Geri Bildirim', `COUNTA(D${mh + 1}:D${mh + 20})`, 'adet'],
        ['Memnun Müşteri (4-5 puan)', `COUNTIF(D${mh + 1}:D${mh + 20},">=4")`, 'kişi'],
        ['Memnuniyet Oranı', `IFERROR(COUNTIF(D${mh + 1}:D${mh + 20},">=4")/COUNTA(D${mh + 1}:D${mh + 20})*100,0)`, '%'],
        ['Düşük Puan (1-2)', `COUNTIF(D${mh + 1}:D${mh + 20},"<=2")`, 'kişi (ACİL AKSİYON)'],
    ];
    metrics.forEach((m, i) => {
        const r = msumR + 1 + i;
        memn.getRow(r).values = ['', m[0], '', '', '', '', ''];
        memn.mergeCells(r, 2, r, 3);
        memn.getCell(r, 2).font = { name: 'Calibri', size: 10, bold: true };
        memn.getCell(r, 4).value = { formula: m[1] };
        memn.getCell(r, 4).font = { name: 'Calibri', size: 12, bold: true, color: { argb: C.brand } };
        memn.mergeCells(r, 5, r, 7);
        memn.getCell(r, 5).value = m[2];
        memn.getCell(r, 5).font = { name: 'Calibri', size: 10 };
    });
    styleDataRows(memn, msumR + 1, msumR + metrics.length, MC);

    addFooter(memn, msumR + metrics.length + 2, MC, '© ArslanOps — Hedef: 4.5/5 üzeri. Kategoriler: Ürün, Servis, Hijyen, Fiyat, Mekan, Personel');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  SAYFA 5: MASA DEVİR HIZI
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const masa = wb.addWorksheet('Masa Devir Hızı', {
        properties: { tabColor: { argb: 'FF8B5CF6' } },
        pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    const MAC = 8;
    addBrandHeader(masa, '🔄 MASA DEVİR HIZI TAKİP', 'Oturma kapasitesi kullanım verimliliği', MAC);

    masa.columns = [
        { width: 5 }, { width: 14 }, { width: 12 }, { width: 14 },
        { width: 14 }, { width: 14 }, { width: 14 }, { width: 22 },
    ];

    // Row 5: Split — sol taraf instruction, sağ taraf Toplam Masa girişi
    // NOT: instructionRow kullanılmıyor çünkü tüm satırı merge eder ve G5'i yok eder
    masa.mergeCells(5, 1, 5, 5);
    const instrCell5 = masa.getCell(5, 1);
    instrCell5.value = '💡 C-D sütunlarını doldurun. Devir hızı otomatik hesaplanır. Hedef: 3x/gün';
    instrCell5.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF6B7280' } };
    instrCell5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
    instrCell5.alignment = { vertical: 'middle' };

    // Toplam Masa label + input (F5-G5 ayrı hücre, merge yok!)
    masa.getCell('F5').value = 'Toplam Masa →';
    masa.getCell('F5').font = { name: 'Calibri', size: 10, bold: true, color: { argb: C.navy } };
    masa.getCell('F5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
    masa.getCell('F5').alignment = { horizontal: 'right', vertical: 'middle' };

    // G5: Kullanıcı buraya masa sayısını girecek
    masa.getCell('G5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
    masa.getCell('G5').font = { name: 'Calibri', size: 14, bold: true, color: { argb: C.brand } };
    masa.getCell('G5').alignment = { horizontal: 'center', vertical: 'middle' };
    masa.getCell('G5').border = {
        top: { style: 'medium', color: { argb: C.brand } },
        bottom: { style: 'medium', color: { argb: C.brand } },
        left: { style: 'medium', color: { argb: C.brand } },
        right: { style: 'medium', color: { argb: C.brand } },
    };
    // H5: Ort. Oturma açıklaması
    masa.getCell('H5').value = 'G: Devir hızına göre otomatik hesaplanır';
    masa.getCell('H5').font = { name: 'Calibri', size: 9, italic: true, color: { argb: C.darkGray } };
    masa.getCell('H5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
    masa.getRow(5).height = 28;

    const mahdr = 6;
    masa.getRow(mahdr).values = ['#', 'Tarih', 'Öğle Müşteri', 'Akşam Müşteri', 'Toplam Müşteri', 'Devir Hızı (x)', 'Ort. Oturma (dk)', 'Not'];
    styleHeaderRow(masa, mahdr, MAC);

    for (let i = 1; i <= 31; i++) {
        const r = mahdr + i;
        masa.getRow(r).values = [i, '', '', '', '', '', '', ''];

        // Toplam = Öğle + Akşam
        masa.getCell(r, 5).value = { formula: `IF(AND(C${r}="",D${r}=""),"",C${r}+D${r})` };
        // Devir Hızı = Toplam Müşteri / (Masa × 2 kişi ort.)
        masa.getCell(r, 6).value = { formula: `IF(OR(E${r}="",G$5="",G$5=0),"",E${r}/(G$5*2))` };
        masa.getCell(r, 6).numFmt = '0.0"x"';
        // Ort. Oturma (dk) — Sektör standardına göre kademeli tahmin
        masa.getCell(r, 7).value = { formula: `IF(F${r}="","",IF(F${r}>=4,30,IF(F${r}>=3,45,IF(F${r}>=2,60,IF(F${r}>=1,90,120)))))` };
        masa.getCell(r, 7).numFmt = '0" dk"';
    }
    styleDataRows(masa, mahdr + 1, mahdr + 31, MAC);

    // Masa devir conditional formatting
    masa.addConditionalFormatting({
        ref: `F${mahdr + 1}:F${mahdr + 31}`,
        rules: [
            { type: 'cellIs', operator: 'greaterThanOrEqual' as any, formulae: [3], style: { font: { color: { argb: 'FF16A34A' }, bold: true } }, priority: 1 },
            { type: 'cellIs', operator: 'greaterThanOrEqual' as any, formulae: [2], style: { font: { color: { argb: 'FFD97706' }, bold: true } }, priority: 2 },
            { type: 'cellIs', operator: 'lessThan' as any, formulae: [2], style: { font: { color: { argb: 'FFDC2626' }, bold: true } }, priority: 3 },
        ],
    });

    const matotR = mahdr + 33;
    sectionHeader(masa, matotR, MAC, '📊 AYLIK ÖZET', C.purple, C.purpleLight);
    masa.getRow(matotR + 1).values = ['', 'Ort. Günlük Müşteri', '', '', '', '', '', ''];
    masa.getCell(matotR + 1, 5).value = { formula: `IFERROR(AVERAGE(E${mahdr + 1}:E${mahdr + 31}),"")` };
    masa.getRow(matotR + 2).values = ['', 'Ort. Devir Hızı', '', '', '', '', '', ''];
    masa.getCell(matotR + 2, 6).value = { formula: `IFERROR(AVERAGE(F${mahdr + 1}:F${mahdr + 31}),"")` };
    masa.getCell(matotR + 2, 6).numFmt = '0.0"x"';
    masa.getRow(matotR + 3).values = ['', 'En Yoğun Gün (Müşteri)', '', '', '', '', '', ''];
    masa.getCell(matotR + 3, 5).value = { formula: `IFERROR(MAX(E${mahdr + 1}:E${mahdr + 31}),"")` };
    masa.getRow(matotR + 4).values = ['', 'Toplam Oturma Kap. (kişi/gün)', '', '', '', '', '', ''];
    masa.getCell(matotR + 4, 5).value = { formula: `IF(OR(G5="",G5=0),"",G5*2)` };
    masa.getRow(matotR + 5).values = ['', 'Ort. Oturma Süresi (dk)', '', '', '', '', '', ''];
    masa.getCell(matotR + 5, 7).value = { formula: `IFERROR(AVERAGE(G${mahdr + 1}:G${mahdr + 31}),"")` };
    masa.getCell(matotR + 5, 7).numFmt = '0" dk"';
    styleDataRows(masa, matotR + 1, matotR + 5, MAC);

    // Devir hızı artırma önerileri
    const maFixR = matotR + 7;
    sectionHeader(masa, maFixR, MAC, '🚀 DEVİR HIZI DÜŞÜKSE → İYİLEŞTİRME PLANI', C.navy, C.lightGray);
    const maFixes = [
        '1. Servis süresini ölçün ve kısaltın (hedef: sipariş→servis 12 dk)',
        '2. Menüden kararsızlık yaratan fazla seçenekleri çıkarın',
        '3. Ödeme sürecini hızlandırın (masada ödeme, QR sipariş)',
        '4. Yoğun saatlerde "bekleme listesi" sistemi kullanın',
        '5. Düşük performanslı zaman dilimlerinde özel kampanya yapın',
    ];
    maFixes.forEach((fix, i) => {
        const r = maFixR + 1 + i;
        masa.mergeCells(r, 2, r, 8);
        masa.getCell(r, 2).value = fix;
        masa.getCell(r, 2).font = { name: 'Calibri', size: 10 };
    });
    styleDataRows(masa, maFixR + 1, maFixR + maFixes.length, MAC);

    addFooter(masa, maFixR + maFixes.length + 2, MAC, '© ArslanOps — Devir Hızı = Toplam Müşteri / (Masa × Ort. Kişi). Hedef: 3x/gün. Coffee shop için 4-5x idealdir.');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  SAYFA 6: PERSONEL TAKİP
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const pers = wb.addWorksheet('Personel Takip', {
        properties: { tabColor: { argb: 'FF64748B' } },
        pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    const PC = 8;
    addBrandHeader(pers, '👥 PERSONEL & İK TAKİP', 'Personel devir oranı ve performans izleme', PC);

    pers.columns = [
        { width: 5 }, { width: 22 }, { width: 16 }, { width: 14 },
        { width: 14 }, { width: 14 }, { width: 14 }, { width: 22 },
    ];

    instructionRow(pers, 5, PC, '💡 Personel bilgilerini girin. İşten ayrılan personel için E sütununa çıkış tarihini yazın. Devir oranı otomatik hesaplanır.');

    const ph = 6;
    pers.getRow(ph).values = ['#', 'Personel Adı', 'Pozisyon', 'Giriş Tarihi', 'Çıkış Tarihi', 'Çalışma (Ay)', 'Durum', 'Not'];
    styleHeaderRow(pers, ph, PC);

    for (let i = 1; i <= 15; i++) {
        const r = ph + i;
        pers.getRow(r).values = [i, '', '', '', '', '', '', ''];

        // Çalışma süresi (ay)
        pers.getCell(r, 6).value = { formula: `IF(D${r}="","",IF(E${r}="",DATEDIF(D${r},TODAY(),"M"),DATEDIF(D${r},E${r},"M")))` };
        // Durum
        pers.getCell(r, 7).value = { formula: `IF(D${r}="","",IF(E${r}="","✅ Aktif","❌ Ayrıldı"))` };
    }
    styleDataRows(pers, ph + 1, ph + 15, PC);

    // İK Özet
    const psumR = ph + 17;
    sectionHeader(pers, psumR, PC, '📊 İK PERFORMANS ÖZETİ', C.navy, C.lightGray);
    const pMetrics = [
        ['Toplam Personel (Aktif)', `COUNTIF(G${ph + 1}:G${ph + 15},"*Aktif*")`],
        ['Ayrılan Personel', `COUNTIF(G${ph + 1}:G${ph + 15},"*Ayrıldı*")`],
        ['Devir Oranı (%)', `IFERROR(COUNTIF(G${ph + 1}:G${ph + 15},"*Ayrıldı*")/(COUNTIF(G${ph + 1}:G${ph + 15},"*Aktif*")+COUNTIF(G${ph + 1}:G${ph + 15},"*Ayrıldı*"))*100,0)`],
        ['Ort. Çalışma Süresi (Ay)', `IFERROR(AVERAGE(F${ph + 1}:F${ph + 15}),0)`],
    ];
    pMetrics.forEach((m, i) => {
        const r = psumR + 1 + i;
        pers.getRow(r).values = ['', m[0], '', '', '', '', '', ''];
        pers.mergeCells(r, 2, r, 4);
        pers.getCell(r, 2).font = { name: 'Calibri', size: 10, bold: true };
        pers.getCell(r, 5).value = { formula: m[1] };
        pers.getCell(r, 5).font = { name: 'Calibri', size: 12, bold: true, color: { argb: C.brand } };
    });
    styleDataRows(pers, psumR + 1, psumR + pMetrics.length, PC);

    // İK Stratejisi
    const pFixR = psumR + pMetrics.length + 2;
    sectionHeader(pers, pFixR, PC, '🎯 DEVİR ORANI YÜKSEKSE → İK STRATEJİSİ', C.red, C.redLight);
    const pFixes = [
        '1. Çıkış mülakatı yapın: Neden ayrılıyor? En sık nedenler: Maaş, çalışma saatleri, yönetim',
        '2. Piyasa maaş araştırması yapın. Rakiplerinizden %10 düşükseniz personel kaybedersiniz',
        '3. Kariyer planı sunun: Barista → Kıdemli Barista → Bar Şefi → Asistan Müdür',
        '4. Çalışma koşullarını iyileştirin: Düzenli çizelge, önceden bildirim, mola düzeni',
        '5. Ödül sistemi kurun: Ayın elemanı, prim, ücretsiz yemek/içecek, doğum günü jesti',
        '6. Eğitim verin: Latte Art kursu, SCA sertifikası gibi kişisel gelişim fırsatları',
    ];
    pFixes.forEach((fix, i) => {
        const r = pFixR + 1 + i;
        pers.mergeCells(r, 2, r, 8);
        pers.getCell(r, 2).value = fix;
        pers.getCell(r, 2).font = { name: 'Calibri', size: 9 };
    });
    styleDataRows(pers, pFixR + 1, pFixR + pFixes.length, PC);

    addFooter(pers, pFixR + pFixes.length + 2, PC, '© ArslanOps — İdeal personel devir oranı: <%10/yıl. %25 üzeri ACİL İK müdahalesi gerektirir.');

    // ━ Kaydet
    await saveWorkbook(wb, `KPI_Dashboard_${today()}.xlsx`);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  8. DANISMANLIK CEP KARTI — Tek Sayfa Cheat Sheet                  */
/* ═══════════════════════════════════════════════════════════════════ */
export function generateCepKartiPDF() {
    const doc = new jsPDF('p', 'mm', 'a4');

    // Brand header
    doc.setFillColor(11, 31, 59);
    doc.rect(0, 0, 210, 14, 'F');
    doc.setTextColor(255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ArslanOps — DANISMANLIK CEP KARTI', 105, 10, { align: 'center' });

    // Sub header
    doc.setFillColor(196, 128, 61);
    doc.rect(0, 14, 210, 8, 'F');
    doc.setFontSize(8);
    doc.text('Tum formuller, sektor standartlari ve kritik degerler — Tek Sayfa Referans', 105, 19, { align: 'center' });

    // Section 1: Formuller
    doc.setTextColor(11, 31, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('TEMEL FORMULLER', 10, 30);

    autoTable(doc, {
        startY: 33,
        head: [['Metrik', 'Formul', 'Ornek']],
        body: [
            ['COGS %', '(D.Basi Stok + Alim - D.Sonu Stok) / Satis x 100', '(10K+5K-8.5K)/50K = %13'],
            ['Fire Orani', 'Atilan Urun (TL) / Toplam Alim (TL) x 100', '80 / 1.000 = %8'],
            ['Prime Cost', '(COGS + Personel Maliyeti) / Ciro x 100', '(30K+25K)/100K = %55'],
            ['Break-Even', 'Sabit Gider / (1 - COGS Orani)', '90K / 0.70 = 128.571 TL/ay'],
            ['Masa Devir', 'Toplam Musteri / (Masa x Ort.Kisi)', '120 / (20x2) = 3x'],
            ['Labor Cost', 'Personel Top. Maliyet / Ciro x 100', '28K / 100K = %28'],
            ['Katki Payi', '1 - (Degisken Gider Orani)', '1 - 0.30 = 0.70'],
            ['Ort. Sepet', 'Toplam Ciro / Siparis Sayisi', '15.000 / 120 = 125 TL'],
        ],
        headStyles: { fillColor: [11, 31, 59], fontSize: 7, halign: 'center' },
        bodyStyles: { fontSize: 6.5 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        theme: 'grid',
        margin: { left: 10, right: 10 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 25 }, 1: { cellWidth: 85 }, 2: { cellWidth: 70 } },
    });

    // Section 2: Sektor Standartlari
    const y1 = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('SEKTOR STANDARTLARI (Isletme Tipine Gore)', 10, y1);

    autoTable(doc, {
        startY: y1 + 3,
        head: [['Metrik', 'Coffee Shop', 'Fast Casual', 'Restoran', 'Fine Dining']],
        body: [
            ['COGS %', '%25-30', '%28-32', '%30-35', '%32-38'],
            ['Labor %', '%20-25', '%25-28', '%28-32', '%30-35'],
            ['Prime Cost', '%50-55', '%55-60', '%58-65', '%62-70'],
            ['Fire Orani', '%2-3', '%2-4', '%3-5', '%3-5'],
            ['Devir Hizi', '4-6x', '3-4x', '2-3x', '1-2x'],
            ['Ort. Oturma', '20-40 dk', '30-45 dk', '60-90 dk', '90-150 dk'],
            ['Siparis Suresi', '<2 dk', '<3 dk', '<5 dk', '<8 dk'],
            ['Servis Suresi', '<5 dk', '<10 dk', '<15 dk', '<25 dk'],
            ['Kasa Farki', '+/- 20 TL', '+/- 50 TL', '+/- 50 TL', '+/- 50 TL'],
        ],
        headStyles: { fillColor: [196, 128, 61], fontSize: 7, halign: 'center' },
        bodyStyles: { fontSize: 6.5, halign: 'center' },
        alternateRowStyles: { fillColor: [255, 248, 240] },
        theme: 'grid',
        margin: { left: 10, right: 10 },
        columnStyles: { 0: { fontStyle: 'bold', halign: 'left', cellWidth: 25 } },
    });

    // Section 3: Kritik Sicakliklar
    const y2 = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('KRITIK SICAKLIK DEGERLERI (HACCP)', 10, y2);

    autoTable(doc, {
        startY: y2 + 3,
        head: [['Alan', 'Ideal', 'Uyari', 'Tehlike']],
        body: [
            ['Buzdolabi', '0 - 4 C', '4 - 8 C', '> 8 C'],
            ['Dondurucu', '<= -18 C', '-18 ile -15 C', '> -15 C'],
            ['Sicak Servis', '>= 63 C', '55 - 63 C', '< 55 C'],
            ['Et Pisirme Ic', '>= 72 C', '63 - 72 C', '< 63 C'],
            ['Tehlike Bolge', '---', '---', '5 - 63 C (2 saat max)'],
        ],
        headStyles: { fillColor: [239, 68, 68], fontSize: 7, halign: 'center' },
        bodyStyles: { fontSize: 6.5, halign: 'center' },
        alternateRowStyles: { fillColor: [254, 242, 242] },
        theme: 'grid',
        margin: { left: 10, right: 10 },
        columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } },
    });

    // Section 4: Musteriye Sorulacak 10 Kritik Soru
    const y3 = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('MUSTERIYE SORULACAK 10 KRITIK SORU', 10, y3);

    autoTable(doc, {
        startY: y3 + 3,
        head: [['#', 'Soru', 'Neden Onemli']],
        body: [
            ['1', 'Aylik ciro hedefiniz ne?', 'Break-even analizi icin temel veri'],
            ['2', 'COGS oraninizi biliyor musunuz?', 'Cogu isletme bilmez, sorunuzu gosterir'],
            ['3', 'Haftalik stok sayimi yapiyor musunuz?', 'Yapmiyorsa fire ve hirsizlik kontrolsuz'],
            ['4', 'Kasa farkiniz ne seviyede?', 'Gunluk +/- 50 TL ustuyse sorun var'],
            ['5', 'Personel devir oraniniz nedir?', '%15 ustuyse ciddi IK sorunu var'],
            ['6', 'Musteriden geri bildirim aliyor musunuz?', 'Google Reviews + QR anket kontrolu'],
            ['7', 'Recepteleriniz standart mi?', 'Yoksa COGS kontrolsuz + tutarsiz lezzet'],
            ['8', 'Sicaklik kaydi tutuyor musunuz?', 'HACCP uyumu + yasal zorunluluk'],
            ['9', 'Menuyu en son ne zaman guncellediniz?', '6 aydan eskiyse menu muhendisligi gerekli'],
            ['10', 'Gunluk Z raporu aliyor musunuz?', 'POS verisi yoksa hicbir KPI olculemez'],
        ],
        headStyles: { fillColor: [11, 31, 59], fontSize: 7, halign: 'center' },
        bodyStyles: { fontSize: 6 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        theme: 'grid',
        margin: { left: 10, right: 10 },
        columnStyles: { 0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' }, 1: { cellWidth: 80 }, 2: { cellWidth: 92 } },
    });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`ArslanOps -- Danismanlik Cep Karti -- ${today()} -- Bu belgeyi yazdir ve her ziyarette yaninda bulundur`, 105, 290, { align: 'center' });

    doc.save(`Danismanlik_Cep_Karti_${today()}.pdf`);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  9. RED FLAG (KIRMIZI BAYRAK) LISTESI                              */
/* ═══════════════════════════════════════════════════════════════════ */
export function generateRedFlagPDF() {
    const doc = new jsPDF('p', 'mm', 'a4');

    // Brand header
    doc.setFillColor(239, 68, 68);
    doc.rect(0, 0, 210, 14, 'F');
    doc.setTextColor(255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('KIRMIZI BAYRAK LISTESI -- Ziyarette Aninda Alarm!', 105, 10, { align: 'center' });

    doc.setFillColor(11, 31, 59);
    doc.rect(0, 14, 210, 7, 'F');
    doc.setFontSize(8);
    doc.text('ArslanOps -- Bu isaretleri gorursen aninda mudahale et', 105, 18.5, { align: 'center' });

    // Category 1: Gida Guvenligi
    autoTable(doc, {
        startY: 26,
        head: [['GIDA GUVENLIGI & HIJYEN -- Yasal Risk + Musteri Sagligi']],
        body: [
            ['Buzdolabi sicakligi 4 C uzerinde (termometre kontrolu)'],
            ['Dondurucu sicakligi -18 C ustunde'],
            ['SKT gecmis urun rafta veya buzdolabinda'],
            ['Personel eldivensiz cig et / tavuk isliyor'],
            ['FIFO kurali uygulanmiyor (yeni urun onde, eski arkada)'],
            ['Sicaklik kayit formu yok veya doldurulmuyor'],
            ['Cig ve pismis urunler ayni rafta (capraz kontaminasyon)'],
            ['Personel sac bonesi / eldiven / onluk takmiyor'],
            ['Temizlik malzemeleri gida ile ayni alanda depolaniyor'],
            ['El yikama lavabosunda sabun / kagit havlu yok'],
        ],
        headStyles: { fillColor: [239, 68, 68], fontSize: 9, halign: 'center' },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [254, 242, 242] },
        theme: 'grid',
        margin: { left: 10, right: 10 },
    });

    // Category 2: Finansal
    const y1 = (doc as any).lastAutoTable.finalY + 4;
    autoTable(doc, {
        startY: y1,
        head: [['FINANSAL KIRMIZI BAYRAKLAR -- Para Kaybi Riski']],
        body: [
            ['Kasa farki 3 gun ust uste 100 TL+ (hirsizlik/hata alarmi)'],
            ['COGS orani %38 uzerinde (maliyet kontrol disi)'],
            ['Fire kaydi hic tutulmuyor (kayip gorunmuyor)'],
            ['Stok sayimi yapilmiyor veya duzensiz'],
            ['POS Z raporu alinmiyor (ciro takibi yok)'],
            ['Recepte standardizasyonu yok (her barista farkli yapiyor)'],
            ['Tedarikci fatura kontrolu yapilmiyor'],
            ['Gunluk ciro hedefi belirlenmemis'],
        ],
        headStyles: { fillColor: [196, 128, 61], fontSize: 9, halign: 'center' },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [255, 248, 240] },
        theme: 'grid',
        margin: { left: 10, right: 10 },
    });

    // Category 3: Operasyonel
    const y2 = (doc as any).lastAutoTable.finalY + 4;
    autoTable(doc, {
        startY: y2,
        head: [['OPERASYONEL KIRMIZI BAYRAKLAR -- Verimlilik Kaybi']],
        body: [
            ['Acilis/kapanis proseduru yazili degil'],
            ['Siparis -> servis suresi 15 dk+ (mutfak darbogazi)'],
            ['Personel devir orani yillik %25+ (surekli yeni eleman)'],
            ['SOP (standart prosedurler) yok veya guncellenmemis'],
            ['Vardiya devir formu kullanilmiyor'],
            ['Musteri sikayeti kayit altina alinmiyor'],
            ['Google Reviews ortalamasi 3.5/5 altinda'],
            ['POS iptal orani %5 uzerinde (hata/suistimal alarmi)'],
        ],
        headStyles: { fillColor: [11, 31, 59], fontSize: 9, halign: 'center' },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [240, 245, 255] },
        theme: 'grid',
        margin: { left: 10, right: 10 },
    });

    // Urgency Guide
    const y3 = (doc as any).lastAutoTable.finalY + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(239, 68, 68);
    doc.text('ONCELIK REHBERI:', 10, y3);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.setFontSize(7);
    doc.text('ACIL (24 saat): Gida guvenligi ihlalleri  |  YUKSEK (1 hafta): Finansal kontrol eksikleri  |  ORTA (2 hafta): Operasyonel iyilestirmeler', 10, y3 + 4);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`ArslanOps -- Kirmizi Bayrak Listesi -- ${today()} -- Her ziyarette bu listeyi kontrol et`, 105, 290, { align: 'center' });

    doc.save(`Kirmizi_Bayrak_Listesi_${today()}.pdf`);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  10. ZIYARET AKIS SEMASI -- Ilk Ziyaret + Takip Ziyareti           */
/* ═══════════════════════════════════════════════════════════════════ */
export function generateZiyaretAkisPDF() {
    const doc = new jsPDF('p', 'mm', 'a4');

    // Brand header
    doc.setFillColor(11, 31, 59);
    doc.rect(0, 0, 210, 14, 'F');
    doc.setTextColor(255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ArslanOps -- DANISMANLIK ZIYARET AKIS SEMASI', 105, 10, { align: 'center' });

    doc.setFillColor(196, 128, 61);
    doc.rect(0, 14, 210, 7, 'F');
    doc.setFontSize(8);
    doc.text('Ilk Ziyaret + Takip Ziyareti -- Adim Adim Rehber', 105, 18.5, { align: 'center' });

    // ILK ZIYARET
    doc.setTextColor(11, 31, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('A. ILK ZIYARET AKISI (Kesif & Analiz -- 2-3 saat)', 10, 28);

    autoTable(doc, {
        startY: 31,
        head: [['Adim', 'Islem', 'Sure', 'Ne Yapilacak', 'Araclar']],
        body: [
            ['1', 'Genel Gozlem', '15 dk', 'Disaridan baslayarak iceriye gir. Musteri gozuyle bak. Ilk izlenim, temizlik, ambiyans not al.', 'Telefon kamera'],
            ['2', 'Isletme Sahibi Gorusme', '20 dk', '10 kritik soruyu sor (Cep Kartinda). Beklentileri, sorunlari dinle. Not al.', 'Cep Karti'],
            ['3', 'Mutfak Turu', '20 dk', 'Buzdolabi, dondurucu, depo sicakliklari olc. FIFO kontrol. SKT kontrol. Temizlik durumu.', 'Termometre'],
            ['4', 'POS & Ciro Analizi', '15 dk', 'Son 30 gun Z raporlarini iste. Gunluk ciro, urun bazli satis, iptal oranlari.', 'POS sistemi'],
            ['5', 'Menu & Fiyat Analizi', '15 dk', 'Menu kart incele. Fiyatlari rakiplerle karsilastir. COGS tahmini yap.', 'Rakip menuleri'],
            ['6', 'Stok & Depo Kontrolu', '15 dk', 'Depo duzeni, etiketleme, FIFO, SKT. Stok kayit sistemi var mi?', 'Stok Formu'],
            ['7', 'Personel Gozlem', '15 dk', 'Kac kisi calisiyor, gorevler belli mi, SOP var mi, hijyen uyumu.', 'Gozlem'],
            ['8', 'Kasa Kontrolu', '10 dk', 'Kasa farki durumu, odeme turleri, Z raporu alimi.', 'Kasa Formu'],
            ['9', 'Fotograf Dokumantasyon', '10 dk', 'Sorunlu alanlar, iyi uygulamalar, oncesi fotolarini cek.', 'Telefon'],
            ['10', 'Oncelikli Bulgu Ozeti', '15 dk', 'En kritik 3-5 bulguyu isletme sahibine anlat. Ilk mudahale plani.', 'Not defteri'],
        ],
        headStyles: { fillColor: [11, 31, 59], fontSize: 7, halign: 'center' },
        bodyStyles: { fontSize: 6.5 },
        alternateRowStyles: { fillColor: [240, 245, 255] },
        theme: 'grid',
        margin: { left: 10, right: 10 },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 30, fontStyle: 'bold' },
            2: { cellWidth: 12, halign: 'center' },
            3: { cellWidth: 93 },
            4: { cellWidth: 25 },
        },
    });

    // TAKIP ZIYARETI
    const y1 = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('B. TAKIP ZIYARETI AKISI (Kontrol & Iyilestirme -- 1-1.5 saat)', 10, y1);

    autoTable(doc, {
        startY: y1 + 3,
        head: [['Adim', 'Islem', 'Sure', 'Ne Yapilacak', 'Araclar']],
        body: [
            ['1', 'Onceki Aksiyonlar', '10 dk', 'Gecen ziyaretten kalan aksiyonlari kontrol et. Yapilanlar ve yapilmayanlar.', 'Aksiyon Plani'],
            ['2', 'KPI Dashboard Inceleme', '10 dk', 'Son haftanin KPI verilerini gozden gecir. Kirmizi olanlar icin neden analizi.', 'KPI Dashboard'],
            ['3', 'Stok Sayim Teyit', '10 dk', 'Haftalik stok sayimi yapildi mi? Farklar var mi? Fire kaydi kontrol.', 'Stok Formu'],
            ['4', 'Hijyen Hizli Kontrol', '10 dk', 'Sicakliklar, temizlik, personel hijyeni. Red Flag kontrolu.', 'Red Flag Liste'],
            ['5', 'Kasa & Ciro Kontrol', '10 dk', 'Kasa farklari, ciro trendi, hedef karsilastirma.', 'KPI Dashboard'],
            ['6', 'Personel Gorusme', '10 dk', 'Sorunlar, oneriler, motivasyon durumu. Cikan personel var mi?', 'Gozlem'],
            ['7', 'Yeni Aksiyon Yazma', '10 dk', 'Tespit edilen sorunlar icin yeni aksiyonlar yaz. Sorumlu ve tarih belirle.', 'Aksiyon Plani'],
            ['8', 'Isletme Sahibi Ozet', '10 dk', 'Gelismeleri, sorunlari ve yeni plani isletme sahibine anlat.', 'Sozlu'],
        ],
        headStyles: { fillColor: [196, 128, 61], fontSize: 7, halign: 'center' },
        bodyStyles: { fontSize: 6.5 },
        alternateRowStyles: { fillColor: [255, 248, 240] },
        theme: 'grid',
        margin: { left: 10, right: 10 },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 30, fontStyle: 'bold' },
            2: { cellWidth: 12, halign: 'center' },
            3: { cellWidth: 93 },
            4: { cellWidth: 25 },
        },
    });

    // AYLIK TAKVIM
    const y2 = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('C. AYLIK DANISMANLIK TAKVIMI', 10, y2);

    autoTable(doc, {
        startY: y2 + 3,
        head: [['Hafta', 'Odak Alani', 'Yapilacaklar', 'Cikti']],
        body: [
            ['Hafta 1', 'Maliyet & Stok', 'Stok sayim + COGS hesaplama + fire analizi + tedarikci fiyat kontrolu', 'COGS Raporu'],
            ['Hafta 2', 'Musteri & Kalite', 'Google Reviews kontrol + QR anket analizi + sikayet takip + hijyen tur', 'Memnuniyet Raporu'],
            ['Hafta 3', 'Personel & Operasyon', 'Performans degerlendirme + devir orani + egitim ihtiyac + SOP guncelleme', 'IK Raporu'],
            ['Hafta 4', 'Genel & Planlama', 'KPI Dashboard toplanti + aylik rapor + gelecek ay hedefleri + aksiyon plani', 'Aylik Ozet PDF'],
        ],
        headStyles: { fillColor: [34, 197, 94], fontSize: 7, halign: 'center' },
        bodyStyles: { fontSize: 7 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        theme: 'grid',
        margin: { left: 10, right: 10 },
        columnStyles: {
            0: { cellWidth: 18, fontStyle: 'bold', halign: 'center' },
            1: { cellWidth: 28, fontStyle: 'bold' },
            2: { cellWidth: 100 },
            3: { cellWidth: 24 },
        },
    });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`ArslanOps -- Ziyaret Akis Semasi -- ${today()} -- Her ziyaret oncesi gozden gecir`, 105, 290, { align: 'center' });

    doc.save(`Ziyaret_Akis_Semasi_${today()}.pdf`);
}

