'use client';

import { useState } from 'react';
import { Download, CreditCard, Loader2, QrCode, Phone, Mail, Globe, MapPin, Upload, X, Instagram } from 'lucide-react';
import QRCode from 'qrcode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface KartvizitData {
    name: string;
    title: string;
    phone: string;
    email: string;
    website: string;
    instagram: string;
    location: string;
    tagline: string;
    photoUrl: string;
}

const DEFAULT_DATA: KartvizitData = {
    name: 'İlhan Arslan',
    title: 'Kurucu & Baş Danışman',
    phone: '+90 539 233 11 474',
    email: 'info@arslanops.com',
    website: 'arslanops.com',
    instagram: '@arslanops',
    location: 'Türkiye genelinde hizmet',
    tagline: 'Coffee & Restoran Operasyon Danışmanlığı',
    photoUrl: '/uploads/team/f9099a34bb86.png',
};

// ─── vCard QR data ───
function generateVCard(data: KartvizitData): string {
    return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${data.name}`,
        `TITLE:${data.title}`,
        `TEL;TYPE=CELL:${data.phone.replace(/\s/g, '')}`,
        `EMAIL:${data.email}`,
        `URL:https://${data.website}`,
        `NOTE:${data.tagline}`,
        'END:VCARD'
    ].join('\n');
}

