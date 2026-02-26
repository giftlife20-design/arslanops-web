'use client';

import { useEffect, useRef, useState } from 'react';
import { Star, Quote } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const FALLBACK_TESTIMONIALS = [
    {
        name: 'Mehmet K.',
        role: 'Coffee Shop Sahibi',
        location: 'İstanbul',
        content: 'İlhan Bey ile çalışmaya başladıktan 60 gün sonra COGS oranımız %38\'den %27\'ye düştü. Fire kontrol sistemi sayesinde aylık 15.000 TL tasarruf sağladık.',
        rating: 5,
        highlight: '%30 maliyet düşüşü',
        avatar_url: ''
    },
    {
        name: 'Ayşe T.',
        role: 'Restoran İşletmecisi',
        location: 'Ankara',
        content: 'Yeni açılışımızda sıfırdan sistem kurulmasını sağladı. Kontrol listeleri ve süreç akışları sayesinde ilk günden profesyonel bir işleyiş oturduk.',
        rating: 5,
        highlight: 'Sıfırdan sistem kurulumu',
        avatar_url: ''
    },
    {
        name: 'Emre D.',
        role: 'Franchise Yöneticisi',
        location: 'İzmir',
        content: 'Üç şubemizde standart operasyon prosedürleri oluşturdu. Artık her şubede aynı kalite ve kontrol sistemiyle çalışıyoruz. Ekip verimliliği gözle görülür şekilde arttı.',
        rating: 5,
        highlight: '3 şubede standart sistem',
        avatar_url: ''
    },
    {
        name: 'Fatma S.',
        role: 'Kafe & Pastane Sahibi',
        location: 'Bursa',
        content: 'Stok sayımlarında her ay eksik çıkıyordu ama sebebini bulamıyorduk. İlhan Bey kontrol noktalarını belirledikten sonra kayıplar neredeyse sıfıra indi.',
        rating: 5,
        highlight: 'Stok kayıpları %95 azaldı',
        avatar_url: ''
    }
];

export default function Testimonials() {
    const [isVisible, setIsVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);
    const [sectionVisible, setSectionVisible] = useState(true);
    const sectionRef = useRef<HTMLDivElement>(null);

    // Fetch testimonials + visibility from API
    useEffect(() => {
        fetch(`${API_URL}/api/content`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    if (data.testimonials_visible === false) {
                        setSectionVisible(false);
                        return;
                    }
                    if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
                        setTestimonials(data.testimonials);
                    }
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

    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    if (!sectionVisible) return null;

    const active = testimonials[activeIndex];

    return (
        <section ref={sectionRef} id="referanslar" className="section-container bg-[#F5F7FA]">
            <div className="text-center mb-14">
                <span className="text-[#C5A55A] font-bold tracking-widest text-sm uppercase mb-2 block">
                    Müşteri Görüşleri
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 section-heading section-heading-gold">
                    Müşterilerimiz Ne Diyor?
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Birlikte çalıştığımız işletmelerin deneyimleri ve elde ettikleri sonuçlar
                </p>
            </div>

            {/* Featured Testimonial */}
            <div className="max-w-4xl mx-auto mb-10">
                <div
                    className={`relative bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-gray-100 hover:border-[#C5A55A]/20 transition-all duration-700 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                >
                    {/* Quote icon */}
                    <div className="absolute -top-5 left-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#C5A55A] to-[#A8863D] rounded-xl flex items-center justify-center shadow-lg shadow-[#C5A55A]/30">
                            <Quote className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mt-4">
                        <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 italic">
                            &ldquo;{active.content}&rdquo;
                        </p>

                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                {/* Avatar — Photo or Initial */}
                                {active.avatar_url ? (
                                    <img
                                        src={`${API_URL}${active.avatar_url}`}
                                        alt={active.name}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-[#C5A55A]/20 shadow-md"
                                    />
                                ) : (
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#C5A55A] to-[#A8863D] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        {active.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <div className="font-bold text-[#0B1F3B]">
                                        {active.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {active.role} · {active.location}
                                    </div>
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: active.rating }).map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-[#C5A55A] fill-[#C5A55A]" />
                                ))}
                            </div>
                        </div>

                        {/* Highlight badge */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#C5A55A] bg-[#C5A55A]/10 px-4 py-2 rounded-full border border-[#C5A55A]/15">
                                ✦ {active.highlight}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dots navigation */}
            <div className="flex items-center justify-center gap-2">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`transition-all duration-300 rounded-full ${activeIndex === index
                            ? 'w-8 h-3 bg-gradient-to-r from-[#C5A55A] to-[#D4B76A]'
                            : 'w-3 h-3 bg-gray-300 hover:bg-[#C5A55A]/50'
                            }`}
                        aria-label={`Görüş ${index + 1}`}
                    />
                ))}
            </div>

            {/* Summary cards with avatars */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}>
                {testimonials.map((testimonial, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`p-4 rounded-xl text-center transition-all duration-300 ${activeIndex === index
                            ? 'bg-white shadow-md border-2 border-[#C5A55A]/20'
                            : 'bg-white/50 border-2 border-transparent hover:bg-white hover:shadow-sm'
                            }`}
                    >
                        {/* Mini Avatar */}
                        <div className="flex justify-center mb-2">
                            {testimonial.avatar_url ? (
                                <img
                                    src={`${API_URL}${testimonial.avatar_url}`}
                                    alt={testimonial.name}
                                    className={`w-10 h-10 rounded-full object-cover border-2 transition-colors ${activeIndex === index ? 'border-[#C5A55A]/40' : 'border-gray-200'
                                        }`}
                                />
                            ) : (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all ${activeIndex === index
                                    ? 'bg-gradient-to-br from-[#C5A55A] to-[#A8863D]'
                                    : 'bg-gray-300'
                                    }`}>
                                    {testimonial.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="text-sm font-bold text-[#0B1F3B]">{testimonial.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{testimonial.role}</div>
                        <div className="text-xs font-semibold text-[#C5A55A] mt-2">{testimonial.highlight}</div>
                    </button>
                ))}
            </div>
        </section>
    );
}
