'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageCircle, Instagram, Linkedin, MapPin, ArrowUp } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FooterData {
    email: string;
    whatsapp: string;
    phone_display: string;
    instagram: string;
    linkedin: string;
    location: string;
    address: string;
}

export default function Footer() {
    const [footer, setFooter] = useState<FooterData>({
        email: 'info@arslanops.com',
        whatsapp: '+905392331474',
        phone_display: '+90 539 233 1 474',
        instagram: 'https://www.instagram.com/arslanops',
        linkedin: 'https://www.linkedin.com/in/ilhan-a-ab0ab7254/',
        location: 'Türkiye genelinde hizmet',
        address: ''
    });

    useEffect(() => {
        fetch(`${API_URL}/api/content/footer`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setFooter(prev => ({ ...prev, ...data })); })
            .catch(() => { });
    }, []);

    // Auto-fix URLs missing protocol
    const ensureUrl = (url: string) =>
        url && !url.startsWith('http://') && !url.startsWith('https://') ? 'https://' + url : url;

    const waUrl = `https://wa.me/${footer.whatsapp.replace(/[^0-9]/g, '')}`;

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            {/* WhatsApp Floating Button */}
            <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-50 flex items-center gap-2 group"
                aria-label="WhatsApp ile iletişime geç"
            >
                <MessageCircle className="w-6 h-6" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold">
                    WhatsApp
                </span>
            </a>

            {/* Footer */}
            <footer className="bg-[#0B1F3B] text-white">
                {/* Üst CTA Bant */}
                <div className="bg-gradient-to-r from-[#C5A55A] via-[#D4B76A] to-[#C5A55A]">
                    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-[#0B1F3B]">
                                İşletmenizi Bir Üst Seviyeye Taşıyalım
                            </h3>
                            <p className="text-[#0B1F3B]/70 text-sm mt-1">
                                Ücretsiz ön değerlendirme için hemen iletişime geçin
                            </p>
                        </div>
                        <button
                            onClick={() => scrollToSection('iletisim')}
                            className="bg-[#0B1F3B] text-[#C5A55A] px-8 py-3 rounded-lg font-bold hover:bg-[#0B1F3B]/90 transition-all shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
                        >
                            Ücretsiz Ön Görüşme
                        </button>
                    </div>
                </div>

                {/* Ana Footer */}
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="grid md:grid-cols-4 gap-8 mb-10">
                        {/* Marka */}
                        <div className="md:col-span-1">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#C5A55A] to-[#A8863D] rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-[#C5A55A]/20">
                                    A
                                </div>
                                <div>
                                    <div className="font-bold text-lg leading-tight">ArslanOps</div>
                                    <div className="text-[10px] text-[#C5A55A]/60 tracking-wider uppercase">Coffee &amp; Restoran Operasyon</div>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                25+ yıllık saha deneyimiyle coffee ve restoranlarda operasyonel mükemmellik sağlıyoruz.
                            </p>

                            {/* Sosyal Medya */}
                            <div className="flex items-center gap-3 mt-6">
                                <a
                                    href={ensureUrl(footer.instagram)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#C5A55A] hover:bg-[#C5A55A]/10 hover:border-[#C5A55A]/20 border border-transparent transition-all"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a
                                    href={ensureUrl(footer.linkedin)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#C5A55A] hover:bg-[#C5A55A]/10 hover:border-[#C5A55A]/20 border border-transparent transition-all"
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#25D366] hover:bg-white/10 border border-transparent transition-all"
                                    aria-label="WhatsApp"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        {/* Hizmetler */}
                        <div>
                            <h4 className="font-semibold mb-4 text-white">Hizmetler</h4>
                            <ul className="space-y-2.5 text-gray-400 text-sm">
                                <li>
                                    <button onClick={() => scrollToSection('hizmetler')} className="hover:text-[#C5A55A] transition-colors text-left">
                                        Maliyet Kontrolü
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => scrollToSection('hizmetler')} className="hover:text-[#C5A55A] transition-colors text-left">
                                        Stok Yönetimi
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => scrollToSection('hizmetler')} className="hover:text-[#C5A55A] transition-colors text-left">
                                        Operasyon Düzeni
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => scrollToSection('hizmetler')} className="hover:text-[#C5A55A] transition-colors text-left">
                                        Yeni Açılış Danışmanlığı
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => scrollToSection('hizmetler')} className="hover:text-[#C5A55A] transition-colors text-left">
                                        Ekip Eğitimi
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Hızlı Erişim */}
                        <div>
                            <h4 className="font-semibold mb-4 text-white">Hızlı Erişim</h4>
                            <ul className="space-y-2.5 text-gray-400 text-sm">
                                <li>
                                    <button onClick={() => scrollToSection('paketler')} className="hover:text-[#C5A55A] transition-colors text-left">
                                        Danışmanlık Paketleri
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => scrollToSection('portfolyo')} className="hover:text-[#C5A55A] transition-colors text-left">
                                        Portföy Örnekleri
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => scrollToSection('hakkimda')} className="hover:text-[#C5A55A] transition-colors text-left">
                                        Hakkımda
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => scrollToSection('sss')} className="hover:text-[#C5A55A] transition-colors text-left">
                                        Sıkça Sorulan Sorular
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* İletişim */}
                        <div>
                            <h4 className="font-semibold mb-4 text-white">İletişim</h4>
                            <div className="space-y-3 text-gray-400 text-sm">
                                <a
                                    href={`mailto:${footer.email}`}
                                    className="flex items-center gap-3 hover:text-[#C5A55A] transition-colors"
                                >
                                    <Mail className="w-4 h-4 flex-shrink-0" />
                                    {footer.email}
                                </a>
                                <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 hover:text-[#C5A55A] transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4 flex-shrink-0" />
                                    {footer.phone_display}
                                </a>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <span>{footer.location}</span>
                                        {footer.address && (
                                            <p className="text-xs text-gray-500 mt-1">{footer.address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alt çizgi */}
                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-400 text-sm">
                            &copy; {new Date().getFullYear()} ArslanOps - İlhan Arslan. Tüm hakları saklıdır.
                        </p>
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="flex items-center gap-2 text-gray-400 hover:text-[#C5A55A] transition-colors text-sm group"
                        >
                            <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                            Yukarı Dön
                        </button>
                    </div>
                </div>
            </footer>
        </>
    );
}