// ─── Load Image as Base64 ───
async function loadImageBase64(url: string): Promise<string | null> {
    try {
        const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
        const resp = await fetch(fullUrl);
        const blob = await resp.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

// ─── PDF Generation ───
async function generateKartvizitPDF(data: KartvizitData) {
    const { jsPDF } = await import('jspdf');

    // Generate branded QR code (gold on navy, with logo center)
    const vCardString = generateVCard(data);

    // Step 1: Generate base QR with gold modules on cream background
    const baseQrDataUrl = await QRCode.toDataURL(vCardString, {
        width: 600,
        margin: 1,
        color: { dark: '#C4803D', light: '#0B1F3B' },
        errorCorrectionLevel: 'H',  // High - allows 30% damage for logo overlay
    });

    // Step 2: Add brand logo overlay in center using canvas
    const qrDataUrl = await new Promise<string>((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 600;
        const ctx = canvas.getContext('2d')!;
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, 600, 600);

            // Center logo area
            const centerX = 300;
            const centerY = 300;
            const logoCircleR = 55;

            // Navy circle background
            ctx.beginPath();
            ctx.arc(centerX, centerY, logoCircleR + 6, 0, Math.PI * 2);
            ctx.fillStyle = '#C4803D';  // gold outer ring
            ctx.fill();

            ctx.beginPath();
            ctx.arc(centerX, centerY, logoCircleR, 0, Math.PI * 2);
            ctx.fillStyle = '#0B1F3B';  // navy inner
            ctx.fill();

            // Gold "A" letter
            ctx.fillStyle = '#D4AF37';
            ctx.font = 'bold 52px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('A', centerX, centerY + 3);

            resolve(canvas.toDataURL('image/png'));
        };
        img.src = baseQrDataUrl;
    });

    // Load photo
    let photoBase64: string | null = null;
    if (data.photoUrl) {
        photoBase64 = await loadImageBase64(data.photoUrl);
    }

    // A4 page
    const doc = new jsPDF('p', 'mm', 'a4');

    // ---- LOAD FONTS ----
    const fontBaseUrl = window.location.origin;
    try {
        const [regBuf, boldBuf] = await Promise.all([
            fetch(`${fontBaseUrl}/fonts/Roboto-Regular.ttf`).then(r => r.arrayBuffer()),
            fetch(`${fontBaseUrl}/fonts/Roboto-Bold.ttf`).then(r => r.arrayBuffer()),
        ]);
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
        console.warn('Font yüklenemedi:', e);
    }

    const FONT = doc.getFont().fontName;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // Card: 90mm x 50mm
    const cardW = 90;
    const cardH = 50;

    // Colors
    const navy: [number, number, number] = [11, 31, 59];
    const darkNavy: [number, number, number] = [7, 20, 40];
    const gold: [number, number, number] = [196, 128, 61];
    const lightGold: [number, number, number] = [212, 175, 55];
    const white: [number, number, number] = [255, 255, 255];
    const textLight: [number, number, number] = [200, 210, 225];
    const textMuted: [number, number, number] = [140, 155, 175];

    // Grid
    const cols = 2;
    const rows = 5;
    const marginX = (pageW - cols * cardW) / 2;
    const marginY = (pageH - rows * cardH) / 2;

    // Photo zone dimensions
    const photoW = 28;                       // right section width
    const infoW = cardW - photoW;            // left section width

    function drawCutMarks(cx: number, cy: number, r: number, c: number) {
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.15);
        const m = 4;
        if (r === 0) { doc.line(cx, cy - m, cx, cy); doc.line(cx + cardW, cy - m, cx + cardW, cy); }
        if (r === rows - 1) { doc.line(cx, cy + cardH, cx, cy + cardH + m); doc.line(cx + cardW, cy + cardH, cx + cardW, cy + cardH + m); }
        if (c === 0) { doc.line(cx - m, cy, cx, cy); doc.line(cx - m, cy + cardH, cx, cy + cardH); }
        if (c === cols - 1) { doc.line(cx + cardW, cy, cx + cardW + m, cy); doc.line(cx + cardW, cy + cardH, cx + cardW + m, cy + cardH); }
    }

    // ══════════════════════════════════════════════
    // PAGE 1: FRONT SIDES
    // ══════════════════════════════════════════════
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.setFont(FONT, 'normal');
    doc.text('Kartvizit Ön Yüz — Kesim çizgileri boyunca kesiniz', pageW / 2, 5, { align: 'center' });

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = marginX + col * cardW;
            const y = marginY + row * cardH;

            // ── Navy background ──
            doc.setFillColor(...navy);
            doc.rect(x, y, cardW, cardH, 'F');

            // ── Gold top accent ──
            doc.setFillColor(...gold);
            doc.rect(x, y, cardW, 0.6, 'F');

            // ── Gold bottom accent ──
            doc.setFillColor(...gold);
            doc.rect(x, y + cardH - 0.6, cardW, 0.6, 'F');

            // ── Photo area (right side) ──
            if (photoBase64) {
                // Slightly darker bg behind photo area
                doc.setFillColor(...darkNavy);
                doc.rect(x + infoW, y + 0.6, photoW, cardH - 1.2, 'F');

                // Gold vertical separator
                doc.setDrawColor(...gold);
                doc.setLineWidth(0.3);
                doc.line(x + infoW, y + 4, x + infoW, y + cardH - 4);

                // Photo
                const photoSize = 22;
                const photoX = x + infoW + (photoW - photoSize) / 2;
                const photoY = y + 5;

                // Gold border around photo
                doc.setDrawColor(...gold);
                doc.setLineWidth(0.4);
                doc.roundedRect(photoX - 0.8, photoY - 0.8, photoSize + 1.6, photoSize + 1.6, 1.2, 1.2, 'S');

                doc.addImage(photoBase64, 'PNG', photoX, photoY, photoSize, photoSize);

                // Name under photo
                doc.setTextColor(...lightGold);
                doc.setFontSize(4.5);
                doc.setFont(FONT, 'bold');
                const shortName = data.name.split(' ')[0];
                doc.text(shortName, x + infoW + photoW / 2, photoY + photoSize + 4, { align: 'center' });

                // Instagram under photo
                doc.setTextColor(...textMuted);
                doc.setFontSize(4);
                doc.setFont(FONT, 'normal');
                doc.text(data.instagram, x + infoW + photoW / 2, photoY + photoSize + 7.5, { align: 'center' });

                // Tagline under photo
                doc.setTextColor(100, 115, 140);
                doc.setFontSize(3.2);
                const pTagLines = doc.splitTextToSize(data.tagline, photoW - 4);
                doc.text(pTagLines, x + infoW + photoW / 2, photoY + photoSize + 11, { align: 'center' });
            }

            // ── LEFT SIDE: Info ──
            const lx = x + 5;  // left padding

            // Logo
            const logoR = 3;
            const logoCX = lx + logoR;
            const logoCY = y + 6;
            doc.setFillColor(...gold);
            doc.circle(logoCX, logoCY, logoR, 'F');
            doc.setTextColor(...white);
            doc.setFontSize(5);
            doc.setFont(FONT, 'bold');
            doc.text('A', logoCX - 1.4, logoCY + 1.8);

            // Brand text
            doc.setTextColor(...white);
            doc.setFontSize(7);
            doc.setFont(FONT, 'bold');
            doc.text('ArslanOps', lx + 8, y + 5.5);
            doc.setTextColor(...lightGold);
            doc.setFontSize(3.5);
            doc.setFont(FONT, 'normal');
            doc.text('COFFEE & RESTORAN OPERASYON', lx + 8, y + 8.5);

            // Thin gold line after brand
            doc.setDrawColor(...gold);
            doc.setLineWidth(0.15);
            doc.line(lx, y + 11.5, lx + 50, y + 11.5);

            // Name — surname UPPERCASE
            const nameParts = data.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ').toUpperCase();
            const displayName = `${firstName} ${lastName}`;
            doc.setTextColor(...white);
            doc.setFontSize(12);
            doc.setFont(FONT, 'bold');
            doc.text(displayName, lx, y + 19);

            // Title
            doc.setTextColor(...lightGold);
            doc.setFontSize(6);
            doc.setFont(FONT, 'normal');
            doc.text(data.title, lx, y + 23.5);

            // Contact section
            const cy0 = y + 29;
            const gap = 4.5;

            // Phone
            doc.setFillColor(...gold);
            doc.circle(lx + 1, cy0, 0.8, 'F');
            doc.setTextColor(...textLight);
            doc.setFontSize(5.5);
            doc.text(data.phone, lx + 3.5, cy0 + 0.8);

            // Email
            doc.setFillColor(...gold);
            doc.circle(lx + 1, cy0 + gap, 0.8, 'F');
            doc.setTextColor(...textLight);
            doc.text(data.email, lx + 3.5, cy0 + gap + 0.8);

            // Website
            doc.setFillColor(...gold);
            doc.circle(lx + 1, cy0 + gap * 2, 0.8, 'F');
            doc.setTextColor(...textLight);
            doc.text(data.website, lx + 3.5, cy0 + gap * 2 + 0.8);

            // Location
            doc.setFillColor(...gold);
            doc.circle(lx + 1, cy0 + gap * 3, 0.8, 'F');
            doc.setTextColor(...textMuted);
            doc.setFontSize(4.5);
            doc.text(data.location, lx + 3.5, cy0 + gap * 3 + 0.8);

            // ── Decorative corners ──
            doc.setDrawColor(gold[0], gold[1], gold[2]);
            doc.setLineWidth(0.15);
            // Top-right
            doc.line(x + cardW - 8, y + 2, x + cardW - 2, y + 2);
            doc.line(x + cardW - 2, y + 2, x + cardW - 2, y + 8);
            // Bottom-left
            doc.line(x + 2, y + cardH - 8, x + 2, y + cardH - 2);
            doc.line(x + 2, y + cardH - 2, x + 8, y + cardH - 2);

            drawCutMarks(x, y, row, col);
        }
    }

    // ══════════════════════════════════════════════
    // PAGE 2: BACK SIDES (mirrored)
    // ══════════════════════════════════════════════
    doc.addPage();

    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.setFont(FONT, 'normal');
    doc.text('Kartvizit Arka Yüz — Kesim çizgileri boyunca kesiniz', pageW / 2, 5, { align: 'center' });

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const mirrorCol = cols - 1 - col;
            const x = marginX + mirrorCol * cardW;
            const y = marginY + row * cardH;

            // ── Background ──
            doc.setFillColor(...navy);
            doc.rect(x, y, cardW, cardH, 'F');

            // ── Thin gold outline ──
            doc.setDrawColor(...gold);
            doc.setLineWidth(0.15);
            doc.rect(x + 2, y + 2, cardW - 4, cardH - 4);

            // ── Left: Branded QR Code ──
            const qrSize = 24;
            const qrX = x + 9;
            const qrY = y + (cardH - qrSize) / 2 - 2;

            // Navy background for QR area (QR is gold-on-navy, so it blends)
            doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

            // Gold corner accents around QR
            doc.setDrawColor(...lightGold);
            doc.setLineWidth(0.3);
            const ca = 3; // corner accent length
            // top-left
            doc.line(qrX - 1, qrY - 1, qrX - 1 + ca, qrY - 1);
            doc.line(qrX - 1, qrY - 1, qrX - 1, qrY - 1 + ca);
            // top-right
            doc.line(qrX + qrSize + 1 - ca, qrY - 1, qrX + qrSize + 1, qrY - 1);
            doc.line(qrX + qrSize + 1, qrY - 1, qrX + qrSize + 1, qrY - 1 + ca);
            // bottom-left
            doc.line(qrX - 1, qrY + qrSize + 1, qrX - 1 + ca, qrY + qrSize + 1);
            doc.line(qrX - 1, qrY + qrSize + 1 - ca, qrX - 1, qrY + qrSize + 1);
            // bottom-right
            doc.line(qrX + qrSize + 1 - ca, qrY + qrSize + 1, qrX + qrSize + 1, qrY + qrSize + 1);
            doc.line(qrX + qrSize + 1, qrY + qrSize + 1 - ca, qrX + qrSize + 1, qrY + qrSize + 1);

            // "Tara & Kaydet" under QR
            doc.setTextColor(...lightGold);
            doc.setFontSize(4.5);
            doc.setFont(FONT, 'normal');
            doc.text('Tara & Kaydet', qrX + qrSize / 2, qrY + qrSize + 4.5, { align: 'center' });

            // ── Right: Brand + Info ──
            const rx = x + 42;

            // Logo
            doc.setFillColor(...gold);
            doc.circle(rx + 3, y + 13, 3, 'F');
            doc.setTextColor(...white);
            doc.setFontSize(5);
            doc.setFont(FONT, 'bold');
            doc.text('A', rx + 1.5, y + 14.8);

            // Brand
            doc.setTextColor(...white);
            doc.setFontSize(10);
            doc.setFont(FONT, 'bold');
            doc.text('ArslanOps', rx + 8, y + 12.5);
            doc.setTextColor(...lightGold);
            doc.setFontSize(4.5);
            doc.text('COFFEE & RESTORAN OPERASYON', rx + 8, y + 16);

            // Gold separator
            doc.setDrawColor(...gold);
            doc.setLineWidth(0.2);
            doc.line(rx, y + 19.5, rx + 42, y + 19.5);

            // Tagline
            doc.setTextColor(...textLight);
            doc.setFontSize(5.5);
            doc.setFont(FONT, 'normal');
            const tagLines = doc.splitTextToSize(data.tagline, 42);
            doc.text(tagLines, rx, y + 25);

            // Contact summary
            doc.setTextColor(...textMuted);
            doc.setFontSize(5);
            doc.text(data.phone, rx, y + 34);
            doc.text(data.email, rx, y + 38);

            // Website (prominent)
            doc.setTextColor(...lightGold);
            doc.setFontSize(6);
            doc.setFont(FONT, 'bold');
            doc.text(data.website, rx, y + 44);

            // ── Mirrored cut marks ──
            doc.setDrawColor(180, 180, 180);
            doc.setLineWidth(0.15);
            const m = 4;
            if (row === 0) { doc.line(x, y - m, x, y); doc.line(x + cardW, y - m, x + cardW, y); }
            if (row === rows - 1) { doc.line(x, y + cardH, x, y + cardH + m); doc.line(x + cardW, y + cardH, x + cardW, y + cardH + m); }
            if (mirrorCol === 0) { doc.line(x - m, y, x, y); doc.line(x - m, y + cardH, x, y + cardH); }
            if (mirrorCol === cols - 1) { doc.line(x + cardW, y, x + cardW + m, y); doc.line(x + cardW, y + cardH, x + cardW + m, y + cardH); }
        }
    }

    // ── Download ──
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `Kartvizit_${data.name.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
}

// ─── Component ───
export default function Kartvizit() {
    const [data, setData] = useState<KartvizitData>(DEFAULT_DATA);
    const [generating, setGenerating] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const authHeader = 'Basic ' + btoa('admin:arslanops2024');

    const update = (key: keyof KartvizitData, value: string) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const uploadPhoto = async (file: File) => {
        setUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'kartvizit');
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST', headers: { Authorization: authHeader }, body: formData,
            });
            if (res.ok) {
                const { url } = await res.json();
                setData(prev => ({ ...prev, photoUrl: url }));
            }
        } catch (e) { console.error(e); }
        setUploadingPhoto(false);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await generateKartvizitPDF(data);
        } catch (err) {
            console.error('PDF hatası:', err);
            alert('PDF oluşturulurken hata oluştu.');
        }
        setGenerating(false);
    };

    const photoSrc = data.photoUrl
        ? (data.photoUrl.startsWith('http') ? data.photoUrl : `${API_URL}${data.photoUrl}`)
        : null;

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#0B1F3B] to-[#1a3a5c] rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#0B1F3B]">Kartvizit Oluşturucu</h2>
                        <p className="text-sm text-gray-500">Fotoğraflı, arkalı-önlü, 10 adet A4 üzerinde</p>
                    </div>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#0B1F3B] to-[#1a3a5c] text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-[#0B1F3B]/20 transition-all disabled:opacity-50"
                >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {generating ? 'Oluşturuluyor...' : 'PDF İndir'}
                </button>
            </div>

            {/* Form: 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Kişisel Bilgiler */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                    <h3 className="font-bold text-[#0B1F3B] text-sm flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#C4803D]" />
                        Kişisel
                    </h3>
                    <div className="space-y-2.5">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Ad Soyad</label>
                            <input type="text" value={data.name} onChange={e => update('name', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Unvan</label>
                            <input type="text" value={data.title} onChange={e => update('title', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Tagline</label>
                            <input type="text" value={data.tagline} onChange={e => update('tagline', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" />
                        </div>
                    </div>
                </div>

                {/* İletişim Bilgileri */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                    <h3 className="font-bold text-[#0B1F3B] text-sm flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#C4803D]" />
                        İletişim
                    </h3>
                    <div className="space-y-2.5">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Telefon</label>
                            <input type="text" value={data.phone} onChange={e => update('phone', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">E-posta</label>
                            <input type="text" value={data.email} onChange={e => update('email', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
                            <input type="text" value={data.website} onChange={e => update('website', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Instagram</label>
                            <input type="text" value={data.instagram} onChange={e => update('instagram', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" />
                        </div>
                    </div>
                </div>

                {/* Fotoğraf */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                    <h3 className="font-bold text-[#0B1F3B] text-sm flex items-center gap-2">
                        <Upload className="w-4 h-4 text-[#C4803D]" />
                        Fotoğraf
                    </h3>
                    <div className="space-y-3">
                        {photoSrc ? (
                            <div className="relative group">
                                <img src={photoSrc} alt="Kartvizit fotoğrafı"
                                    className="w-full aspect-square object-cover rounded-xl border-2 border-[#D4AF37]/30" />
                                <button onClick={() => update('photoUrl', '')}
                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#C4803D] transition-colors">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500">Fotoğraf Yükle</span>
                                <input type="file" accept="image/*" className="hidden"
                                    onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
                            </label>
                        )}
                        {uploadingPhoto && (
                            <div className="flex items-center gap-2 text-xs text-[#C4803D]">
                                <Loader2 className="w-3 h-3 animate-spin" /> Yükleniyor...
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Konum</label>
                            <input type="text" value={data.location} onChange={e => update('location', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#C4803D] focus:ring-1 focus:ring-[#C4803D]/20 outline-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-[#0B1F3B] text-sm mb-5 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#C4803D]" />
                    Önizleme
                </h3>

                <div className="flex flex-col lg:flex-row gap-8 justify-center items-center">
                    {/* Front Preview */}
                    <div className="space-y-2">
                        <p className="text-xs text-gray-500 text-center font-medium uppercase tracking-wider">Ön Yüz</p>
                        <div className="relative bg-[#0B1F3B] rounded-xl shadow-2xl overflow-hidden"
                            style={{ width: '360px', height: '200px' }}>
                            {/* Gold lines top & bottom */}
                            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#D4AF37] via-[#C4803D] to-[#D4AF37]" />
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#D4AF37] via-[#C4803D] to-[#D4AF37]" />

                            {/* Corner decorations */}
                            <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-[#D4AF37]/30" />
                            <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-[#D4AF37]/30" />

                            <div className="flex h-full">
                                {/* Left: Info */}
                                <div className="flex-1 p-5 flex flex-col justify-between">
                                    {/* Logo + Brand */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gradient-to-br from-[#D4AF37] to-[#C4803D] rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-[8px]">A</span>
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-[10px]">ArslanOps</div>
                                            <div className="text-[#D4AF37] text-[6px] tracking-[0.15em]">COFFEE & RESTORAN</div>
                                        </div>
                                    </div>

                                    {/* Name + Title */}
                                    <div>
                                        <div className="w-full h-px bg-[#D4AF37]/20 mb-2" />
                                        <div className="text-white font-bold text-[14px] leading-tight">
                                            {data.name.split(' ')[0]} <span className="tracking-wide">{data.name.split(' ').slice(1).join(' ').toUpperCase()}</span>
                                        </div>
                                        <div className="text-[#D4AF37]/70 text-[8px] mt-0.5">{data.title}</div>
                                    </div>

                                    {/* Contact */}
                                    <div className="space-y-[3px]">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                            <span className="text-gray-300 text-[7px]">{data.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                            <span className="text-gray-300 text-[7px]">{data.email}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                            <span className="text-gray-300 text-[7px]">{data.website}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                            <span className="text-gray-400/70 text-[6px]">{data.location}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Photo */}
                                <div className="w-[120px] bg-[#071428] border-l border-[#D4AF37]/20 flex flex-col items-center justify-center gap-2 p-3">
                                    {photoSrc ? (
                                        <img src={photoSrc} alt=""
                                            className="w-20 h-20 object-cover rounded-lg border border-[#D4AF37]/40" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-lg border border-[#D4AF37]/20 bg-[#0B1F3B] flex items-center justify-center">
                                            <span className="text-gray-600 text-[8px]">Foto</span>
                                        </div>
                                    )}
                                    <div className="text-center">
                                        <div className="text-[#D4AF37] text-[7px] font-bold">{data.name.split(' ')[0]}</div>
                                        <div className="text-gray-500 text-[5px]">{data.instagram}</div>
                                    </div>
                                    <div className="text-gray-500/60 text-[5px] text-center leading-relaxed">{data.tagline}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back Preview */}
                    <div className="space-y-2">
                        <p className="text-xs text-gray-500 text-center font-medium uppercase tracking-wider">Arka Yüz</p>
                        <div className="relative bg-[#0B1F3B] rounded-xl shadow-2xl overflow-hidden"
                            style={{ width: '360px', height: '200px' }}>
                            {/* Gold outline */}
                            <div className="absolute inset-[6px] border border-[#D4AF37]/20 rounded-lg" />

                            <div className="p-6 h-full flex items-center gap-8">
                                {/* QR - branded style */}
                                <div className="flex flex-col items-center gap-2">
                                    <div className="relative">
                                        {/* Gold corner accents */}
                                        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]/60" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]/60" />
                                        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]/60" />
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]/60" />
                                        <div className="bg-[#0B1F3B] rounded-lg p-2 relative">
                                            <QrCode className="w-14 h-14 text-[#C4803D]" />
                                            {/* Center logo overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-5 h-5 bg-[#0B1F3B] rounded-full border border-[#C4803D] flex items-center justify-center">
                                                    <span className="text-[#D4AF37] font-bold text-[6px]">A</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[#D4AF37]/60 text-[6px] tracking-wider">TARA & KAYDET</span>
                                </div>

                                {/* Right */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-5 h-5 bg-gradient-to-br from-[#D4AF37] to-[#C4803D] rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-[6px]">A</span>
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-xs">ArslanOps</div>
                                            <div className="text-[#D4AF37] text-[7px] tracking-widest">COFFEE & RESTORAN</div>
                                        </div>
                                    </div>
                                    <div className="w-full h-px bg-[#D4AF37]/20 mb-2" />
                                    <p className="text-gray-400 text-[7px] leading-relaxed mb-3">{data.tagline}</p>
                                    <div className="space-y-0.5 mb-3">
                                        <p className="text-gray-500 text-[6px]">{data.phone}</p>
                                        <p className="text-gray-500 text-[6px]">{data.email}</p>
                                    </div>
                                    <div className="text-[#D4AF37] text-[8px] font-bold">{data.website}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="bg-gradient-to-r from-[#0B1F3B]/5 to-[#D4AF37]/5 rounded-xl p-4 border border-[#D4AF37]/10">
                <div className="flex items-start gap-3">
                    <QrCode className="w-5 h-5 text-[#C4803D] flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium text-[#0B1F3B]">Profesyonel Kartvizit</p>
                        <p>Arka yüzdeki QR kod <strong>vCard formatındadır</strong>. Telefonla tarandığında bilgileriniz otomatik rehbere kaydedilir. Ön yüzdeki fotoğraf, kişisel tanınırlığınızı artırır.</p>
                        <p className="text-xs text-gray-500 mt-2">
                            📏 90mm × 50mm | 📄 A4'te 10 adet | ✂️ Kesim çizgileri | 📸 Fotoğraflı
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
