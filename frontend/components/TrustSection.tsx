'use client';

import { useEffect, useRef, useState } from 'react';
import {
    ShieldCheck, FileCheck2, Lock, TrendingDown, TrendingUp,
    Clock, Phone, CheckCircle2, ArrowRight, Award,
    BadgeCheck, Handshake, CalendarCheck
} from 'lucide-react';

/* ── 1 · Garanti Rozetleri ── */
const GUARANTEES = [
    {
        icon: FileCheck2,
        title: 'Sözleşme Güvencesi',
        desc: 'Tüm hizmetler yazılı sözleşmeye bağlıdır. Hak ve yükümlülükler net tanımlanır.',
        color: 'from-blue-500 to-blue-600',
    },
    {
        icon: Lock,
        title: 'Gizlilik (NDA)',
        desc: 'İşletme bilgileriniz NDA ile korunur. Verileriniz 3. şahıslarla asla paylaşılmaz.',
        color: 'from-purple-500 to-purple-600',
    },
    {
        icon: Handshake,
        title: 'Sonuç Odaklı Çalışma',
        desc: 'Ölçülebilir hedefler belirlenir, ilerleme haftalık raporlarla takip edilir.',
        color: 'from-emerald-500 to-emerald-600',
    },
];

/* ── 2 · Rakamlarla Kanıt ── */
const STATS_PROOF = [
    { value: '25+', label: 'Yıl Saha Deneyimi', icon: Award },
    { value: '50+', label: 'Tamamlanan Proje', icon: CheckCircle2 },
    { value: '%30', label: 'Ortalama Maliyet Düşüşü', icon: TrendingDown },
    { value: '%95', label: 'Müşteri Memnuniyeti', icon: TrendingUp },
];

/* ── 3 · Başarı Hikayeleri ── */
const CASE_STUDIES = [
    {
        business: 'Restoran Zinciri',
        location: 'İstanbul',
        problem: 'COGS oranı %38, fire kayıpları %12',
        solution: 'Stok takibi, reçete standardizasyonu, satın alma optimizasyonu',
        results: [
            { label: 'COGS', before: '%38', after: '%27', direction: 'down' },
            { label: 'Fire Oranı', before: '%12', after: '%4', direction: 'down' },
            { label: 'Kâr Marjı', before: '%8', after: '%19', direction: 'up' },
        ],
        duration: '90 gün',
    },
    {
        business: 'Butik Kafe',
        location: 'İstanbul',
        problem: 'Kasa farkları, personel verimsizliği, stok kayıpları',
        solution: 'Kasa yönetimi, vardiya planlaması, KPI dashboard kurulumu',
        results: [
            { label: 'Kasa Farkı', before: '₺2.800/ay', after: '₺150/ay', direction: 'down' },
            { label: 'Personel Ver.', before: '%45', after: '%82', direction: 'up' },
            { label: 'Stok Doğruluk', before: '%68', after: '%96', direction: 'up' },
        ],
        duration: '60 gün',
    },
];

/* ── 6 · Süreç Adımları ── */
const PROCESS_STEPS = [
    {
        step: 1,
        title: 'Ücretsiz Ön Görüşme',
        desc: 'İşletmenizi tanırız, sorunları dinler, çözüm yön haritası çizeriz.',
        icon: Phone,
        duration: '15 dakika',
    },
    {
        step: 2,
        title: 'Analiz & Teşhis',
        desc: 'Yerinde veya online detaylı analiz. SWOT, maliyet, operasyon taraması.',
        icon: BadgeCheck,
        duration: '3-5 gün',
    },
    {
        step: 3,
        title: 'Plan & Sözleşme',
        desc: 'Kişiye özel aksiyon planı hazırlanır, sözleşme imzalanır, paket seçilir.',
        icon: Handshake,
        duration: '1-2 gün',
    },
    {
        step: 4,
        title: 'Uygulama & Takip',
        desc: 'Planları uygularız, haftalık KPI raporları sunarız, sonuçları ölçeriz.',
        icon: CalendarCheck,
        duration: '30-90 gün',
    },
];

/* ── 8 · Sertifika / Yetkinlik ── */
const CERTIFICATIONS = [
    '25+ Yıl F&B Operasyon Deneyimi',
    'COGS & Maliyet Analizi Uzmanlığı',
    'SOP & Süreç Tasarımı',
    'KPI Dashboard & Raporlama',
    'Stok & Satın Alma Yönetimi',
    'Personel Verimlilik Analizi',
];

