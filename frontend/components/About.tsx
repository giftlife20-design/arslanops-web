'use client';

import { Target, Boxes, Users2, LineChart, ArrowRight, Award, Coffee } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const METHODOLOGY = [
    {
        icon: Target,
        title: 'Teşhis',
        duration: '1. Hafta',
        description: 'Stok, satın alma, kasa akışını gözlemler, fire/ikram/sızıntı noktalarını tespit ederim'
    },
    {
        icon: Boxes,
        title: 'Düzenleme',
        duration: '30 Gün',
        description: 'Kontrol listelerini, süreç akışını ve KPI\'ları oluşturur, ekip eğitimi veririm'
    },
    {
        icon: Users2,
        title: 'Uygulama',
        duration: '60 Gün',
        description: 'Sistemi günlük operasyona entegre eder, ekibin alışmasını sağlarım'
    },
    {
        icon: LineChart,
        title: 'İyileştirme',
        duration: '90 Gün',
        description: 'Sonuçları ölçer, gerekli ayarlamaları yapar ve sürdürülebilir hale getiririm'
    }
];

interface TeamMember {
    name: string;
    title: string;
    photo_url: string;
}

interface TeamData {
    founder: {
        name: string;
        title: string;
        photo_url: string;
        bio: string;
        bio2: string;
    };
    members: TeamMember[];
}

