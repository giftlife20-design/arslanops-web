'use client';

import { useState, useEffect } from 'react';
import { Check, X, DollarSign, ClipboardList, Users, BarChart3, UtensilsCrossed, ShieldCheck, ArrowRight, FileText, Star } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/* ── 6 Ana Hizmet ── */
const ALL_SERVICES = [
    { key: 'cogs', label: 'Maliyet Kontrolü & COGS', icon: DollarSign },
    { key: 'ops', label: 'Operasyon & Süreç Kurulumu', icon: ClipboardList },
    { key: 'finance', label: 'Finansal Analiz & KPI', icon: BarChart3 },
    { key: 'food', label: 'Gıda Güvenliği & Kalite', icon: ShieldCheck },
    { key: 'team', label: 'Ekip Eğitimi & Standartlaştırma', icon: Users },
    { key: 'opening', label: 'Yeni Açılış Danışmanlığı', icon: UtensilsCrossed },
] as const;

type ServiceKey = typeof ALL_SERVICES[number]['key'];

interface PackageData {
    name: string;
    subtitle: string;
    startingPrice: string;
    services: Record<ServiceKey, 'full' | 'basic' | false>;
    deliverables: string[];
    recommended: boolean;
    accent: string;
    showPrice?: boolean;
    visible?: boolean;
}

const DEFAULT_PACKAGES: PackageData[] = [
    {
        name: 'TEMEL',
        subtitle: 'Hızlı Teşhis + 30 Gün Planı',
        startingPrice: '20.000',
        services: {
            cogs: 'basic',
            ops: 'basic',
            finance: false,
            food: false,
            team: false,
            opening: false,
        },
        deliverables: [
            'Mevcut durum özeti (PDF)',
            'Fire/ikram kontrol noktaları',
            '30 gün aksiyon listesi (Excel)',
            'Kontrol listesi seti',
            '1 saat online görüşme',
        ],
        recommended: false,
        accent: '#64748b',
    },
    {
        name: 'STANDART',
        subtitle: 'Maliyet & Operasyon Kurulumu',
        startingPrice: '55.000',
        services: {
            cogs: 'full',
            ops: 'full',
            finance: 'basic',
            food: 'basic',
            team: false,
            opening: false,
        },
        deliverables: [
            'Detaylı analiz raporu (PDF)',
            '30/60/90 gün aksiyon planı (Excel)',
            'SOP dokümanları',
            'Haftalık KPI takibi',
            'Kontrol listeleri',
            '60 gün uygulama desteği',
            'Haftalık takip görüşmeleri',
        ],
        recommended: true,
        accent: '#C5A55A',
    },
    {
        name: 'PRO',
        subtitle: 'Uygulamalı Dönüşüm + Takip',
        startingPrice: '120.000',
        services: {
            cogs: 'full',
            ops: 'full',
            finance: 'full',
            food: 'full',
            team: 'full',
            opening: 'full',
        },
        deliverables: [
            'Standart paketteki her şey',
            'Yerinde ziyaret ve denetim',
            'Ekip eğitimleri (yerinde)',
            '90 gün tam destek',
            'Tedarikçi müzakereleri',
            'Aylık performans raporu',
            'KPI Dashboard (Excel)',
            '7/24 WhatsApp destek',
        ],
        recommended: false,
        accent: '#C5A55A',
    },
];

/* ── Helpers ── */
function ServiceBadge({ level }: { level: 'full' | 'basic' | false }) {
    if (level === 'full')
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" strokeWidth={3} /> Tam
            </span>
        );
    if (level === 'basic')
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" strokeWidth={3} /> Temel
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-500/10 px-2 py-0.5 rounded-full">
            <X className="w-3 h-3" strokeWidth={3} /> Dahil Değil
        </span>
    );
}

