'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const NAV_LINKS = [
    { label: 'Hizmetler', href: 'hizmetler' },
    { label: 'Portföy', href: 'portfolyo' },
    { label: 'Referanslar', href: 'referanslar' },
    { label: 'Paketler', href: 'paketler' },
    { label: 'Hakkımda', href: 'hakkimda' },
    { label: 'SSS', href: 'sss' },
    { label: 'İletişim', href: 'iletisim' },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [branding, setBranding] = useState<{ logo_url?: string; logo_text?: string }>({});

    useEffect(() => {
        // Fetch branding
        fetch(`${API_URL}/api/content/branding`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setBranding(data); })
            .catch(() => { });

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 40);
        };

        const handleSectionObserver = () => {
            const sections = NAV_LINKS.map(link => document.getElementById(link.href)).filter(Boolean);

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setActiveSection(entry.target.id);
                        }
                    });
                },
                { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' }
            );

            sections.forEach((section) => {
                if (section) observer.observe(section);
            });

            return () => observer.disconnect();
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        // Small delay to allow DOM to be ready
        const timeout = setTimeout(handleSectionObserver, 500);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeout);
        };
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80; // navbar height
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementPosition - offset,
                behavior: 'smooth'
            });
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                    ? 'bg-[#0B1F3B]/95 backdrop-blur-md shadow-lg shadow-black/10 py-3'
                    : 'bg-transparent py-5'
                    }`}
            >
                <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
                    {/* Logo */}
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex items-center gap-2.5 group"
                    >
                        {branding.logo_url ? (
                            <img src={`${API_URL}${branding.logo_url}`} alt={branding.logo_text || 'Logo'} className="h-9 w-auto group-hover:scale-105 transition-transform" />
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-[#C5A55A] to-[#A8863D] rounded-lg flex items-center justify-center font-bold text-white text-lg group-hover:scale-105 transition-all shadow-lg shadow-[#C5A55A]/20">
                                A
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-lg leading-tight tracking-tight">
                                {branding.logo_text || 'ArslanOps'}
                            </span>
                            <span className={`text-[10px] leading-none tracking-wider uppercase transition-all duration-300 ${isScrolled ? 'text-[#C5A55A]/60' : 'text-[#C5A55A]/80'
                                }`}>
                                Coffee & Restoran Operasyon
                            </span>
                        </div>
                    </button>

                    {/* Desktop Nav Links */}
                    <div className="hidden lg:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <button
                                key={link.href}
                                onClick={() => scrollToSection(link.href)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeSection === link.href
                                    ? 'text-[#C5A55A] bg-[#C5A55A]/10'
                                    : 'text-white hover:text-[#C5A55A] hover:bg-white/5'
                                    }`}
                            >
                                {link.label}
                            </button>
                        ))}
                        <button
                            onClick={() => scrollToSection('iletisim')}
                            className="ml-3 bg-gradient-to-r from-[#C5A55A] to-[#D4B76A] text-[#0B1F3B] px-5 py-2.5 rounded-lg text-sm font-bold hover:from-[#A8863D] hover:to-[#C5A55A] transition-all shadow-lg shadow-[#C5A55A]/20 hover:shadow-[#C5A55A]/40 hover:-translate-y-0.5"
                        >
                            Teklif Al
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Menüyü aç"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-72 bg-[#0B1F3B] z-50 lg:hidden transition-transform duration-300 shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-10">
                        <span className="text-white font-bold text-lg">Menü</span>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Menüyü kapat"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-1">
                        {NAV_LINKS.map((link) => (
                            <button
                                key={link.href}
                                onClick={() => scrollToSection(link.href)}
                                className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${activeSection === link.href
                                    ? 'text-[#C5A55A] bg-[#C5A55A]/10'
                                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10">
                        <button
                            onClick={() => scrollToSection('iletisim')}
                            className="w-full bg-gradient-to-r from-[#C5A55A] to-[#D4B76A] text-[#0B1F3B] px-5 py-3 rounded-lg font-bold hover:from-[#A8863D] hover:to-[#C5A55A] transition-all text-center"
                        >
                            Teklif Al
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
