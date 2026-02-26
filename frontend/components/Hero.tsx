'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const FALLBACK_WORDS = ['maliyet', 'stok', 'kasa'];

export default function Hero() {
    const [currentWord, setCurrentWord] = useState(0);
    const [hero, setHero] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/api/content/hero`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setHero(data); })
            .catch(() => { });

        // Trigger entrance animation
        setTimeout(() => setIsLoaded(true), 100);
    }, []);

    const words = hero?.rotating_words?.length ? hero.rotating_words : FALLBACK_WORDS;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % words.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [words.length]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    // Build background styles
    const bgType = hero?.bg_type || 'gradient';
    const bgColor = hero?.bg_color || '#0B1F3B';
    const bgGradientFrom = hero?.bg_gradient_from || '#0B1F3B';
    const bgGradientTo = hero?.bg_gradient_to || '#2B2F36';
    const bgImageUrl = hero?.bg_image_url || '';
    const bgVideoUrl = hero?.bg_video_url || '';
    const overlayColor = hero?.bg_overlay_color || '#000000';
    const overlayOpacity = hero?.bg_overlay_opacity ?? 0.5;

    let sectionStyle: React.CSSProperties = {};

    if (bgType === 'color') {
        sectionStyle.backgroundColor = bgColor;
    } else if (bgType === 'gradient') {
        sectionStyle.background = `linear-gradient(135deg, ${bgGradientFrom}, ${bgGradientTo})`;
    } else {
        sectionStyle.backgroundColor = '#0B1F3B';
    }

    return (
        <section className="relative min-h-screen flex items-center text-white overflow-hidden section-wave" style={sectionStyle}>
            {/* Background Image */}
            {bgType === 'image' && bgImageUrl && (
                <img
                    src={`${API_URL}${bgImageUrl}`}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
            )}

            {/* Background Video */}
            {bgType === 'video' && bgVideoUrl && (
                <video
                    src={`${API_URL}${bgVideoUrl}`}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            )}

            {/* Overlay for image/video */}
            {(bgType === 'image' || bgType === 'video') && (
                <div
                    className="absolute inset-0 z-[1]"
                    style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
                />
            )}

            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/40 via-transparent to-transparent" />

            {/* Subtle gold ambient glow */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C5A55A]/5 rounded-full blur-3xl z-[3] pointer-events-none" />
            <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-[#C5A55A]/3 rounded-full blur-3xl z-[3] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10 pt-32 pb-20 md:pt-40 md:pb-32">
                {/* Sol: Metin */}
                <div className={`space-y-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {/* Küçük üst başlık */}
                    <span className="inline-block text-[#C5A55A] font-semibold tracking-[0.2em] text-xs uppercase border border-[#C5A55A]/30 px-4 py-1.5 rounded-full backdrop-blur-sm bg-[#C5A55A]/5">
                        {hero?.badge || 'Coffee & Restoran Operasyon Danışmanlığı'}
                    </span>

                    {/* ANA BAŞLIK — Serif font + text shadow */}
                    <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.15] text-white hero-text-shadow" style={{ fontFamily: 'var(--font-heading)' }}>
                        {hero?.title_prefix || 'İşletmenizde'} <br />
                        <span className="block h-[1.25em] overflow-hidden">
                            <span
                                key={currentWord}
                                className="inline-block font-bold"
                                style={{
                                    animation: 'fadeUp 0.5s ease-out',
                                    fontSize: '1.05em',
                                    color: '#C5A55A',
                                    textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 0 30px rgba(197,165,90,0.3)',
                                }}
                            >
                                {words[currentWord]}
                            </span>
                        </span>
                        kontrolü ve operasyon düzeni kurarım.
                    </h1>

                    {/* Alt Açıklama */}
                    <p className="text-lg md:text-xl text-gray-200 max-w-xl font-light leading-relaxed hero-subtitle-shadow">
                        {hero?.description || '25+ yıllık saha deneyimiyle stok–satın alma–kasa akışını toplar, fire/ikram kaçaklarını görünür hale getirir, takip edilebilir bir sistem kurarım.'}
                    </p>

                    {/* CTA Butonlar */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button
                            onClick={() => scrollToSection('iletisim')}
                            className="bg-gradient-to-r from-[#C5A55A] to-[#D4B76A] text-[#0B1F3B] px-10 py-4.5 rounded-xl font-bold text-lg text-center hover:from-[#A8863D] hover:to-[#C5A55A] transition-all duration-300 shadow-xl shadow-[#C5A55A]/25 hover:shadow-2xl hover:shadow-[#C5A55A]/40 hover:-translate-y-0.5"
                        >
                            {hero?.cta_primary || 'Ücretsiz Ön Görüşme'}
                        </button>
                        <button
                            onClick={() => {
                                scrollToSection('iletisim');
                                setTimeout(() => {
                                    document.getElementById('form-ad-soyad')?.focus();
                                }, 500);
                            }}
                            className="border-2 border-[#C5A55A]/30 backdrop-blur-sm text-white px-10 py-4.5 rounded-xl font-semibold text-lg text-center hover:bg-[#C5A55A]/10 hover:border-[#C5A55A]/60 transition-all duration-300"
                        >
                            {hero?.cta_secondary || 'Teklif İste'}
                        </button>
                    </div>
                </div>

                {/* Sağ: Premium Glassmorphism Card */}
                <div className={`flex justify-center items-center transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl p-8 border border-[#C5A55A]/15 shadow-2xl shadow-black/20 gold-glow">
                        {/* Gold accent line at top */}
                        <div className="w-12 h-0.5 bg-gradient-to-r from-[#C5A55A] to-transparent mb-6" />
                        <h3 className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-6" style={{ fontFamily: 'var(--font-body)' }}>Danışmanlık Çıktıları</h3>
                        <div className="space-y-5">
                            {[
                                { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Durum Özeti (PDF)' },
                                { icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Aksiyon Planı (Excel)' },
                                { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', label: 'Kontrol Listeleri' },
                            ].map((item, i) => (
                                <div key={i} className={`flex items-center gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                                    style={{ transitionDelay: `${0.6 + i * 0.15}s` }}>
                                    <div className="w-12 h-12 icon-box-gold flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-[#C5A55A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                        </svg>
                                    </div>
                                    <span className="text-gray-200 font-medium">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex flex-col items-center gap-2 animate-bounce">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A55A]/50 font-medium">Keşfet</span>
                    <ChevronDown className="w-6 h-6 text-[#C5A55A]/50" />
                </div>
            </div>
        </section>
    );
}
