'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, TrendingDown, Users, DollarSign, ClipboardX, Eye } from 'lucide-react';

/* ─── Animated Background Components ─── */

// 1. Maliyet Kontrolsüzlüğü — Rising red chart line + percentage
function CostAnimation() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-[0.07] group-hover:opacity-[0.15] transition-opacity duration-700">
            {/* Animated rising chart */}
            <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Area under the curve */}
                <path
                    d="M0,180 Q50,170 100,160 T200,120 T300,60 T400,20 L400,200 L0,200 Z"
                    fill="url(#chartGrad)"
                    className="animate-cost-area"
                />
                {/* The line itself */}
                <path
                    d="M0,180 Q50,170 100,160 T200,120 T300,60 T400,20"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="animate-cost-line"
                />
            </svg>
            {/* Floating percentage numbers */}
            <div className="absolute top-4 right-4 text-red-500 font-bold text-4xl animate-cost-percent">%40</div>
            <div className="absolute top-12 right-12 text-red-400 font-bold text-2xl animate-cost-percent-2">%35</div>
            {/* Small warning triangles floating */}
            <div className="absolute bottom-8 left-8 animate-float-slow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            </div>
        </div>
    );
}

// 2. Süreç Eksikliği — Scattered checklist items fading in/out
function ProcessAnimation() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-[0.07] group-hover:opacity-[0.15] transition-opacity duration-700">
            {/* Scattered checklist items */}
            {[
                { x: '10%', y: '15%', delay: '0s', w: '55%' },
                { x: '20%', y: '30%', delay: '0.8s', w: '40%' },
                { x: '5%', y: '45%', delay: '1.6s', w: '65%' },
                { x: '15%', y: '60%', delay: '2.4s', w: '50%' },
                { x: '8%', y: '75%', delay: '3.2s', w: '45%' },
            ].map((item, i) => (
                <div
                    key={i}
                    className="absolute animate-checklist-fade"
                    style={{ left: item.x, top: item.y, animationDelay: item.delay }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-red-400 flex items-center justify-center">
                            <svg width="10" height="10" viewBox="0 0 10 10" className="animate-x-draw">
                                <line x1="2" y1="2" x2="8" y2="8" stroke="#ef4444" strokeWidth="2" />
                                <line x1="8" y1="2" x2="2" y2="8" stroke="#ef4444" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className="h-2 rounded-full bg-red-300" style={{ width: item.w }} />
                    </div>
                </div>
            ))}
            {/* Broken clipboard icon */}
            <div className="absolute bottom-4 right-4 animate-rock">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.5">
                    <path d="M16 4h2a2 2 0 0 1 2 2v1" /><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <line x1="4" y1="12" x2="20" y2="12" strokeDasharray="4 3" />
                </svg>
            </div>
        </div>
    );
}

// 3. Ekip Düzensizliği — Chaotic bouncing person icons
function TeamAnimation() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-[0.07] group-hover:opacity-[0.15] transition-opacity duration-700">
            {[
                { x: '15%', y: '20%', delay: '0s', dx: 15, dy: 10 },
                { x: '60%', y: '15%', delay: '0.5s', dx: -12, dy: 15 },
                { x: '35%', y: '55%', delay: '1s', dx: 20, dy: -8 },
                { x: '75%', y: '50%', delay: '1.5s', dx: -18, dy: -12 },
                { x: '25%', y: '75%', delay: '2s', dx: 10, dy: 18 },
                { x: '65%', y: '70%', delay: '2.5s', dx: -8, dy: -15 },
            ].map((person, i) => (
                <div
                    key={i}
                    className="absolute animate-chaotic-move"
                    style={{
                        left: person.x, top: person.y,
                        animationDelay: person.delay,
                        ['--dx' as string]: `${person.dx}px`,
                        ['--dy' as string]: `${person.dy}px`,
                    }}
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
            ))}
            {/* Collision sparks */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spark">
                <svg width="30" height="30" viewBox="0 0 30 30">
                    <line x1="15" y1="5" x2="15" y2="0" stroke="#ef4444" strokeWidth="2" />
                    <line x1="25" y1="15" x2="30" y2="15" stroke="#ef4444" strokeWidth="2" />
                    <line x1="15" y1="25" x2="15" y2="30" stroke="#ef4444" strokeWidth="2" />
                    <line x1="5" y1="15" x2="0" y2="15" stroke="#ef4444" strokeWidth="2" />
                    <line x1="22" y1="8" x2="26" y2="4" stroke="#ef4444" strokeWidth="1.5" />
                    <line x1="8" y1="22" x2="4" y2="26" stroke="#ef4444" strokeWidth="1.5" />
                </svg>
            </div>
        </div>
    );
}

// 4. Kasa Takip Problemi — Falling/leaking coins
function CashAnimation() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-[0.07] group-hover:opacity-[0.15] transition-opacity duration-700">
            {/* Falling coins */}
            {[
                { x: '20%', delay: '0s', size: 20 },
                { x: '45%', delay: '0.6s', size: 16 },
                { x: '70%', delay: '1.2s', size: 22 },
                { x: '30%', delay: '1.8s', size: 14 },
                { x: '55%', delay: '2.4s', size: 18 },
                { x: '80%', delay: '3s', size: 15 },
                { x: '10%', delay: '3.6s', size: 20 },
            ].map((coin, i) => (
                <div
                    key={i}
                    className="absolute animate-coin-fall"
                    style={{ left: coin.x, animationDelay: coin.delay, top: '-10%' }}
                >
                    <svg width={coin.size} height={coin.size} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v12M9 9h6M9 15h6" />
                    </svg>
                </div>
            ))}
            {/* Broken piggy bank */}
            <div className="absolute bottom-6 right-6 animate-shake">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.4">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            </div>
        </div>
    );
}

