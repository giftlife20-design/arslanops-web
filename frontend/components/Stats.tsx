'use client';

import { useEffect, useRef, useState } from 'react';
import { Briefcase, TrendingUp, Clock, Award } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const ICONS = [Award, Briefcase, TrendingUp, Clock];

const FALLBACK_STATS = [
    {
        numericValue: 25,
        suffix: '+',
        label: 'Yıllık Sektör Tecrübesi',
        description: 'Coffee ve restoran sektöründe operasyon ve danışmanlık alanında kanıtlanmış deneyim'
    },
    {
        numericValue: 15,
        suffix: '+',
        label: 'Tamamlanan Proje',
        description: 'Yeni açılışlardan mevcut işletme iyileştirmelerine kadar geniş portföy'
    },
    {
        numericValue: 30,
        prefix: '%',
        suffix: '+',
        label: 'Ortalama Maliyet İyileştirmesi',
        description: 'Fire kontrolü ve süreç optimizasyonu ile sağlanan tipik kazanç'
    },
    {
        numericValue: 90,
        suffix: '',
        label: 'Gün İçinde Çözüm',
        description: 'Hızlı teşhis ve aşamalı uygulama modeli ile sonuç odaklı yaklaşım'
    }
];

type StatItem = {
    icon: typeof Award;
    numericValue: number;
    suffix: string;
    prefix?: string;
    label: string;
    description: string;
};

function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!start) return;

        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, start]);

    return count;
}

function StatCard({ stat, index, isVisible }: {
    stat: StatItem;
    index: number;
    isVisible: boolean;
}) {
    const Icon = stat.icon;
    const count = useCountUp(stat.numericValue, 2000, isVisible);

    return (
        <div
            className={`relative group bg-white rounded-2xl p-8 text-center transition-all duration-700 border border-gray-100 hover:border-[#C5A55A]/30 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#C5A55A]/5 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            {/* Top gold accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-[#C5A55A] to-transparent group-hover:w-20 transition-all duration-500" />

            <div className="w-16 h-16 icon-box-gold flex items-center justify-center mb-5 mx-auto">
                <Icon className="w-8 h-8 text-[#C5A55A]" strokeWidth={1.5} />
            </div>
            <div className="text-4xl md:text-5xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <span className="gold-shimmer">
                    {stat.prefix || ''}{count}{stat.suffix}
                </span>
            </div>
            <div className="text-lg font-bold text-[#0B1F3B] mb-3">
                {stat.label}
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
                {stat.description}
            </p>
        </div>
    );
}

export default function Stats() {
    const [isVisible, setIsVisible] = useState(false);
    const [stats, setStats] = useState<StatItem[]>(
        FALLBACK_STATS.map((s, i) => ({ ...s, icon: ICONS[i] || Award }))
    );
    const sectionRef = useRef<HTMLDivElement>(null);

    // Fetch stats from API
    useEffect(() => {
        fetch(`${API_URL}/api/content`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data && Array.isArray(data.stats) && data.stats.length > 0) {
                    const apiStats: StatItem[] = data.stats.map((s: any, i: number) => ({
                        icon: ICONS[i] || Award,
                        numericValue: s.value || 0,
                        suffix: s.suffix ?? '+',
                        prefix: s.prefix || '',
                        label: s.label || '',
                        description: s.description || ''
                    }));
                    setStats(apiStats);
                }
            })
            .catch(() => { });
    }, []);

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
        <section
            ref={sectionRef}
            className="section-container bg-gradient-to-br from-[#F5F7FA] to-white"
        >
            <div className="text-center mb-14">
                <span className="text-[#C5A55A] font-bold tracking-widest text-sm uppercase mb-2 block">
                    Rakamlarla ArslanOps
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 section-heading section-heading-gold">
                    Saha Deneyimi ve Sonuçlar
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Operasyonel mükemmellik için somut göstergeler
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        stat={stat}
                        index={index}
                        isVisible={isVisible}
                    />
                ))}
            </div>
        </section>
    );
}
