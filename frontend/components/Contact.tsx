'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle, Mail, MessageCircle, MapPin, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FooterData {
    email: string;
    whatsapp: string;
    phone_display: string;
    location: string;
    address: string;
    maps_embed_url: string;
}

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        business_type: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [footer, setFooter] = useState<FooterData>({
        email: 'info@arslanops.com',
        whatsapp: '+905392331474',
        phone_display: '+90 539 233 1 474',
        location: 'Türkiye genelinde hizmet',
        address: '',
        maps_embed_url: ''
    });

    useEffect(() => {
        // Fetch footer/contact data from API
        fetch(`${API_URL}/api/content/footer`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setFooter(prev => ({ ...prev, ...data })); })
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

    // Build WhatsApp URL - strip non-numeric chars
    const waUrl = `https://wa.me/${footer.whatsapp.replace(/[^0-9]/g, '')}`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsSubmitted(true);
                setFormData({ name: '', email: '', phone: '', business_type: '', message: '' });
            } else {
                const data = await res.json();
                setError(data.detail || 'Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } catch {
            setError('Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <section id="iletisim" className="section-container bg-gradient-to-br from-[#0B1F3B] via-[#0F2847] to-[#2B2F36] text-white">
                <div className="max-w-lg mx-auto text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#C5A55A] to-[#A8863D] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#C5A55A]/30">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Mesajınız Alındı!</h3>
                    <p className="text-gray-300 mb-6">
                        En kısa sürede sizinle iletişime geçeceğiz. Genellikle 24 saat içinde dönüş yapıyoruz.
                    </p>
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="text-[#C5A55A] font-semibold hover:underline"
                    >
                        Yeni mesaj gönder
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section ref={sectionRef} id="iletisim" className="relative section-container bg-gradient-to-br from-[#0B1F3B] via-[#0F2847] to-[#2B2F36] text-white overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-1/3 right-0 w-80 h-80 bg-[#C5A55A]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <div className="text-center mb-14">
                    <span className="text-[#C5A55A] font-bold tracking-widest text-sm uppercase mb-2 block">
                        İletişim
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 section-heading section-heading-gold">
                        İşletmenizi Konuşalım
                    </h2>
                    <p className="text-gray-300 max-w-2xl mx-auto">
                        Ücretsiz ön değerlendirme görüşmesi için formu doldurun veya doğrudan iletişime geçin
                    </p>
                </div>

                <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-10">
                    {/* Form */}
                    <div className={`md:col-span-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                        Ad Soyad *
                                    </label>
                                    <input
                                        id="form-ad-soyad"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A55A]/50 focus:ring-1 focus:ring-[#C5A55A]/20 transition-all"
                                        placeholder="Adınız Soyadınız"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                        E-posta *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A55A]/50 focus:ring-1 focus:ring-[#C5A55A]/20 transition-all"
                                        placeholder="ornek@email.com"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                        Telefon
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A55A]/50 focus:ring-1 focus:ring-[#C5A55A]/20 transition-all"
                                        placeholder={footer.phone_display}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                        İşletme Türü
                                    </label>
                                    <select
                                        value={formData.business_type}
                                        onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C5A55A]/50 focus:ring-1 focus:ring-[#C5A55A]/20 transition-all"
                                    >
                                        <option value="" className="text-black">Seçiniz</option>
                                        <option value="coffee" className="text-black">Coffee Shop</option>
                                        <option value="restoran" className="text-black">Restoran</option>
                                        <option value="kafe" className="text-black">Kafe</option>
                                        <option value="pastane" className="text-black">Pastane</option>
                                        <option value="franchise" className="text-black">Franchise</option>
                                        <option value="yeni_acilis" className="text-black">Yeni Açılış</option>
                                        <option value="diger" className="text-black">Diğer</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                    Mesajınız
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A55A]/50 focus:ring-1 focus:ring-[#C5A55A]/20 transition-all resize-none"
                                    placeholder="İşletmenizle ilgili kısa bir bilgi verin..."
                                />
                            </div>

                            {error && (
                                <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C5A55A] to-[#D4B76A] text-[#0B1F3B] py-4 rounded-xl font-bold text-lg hover:from-[#A8863D] hover:to-[#C5A55A] transition-all shadow-lg shadow-[#C5A55A]/20 hover:shadow-[#C5A55A]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-[#0B1F3B]/30 border-t-[#0B1F3B] rounded-full animate-spin" />
                                        Gönderiliyor...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Ücretsiz Ön Görüşme Talep Et
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className={`md:col-span-2 space-y-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <div className="glass-card p-6">
                            <h3 className="font-bold text-lg mb-4">Doğrudan İletişim</h3>
                            <div className="space-y-4">
                                <a
                                    href={`mailto:${footer.email}`}
                                    className="flex items-center gap-3 text-gray-300 hover:text-[#C5A55A] transition-colors"
                                >
                                    <div className="w-10 h-10 icon-box-gold flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-[#C5A55A]" />
                                    </div>
                                    <span>{footer.email}</span>
                                </a>

                                <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-gray-300 hover:text-[#25D366] transition-colors"
                                >
                                    <div className="w-10 h-10 bg-[#25D366]/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#25D366]/20">
                                        <MessageCircle className="w-5 h-5 text-[#25D366]" />
                                    </div>
                                    <span>{footer.phone_display}</span>
                                </a>

                                <div className="flex items-center gap-3 text-gray-300">
                                    <div className="w-10 h-10 icon-box-gold flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-[#C5A55A]" />
                                    </div>
                                    <span>{footer.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 icon-box-gold flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-[#C5A55A]" />
                                </div>
                                <h3 className="font-bold">Yanıt Süresi</h3>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Formunuz bize ulaştıktan sonra genellikle <span className="text-[#C5A55A] font-semibold">24 saat</span> içinde dönüş yapıyoruz.
                            </p>
                        </div>

                        <div className="glass-card p-6 text-center">
                            <p className="text-sm text-gray-400 mb-3">WhatsApp ile anında ulaşın</p>
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#20BD5A] transition-all shadow-lg shadow-[#25D366]/20"
                            >
                                <MessageCircle className="w-5 h-5" />
                                WhatsApp&apos;tan Yazın
                            </a>
                        </div>

                        {/* Harita — sadece URL doluysa göster */}
                        {footer.maps_embed_url && (
                            <div className="glass-card p-0 overflow-hidden">
                                <iframe
                                    src={footer.maps_embed_url}
                                    width="100%"
                                    height="180"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="w-full"
                                />
                                {footer.address && (
                                    <div className="px-4 py-3 flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-[#C5A55A] flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-gray-400 leading-relaxed">{footer.address}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