export default function Packages() {
    const [packages, setPackages] = useState<PackageData[]>(DEFAULT_PACKAGES);
    const [heading, setHeading] = useState({ badge: 'Danışmanlık Paketleri', title: 'Paketler', subtitle: 'İhtiyacınıza göre ölçeklenebilir danışmanlık seçenekleri. Her paketin hangi hizmetleri kapsadığını aşağıda görebilirsiniz.' });

    useEffect(() => {
        fetch(`${API_URL}/api/content/packages`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && Array.isArray(data) && data.length > 0) {
                    // Admin'den gelen verileri PackageData'ya dönüştür
                    const mapped: PackageData[] = data
                        .filter((p: any) => p.visible !== false) // gizli paketleri filtrele
                        .map((p: any, idx: number) => ({
                            name: p.name || '',
                            subtitle: p.description || DEFAULT_PACKAGES[idx]?.subtitle || '',
                            startingPrice: p.startingPrice || DEFAULT_PACKAGES[idx]?.startingPrice || '',
                            services: DEFAULT_PACKAGES[idx]?.services || { cogs: false, ops: false, finance: false, food: false, team: false, opening: false },
                            deliverables: p.features || DEFAULT_PACKAGES[idx]?.deliverables || [],
                            recommended: p.recommended || false,
                            accent: DEFAULT_PACKAGES[idx]?.accent || '#C5A55A',
                            showPrice: p.showPrice,
                            visible: p.visible,
                        }));
                    if (mapped.length > 0) setPackages(mapped);
                }
            })
            .catch(() => {}); // Hata olursa fallback veriler kalır

        // Heading verisi
        fetch(`${API_URL}/api/content/packages_heading`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data && (data.badge || data.title || data.subtitle)) setHeading(prev => ({ ...prev, ...data })); })
            .catch(() => {});
    }, []);

    const scrollToContact = () => {
        document.getElementById('iletisim')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Görünür paketleri filtrele
    const visiblePackages = packages.filter(p => p.visible !== false);

    return (
        <section id="paketler" className="section-container">
            {/* ── Header ── */}
            <div className="text-center mb-14">
                <span className="text-[#C5A55A] font-bold tracking-widest text-sm uppercase mb-2 block">
                    {heading.badge}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 section-heading section-heading-gold">
                    {heading.title}
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    {heading.subtitle}
                </p>
            </div>

            {/* ── Package Cards ── */}
            <div className={`grid gap-6 lg:gap-8 mb-16 ${visiblePackages.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' : visiblePackages.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
                {visiblePackages.map((pkg, index) => (
                    <div
                        key={index}
                        className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${pkg.recommended
                            ? 'ring-2 ring-[#C5A55A] shadow-2xl shadow-[#C5A55A]/15'
                            : 'shadow-lg hover:shadow-xl'
                            }`}
                        style={{
                            background: 'linear-gradient(135deg, #0B1F3B 0%, #0F2847 50%, #162d50 100%)',
                        }}
                    >
                        {/* Recommended badge */}
                        {pkg.recommended && (
                            <div className="absolute -top-0 left-0 right-0 bg-gradient-to-r from-[#C5A55A] to-[#D4B76A] text-[#0B1F3B] text-center py-1.5 text-sm font-bold flex items-center justify-center gap-1.5">
                                <Star className="w-4 h-4 fill-current" /> Önerilen Paket
                            </div>
                        )}

                        <div className={`p-6 lg:p-8 ${pkg.recommended ? 'pt-12' : ''}`}>
                            {/* Header */}
                            <div className="text-center mb-6 pb-6 border-b border-white/10">
                                <h3 className="text-2xl font-bold text-white mb-1">{pkg.name}</h3>
                                <p className="text-gray-400 text-sm mb-3">{pkg.subtitle}</p>
                                {pkg.showPrice !== false && pkg.startingPrice && (
                                    <>
                                        <p className="text-[11px] text-amber-400/80 font-medium uppercase tracking-wider mb-2">Tek şube / küçük işletme başlangıç fiyatı</p>
                                        <div>
                                            <span className="text-3xl font-extrabold text-white">₺{pkg.startingPrice}</span>
                                            <span className="text-gray-400 text-sm ml-1">&#39;den başlayan</span>
                                        </div>
                                        <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                                            <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
                                            <span className="text-[11px] text-amber-300/90 font-medium">Şube sayısı, ekip büyüklüğü ve kapsama göre değişir</span>
                                        </div>
                                    </>
                                )}
                                {pkg.showPrice === false && (
                                    <div className="mt-2">
                                        <span className="text-lg font-semibold text-amber-400">Fiyat için teklif alın</span>
                                    </div>
                                )}
                            </div>

                            {/* ── Dahil Hizmetler ── */}
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-[#C5A55A] uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ClipboardList className="w-3.5 h-3.5" />
                                    Dahil Hizmetler
                                </h4>
                                <div className="space-y-3">
                                    {ALL_SERVICES.map((svc) => {
                                        const level = pkg.services[svc.key];
                                        const Icon = svc.icon;
                                        return (
                                            <div
                                                key={svc.key}
                                                className={`flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg transition-colors ${level ? 'bg-white/5' : 'bg-transparent opacity-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <Icon className={`w-4 h-4 flex-shrink-0 ${level ? 'text-[#C5A55A]' : 'text-gray-600'}`} strokeWidth={1.5} />
                                                    <span className={`text-sm truncate ${level ? 'text-gray-200' : 'text-gray-600 line-through'}`}>
                                                        {svc.label}
                                                    </span>
                                                </div>
                                                <ServiceBadge level={level} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── Teslimatlar ── */}
                            <div className="mb-8">
                                <h4 className="text-xs font-bold text-[#C5A55A] uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" />
                                    Teslimatlar
                                </h4>
                                <ul className="space-y-2.5">
                                    {pkg.deliverables.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                            <span className="text-gray-300 text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={scrollToContact}
                                className={`w-full py-3.5 rounded-xl font-semibold transition-all text-sm ${pkg.recommended
                                    ? 'bg-gradient-to-r from-[#C5A55A] to-[#D4B76A] text-[#0B1F3B] hover:from-[#A8863D] hover:to-[#C5A55A] shadow-lg shadow-[#C5A55A]/20 hover:shadow-[#C5A55A]/40'
                                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                    }`}
                            >
                                Teklif İste
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Karşılaştırma Tablosu (Desktop) ── */}
            <div className="hidden lg:block">
                <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-[#0B1F3B] mb-2">Paket Karşılaştırma Tablosu</h3>
                    <p className="text-gray-500 text-sm">Hangi hizmet hangi pakette? Hızlıca karşılaştırın.</p>
                </div>

                <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-[#0B1F3B] to-[#162d50]">
                                <th className="text-left py-4 px-6 text-gray-300 text-sm font-medium w-[40%]">
                                    Hizmet
                                </th>
                                {visiblePackages.map((pkg, i) => (
                                    <th key={i} className="py-4 px-4 text-center">
                                        <span className={`text-sm font-bold ${pkg.recommended ? 'text-[#C5A55A]' : 'text-white'}`}>
                                            {pkg.name}
                                        </span>
                                        {pkg.recommended && (
                                            <span className="block text-[10px] text-[#C5A55A]/70 mt-0.5">⭐ Önerilen</span>
                                        )}
                                        {pkg.showPrice !== false && pkg.startingPrice && (
                                            <span className="block text-[11px] text-gray-400 mt-1">₺{pkg.startingPrice}&apos;den</span>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {ALL_SERVICES.map((svc, idx) => {
                                const Icon = svc.icon;
                                return (
                                    <tr key={svc.key} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'} hover:bg-[#C5A55A]/5 transition-colors`}>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#0B1F3B]/5 flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-4 h-4 text-[#0B1F3B]" strokeWidth={1.5} />
                                                </div>
                                                <span className="text-sm font-medium text-[#0B1F3B]">{svc.label}</span>
                                            </div>
                                        </td>
                                        {visiblePackages.map((pkg, pi) => {
                                            const level = pkg.services[svc.key];
                                            return (
                                                <td key={pi} className="py-4 px-4 text-center">
                                                    {level === 'full' && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                                                            <Check className="w-3.5 h-3.5" strokeWidth={3} /> Tam Kapsam
                                                        </span>
                                                    )}
                                                    {level === 'basic' && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                                                            <Check className="w-3.5 h-3.5" strokeWidth={3} /> Temel
                                                        </span>
                                                    )}
                                                    {!level && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400">
                                                            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Fiyatlandırma Bilgi Notu ── */}
            <div className="max-w-2xl mx-auto mt-12 bg-gradient-to-r from-[#0B1F3B] to-[#162d50] rounded-2xl p-6 text-center shadow-lg border border-[#C5A55A]/10">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-[#C5A55A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
                    <span className="text-[#C5A55A] font-bold text-sm">Fiyat Nasıl Belirlenir?</span>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                    Yukarıdaki fiyatlar <span className="text-amber-400 font-semibold">tek şubeli küçük işletmeler</span> için başlangıç fiyatlarıdır.
                    Nihai fiyat aşağıdaki faktörlere göre belirlenir:
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-gray-300">
                        🏪 Şube Sayısı
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-gray-300">
                        👥 Ekip Büyüklüğü
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-gray-300">
                        📋 Hizmet Kapsamı
                    </span>
                </div>
                <p className="text-gray-400 text-xs">
                    Size özel fiyat teklifi için ücretsiz ön görüşme yapabilirsiniz.
                </p>
            </div>
        </section>
    );
}
