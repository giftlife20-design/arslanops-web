'use client';

import { useEffect, useRef, useState } from 'react';
import { Shield, Zap, HeartHandshake, Target, Clock, Award } from 'lucide-react';

const REASONS = [
    {
        icon: Award,
        title: '25+ Yıl Saha Deneyimi',
        description: 'Teorik değil, sahada kanıtlanmış çözümler. Her tip restoran ve kafe operasyonunda aktif tecrübe.'
    },
    {
        icon: Target,
        title: 'Sonuç Odaklı Yaklaşım',
        description: 'Uzun raporlar değil, uygulanabilir aksiyon planları. Ölçülebilir hedefler ve net takvimlendirme.'
    },
    {
        icon: Zap,
        title: 'Hızlı Teşhis',
        description: 'İlk hafta içinde sorunları tespit eder, acil müdahale gerektiren noktaları belirleriz.'
    },
    {
        icon: Shield,
        title: 'Uçtan Uca Çözüm',
        description: 'Maliyet kontrolünden ekip eğitimine, KPI takibinden süreç kurulumuna kadar her alanda destek.'
    },
    {
        icon: HeartHandshake,
        title: 'İşletmeye Özel Yaklaşım',
        description: 'Her işletmenin dinamiği farklıdır. Kalıp çözümler değil, size özel stratejiler geliştiriyoruz.'
    },
    {
        icon: Clock,
        title: '90 Günde Dönüşüm',
        description: 'Aşamalı uygulama modeliyle 90 gün içinde sürdürülebilir sonuçlar.'
    }
];

export default function WhyUs() {
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

    return (
        <section ref={sectionRef} className="relative overflow-hidden">
            {/* Hafif kafe dokusu — çok subtle */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.07]"
                style={{ backgroundImage: "url('/whyus-bg.png')" }}
            />
            {/* Açık renkli overlay */}
            <div className="absolute inset-0 bg-[#F5F7FA]/95" />

            <div className="section-container relative z-10">
                <div className="text-center mb-14">
                    <span className="text-[#C5A55A] font-bold tracking-widest text-sm uppercase mb-2 block">
                        Neden Biz?
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 section-heading section-heading-gold">
                        Neden ArslanOps?
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Operasyonel mükemmellik için neden bizi tercih etmelisiniz?
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {REASONS.map((reason, index) => {
                        const Icon = reason.icon;
                        return (
                            <div
                                key={index}
                                className={`group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#C5A55A]/20 hover:-translate-y-1 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                    }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div className="w-12 h-12 icon-box-gold flex items-center justify-center mb-4">
                                    <Icon className="w-6 h-6 text-[#C5A55A]" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-bold text-[#0B1F3B] mb-3">
                                    {reason.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {reason.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
