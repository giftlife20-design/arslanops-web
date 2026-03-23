'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, Table, ClipboardCheck, BarChart3 } from 'lucide-react';

const DELIVERABLES = [
    {
        icon: FileText,
        title: 'Durum Özeti (PDF)',
        description: 'İşletmenizin mevcut durumunu, güçlü ve zayıf yönlerini ortaya koyan kapsamlı analiz raporu.',
        format: 'PDF'
    },
    {
        icon: Table,
        title: 'Aksiyon Planı (Excel)',
        description: '30/60/90 günlük aksiyon planı, hedefler, sorumlular ve takvimlendirme içeren detaylı çalışma tablosu.',
        format: 'Excel'
    },
    {
        icon: ClipboardCheck,
        title: 'Kontrol Listeleri',
        description: 'Günlük açılış-kapanış, stok sayım, hijyen kontrol ve vardiya geçiş listeleri.',
        format: 'PDF & Excel'
    },
    {
        icon: BarChart3,
        title: 'KPI Dashboard',
        description: 'Haftalık ve aylık takip edilecek temel performans göstergeleri ve karşılaştırma tabloları.',
        format: 'Excel'
    }
];

export default function Deliverables() {
    const [isVisible, setIsVisible] = useState(false);
    const [heading, setHeading] = useState({ badge: 'Teslim Edilenler', title: 'Elinize Ne Geçer?', subtitle: 'Danışmanlık sürecinin sonunda alacağınız somut çıktılar' });
    const [items, setItems] = useState(DELIVERABLES);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        fetch(`${API_URL}/api/content/deliverables_heading`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data && (data.badge || data.title || data.subtitle)) setHeading(prev => ({ ...prev, ...data })); })
            .catch(() => {});
        fetch(`${API_URL}/api/content/deliverables`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data && Array.isArray(data) && data.length > 0) {
                    const merged = data.map((item: any, i: number) => ({
                        ...DELIVERABLES[i],
                        title: item.title || DELIVERABLES[i]?.title || '',
                        description: item.description || DELIVERABLES[i]?.description || '',
                        format: item.format || DELIVERABLES[i]?.format || '',
                    }));
                    setItems(merged);
                }
            })
            .catch(() => {});
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
        <section ref={sectionRef} className="section-container bg-[#F5F7FA]">
            <div className="text-center mb-14">
                <span className="text-[#C5A55A] font-bold tracking-widest text-sm uppercase mb-2 block">
                    {heading.badge}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 section-heading section-heading-gold">
                    {heading.title}
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    {heading.subtitle}
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={index}
                            className={`group card text-center transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                }`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <div className="w-14 h-14 icon-box-gold flex items-center justify-center mx-auto mb-4">
                                <Icon className="w-7 h-7 text-[#C5A55A]" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-bold text-[#0B1F3B] mb-2">
                                {item.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                {item.description}
                            </p>
                            <span className="gold-tag">
                                {item.format}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
