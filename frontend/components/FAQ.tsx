'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const FALLBACK_FAQ = [
    {
        question: 'Danışmanlık süreci nasıl işliyor?',
        answer: 'İlk olarak ücretsiz bir ön görüşme yapıyoruz. Mevcut durumunuzu anladıktan sonra, size özel bir analiz ve aksiyon planı hazırlıyoruz. Ardından aşamalı olarak uygulamaya geçiyoruz.'
    },
    {
        question: 'Hangi işletmelere hizmet veriyorsunuz?',
        answer: 'Coffee shop, restoran, kafe, pastane ve franchise zincirlerine hizmet veriyoruz. Hem yeni açılışlarda hem mevcut işletmelerde çalışıyoruz.'
    },
    {
        question: 'İlk görüşme ücretli mi?',
        answer: 'Hayır, ilk ön değerlendirme görüşmemiz tamamen ücretsizdir. Bu görüşmede ihtiyaçlarınızı analiz eder ve size uygun paketi öneriyoruz.'
    },
    {
        question: 'Şehir dışı işletmelere de hizmet verebiliyor musunuz?',
        answer: 'Evet, Türkiye genelinde hizmet veriyoruz. İlk teşhis için sahada bulunuyoruz, takip sürecini online olarak yürütebiliyoruz.'
    },
    {
        question: 'Sonuçları ne kadar sürede görmeye başlarız?',
        answer: 'İlk haftada teşhis raporu, 30 gün içinde ilk iyileştirmeler, 90 gün içinde ölçülebilir sonuçlar hedefliyoruz. Her işletmenin dinamiği farklı olsa da, genellikle ilk aydan itibaren fark hissedilir.'
    },
    {
        question: 'Danışmanlık sonunda elimde somut ne kalacak?',
        answer: 'Her pakette elinize geçecek teslimatlar net olarak belirlenmiştir: Durum Özeti PDF, Aksiyon Planı Excel, SOP dokümanları, kontrol listeleri ve KPI takip dosyaları. Sadece konuşma değil, kalıcı ve kullanılabilir dokümanlar teslim ediyoruz.'
    },
    {
        question: 'Danışman gittikten sonra eski düzene dönmez miyiz?',
        answer: 'Bu en yaygın endişelerden biri ve biz bunu çözmek için çalışıyoruz. Kurduğumuz SOP (Standart Operasyon Prosedürleri), kontrol listeleri ve takip sistemleri ekibinizle birlikte sahada test edilir. Ayrıca eğitim dokümanları sayesinde yeni personel de aynı standartlarda çalışmaya devam eder.'
    },
    {
        question: 'Sonuçlar nasıl ölçülüyor? Gerçekten fark oluyor mu?',
        answer: 'Her projenin başında mevcut KPI\'larınızı (COGS oranı, fire yüzdesi, kasa açığı vb.) kayıt altına alıyoruz. Süreç boyunca bu metrikleri haftalık takip ediyor, proje sonunda öncesi-sonrası karşılaştırma raporu sunuyoruz. Ortalama müşterimiz %20-30 maliyet iyileştirmesi görüyor.'
    },
    {
        question: 'İletişim süreci nasıl yürütülüyor? Ulaşabilir misiniz?',
        answer: 'Paketinize göre haftalık online görüşmeler, e-posta ile ilerleme raporları ve WhatsApp üzerinden anlık iletişim sunuyoruz. Pro pakette 7/24 WhatsApp desteği bulunur. Hiçbir müşterimiz "danışmanıma ulaşamıyorum" demez — bu bizim temel prensibimizdir.'
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [faqs, setFaqs] = useState(FALLBACK_FAQ);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`${API_URL}/api/content/faq`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data && Array.isArray(data) && data.length > 0) {
                    setFaqs(data);
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
        <section ref={sectionRef} id="sss" className="section-container bg-white">
            <div className="text-center mb-14">
                <span className="text-[#C5A55A] font-bold tracking-widest text-sm uppercase mb-2 block">
                    Sıkça Sorulan Sorular
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 section-heading section-heading-gold">
                    Merak Edilenler
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Danışmanlık süreciyle ilgili en çok sorulan sorular ve cevapları
                </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className={`border border-gray-100 rounded-xl overflow-hidden transition-all duration-500 hover:border-[#C5A55A]/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            } ${openIndex === index ? 'shadow-md shadow-[#C5A55A]/5' : ''}`}
                        style={{ transitionDelay: `${index * 80}ms` }}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                        >
                            <span className="font-semibold text-[#0B1F3B]">{faq.question}</span>
                            <ChevronDown
                                className={`w-5 h-5 text-[#C5A55A] flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-50">
                                <p className="pt-4">{faq.answer}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
