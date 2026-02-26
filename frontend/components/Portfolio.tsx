'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CheckCircle, ArrowRight } from 'lucide-react';

const PORTFOLIO = [
    {
        title: 'Coffee Shop — Maliyet Kontrolü',
        type: 'Maliyet Analizi',
        challenge: 'COGS oranı %40 üstünde, fire ve ikram kayıpları kontrol dışında, kârlılık düşük',
        solution: 'Stok sayım sistemi kurulur, fire takip formu oluşturulur, satın alma süreci optimize edilir',
        result: 'Hedef: 90 günde COGS %25-30 bandına çekmek, aylık binlerce TL tasarruf',
        duration: '90 gün',
        image: '/portfolio/01.png'
    },
    {
        title: 'Yeni Açılış — Sıfırdan Sistem',
        type: 'Açılış Danışmanlığı',
        challenge: 'Sıfırdan kafe/restoran açılışında konsept, ekipman listesi ve operasyon planı yok',
        solution: 'Konsept belirleme, ekipman listesi, menü mühendisliği ve açılış checklistleri hazırlanır',
        result: 'Hedef: İlk günden profesyonel işleyiş, 6 ayda başa baş noktasına ulaşma',
        duration: '60 gün',
        image: '/portfolio/02.png'
    },
    {
        title: 'Çok Şubeli — Standardizasyon',
        type: 'Operasyon Düzeni',
        challenge: 'Farklı şubelerde farklı standartlar, tutarsız kalite ve kontrol eksikliği',
        solution: 'SOP dokümanları, kontrol listeleri ve KPI dashboard sistemi kurulur',
        result: 'Hedef: Tüm şubelerde aynı kalite standardı, ekip verimliliğinde %30+ artış',
        duration: '120 gün',
        image: '/portfolio/03.png'
    }
];

export default function Portfolio() {
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
        <section ref={sectionRef} id="portfolyo" className="section-container bg-white">
            <div className="text-center mb-14">
                <span className="text-[#C5A55A] font-bold tracking-widest text-sm uppercase mb-2 block">
                    Nasıl Çalışıyoruz
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 section-heading section-heading-gold">
                    Örnek Senaryolar
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    25+ yıllık saha deneyimine dayanan tipik problem-çözüm yaklaşımlarımız
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {PORTFOLIO.map((project, index) => (
                    <div
                        key={index}
                        className={`card group transition-all duration-700 overflow-hidden p-0 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                        style={{ transitionDelay: `${index * 150}ms` }}
                    >
                        {/* Görsel */}
                        <div className="relative h-48 w-full overflow-hidden">
                            <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3B]/60 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                                <span className="bg-[#C5A55A] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                    {project.type}
                                </span>
                                <span className="text-xs text-white/80 font-medium">{project.duration}</span>
                            </div>
                        </div>

                        {/* İçerik */}
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-[#0B1F3B] mb-4">
                                {project.title}
                            </h3>

                            <div className="space-y-3 mb-2">
                                <div>
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Problem</div>
                                    <p className="text-sm text-gray-600">{project.challenge}</p>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Çözüm</div>
                                    <p className="text-sm text-gray-600">{project.solution}</p>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-[#C5A55A] uppercase tracking-wider mb-1">Sonuç</div>
                                    <p className="text-sm font-semibold text-[#0B1F3B] flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-[#C5A55A] flex-shrink-0 mt-0.5" />
                                        {project.result}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-10">
                <button
                    onClick={scrollToContact}
                    className="inline-flex items-center gap-2 text-[#C5A55A] font-semibold hover:gap-3 transition-all group"
                >
                    Projenizi Konuşalım
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </section>
    );
}