// 5. Görünürlük Eksikliği — Blurry dashboard elements flickering
function VisibilityAnimation() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-[0.07] group-hover:opacity-[0.15] transition-opacity duration-700">
            {/* Blurry bar chart */}
            <div className="absolute top-6 left-6 flex items-end gap-2 animate-blur-flicker">
                {[60, 40, 80, 30, 55, 70, 45].map((h, i) => (
                    <div
                        key={i}
                        className="w-4 rounded-t bg-red-400"
                        style={{ height: `${h}%`, filter: 'blur(1.5px)', opacity: 0.5 + Math.random() * 0.3 }}
                    />
                ))}
            </div>
            {/* Blurry line chart */}
            <svg className="absolute bottom-8 right-4 w-32 h-20 animate-blur-flicker-2" viewBox="0 0 120 60" style={{ filter: 'blur(1px)' }}>
                <polyline points="0,50 20,35 40,45 60,20 80,30 100,10 120,25" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.5" />
                <polyline points="0,55 20,50 40,40 60,45 80,35 100,40 120,30" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 3" />
            </svg>
            {/* Question marks */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 text-5xl font-bold animate-pulse-slow" style={{ filter: 'blur(2px)' }}>
                ?
            </div>
        </div>
    );
}

// 6. Yeni Açılış Belirsizliği — Floating question marks + warning icons
function NewOpeningAnimation() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-[0.07] group-hover:opacity-[0.15] transition-opacity duration-700">
            {/* Floating question marks */}
            {[
                { x: '15%', y: '20%', size: 28, delay: '0s' },
                { x: '70%', y: '30%', size: 36, delay: '1s' },
                { x: '40%', y: '60%', size: 24, delay: '2s' },
                { x: '80%', y: '65%', size: 32, delay: '0.5s' },
                { x: '25%', y: '45%', size: 20, delay: '1.5s' },
            ].map((q, i) => (
                <div
                    key={i}
                    className="absolute text-red-500 font-bold animate-question-float"
                    style={{
                        left: q.x, top: q.y,
                        fontSize: q.size,
                        animationDelay: q.delay,
                    }}
                >
                    ?
                </div>
            ))}
            {/* Warning triangles */}
            {[
                { x: '50%', y: '15%', delay: '0.7s' },
                { x: '10%', y: '70%', delay: '2.2s' },
                { x: '65%', y: '75%', delay: '1.3s' },
            ].map((w, i) => (
                <div
                    key={i}
                    className="absolute animate-warning-pulse"
                    style={{ left: w.x, top: w.y, animationDelay: w.delay }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>
            ))}
        </div>
    );
}

/* ─── Animation type mapping ─── */
const ANIMATION_MAP: Record<string, React.FC> = {
    'cost': CostAnimation,
    'process': ProcessAnimation,
    'team': TeamAnimation,
    'cash': CashAnimation,
    'visibility': VisibilityAnimation,
    'newopening': NewOpeningAnimation,
};

const PROBLEMS = [
    {
        icon: TrendingDown,
        title: 'Maliyet Kontrolsüzlüğü',
        description: 'COGS oranları %35-40 üstüne çıktı ama sebebi tespit edilemiyor. Fire, ikram ve stok kayıpları görünür değil.',
        animKey: 'cost',
    },
    {
        icon: ClipboardX,
        title: 'Süreç Eksikliği',
        description: 'Açılış-kapanış prosedürü yok, kontrol listesi yok, vardiya geçişlerinde bilgi kaybı yaşanıyor.',
        animKey: 'process',
    },
    {
        icon: Users,
        title: 'Ekip Düzensizliği',
        description: 'Görev tanımları belirsiz, sorumluluklar çakışıyor, personel verimsiz çalışıyor.',
        animKey: 'team',
    },
    {
        icon: DollarSign,
        title: 'Kasa Takip Problemi',
        description: 'Günlük kasa kapanışları yapılmıyor, gelir-gider takibi eksik, nakit akışı kontrol dışı.',
        animKey: 'cash',
    },
    {
        icon: Eye,
        title: 'Görünürlük Eksikliği',
        description: 'KPI yok, dashboard yok, haftalık-aylık karşılaştırma yapılamıyor. Kararlar sezgiye dayalı.',
        animKey: 'visibility',
    },
    {
        icon: AlertTriangle,
        title: 'Yeni Açılış Belirsizliği',
        description: 'Konsept, ekipman, menü ve operasyon planı olmadan açılış yapılıyor, ilk 6 ayda ciddi kayıplar yaşanıyor.',
        animKey: 'newopening',
    }
];

export default function Problems() {
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
        <section ref={sectionRef} className="section-container bg-white">
            <div className="text-center mb-14">
                <span className="text-[#C5A55A] font-bold tracking-widest text-sm uppercase mb-2 block">
                    Sık Karşılaşılan Sorunlar
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 section-heading section-heading-gold">
                    Bu Sorunlar Tanıdık Geldi mi?
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    İşletmelerin en sık karşılaştığı operasyonel problemler ve kontrol eksiklikleri
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PROBLEMS.map((problem, index) => {
                    const Icon = problem.icon;
                    const AnimBg = ANIMATION_MAP[problem.animKey];
                    return (
                        <div
                            key={index}
                            className={`group relative card overflow-hidden hover:border-red-200/50 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                }`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            {/* Animated background */}
                            {AnimBg && <AnimBg />}

                            {/* Content (on top) */}
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-100 group-hover:scale-110 transition-all duration-300">
                                    <Icon className="w-6 h-6 text-red-500" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-bold text-[#0B1F3B] mb-3">
                                    {problem.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {problem.description}
                                </p>
                            </div>

                            {/* Hover glow effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{
                                    background: 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.04), transparent 70%)',
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
