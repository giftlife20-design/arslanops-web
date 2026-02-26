'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const FALLBACK_LOGOS = [
    'Gloria Jeans', 'MOC', 'Petra Roasting', 'Coffee Lab', 'Brew & Co',
    'Espresso House', 'Artemis', 'Bean Station'
];

interface LogoItem {
    name: string;
    logo_url?: string;
    description?: string;
    enabled?: boolean;
}

export default function LogoMarquee() {
    const [logos, setLogos] = useState<LogoItem[]>([]);
    const [sectionVisible, setSectionVisible] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/content`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    if (data.logo_clients_visible === false) {
                        setSectionVisible(false);
                        return;
                    }
                    if (Array.isArray(data.logo_clients) && data.logo_clients.length > 0) {
                        const enabledLogos = data.logo_clients.filter((l: LogoItem) => l.enabled !== false);
                        setLogos(enabledLogos);
                    } else {
                        setLogos(FALLBACK_LOGOS.map(name => ({ name })));
                    }
                }
            })
            .catch(() => {
                setLogos(FALLBACK_LOGOS.map(name => ({ name })));
            });
    }, []);

    if (!sectionVisible || logos.length === 0) return null;

    // Triple logos for seamless infinite scroll (prevents gap)
    const tripleLogos = [...logos, ...logos, ...logos];

    return (
        <section className="py-14 bg-white overflow-hidden border-y border-gray-100">
            <div className="text-center mb-10">
                <span className="text-[#C5A55A] font-bold tracking-widest text-xs uppercase">
                    Güvenilir Referanslar
                </span>
            </div>

            <div className="relative">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

                <div className="flex marquee-track">
                    {tripleLogos.map((logo, index) => (
                        <div
                            key={index}
                            className="marquee-item flex-shrink-0 mx-6 flex flex-col items-center justify-center group"
                        >
                            {/* Round logo container */}
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 bg-white flex items-center justify-center shadow-md group-hover:border-[#C5A55A] group-hover:shadow-lg group-hover:shadow-[#C5A55A]/10 transition-all duration-300">
                                {logo.logo_url ? (
                                    <img
                                        src={`${API_URL}${logo.logo_url}`}
                                        alt={logo.name}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                    />
                                ) : (
                                    <span className="text-gray-400 font-bold text-lg text-center leading-tight px-2 group-hover:text-[#C5A55A] transition-colors duration-300">
                                        {logo.name.split(' ').map(w => w[0]).join('')}
                                    </span>
                                )}
                            </div>
                            {/* Name */}
                            <span className="mt-2 text-xs font-semibold text-gray-500 group-hover:text-[#C5A55A] transition-colors whitespace-nowrap">
                                {logo.name}
                            </span>
                            {/* Description on hover */}
                            {logo.description && (
                                <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity max-w-[120px] text-center leading-tight mt-0.5">
                                    {logo.description}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