export default function TrustSection() {
    const [isVisible, setIsVisible] = useState(false);
    const [activeCase, setActiveCase] = useState(0);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.05 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const scrollToContact = () => {
        document.getElementById('iletisim')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section ref={sectionRef} id="guven" className="relative overflow-hidden bg-gradient-to-b from-white via-[#FAFBFD] to-white">

            {/* ────────── BÖLÜM 1: GARANTİ ROZETLERİ ────────── */}
            <div className="section-container py-16 md:py-20">
                <div className="text-center mb-12">
                    <span className="text-[#C5A55A] font-bold tracking-widest text-sm uppercase mb-2 block">
                        Güvenle Çalışın
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 section-heading section-heading-gold">
                        Neden Güvenebilirsiniz?
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        İşletmenizin bilgileri ve bütçeniz tamamen güvence altında
                    </p>
                </div>

                <div className={`grid md:grid-cols-3 gap-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {GUARANTEES.map((g, i) => {
                        const Icon = g.icon;
                        return (
                            <div key={i} className="relative group bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                                </div>
                                <h3 className="text-lg font-bold text-[#0B1F3B] mb-2">{g.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{g.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ────────── BÖLÜM 2: RAKAMLARLA KANIT ────────── */}
            <div className="bg-gradient-to-r from-[#0B1F3B] to-[#132D52] py-14">
                <div className="section-container">
                    <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        {STATS_PROOF.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <div key={i} className="text-center group">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#C5A55A]/10 flex items-center justify-center group-hover:bg-[#C5A55A]/20 transition-colors">
                                        <Icon className="w-6 h-6 text-[#C5A55A]" />
                                    </div>
                                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">{s.value}</div>
                                    <div className="text-sm text-gray-400">{s.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ────────── BÖLÜM 3: BAŞARI HİKAYELERİ ────────── */}
            <div className="section-container py-16 md:py-20">
                <div className="text-center mb-12">
                    <span className="text-[#C5A55A] font-bold tracking-widest text-sm uppercase mb-2 block">
                        Kanıtlanmış Sonuçlar
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 section-heading section-heading-gold">
                        Gerçek Başarı Hikayeleri
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Danışmanlık hizmetimiz ile somut sonuçlar elde eden işletmelerden örnekler
                    </p>
                </div>

                {/* Case Study Tabs */}
                <div className="flex justify-center gap-3 mb-8">
                    {CASE_STUDIES.map((cs, i) => (
                        <button key={i} onClick={() => setActiveCase(i)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeCase === i
                                ? 'bg-[#0B1F3B] text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}>
                            {cs.business}
                        </button>
                    ))}
                </div>

                {/* Active Case */}
                <div className={`bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="grid md:grid-cols-2">
                        {/* Sol: Problem & Çözüm */}
                        <div className="p-8 md:p-10">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                <span className="px-3 py-1 bg-[#C5A55A]/10 text-[#C5A55A] rounded-full font-medium">{CASE_STUDIES[activeCase].business}</span>
                                <span>•</span>
                                <span>{CASE_STUDIES[activeCase].location}</span>
                                <span>•</span>
                                <Clock className="w-3.5 h-3.5" />
                                <span>{CASE_STUDIES[activeCase].duration}</span>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Sorun</h4>
                                <p className="text-gray-700">{CASE_STUDIES[activeCase].problem}</p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Çözüm</h4>
                                <p className="text-gray-700">{CASE_STUDIES[activeCase].solution}</p>
                            </div>
                        </div>

                        {/* Sağ: Sonuçlar */}
                        <div className="bg-gradient-to-br from-[#0B1F3B] to-[#132D52] p-8 md:p-10 flex flex-col justify-center">
                            <h4 className="text-xs font-bold text-[#C5A55A] uppercase tracking-wider mb-6">Sonuçlar</h4>
                            <div className="space-y-5">
                                {CASE_STUDIES[activeCase].results.map((r, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-400 mb-1">{r.label}</div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-500 line-through text-lg">{r.before}</span>
                                                <ArrowRight className="w-4 h-4 text-[#C5A55A]" />
                                                <span className={`text-2xl font-bold ${r.direction === 'down' ? 'text-emerald-400' : 'text-emerald-400'}`}>
                                                    {r.after}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${r.direction === 'down' ? 'bg-emerald-500/10' : 'bg-emerald-500/10'}`}>
                                            {r.direction === 'down'
                                                ? <TrendingDown className="w-5 h-5 text-emerald-400" />
                                                : <TrendingUp className="w-5 h-5 text-emerald-400" />
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ────────── BÖLÜM 6: SÜREÇ ADIMLARI ────────── */}
            <div className="bg-[#F5F7FA] py-16 md:py-20">
                <div className="section-container">
                    <div className="text-center mb-14">
                        <span className="text-[#C5A55A] font-bold tracking-widest text-sm uppercase mb-2 block">
                            Nasıl Çalışıyoruz?
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 section-heading section-heading-gold">
                            4 Adımda Dönüşüm
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Şeffaf, adım adım ilerleyen bir süreç — her aşamada sizi bilgilendiriyoruz
                        </p>
                    </div>

                    <div className={`grid md:grid-cols-4 gap-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        {PROCESS_STEPS.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <div key={i} className="relative">
                                    {/* Bağlantı çizgisi */}
                                    {i < PROCESS_STEPS.length - 1 && (
                                        <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#C5A55A]/30 to-transparent z-0" />
                                    )}
                                    <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 z-10" style={{ transitionDelay: `${i * 120}ms` }}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C5A55A] to-[#A8863D] flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                {step.step}
                                            </div>
                                            <Icon className="w-5 h-5 text-[#C5A55A]" />
                                        </div>
                                        <h3 className="text-base font-bold text-[#0B1F3B] mb-2">{step.title}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{step.desc}</p>
                                        <span className="inline-block text-xs font-medium text-[#C5A55A] bg-[#C5A55A]/10 px-3 py-1 rounded-full">{step.duration}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ────────── BÖLÜM 8: SERTİFİKA & YETKİNLİK + 5: ÜCRETSİZ ÖN GÖRÜŞME CTA ────────── */}
            <div className="section-container py-16 md:py-20">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Sol: Sertifikalar */}
                    <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                        <span className="text-[#C5A55A] font-bold tracking-widest text-sm uppercase mb-2 block">
                            Uzmanlık Alanları
                        </span>
                        <h3 className="text-2xl md:text-3xl font-bold text-[#0B1F3B] mb-6">
                            Profesyonel Yetkinlikler
                        </h3>
                        <div className="space-y-3">
                            {CERTIFICATIONS.map((cert, i) => (
                                <div key={i} className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-lg bg-[#C5A55A]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C5A55A]/20 transition-colors">
                                        <BadgeCheck className="w-4 h-4 text-[#C5A55A]" />
                                    </div>
                                    <span className="text-gray-700 font-medium">{cert}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sağ: Ücretsiz Ön Görüşme CTA */}
                    <div className={`transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                        <div className="bg-gradient-to-br from-[#0B1F3B] to-[#132D52] rounded-3xl p-8 md:p-10 text-center shadow-2xl relative overflow-hidden">
                            {/* Dekoratif */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A55A]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C5A55A]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                            <div className="relative z-10">
                                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#C5A55A]/10 flex items-center justify-center">
                                    <Phone className="w-8 h-8 text-[#C5A55A]" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">
                                    Ücretsiz Ön Görüşme
                                </h3>
                                <p className="text-gray-400 mb-6 text-sm leading-relaxed max-w-sm mx-auto">
                                    15 dakikalık ücretsiz tanışma görüşmesiyle işletmenizin ihtiyaçlarını birlikte değerlendirelim.
                                    Hiçbir yükümlülük yok.
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={scrollToContact}
                                        className="w-full bg-gradient-to-r from-[#C5A55A] to-[#D4B76A] text-[#0B1F3B] px-8 py-4 rounded-xl font-bold text-lg hover:from-[#A8863D] hover:to-[#C5A55A] transition-all duration-300 shadow-xl shadow-[#C5A55A]/25 hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Hemen Randevu Al
                                    </button>
                                    <p className="text-xs text-gray-500">
                                        ✓ Ücretsiz &nbsp; ✓ 15 Dakika &nbsp; ✓ Bağlayıcı Değil
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
