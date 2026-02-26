'use client';

import { useEffect, useRef, useState } from 'react';
import {
    DollarSign,
    ClipboardList,
    Users,
    BarChart3,
    UtensilsCrossed,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';

const SERVICES = [
    {
        icon: DollarSign,
        title: 'Maliyet Kontrolü & COGS Yönetimi',
        description: 'Satın alma, fire, ikram ve stok kayıplarını tespit ederek maliyet oranlarını optimize ediyoruz. COGS hedeflerinizi belirliyor ve takip sistemi kuruyoruz.',
        highlights: ['COGS Analizi', 'Fire Takibi', 'Satın Alma Optimizasyonu']
    },
    {
        icon: ClipboardList,
        title: 'Operasyon Düzeni & Süreç Kurulumu',
        description: 'Açılış-kapanış prosedürleri, vardiya düzeni, kontrol listeleri ve süreç akışlarıyla operasyonel mükemmellik sağlıyoruz.',
        highlights: ['Kontrol Listeleri', 'Süreç Akışı', 'Vardiya Düzeni']
    },
    {
        icon: Users,
        title: 'Ekip Eğitimi & Standartlaştırma',
        description: 'Personel eğitimi, görev tanımları ve sorumluluk matrisleriyle ekibinizi profesyonel seviyeye taşıyoruz.',
        highlights: ['Personel Eğitimi', 'Görev Tanımları', 'Performans Takibi']
    },
    {
        icon: BarChart3,
        title: 'Finansal Analiz & KPI Takibi',
        description: 'Haftalık ve aylık KPI dashboardları, kasa takibi ve gelir-gider analizleriyle işletmenizin finansal sağlığını kontrol altında tutuyoruz.',
        highlights: ['KPI Dashboard', 'Kasa Takibi', 'Gelir Analizi']
    },
    {
        icon: UtensilsCrossed,
        title: 'Yeni Açılış Danışmanlığı',
        description: 'Sıfırdan işletme açılışında konsept belirleme, ekipman planlaması, menü mühendisliği ve operasyon altyapısı kuruyoruz.',
        highlights: ['Konsept Planlama', 'Ekipman Listesi', 'Açılış Checklist']
    },
    {
        icon: ShieldCheck,
        title: 'Gıda Güvenliği & Kalite Standartları',
        description: 'Hijyen protokolleri, saklama koşulları, HACCP temelleri ve kalite kontrol noktalarıyla uluslararası standartlara uygunluk sağlıyoruz.',
        highlights: ['Hijyen Protokolü', 'HACCP Temelleri', 'Kalite Kontrol']
    }
];

export default function Services() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const scrollToContact = () => {
        document.getElementById('iletisim')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section ref={sectionRef} id="hizmetler" className="relative section-container bg-gradient-to-br from-[#0B1F3B] via-[#0F2847] to-[#2B2F36] text-white overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A55A]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#C5A55A]/3 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <div className="text-center mb-14">
                    <span className="text-[#C5A55A] font-bold tracking-widest text-sm uppercase mb-2 block">
                        Hizmetlerimiz
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 section-heading section-heading-gold text-white">
                        İşletmenize Özel Çözümler
                    </h2>
                    <p className="text-gray-300 max-w-2xl mx-auto">
                        Coffee ve restoran sektöründe operasyonel mükemmellik için kapsamlı danışmanlık hizmetleri
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {SERVICES.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <div
                                key={index}
                                className={`group glass-card cursor-pointer ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                    }`}
                                style={{ transitionDelay: `${index * 120}ms` }}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 icon-box-gold flex items-center justify-center">
                                        <Icon className="w-6 h-6 text-[#C5A55A]" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-lg font-bold leading-tight">
                                        {service.title}
                                    </h3>
                                </div>

                                <p className="text-gray-300 text-sm leading-relaxed mb-5">
                                    {service.description}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {service.highlights.map((highlight, idx) => (
                                        <span
                                            key={idx}
                                            className="gold-tag"
                                        >
                                            {highlight}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <button
                        onClick={scrollToContact}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C5A55A] to-[#D4B76A] text-[#0B1F3B] px-8 py-4 rounded-lg font-bold hover:from-[#A8863D] hover:to-[#C5A55A] transition-all shadow-lg shadow-[#C5A55A]/20 hover:shadow-[#C5A55A]/40 group hover:-translate-y-0.5"
                    >
                        Hizmet Detayları İçin İletişime Geçin
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
}
