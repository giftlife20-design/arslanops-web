import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0B1F3B] to-[#2B2F36] flex items-center justify-center px-4">
            <div className="text-center">
                {/* Brand Icon */}
                <div className="w-16 h-16 bg-[#C4803D] rounded-2xl flex items-center justify-center font-bold text-white text-3xl mx-auto mb-8">
                    A
                </div>

                {/* 404 */}
                <h1 className="text-8xl md:text-9xl font-bold text-[#C4803D]/20 mb-4">
                    404
                </h1>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Sayfa Bulunamadı
                </h2>

                <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                    Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                    Ana sayfaya dönerek devam edebilirsiniz.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-[#C4803D] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#A66A30] transition-all shadow-lg shadow-[#C4803D]/20 hover:-translate-y-0.5"
                >
                    Ana Sayfaya Dön
                </Link>
            </div>
        </div>
    );
}