export default function About() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [team, setTeam] = useState<TeamData | null>(null);
    const [miniStats, setMiniStats] = useState({ yil: '25+', proje: '15+' });

    useEffect(() => {
        // Fetch team data
        fetch(`${API_URL}/api/content/team`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setTeam(data); })
            .catch(() => { });

        // Fetch stats for mini stats row
        fetch(`${API_URL}/api/content`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data && Array.isArray(data.stats)) {
                    const s = data.stats;
                    const yilStat = s[0]; // first stat = yıl deneyim
                    const projeStat = s[1]; // second stat = proje
                    setMiniStats({
                        yil: yilStat ? `${yilStat.value}${yilStat.suffix || ''}` : '25+',
                        proje: projeStat ? `${projeStat.value}${projeStat.suffix || ''}` : '15+'
                    });
                }
            })
            .catch(() => { });

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

    const founder = team?.founder;
    const members = team?.members || [];

    return (
        <section ref={sectionRef} id="hakkimda" className="relative section-container bg-gradient-to-br from-[#0B1F3B] via-[#0F2847] to-[#2B2F36] text-white overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-20 left-1/3 w-96 h-96 bg-[#C5A55A]/4 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-[#C5A55A]/3 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-14">
                    <span className="text-[#C5A55A] font-bold tracking-widest text-sm uppercase mb-2 block">
                        Biz Kimiz
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 section-heading section-heading-gold">
                        Hakkımızda
                    </h2>
                    <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#C5A55A] to-transparent mx-auto rounded-full"></div>
                </div>

                {/* ── Founder Section ── */}
                <div className={`glass-card p-0 overflow-hidden mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="flex flex-col md:flex-row">
                        {/* Photo Side */}
                        <div className="md:w-[30%] relative group">
                            <div className="aspect-[3/4] md:aspect-auto md:h-full md:max-h-[380px] relative overflow-hidden">
                                {founder?.photo_url ? (
                                    <img
                                        src={`${API_URL}${founder.photo_url}`}
                                        alt={founder.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full min-h-[320px] bg-gradient-to-br from-[#1a3a5c] to-[#0B1F3B] flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-28 h-28 bg-gradient-to-br from-[#C5A55A] to-[#A8863D] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-[#C5A55A]/20">
                                                <span className="text-4xl font-bold text-white">İA</span>
                                            </div>
                                            <p className="text-gray-400 text-sm">Fotoğraf eklenecek</p>
                                        </div>
                                    </div>
                                )}
                                {/* Gradient overlay at bottom */}
                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0B1F3B]/80 to-transparent md:hidden" />
                            </div>
                        </div>

                        {/* Info Side */}
                        <div className="md:w-[70%] p-8 md:p-10 flex flex-col justify-center">
                            {/* Name badge */}
                            <div className="mb-6">
                                <div className="inline-flex items-center gap-2 gold-tag mb-3">
                                    <Award className="w-3.5 h-3.5" />
                                    <span>{founder?.title || 'Kurucu & Baş Danışman'}</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                                    {founder?.name || 'İlhan Arslan'}
                                </h3>
                                <div className="flex items-center gap-2 text-[#C5A55A]/70 text-sm mt-1">
                                    <Coffee className="w-4 h-4" />
                                    <span>Coffee & Restoran Operasyon Uzmanı</span>
                                </div>
                            </div>

                            {/* Bio */}
                            <p className="text-gray-200 leading-relaxed mb-4">
                                {founder?.bio || 'Restoran ve kafe sektöründe 25+ yıldır yönetim, operasyon ve danışmanlık tarafında çalışıyorum. Satın alma, stok, maliyet kontrolü, ekip düzeni ve günlük operasyon akışını sahada kurma konusunda uzmanım.'}
                            </p>
                            <p className="text-gray-300 leading-relaxed mb-8">
                                {founder?.bio2 || 'Amacım uzun raporlar yazmak değil; uygulanabilir kontrol listeleri, süreç akışı ve net aksiyon planıyla düzeni oturtmak.'}
                            </p>

                            {/* Stats row */}
                            <div className="pt-6 border-t border-white/10">
                                <div className="flex flex-wrap gap-8">
                                    <div className="group">
                                        <div className="text-3xl font-bold mb-0.5 gold-shimmer" style={{ fontFamily: 'var(--font-heading)' }}>{miniStats.yil}</div>
                                        <div className="text-xs text-gray-400 group-hover:text-[#C5A55A]/80 transition-colors uppercase tracking-wider">Yıl Deneyim</div>
                                    </div>
                                    <div className="group">
                                        <div className="text-3xl font-bold mb-0.5 gold-shimmer" style={{ fontFamily: 'var(--font-heading)' }}>{miniStats.proje}</div>
                                        <div className="text-xs text-gray-400 group-hover:text-[#C5A55A]/80 transition-colors uppercase tracking-wider">Proje</div>
                                    </div>
                                    <div className="group">
                                        <div className="text-3xl font-bold text-[#C5A55A] mb-0.5" style={{ fontFamily: 'var(--font-heading)' }}>Coffee & Restoran</div>
                                        <div className="text-xs text-gray-400 group-hover:text-[#C5A55A]/80 transition-colors uppercase tracking-wider">Uzmanlık Alanı</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Team Members Grid ── */}
                {members.length > 0 && (
                    <div className={`mb-14 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <h3 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
                            Ekibimiz
                        </h3>
                        <div className={`grid gap-8 ${members.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
                            members.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' :
                                members.length === 3 ? 'grid-cols-3 max-w-4xl mx-auto' :
                                    'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                            }`}>
                            {members.map((member, index) => (
                                <div
                                    key={index}
                                    className="glass-card p-8 text-center group"
                                    style={{ transitionDelay: `${400 + index * 100}ms` }}
                                >
                                    {/* Photo */}
                                    <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-5 border-3 border-white/10 group-hover:border-[#C5A55A]/50 transition-all shadow-xl">
                                        {member.photo_url ? (
                                            <img
                                                src={`${API_URL}${member.photo_url}`}
                                                alt={member.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[#1a3a5c] to-[#0B1F3B] flex items-center justify-center">
                                                <span className="text-3xl font-bold text-[#C5A55A]">
                                                    {member.name.split(' ').map(w => w[0]).join('')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-lg text-white group-hover:text-[#C5A55A] transition-colors">
                                        {member.name}
                                    </h4>
                                    <p className="text-base text-gray-400 mt-1">{member.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Methodology ── */}
                <div>
                    <h3 className="text-2xl font-bold text-center mb-4">
                        ArslanOps Metodolojisi
                    </h3>
                    <p className="text-center text-gray-300 mb-10 max-w-3xl mx-auto">
                        90 günlük aşamalı yaklaşım: Teşhisten iyileştirmeye, sürdürülebilir operasyonel mükemmellik
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {METHODOLOGY.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={index}
                                    className={`group glass-card relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                    style={{ transitionDelay: `${600 + index * 150}ms` }}
                                >
                                    {/* Duration + Step badge */}
                                    <span className="gold-tag text-[10px] uppercase tracking-wider mb-4 inline-flex items-center gap-1.5">
                                        <span className="w-5 h-5 bg-[#C5A55A] text-[#0B1F3B] rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0">
                                            {index + 1}
                                        </span>
                                        {step.duration}
                                    </span>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-11 h-11 icon-box-gold flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-[#C5A55A]" strokeWidth={1.5} />
                                        </div>
                                        <h4 className="text-lg font-bold group-hover:text-[#C5A55A] transition-colors">
                                            {step.title}
                                        </h4>
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {step.description}
                                    </p>

                                    {/* Arrow connector (hidden on mobile and last item) */}
                                    {index < METHODOLOGY.length - 1 && (
                                        <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                                            <ArrowRight className="w-5 h-5 text-[#C5A55A]/40" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
