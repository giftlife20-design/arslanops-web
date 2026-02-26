'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    ArrowLeft, Loader2, LogIn, LogOut, Download, Search,
    Users, Users2, LayoutDashboard, FileText, BarChart3, Briefcase,
    MessageSquare, Package, HelpCircle, UserCircle, Globe,
    Save, Plus, Trash2, GripVertical, Star, ChevronRight,
    Quote, Settings, Eye, Upload, Image, Video, Palette,
    Paintbrush, X, ClipboardList, BookOpen, CreditCard, Server, ExternalLink, Copy, Check
} from 'lucide-react';
import Link from 'next/link';
import DurumOzetiForm from '../../components/DurumOzetiPDF';
import AksiyonPlani from '../../components/AksiyonPlani';
import KontrolListesi from '../../components/KontrolListesi';
import EgitimSeti from '../../components/EgitimSeti';
import AylikPerformans from '../../components/AylikPerformans';
import TeklifSablonu from '../../components/TeklifSablonu';
import ZiyaretNotu from '../../components/ZiyaretNotu';
import Kartvizit from '../../components/Kartvizit';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ─── Types ───
interface Lead {
    id: number;
    ad_soyad: string;
    isletme_turu: string;
    sehir: string;
    telefon: string;
    email?: string;
    mesaj: string;
    paket?: string;
    utm_source?: string;
    utm_campaign?: string;
    olusturma_tarihi: string;
}

type TabId = 'dashboard' | 'leads' | 'branding' | 'hero' | 'stats' | 'services' | 'testimonials' | 'logo_clients' | 'packages' | 'faq' | 'team' | 'footer' | 'egitim_seti' | 'durum_ozeti' | 'aksiyon_plani' | 'kontrol_listesi' | 'aylik_performans' | 'teklif_sablonu' | 'ziyaret_notu' | 'kartvizit' | 'yayin_bilgileri';

interface TabDef {
    id: TabId;
    label: string;
    icon: React.ElementType;
    group: string;
}

const TABS: TabDef[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Genel' },
    { id: 'leads', label: 'Başvurular', icon: Users, group: 'Genel' },
    { id: 'branding', label: 'Logo & Marka', icon: Paintbrush, group: 'Görsel Ayarlar' },
    { id: 'hero', label: 'Hero / Ana Ekran', icon: Globe, group: 'Görsel Ayarlar' },
    { id: 'stats', label: 'İstatistikler', icon: BarChart3, group: 'İçerik Yönetimi' },
    { id: 'services', label: 'Hizmetler', icon: Briefcase, group: 'İçerik Yönetimi' },
    { id: 'testimonials', label: 'Müşteri Yorumları', icon: Quote, group: 'İçerik Yönetimi' },
    { id: 'logo_clients', label: 'Referans Logolar', icon: Image, group: 'İçerik Yönetimi' },
    { id: 'packages', label: 'Paketler', icon: Package, group: 'İçerik Yönetimi' },
    { id: 'faq', label: 'SSS', icon: HelpCircle, group: 'İçerik Yönetimi' },
    { id: 'team', label: 'Ekip & Kurucu', icon: Users2, group: 'İçerik Yönetimi' },
    { id: 'footer', label: 'Footer & Sosyal', icon: Settings, group: 'İçerik Yönetimi' },
    { id: 'egitim_seti', label: 'Eğitim Seti', icon: BookOpen, group: 'Danışman Araçları' },
    { id: 'durum_ozeti', label: 'Durum Özeti (PDF)', icon: FileText, group: 'Belgeler' },
    { id: 'aksiyon_plani', label: 'Aksiyon Planı (Excel)', icon: ClipboardList, group: 'Belgeler' },
    { id: 'kontrol_listesi', label: 'Kontrol Listesi', icon: ClipboardList, group: 'Belgeler' },
    { id: 'aylik_performans', label: 'Aylık Performans', icon: BarChart3, group: 'Belgeler' },
    { id: 'teklif_sablonu', label: 'Teklif / Sözleşme', icon: FileText, group: 'Belgeler' },
    { id: 'ziyaret_notu', label: 'Ziyaret Notu', icon: ClipboardList, group: 'Belgeler' },
    { id: 'kartvizit', label: 'Kartvizit (PDF)', icon: CreditCard, group: 'Belgeler' },
    { id: 'yayin_bilgileri', label: 'Yayın Bilgileri', icon: Server, group: 'Sistem' },
];

// ─── Helpers ───
function formatDate(dateStr: string) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('tr-TR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

// ─── Toast Component ───
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl shadow-2xl text-white font-medium flex items-center gap-2 animate-slide-in ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            }`}>
            {type === 'success' ? '✓' : '✕'} {message}
        </div>
    );
}

// ─── Main Component ───
export default function AdminPage() {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [authHeader, setAuthHeader] = useState('');

    // UI State
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Data State
    const [leads, setLeads] = useState<Lead[]>([]);
    const [content, setContent] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // ─── Auth ───
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');

        const auth = 'Basic ' + btoa(`${username}:${password}`);

        try {
            const response = await fetch(`${API_URL}/api/leads`, { headers: { 'Authorization': auth } });
            if (response.ok) {
                setAuthHeader(auth);
                setIsAuthenticated(true);
                const data = await response.json();
                setLeads(data);
                // Load content
                const contentRes = await fetch(`${API_URL}/api/content`);
                if (contentRes.ok) setContent(await contentRes.json());
            } else {
                setAuthError('Kullanıcı adı veya şifre hatalı.');
            }
        } catch {
            setAuthError('Sunucuya bağlanılamadı. Backend çalışıyor mu?');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setAuthHeader('');
        setUsername('');
        setPassword('');
        setLeads([]);
        setContent({});
    };

    // ─── Data Operations ───
    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/leads`, { headers: { 'Authorization': authHeader } });
            if (res.ok) {
                const data = await res.json();
                // Backend uses 'created_at', frontend expects 'olusturma_tarihi'
                const mapped = data.map((l: any) => ({
                    ...l,
                    olusturma_tarihi: l.olusturma_tarihi || l.created_at || ''
                }));
                setLeads(mapped);
            }
        } catch { } finally { setLoading(false); }
    }, [authHeader]);

    const deleteLead = async (id: number) => {
        if (!confirm('Bu başvuruyu silmek istediğinize emin misiniz?')) return;
        try {
            const res = await fetch(`${API_URL}/api/leads/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': authHeader }
            });
            if (res.ok) {
                setLeads(prev => prev.filter(l => l.id !== id));
                showToast('Başvuru silindi', 'success');
            }
        } catch { showToast('Silme hatası', 'error'); }
    };

    const saveSection = async (section: string, data: any) => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/content/${section}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                setContent(prev => ({ ...prev, [section]: data }));
                showToast(`${section} başarıyla kaydedildi`, 'success');
            } else {
                showToast('Kaydetme hatası', 'error');
            }
        } catch { showToast('Sunucu hatası', 'error'); }
        finally { setSaving(false); }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const exportCSV = () => {
        if (leads.length === 0) return;
        const sep = ';'; // Turkish Excel uses semicolons
        const headers = ['ID', 'Ad Soyad', 'İşletme', 'Şehir', 'Telefon', 'E-posta', 'Mesaj', 'Paket', 'Tarih'];
        const rows = leads.map(l => [
            l.id,
            l.ad_soyad,
            l.isletme_turu,
            l.sehir,
            l.telefon,
            l.email || '',
            l.mesaj.replace(/[\n\r]+/g, ' '), // remove newlines in messages
            l.paket || '',
            formatDate(l.olusturma_tarihi)
        ]);
        const csvContent = [
            headers.join(sep),
            ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(sep))
        ].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `basvurular_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // ─── Login Screen ───
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0B1F3B] to-[#2B2F36] flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-[#C4803D] rounded-xl flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4">A</div>
                        <h1 className="text-2xl font-bold text-white">ArslanOps Admin</h1>
                        <p className="text-gray-400 text-sm mt-1">İçerik & Lead Yönetim Paneli</p>
                    </div>
                    <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Kullanıcı Adı</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-[#C4803D] focus:ring-2 focus:ring-[#C4803D]/20 outline-none" placeholder="admin" required autoFocus />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-[#C4803D] focus:ring-2 focus:ring-[#C4803D]/20 outline-none" placeholder="••••••••" required />
                        </div>
                        {authError && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">{authError}</div>}
                        <button type="submit" disabled={authLoading}
                            className="w-full bg-[#C4803D] text-white py-3 rounded-lg font-semibold hover:bg-[#A66A30] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                            Giriş Yap
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <Link href="/" className="text-gray-400 text-sm hover:text-[#C4803D] transition-colors">← Ana Sayfaya Dön</Link>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Admin Panel ───
    const filteredLeads = leads.filter(l =>
        l.ad_soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.sehir.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.telefon.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full bg-[#0B1F3B] text-white z-40 transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
                {/* Logo */}
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#C4803D] rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">A</div>
                    {!sidebarCollapsed && <div><div className="font-bold leading-tight">ArslanOps</div><div className="text-[10px] text-gray-400 uppercase tracking-wider">Admin Panel</div></div>}
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    {['Genel', 'Görsel Ayarlar', 'İçerik Yönetimi', 'Danışman Araçları', 'Belgeler'].map(group => (
                        <div key={group}>
                            {!sidebarCollapsed && <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{group}</div>}
                            {TABS.filter(t => t.group === group).map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${activeTab === tab.id
                                            ? 'bg-[#C4803D]/20 text-[#C4803D] border-r-2 border-[#C4803D]'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            } ${sidebarCollapsed ? 'justify-center' : ''}`}
                                        title={sidebarCollapsed ? tab.label : undefined}>
                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                        {!sidebarCollapsed && <span>{tab.label}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <Link href="/" target="_blank" className={`flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <Eye className="w-4 h-4" />{!sidebarCollapsed && 'Siteyi Görüntüle'}
                    </Link>
                    <button onClick={handleLogout} className={`flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <LogOut className="w-4 h-4" />{!sidebarCollapsed && 'Çıkış Yap'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ChevronRight className={`w-5 h-5 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
                        </button>
                        <h1 className="text-xl font-bold text-[#0B1F3B]">
                            {TABS.find(t => t.id === activeTab)?.label}
                        </h1>
                    </div>
                    {saving && <div className="flex items-center gap-2 text-[#C4803D] text-sm"><Loader2 className="w-4 h-4 animate-spin" />Kaydediliyor...</div>}
                </header>

                <div className="p-6">
                    {activeTab === 'dashboard' && <DashboardTab leads={leads} />}
                    {activeTab === 'leads' && (
                        <LeadsTab leads={filteredLeads} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                            onRefresh={fetchLeads} onExport={exportCSV} onDelete={deleteLead} loading={loading} />
                    )}
                    {activeTab === 'branding' && <BrandingEditor data={content.branding} onSave={(d: any) => saveSection('branding', d)} saving={saving} authHeader={authHeader} />}
                    {activeTab === 'hero' && <HeroEditor data={content.hero} onSave={(d: any) => saveSection('hero', d)} saving={saving} authHeader={authHeader} />}
                    {activeTab === 'stats' && <StatsEditor data={content.stats} onSave={(d: any) => saveSection('stats', d)} saving={saving} />}
                    {activeTab === 'services' && <ServicesEditor data={content.services} onSave={(d: any) => saveSection('services', d)} saving={saving} />}
                    {activeTab === 'testimonials' && <TestimonialsEditor data={content.testimonials} onSave={(d: any) => saveSection('testimonials', d)} saving={saving} authHeader={authHeader} sectionVisible={content.testimonials_visible !== false} onToggleVisibility={(v: boolean) => saveSection('testimonials_visible', v)} />}
                    {activeTab === 'logo_clients' && <LogoClientsEditor data={content.logo_clients} onSave={(d: any) => saveSection('logo_clients', d)} saving={saving} authHeader={authHeader} sectionVisible={content.logo_clients_visible !== false} onToggleVisibility={(v: boolean) => saveSection('logo_clients_visible', v)} />}
                    {activeTab === 'packages' && <PackagesEditor data={content.packages} onSave={(d: any) => saveSection('packages', d)} saving={saving} />}
                    {activeTab === 'faq' && <FAQEditor data={content.faq} onSave={(d: any) => saveSection('faq', d)} saving={saving} />}
                    {activeTab === 'team' && <TeamEditor data={content.team} onSave={(d: any) => saveSection('team', d)} saving={saving} authHeader={authHeader} />}
                    {activeTab === 'footer' && <FooterEditor data={content.footer} onSave={(d: any) => saveSection('footer', d)} saving={saving} />}
                    {activeTab === 'durum_ozeti' && <DurumOzetiForm />}
                    {activeTab === 'aksiyon_plani' && <AksiyonPlani />}
                    {activeTab === 'kontrol_listesi' && <KontrolListesi />}
                    {activeTab === 'aylik_performans' && <AylikPerformans />}
                    {activeTab === 'teklif_sablonu' && <TeklifSablonu />}
                    {activeTab === 'ziyaret_notu' && <ZiyaretNotu />}
                    {activeTab === 'egitim_seti' && <EgitimSeti />}
                    {activeTab === 'kartvizit' && <Kartvizit />}
                    {activeTab === 'yayin_bilgileri' && <YayinBilgileri />}
                </div>
            </main>
        </div>
    );
}

// ═══════════════════════════════════════════
// TAB COMPONENTS
// ═══════════════════════════════════════════

// ─── Dashboard ───
function DashboardTab({ leads }: { leads: Lead[] }) {
    const now = new Date();
    const thisMonth = leads.filter(l => { const d = new Date(l.olusturma_tarihi); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
    const thisWeek = leads.filter(l => { const d = new Date(l.olusturma_tarihi); return d >= new Date(now.getTime() - 7 * 86400000); }).length;
    const cities = new Set(leads.map(l => l.sehir)).size;

    const cards = [
        { label: 'Toplam Başvuru', value: leads.length, color: 'bg-blue-100 text-blue-600' },
        { label: 'Bu Ay', value: thisMonth, color: 'bg-green-100 text-green-600' },
        { label: 'Bu Hafta', value: thisWeek, color: 'bg-amber-100 text-amber-600' },
        { label: 'Farklı Şehir', value: cities, color: 'bg-purple-100 text-purple-600' },
    ];

    const recentLeads = leads.slice(0, 5);

    return (
        <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map((c, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                        <div className={`w-10 h-10 ${c.color} rounded-lg flex items-center justify-center mb-3`}>
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="text-3xl font-bold text-[#0B1F3B]">{c.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{c.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-[#0B1F3B] mb-4">Son Başvurular</h3>
                {recentLeads.length === 0 ? (
                    <p className="text-gray-400 text-sm">Henüz başvuru yok.</p>
                ) : (
                    <div className="space-y-3">
                        {recentLeads.map(l => (
                            <div key={l.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                <div>
                                    <div className="font-medium text-[#0B1F3B]">{l.ad_soyad}</div>
                                    <div className="text-xs text-gray-500">{l.isletme_turu} · {l.sehir}</div>
                                </div>
                                <div className="text-xs text-gray-400">{formatDate(l.olusturma_tarihi)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Leads Tab ───
function LeadsTab({ leads, searchTerm, setSearchTerm, onRefresh, onExport, onDelete, loading }: any) {
    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C4803D] transition-all" placeholder="İsim, şehir, telefon ara..." />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onRefresh} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-all">Yenile</button>
                    <button onClick={onExport} className="flex items-center gap-2 bg-[#0B1F3B] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#142d52] transition-all">
                        <Download className="w-4 h-4" />CSV İndir ({leads.length})
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#C4803D]" /></div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {['#', 'Ad Soyad', 'İşletme', 'Şehir', 'Telefon', 'E-posta', 'Mesaj', 'Paket', 'Tarih', ''].map(h => (
                                        <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {leads.length === 0 ? (
                                    <tr><td colSpan={10} className="text-center py-12 text-gray-400">{searchTerm ? 'Sonuç yok.' : 'Henüz başvuru yok.'}</td></tr>
                                ) : leads.map((l: Lead) => (
                                    <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{l.id}</td>
                                        <td className="px-4 py-3 font-medium text-[#0B1F3B] whitespace-nowrap">{l.ad_soyad}</td>
                                        <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">{l.isletme_turu}</span></td>
                                        <td className="px-4 py-3 text-gray-600">{l.sehir}</td>
                                        <td className="px-4 py-3"><a href={`tel:${l.telefon}`} className="text-[#C4803D] hover:underline">{l.telefon}</a></td>
                                        <td className="px-4 py-3 text-gray-600">{l.email || '-'}</td>
                                        <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={l.mesaj}>{l.mesaj}</td>
                                        <td className="px-4 py-3">{l.paket ? <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-xs">{l.paket}</span> : '-'}</td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDate(l.olusturma_tarihi)}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => onDelete(l.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Sil">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════
// CONTENT EDITORS
// ═══════════════════════════════════════════

// Shared UI Components
function EditorCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-[#0B1F3B] mb-4 text-lg">{title}</h3>
            {children}
        </div>
    );
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
    return (
        <button onClick={onClick} disabled={saving}
            className="flex items-center gap-2 bg-[#C4803D] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#A66A30] transition-all disabled:opacity-50 shadow-lg shadow-[#C4803D]/20">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Kaydet
        </button>
    );
}

function InputField({ label, value, onChange, placeholder, type = 'text', multiline = false }: any) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            {multiline ? (
                <textarea value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder} rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C4803D] focus:ring-2 focus:ring-[#C4803D]/10 transition-all resize-none" />
            ) : (
                <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C4803D] focus:ring-2 focus:ring-[#C4803D]/10 transition-all" />
            )}
        </div>
    );
}

// ─── File Uploader Component ───
function FileUploader({ label, accept, currentUrl, onUpload, onRemove, category, authHeader, preview = 'image' }: {
    label: string; accept: string; currentUrl: string; onUpload: (url: string) => void;
    onRemove: () => void; category: string; authHeader: string; preview?: 'image' | 'video';
}) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = async (file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        try {
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: { 'Authorization': authHeader },
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                onUpload(data.url);
            }
        } catch { } finally { setUploading(false); }
    };

    return (
        <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            {currentUrl ? (
                <div className="relative group">
                    {preview === 'image' ? (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                            <img src={`${API_URL}${currentUrl}`} alt="" className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-black">
                            <video src={`${API_URL}${currentUrl}`} className="w-full h-48 object-contain" controls muted />
                        </div>
                    )}
                    <div className="flex gap-2 mt-2">
                        <label className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                            <Upload className="w-3 h-3" />Değiştir
                            <input type="file" accept={accept} className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                        </label>
                        <button onClick={onRemove} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                            <X className="w-3 h-3" />Kaldır
                        </button>
                    </div>
                </div>
            ) : (
                <label
                    onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={e => { e.preventDefault(); setDragActive(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${dragActive ? 'border-[#C4803D] bg-[#C4803D]/5' : 'border-gray-300 hover:border-[#C4803D] hover:bg-gray-50'
                        }`}>
                    {uploading ? (
                        <Loader2 className="w-8 h-8 text-[#C4803D] animate-spin" />
                    ) : (
                        <>
                            {preview === 'image' ? <Image className="w-8 h-8 text-gray-400 mb-2" /> : <Video className="w-8 h-8 text-gray-400 mb-2" />}
                            <span className="text-sm text-gray-500">Sürükle & bırak veya tıkla</span>
                            <span className="text-xs text-gray-400 mt-1">Max 15MB</span>
                        </>
                    )}
                    <input type="file" accept={accept} className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </label>
            )}
        </div>
    );
}

// ─── Color Picker Field ───
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
                        className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                </div>
                <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#000000"
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C4803D] transition-all font-mono" />
            </div>
        </div>
    );
}

// ─── Branding Editor ───
function BrandingEditor({ data, onSave, saving, authHeader }: { data: any; onSave: (d: any) => void; saving: boolean; authHeader: string }) {
    const [local, setLocal] = useState(data || { logo_url: '', logo_text: 'ArslanOps', favicon_url: '' });
    useEffect(() => { if (data) setLocal(data); }, [data]);

    return (
        <div>
            <EditorCard title="Logo Yönetimi">
                <p className="text-sm text-gray-500 mb-4">Sitenizde görüntülenecek logoyu buradan değiştirebilirsiniz. Logo yüklemezseniz metin logo kullanılır.</p>
                <FileUploader
                    label="Site Logosu (PNG, SVG, WebP)"
                    accept="image/png,image/svg+xml,image/webp,image/jpeg"
                    currentUrl={local.logo_url}
                    onUpload={(url) => setLocal({ ...local, logo_url: url })}
                    onRemove={() => setLocal({ ...local, logo_url: '' })}
                    category="logo"
                    authHeader={authHeader}
                />
                <InputField label="Metin Logo (Logo yüklenmezse gösterilir)" value={local.logo_text} onChange={(v: string) => setLocal({ ...local, logo_text: v })} />
            </EditorCard>

            <EditorCard title="Favicon">
                <FileUploader
                    label="Favicon (32x32 veya 64x64 PNG önerilir)"
                    accept="image/png,image/x-icon,image/svg+xml"
                    currentUrl={local.favicon_url}
                    onUpload={(url) => setLocal({ ...local, favicon_url: url })}
                    onRemove={() => setLocal({ ...local, favicon_url: '' })}
                    category="logo"
                    authHeader={authHeader}
                />
            </EditorCard>

            <SaveButton onClick={() => onSave(local)} saving={saving} />
        </div>
    );
}

// ─── Hero Editor ───
function HeroEditor({ data, onSave, saving, authHeader }: { data: any; onSave: (d: any) => void; saving: boolean; authHeader: string }) {
    const [local, setLocal] = useState(data || {
        badge: '', title_prefix: '', rotating_words: [], description: '', cta_primary: '', cta_secondary: '',
        bg_type: 'gradient', bg_color: '#0B1F3B', bg_gradient_from: '#0B1F3B', bg_gradient_to: '#1a3a5c',
        bg_image_url: '', bg_video_url: '', bg_overlay_opacity: 0.6, bg_overlay_color: '#000000'
    });

    useEffect(() => { if (data) setLocal(data); }, [data]);

    const updateWords = (index: number, value: string) => {
        const words = [...local.rotating_words];
        words[index] = value;
        setLocal({ ...local, rotating_words: words });
    };

    // Build preview background style
    const previewStyle: React.CSSProperties = {};
    if (local.bg_type === 'color') {
        previewStyle.background = local.bg_color || '#0B1F3B';
    } else if (local.bg_type === 'gradient') {
        previewStyle.background = `linear-gradient(135deg, ${local.bg_gradient_from || '#0B1F3B'}, ${local.bg_gradient_to || '#1a3a5c'})`;
    } else {
        previewStyle.background = '#0B1F3B';
    }

    return (
        <div>
            {/* Hero Background Settings */}
            <EditorCard title="Arka Plan Ayarları">
                <p className="text-sm text-gray-500 mb-4">Hero bölümünün arka plan türünü, renklerini ve görsellerini buradan yönetebilirsiniz.</p>

                {/* Background Type Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Arka Plan Türü</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: 'color', label: 'Düz Renk', icon: Palette },
                            { id: 'gradient', label: 'Gradient', icon: Paintbrush },
                            { id: 'image', label: 'Görsel', icon: Image },
                            { id: 'video', label: 'Video', icon: Video },
                        ].map(opt => {
                            const Icon = opt.icon;
                            return (
                                <button key={opt.id} onClick={() => setLocal({ ...local, bg_type: opt.id })}
                                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm ${local.bg_type === opt.id
                                        ? 'border-[#C4803D] bg-[#C4803D]/5 text-[#C4803D]'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}>
                                    <Icon className="w-5 h-5" />
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Color settings */}
                {local.bg_type === 'color' && (
                    <ColorField label="Arka Plan Rengi" value={local.bg_color} onChange={(v) => setLocal({ ...local, bg_color: v })} />
                )}

                {/* Gradient settings */}
                {local.bg_type === 'gradient' && (
                    <div className="grid grid-cols-2 gap-4">
                        <ColorField label="Başlangıç Rengi" value={local.bg_gradient_from} onChange={(v) => setLocal({ ...local, bg_gradient_from: v })} />
                        <ColorField label="Bitiş Rengi" value={local.bg_gradient_to} onChange={(v) => setLocal({ ...local, bg_gradient_to: v })} />
                    </div>
                )}

                {/* Image upload */}
                {local.bg_type === 'image' && (
                    <>
                        <FileUploader
                            label="Arka Plan Görseli"
                            accept="image/jpeg,image/png,image/webp"
                            currentUrl={local.bg_image_url}
                            onUpload={(url) => setLocal({ ...local, bg_image_url: url })}
                            onRemove={() => setLocal({ ...local, bg_image_url: '' })}
                            category="hero"
                            authHeader={authHeader}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <ColorField label="Overlay Rengi" value={local.bg_overlay_color} onChange={(v) => setLocal({ ...local, bg_overlay_color: v })} />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Overlay Opaklığı: {Math.round((local.bg_overlay_opacity || 0) * 100)}%</label>
                                <input type="range" min="0" max="1" step="0.05" value={local.bg_overlay_opacity || 0.6}
                                    onChange={e => setLocal({ ...local, bg_overlay_opacity: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C4803D] mt-3" />
                            </div>
                        </div>
                    </>
                )}

                {/* Video upload */}
                {local.bg_type === 'video' && (
                    <>
                        <FileUploader
                            label="Arka Plan Videosu (MP4, WebM)"
                            accept="video/mp4,video/webm"
                            currentUrl={local.bg_video_url}
                            onUpload={(url) => setLocal({ ...local, bg_video_url: url })}
                            onRemove={() => setLocal({ ...local, bg_video_url: '' })}
                            category="hero"
                            authHeader={authHeader}
                            preview="video"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <ColorField label="Overlay Rengi" value={local.bg_overlay_color} onChange={(v) => setLocal({ ...local, bg_overlay_color: v })} />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Overlay Opaklığı: {Math.round((local.bg_overlay_opacity || 0) * 100)}%</label>
                                <input type="range" min="0" max="1" step="0.05" value={local.bg_overlay_opacity || 0.6}
                                    onChange={e => setLocal({ ...local, bg_overlay_opacity: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C4803D] mt-3" />
                            </div>
                        </div>
                    </>
                )}

                {/* Live Preview */}
                <div className="mt-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Canlı Önizleme</label>
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200" style={previewStyle}>
                        {local.bg_type === 'image' && local.bg_image_url && (
                            <img src={`${API_URL}${local.bg_image_url}`} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        )}
                        {local.bg_type === 'video' && local.bg_video_url && (
                            <video src={`${API_URL}${local.bg_video_url}`} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
                        )}
                        {(local.bg_type === 'image' || local.bg_type === 'video') && (
                            <div className="absolute inset-0" style={{ backgroundColor: local.bg_overlay_color || '#000', opacity: local.bg_overlay_opacity || 0.6 }} />
                        )}
                        <div className="relative z-10 flex items-center justify-center h-full">
                            <div className="text-center">
                                <span className="text-white/60 text-xs px-2 py-1 rounded bg-white/10">{local.badge || 'Badge'}</span>
                                <h3 className="text-white font-bold text-xl mt-2">{local.title_prefix || 'Başlık'}</h3>
                                <p className="text-white/70 text-sm mt-1">{local.description?.slice(0, 60) || 'Açıklama...'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </EditorCard>

            <EditorCard title="Hero Bölümü İçeriği">
                <InputField label="Üst Badge" value={local.badge} onChange={(v: string) => setLocal({ ...local, badge: v })} />
                <InputField label="Başlık Prefix" value={local.title_prefix} onChange={(v: string) => setLocal({ ...local, title_prefix: v })} />
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Dönen Kelimeler</label>
                    {(local.rotating_words || []).map((w: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                            <input value={w} onChange={(e) => updateWords(i, e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C4803D] transition-all" />
                            <button onClick={() => setLocal({ ...local, rotating_words: local.rotating_words.filter((_: any, j: number) => j !== i) })}
                                className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                    <button onClick={() => setLocal({ ...local, rotating_words: [...(local.rotating_words || []), ''] })}
                        className="flex items-center gap-1 text-sm text-[#C4803D] hover:underline mt-1"><Plus className="w-3 h-3" />Kelime Ekle</button>
                </div>
                <InputField label="Açıklama" value={local.description} onChange={(v: string) => setLocal({ ...local, description: v })} multiline />
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="Ana Buton" value={local.cta_primary} onChange={(v: string) => setLocal({ ...local, cta_primary: v })} />
                    <InputField label="İkincil Buton" value={local.cta_secondary} onChange={(v: string) => setLocal({ ...local, cta_secondary: v })} />
                </div>
            </EditorCard>
            <SaveButton onClick={() => onSave(local)} saving={saving} />
        </div>
    );
}

// ─── Stats Editor ───
function StatsEditor({ data, onSave, saving }: { data: any; onSave: (d: any) => void; saving: boolean }) {
    const [local, setLocal] = useState<any[]>(data || []);
    useEffect(() => { if (data) setLocal(data); }, [data]);

    const update = (i: number, key: string, value: any) => {
        const items = [...local];
        items[i] = { ...items[i], [key]: value };
        setLocal(items);
    };

    return (
        <div>
            {local.map((item: any, i: number) => (
                <EditorCard key={i} title={`İstatistik ${i + 1}`}>
                    <div className="grid grid-cols-3 gap-4">
                        <InputField label="Değer" type="number" value={item.value} onChange={(v: string) => update(i, 'value', parseInt(v) || 0)} />
                        <InputField label="Prefix" value={item.prefix || ''} onChange={(v: string) => update(i, 'prefix', v)} placeholder="%, vb." />
                        <InputField label="Suffix" value={item.suffix || ''} onChange={(v: string) => update(i, 'suffix', v)} placeholder="+, vb." />
                    </div>
                    <InputField label="Başlık" value={item.label} onChange={(v: string) => update(i, 'label', v)} />
                    <InputField label="Açıklama" value={item.description} onChange={(v: string) => update(i, 'description', v)} multiline />
                    <button onClick={() => setLocal(local.filter((_: any, j: number) => j !== i))}
                        className="text-red-400 hover:text-red-600 text-sm flex items-center gap-1"><Trash2 className="w-3 h-3" />Sil</button>
                </EditorCard>
            ))}
            <div className="flex items-center gap-4">
                <button onClick={() => setLocal([...local, { value: 0, suffix: '+', label: '', description: '' }])}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#C4803D] hover:text-[#C4803D] transition-all">
                    <Plus className="w-4 h-4" />Yeni İstatistik
                </button>
                <SaveButton onClick={() => onSave(local)} saving={saving} />
            </div>
        </div>
    );
}

// ─── Services Editor ───
function ServicesEditor({ data, onSave, saving }: { data: any; onSave: (d: any) => void; saving: boolean }) {
    const [local, setLocal] = useState<any[]>(data || []);
    useEffect(() => { if (data) setLocal(data); }, [data]);

    const update = (i: number, key: string, value: any) => {
        const items = [...local];
        items[i] = { ...items[i], [key]: value };
        setLocal(items);
    };

    const updateHighlight = (i: number, hi: number, value: string) => {
        const items = [...local];
        const hl = [...items[i].highlights];
        hl[hi] = value;
        items[i] = { ...items[i], highlights: hl };
        setLocal(items);
    };

    return (
        <div>
            {local.map((item: any, i: number) => (
                <EditorCard key={i} title={`Hizmet ${i + 1}: ${item.title || 'Yeni'}`}>
                    <InputField label="Başlık" value={item.title} onChange={(v: string) => update(i, 'title', v)} />
                    <InputField label="Açıklama" value={item.description} onChange={(v: string) => update(i, 'description', v)} multiline />
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Öne Çıkanlar (Etiketler)</label>
                        {(item.highlights || []).map((h: string, hi: number) => (
                            <div key={hi} className="flex items-center gap-2 mb-2">
                                <input value={h} onChange={e => updateHighlight(i, hi, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C4803D] transition-all" />
                                <button onClick={() => { const hl = item.highlights.filter((_: any, j: number) => j !== hi); update(i, 'highlights', hl); }}
                                    className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3 h-3" /></button>
                            </div>
                        ))}
                        <button onClick={() => update(i, 'highlights', [...(item.highlights || []), ''])}
                            className="text-sm text-[#C4803D] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Etiket Ekle</button>
                    </div>
                    <button onClick={() => setLocal(local.filter((_: any, j: number) => j !== i))}
                        className="text-red-400 hover:text-red-600 text-sm flex items-center gap-1"><Trash2 className="w-3 h-3" />Hizmeti Sil</button>
                </EditorCard>
            ))}
            <div className="flex items-center gap-4">
                <button onClick={() => setLocal([...local, { title: '', description: '', highlights: [] }])}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#C4803D] hover:text-[#C4803D] transition-all">
                    <Plus className="w-4 h-4" />Yeni Hizmet
                </button>
                <SaveButton onClick={() => onSave(local)} saving={saving} />
            </div>
        </div>
    );
}

// ─── Testimonials Editor ───
function TestimonialsEditor({ data, onSave, saving, authHeader, sectionVisible, onToggleVisibility }: { data: any; onSave: (d: any) => void; saving: boolean; authHeader: string; sectionVisible: boolean; onToggleVisibility: (v: boolean) => void }) {
    const [local, setLocal] = useState<any[]>(data || []);
    useEffect(() => { if (data) setLocal(data); }, [data]);

    const update = (i: number, key: string, value: any) => {
        const items = [...local];
        items[i] = { ...items[i], [key]: value };
        setLocal(items);
    };

    return (
        <div>
            {/* Visibility Toggle */}
            <EditorCard title="Bölüm Görünürlüğü">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Müşteri Yorumları Bölümü</p>
                        <p className="text-xs text-gray-500 mt-0.5">{sectionVisible ? 'Bu bölüm sitede görünüyor' : 'Bu bölüm sitede gizli'}</p>
                    </div>
                    <button
                        onClick={() => onToggleVisibility(!sectionVisible)}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${sectionVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${sectionVisible ? 'translate-x-8' : 'translate-x-1'}`} />
                    </button>
                </div>
            </EditorCard>
            {local.map((item: any, i: number) => (
                <EditorCard key={i} title={`Yorum ${i + 1}: ${item.name || 'Yeni'}`}>
                    <div className="flex gap-6">
                        {/* Avatar Upload - Compact Circular */}
                        <div className="flex-shrink-0">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Profil Fotoğrafı</label>
                            {item.avatar_url ? (
                                <div className="relative group">
                                    <img
                                        src={`${API_URL}${item.avatar_url}`}
                                        alt={item.name || 'Avatar'}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-[#C4803D]/30 shadow-md"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => update(i, 'avatar_url', '')}
                                            className="bg-red-500/80 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-[#C4803D] hover:bg-[#C4803D]/5 transition-all">
                                    <Upload className="w-5 h-5 text-gray-400" />
                                    <span className="text-[9px] text-gray-400 mt-0.5">Yükle</span>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            formData.append('category', 'testimonials');
                                            try {
                                                const res = await fetch(`${API_URL}/api/upload`, {
                                                    method: 'POST',
                                                    headers: { 'Authorization': authHeader },
                                                    body: formData
                                                });
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    update(i, 'avatar_url', data.url);
                                                }
                                            } catch { }
                                        }}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Text Fields */}
                        <div className="flex-1">
                            <div className="grid grid-cols-3 gap-4">
                                <InputField label="İsim" value={item.name} onChange={(v: string) => update(i, 'name', v)} />
                                <InputField label="Rol / Unvan" value={item.role} onChange={(v: string) => update(i, 'role', v)} />
                                <InputField label="Şehir" value={item.location} onChange={(v: string) => update(i, 'location', v)} />
                            </div>
                        </div>
                    </div>

                    <InputField label="Yorum İçeriği" value={item.content} onChange={(v: string) => update(i, 'content', v)} multiline />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Öne Çıkan Sonuç" value={item.highlight} onChange={(v: string) => update(i, 'highlight', v)} placeholder="Ör: %30 maliyet düşüşü" />
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Yıldız (1-5)</label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} onClick={() => update(i, 'rating', star)}
                                        className={`p-1 transition-colors ${star <= (item.rating || 0) ? 'text-[#C4803D]' : 'text-gray-300'}`}>
                                        <Star className="w-6 h-6 fill-current" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setLocal(local.filter((_: any, j: number) => j !== i))}
                        className="text-red-400 hover:text-red-600 text-sm flex items-center gap-1"><Trash2 className="w-3 h-3" />Yorumu Sil</button>
                </EditorCard>
            ))}
            <div className="flex items-center gap-4">
                <button onClick={() => setLocal([...local, { name: '', role: '', location: '', content: '', rating: 5, highlight: '', avatar_url: '' }])}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#C4803D] hover:text-[#C4803D] transition-all">
                    <Plus className="w-4 h-4" />Yeni Yorum
                </button>
                <SaveButton onClick={() => onSave(local)} saving={saving} />
            </div>
        </div>
    );
}

// ─── Packages Editor ───
function PackagesEditor({ data, onSave, saving }: { data: any; onSave: (d: any) => void; saving: boolean }) {
    const [local, setLocal] = useState<any[]>(data || []);
    useEffect(() => { if (data) setLocal(data); }, [data]);

    const update = (i: number, key: string, value: any) => {
        const items = [...local];
        items[i] = { ...items[i], [key]: value };
        setLocal(items);
    };

    const updateFeature = (i: number, fi: number, value: string) => {
        const items = [...local];
        const features = [...items[i].features];
        features[fi] = value;
        items[i] = { ...items[i], features };
        setLocal(items);
    };

    return (
        <div>
            {local.map((item: any, i: number) => (
                <EditorCard key={i} title={`Paket: ${item.name || 'Yeni'}`}>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Paket Adı" value={item.name} onChange={(v: string) => update(i, 'name', v)} />
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Önerilen Paket?</label>
                            <button onClick={() => {
                                const items = local.map((p: any, j: number) => ({ ...p, recommended: j === i ? !p.recommended : false }));
                                setLocal(items);
                            }} className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${item.recommended ? 'bg-[#C4803D] text-white border-[#C4803D]' : 'border-gray-200 text-gray-500 hover:border-[#C4803D]'
                                }`}>
                                {item.recommended ? '★ Önerilen' : 'Önerilen Yap'}
                            </button>
                        </div>
                    </div>
                    <InputField label="Açıklama" value={item.description} onChange={(v: string) => update(i, 'description', v)} />
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Özellikler</label>
                        {(item.features || []).map((f: string, fi: number) => (
                            <div key={fi} className="flex items-center gap-2 mb-2">
                                <span className="text-[#C4803D]">✓</span>
                                <input value={f} onChange={e => updateFeature(i, fi, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C4803D] transition-all" />
                                <button onClick={() => { const fl = item.features.filter((_: any, j: number) => j !== fi); update(i, 'features', fl); }}
                                    className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3 h-3" /></button>
                            </div>
                        ))}
                        <button onClick={() => update(i, 'features', [...(item.features || []), ''])}
                            className="text-sm text-[#C4803D] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Özellik Ekle</button>
                    </div>
                    <button onClick={() => setLocal(local.filter((_: any, j: number) => j !== i))}
                        className="text-red-400 hover:text-red-600 text-sm flex items-center gap-1"><Trash2 className="w-3 h-3" />Paketi Sil</button>
                </EditorCard>
            ))}
            <div className="flex items-center gap-4">
                <button onClick={() => setLocal([...local, { name: '', description: '', features: [], recommended: false }])}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#C4803D] hover:text-[#C4803D] transition-all">
                    <Plus className="w-4 h-4" />Yeni Paket
                </button>
                <SaveButton onClick={() => onSave(local)} saving={saving} />
            </div>
        </div>
    );
}

// ─── FAQ Editor ───
function FAQEditor({ data, onSave, saving }: { data: any; onSave: (d: any) => void; saving: boolean }) {
    const [local, setLocal] = useState<any[]>(data || []);
    useEffect(() => { if (data) setLocal(data); }, [data]);

    const update = (i: number, key: string, value: string) => {
        const items = [...local];
        items[i] = { ...items[i], [key]: value };
        setLocal(items);
    };

    return (
        <div>
            {local.map((item: any, i: number) => (
                <EditorCard key={i} title={`Soru ${i + 1}`}>
                    <InputField label="Soru" value={item.question} onChange={(v: string) => update(i, 'question', v)} />
                    <InputField label="Cevap" value={item.answer} onChange={(v: string) => update(i, 'answer', v)} multiline />
                    <button onClick={() => setLocal(local.filter((_: any, j: number) => j !== i))}
                        className="text-red-400 hover:text-red-600 text-sm flex items-center gap-1"><Trash2 className="w-3 h-3" />Soruyu Sil</button>
                </EditorCard>
            ))}
            <div className="flex items-center gap-4">
                <button onClick={() => setLocal([...local, { question: '', answer: '' }])}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#C4803D] hover:text-[#C4803D] transition-all">
                    <Plus className="w-4 h-4" />Yeni Soru
                </button>
                <SaveButton onClick={() => onSave(local)} saving={saving} />
            </div>
        </div>
    );
}

// ─── Team & Founder Editor ───
function TeamEditor({ data, onSave, saving, authHeader }: { data: any; onSave: (d: any) => void; saving: boolean; authHeader: string }) {
    const [local, setLocal] = useState(data || {
        founder: { name: 'İlhan Arslan', title: 'Kurucu & Baş Danışman', photo_url: '', bio: '', bio2: '' },
        members: []
    });
    useEffect(() => { if (data) setLocal(data); }, [data]);

    const updateFounder = (key: string, value: string) => {
        setLocal({ ...local, founder: { ...local.founder, [key]: value } });
    };

    const updateMember = (i: number, key: string, value: string) => {
        const members = [...local.members];
        members[i] = { ...members[i], [key]: value };
        setLocal({ ...local, members });
    };

    const addMember = () => {
        setLocal({ ...local, members: [...local.members, { name: '', title: '', photo_url: '' }] });
    };

    const removeMember = (index: number) => {
        setLocal({ ...local, members: local.members.filter((_: any, j: number) => j !== index) });
    };

    return (
        <div>
            {/* Founder Section */}
            <EditorCard title="Kurucu Bilgileri">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Founder Photo */}
                    <div className="md:w-1/3">
                        <FileUploader
                            label="Kurucu Fotoğrafı"
                            accept="image/*"
                            currentUrl={local.founder?.photo_url || ''}
                            onUpload={(url) => updateFounder('photo_url', url)}
                            onRemove={() => updateFounder('photo_url', '')}
                            category="team"
                            authHeader={authHeader}
                            preview="image"
                        />
                    </div>

                    {/* Founder Info */}
                    <div className="md:w-2/3 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="İsim Soyisim" value={local.founder?.name || ''} onChange={(v: string) => updateFounder('name', v)} placeholder="İlhan Arslan" />
                            <InputField label="Unvan" value={local.founder?.title || ''} onChange={(v: string) => updateFounder('title', v)} placeholder="Kurucu & Baş Danışman" />
                        </div>
                        <InputField label="Biyografi (1. paragraf)" value={local.founder?.bio || ''} onChange={(v: string) => updateFounder('bio', v)} multiline placeholder="Deneyim ve uzmanlık alanınızı anlatan kısa paragraf..." />
                        <InputField label="Biyografi (2. paragraf)" value={local.founder?.bio2 || ''} onChange={(v: string) => updateFounder('bio2', v)} multiline placeholder="Çalışma tarzınızı ve hedefinizi anlatan ikinci paragraf..." />
                    </div>
                </div>
            </EditorCard>

            {/* Team Members */}
            <EditorCard title="Ekip Üyeleri">
                <p className="text-sm text-gray-500 mb-4">Ekibinizdeki kişileri burada ekleyebilir, fotoğraflarını yükleyebilirsiniz. Ekip üyesi yoksa bu bölüm sitede görünmez.</p>

                {(local.members || []).map((member: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        {/* Member Photo */}
                        <div className="w-32 flex-shrink-0">
                            <FileUploader
                                label="Fotoğraf"
                                accept="image/*"
                                currentUrl={member.photo_url || ''}
                                onUpload={(url) => updateMember(i, 'photo_url', url)}
                                onRemove={() => updateMember(i, 'photo_url', '')}
                                category="team"
                                authHeader={authHeader}
                                preview="image"
                            />
                        </div>
                        {/* Member Info */}
                        <div className="flex-1 space-y-2">
                            <InputField label="İsim Soyisim" value={member.name || ''} onChange={(v: string) => updateMember(i, 'name', v)} placeholder="Ad Soyad" />
                            <InputField label="Unvan / Görev" value={member.title || ''} onChange={(v: string) => updateMember(i, 'title', v)} placeholder="Operasyon Uzmanı" />
                        </div>
                        {/* Remove */}
                        <button onClick={() => removeMember(i)}
                            className="text-red-400 hover:text-red-600 p-2 mt-6 flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                <button onClick={addMember}
                    className="text-sm text-[#C4803D] hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" />Ekip Üyesi Ekle
                </button>
            </EditorCard>

            <SaveButton onClick={() => onSave(local)} saving={saving} />
        </div>
    );
}

// ─── Logo Clients Editor ───
function LogoClientsEditor({ data, onSave, saving, authHeader, sectionVisible, onToggleVisibility }: { data: any; onSave: (d: any) => void; saving: boolean; authHeader: string; sectionVisible: boolean; onToggleVisibility: (v: boolean) => void }) {
    const [local, setLocal] = useState<any[]>(data || []);
    useEffect(() => { if (data) setLocal(data); }, [data]);

    const update = (i: number, key: string, value: any) => {
        const items = [...local];
        items[i] = { ...items[i], [key]: value };
        setLocal(items);
    };

    const addLogo = () => {
        setLocal([...local, { name: '', logo_url: '', description: '', enabled: true }]);
    };

    const removeLogo = (index: number) => {
        setLocal(local.filter((_: any, i: number) => i !== index));
    };

    const enabledCount = local.filter((l: any) => l.enabled !== false).length;

    return (
        <div>
            {/* Visibility Toggle */}
            <EditorCard title="Bölüm Görünürlüğü">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Referans Logolar Bölümü</p>
                        <p className="text-xs text-gray-500 mt-0.5">{sectionVisible ? 'Bu bölüm sitede görünüyor' : 'Bu bölüm sitede gizli'}</p>
                    </div>
                    <button
                        onClick={() => onToggleVisibility(!sectionVisible)}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${sectionVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${sectionVisible ? 'translate-x-8' : 'translate-x-1'}`} />
                    </button>
                </div>
            </EditorCard>
            <EditorCard title="Referans Logo Bandı">
                <p className="text-sm text-gray-500 mb-2">
                    Anasayfada kayan logo bandında gösterilecek müşteri/referans logolarını yönetin.
                    Kapalı olanlar sitede görünmez ve boşluk bırakmaz.
                </p>
                <p className="text-xs text-[#C4803D] font-medium mb-6">
                    {enabledCount} / {local.length} referans aktif
                </p>

                <div className="space-y-4">
                    {local.map((item: any, i: number) => (
                        <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${item.enabled !== false ? 'bg-gray-50 border-gray-100' : 'bg-gray-100/50 border-gray-200 opacity-60'}`}>
                            {/* Enabled Toggle */}
                            <div className="flex-shrink-0 pt-1">
                                <button
                                    onClick={() => update(i, 'enabled', item.enabled === false ? true : false)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.enabled !== false ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                    title={item.enabled !== false ? 'Aktif – sitede görünüyor' : 'Kapalı – sitede gizli'}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${item.enabled !== false ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {/* Logo preview or upload */}
                            <div className="flex-shrink-0 w-32">
                                {item.logo_url ? (
                                    <div className="relative group">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center mx-auto">
                                            <img src={`${API_URL}${item.logo_url}`} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex gap-1 mt-2 justify-center">
                                            <label className="flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-medium bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition-colors">
                                                <Upload className="w-2.5 h-2.5" />Değiştir
                                                <input type="file" accept="image/*" className="hidden" onChange={async e => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const fd = new FormData();
                                                    fd.append('file', file);
                                                    fd.append('category', 'logos');
                                                    try {
                                                        const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', headers: { 'Authorization': authHeader }, body: fd });
                                                        if (res.ok) { const d = await res.json(); update(i, 'logo_url', d.url); }
                                                    } catch { }
                                                }} />
                                            </label>
                                            <button onClick={() => update(i, 'logo_url', '')} className="px-2 py-1 text-[10px] font-medium text-red-500 bg-red-50 rounded hover:bg-red-100 transition-colors">
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-16 h-16 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-[#C4803D] hover:bg-[#C4803D]/5 transition-all mx-auto">
                                        <Image className="w-5 h-5 text-gray-400 mb-0.5" />
                                        <span className="text-[8px] text-gray-400">Logo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={async e => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const fd = new FormData();
                                            fd.append('file', file);
                                            fd.append('category', 'logos');
                                            try {
                                                const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', headers: { 'Authorization': authHeader }, body: fd });
                                                if (res.ok) { const d = await res.json(); update(i, 'logo_url', d.url); }
                                            } catch { }
                                        }} />
                                    </label>
                                )}
                            </div>

                            {/* Name + Description */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">İşletme Adı</label>
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={e => update(i, 'name', e.target.value)}
                                        placeholder="Ör: Kahve Deryası"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C4803D] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama <span className="text-gray-400 font-normal">(opsiyonel)</span></label>
                                    <input
                                        type="text"
                                        value={item.description || ''}
                                        onChange={e => update(i, 'description', e.target.value)}
                                        placeholder="Ör: İstanbul - 3 Şube"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C4803D] transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400">
                                    {item.enabled !== false ? '✅ Sitede görünüyor' : '⛔ Sitede gizli'}
                                    {!item.logo_url && ' · Logo yüklenmezse baş harfleri gösterilir'}
                                </p>
                            </div>

                            {/* Delete button */}
                            <button onClick={() => removeLogo(i)} className="mt-5 text-red-400 hover:text-red-600 transition-colors p-1" title="Sil">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <button onClick={addLogo} className="flex items-center gap-2 text-sm text-[#C4803D] hover:underline mt-4 font-medium">
                    <Plus className="w-4 h-4" />Yeni Referans Ekle
                </button>
            </EditorCard>

            <SaveButton onClick={() => onSave(local)} saving={saving} />
        </div>
    );
}

// ─── Footer Editor ───
function FooterEditor({ data, onSave, saving }: { data: any; onSave: (d: any) => void; saving: boolean }) {
    const [local, setLocal] = useState(data || { email: '', whatsapp: '', phone_display: '', instagram: '', linkedin: '', location: '', address: '', maps_embed_url: '', cta_title: '', cta_description: '' });
    useEffect(() => { if (data) setLocal(data); }, [data]);

    return (
        <div>
            <EditorCard title="İletişim Bilgileri">
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="E-posta" value={local.email} onChange={(v: string) => setLocal({ ...local, email: v })} />
                    <InputField label="Telefon (Görünen)" value={local.phone_display} onChange={(v: string) => setLocal({ ...local, phone_display: v })} />
                </div>
                <InputField label="WhatsApp Numarası (ülke kodu ile)" value={local.whatsapp} onChange={(v: string) => setLocal({ ...local, whatsapp: v })} placeholder="9053923311474" />
                <InputField label="Konum Bilgisi" value={local.location} onChange={(v: string) => setLocal({ ...local, location: v })} />
            </EditorCard>

            <EditorCard title="Adres & Harita">
                <p className="text-sm text-gray-500 mb-4">
                    Adres ve Google Maps bilgilerini buradan yönetebilirsiniz. Adres boş bırakılırsa İletişim bölümünde harita gösterilmez.
                </p>
                <InputField label="Açık Adres" value={local.address || ''} onChange={(v: string) => setLocal({ ...local, address: v })} placeholder="Ör: Atatürk Mah. Cumhuriyet Cad. No:42, Kadıköy, İstanbul" />
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Maps Embed URL</label>
                    <input
                        type="text"
                        value={local.maps_embed_url || ''}
                        onChange={(e) => setLocal({ ...local, maps_embed_url: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#C4803D] transition-all"
                        placeholder="https://www.google.com/maps/embed?pb=..."
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                        Google Maps&apos;te adresinizi arayın → &quot;Paylaş&quot; → &quot;Harita yerleştir&quot; → iframe kodundaki <code className="bg-gray-100 px-1 rounded">src=&quot;...&quot;</code> kısmındaki URL&apos;yi yapıştırın
                    </p>
                </div>
                {local.maps_embed_url && (
                    <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Harita Önizleme</label>
                        <div className="rounded-xl overflow-hidden border border-gray-200">
                            <iframe
                                src={local.maps_embed_url}
                                width="100%"
                                height="200"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                )}
            </EditorCard>

            <EditorCard title="Sosyal Medya Linkleri">
                <InputField label="Instagram URL" value={local.instagram} onChange={(v: string) => {
                    if (v && !v.startsWith('http://') && !v.startsWith('https://') && v.includes('.')) v = 'https://' + v;
                    setLocal({ ...local, instagram: v });
                }} placeholder="https://www.instagram.com/..." />
                <InputField label="LinkedIn URL" value={local.linkedin} onChange={(v: string) => {
                    if (v && !v.startsWith('http://') && !v.startsWith('https://') && v.includes('.')) v = 'https://' + v;
                    setLocal({ ...local, linkedin: v });
                }} placeholder="https://www.linkedin.com/in/..." />
            </EditorCard>

            <EditorCard title="Alt CTA Bandı">
                <InputField label="Başlık" value={local.cta_title} onChange={(v: string) => setLocal({ ...local, cta_title: v })} />
                <InputField label="Alt Açıklama" value={local.cta_description} onChange={(v: string) => setLocal({ ...local, cta_description: v })} />
            </EditorCard>

            <SaveButton onClick={() => onSave(local)} saving={saving} />
        </div>
    );
}

// ─── Yayın Bilgileri ───
function YayinBilgileri() {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const CopyBtn = ({ text, field }: { text: string; field: string }) => (
        <button
            onClick={() => copyToClipboard(text, field)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Kopyala"
        >
            {copiedField === field ? (
                <Check className="w-4 h-4 text-green-400" />
            ) : (
                <Copy className="w-4 h-4 text-gray-400" />
            )}
        </button>
    );

    const infoItems = [
        {
            label: '🌐 Website',
            value: 'https://www.arslanops.com',
            link: 'https://www.arslanops.com',
            field: 'site'
        },
        {
            label: '⚙️ Admin Paneli',
            value: 'https://www.arslanops.com/admin',
            link: 'https://www.arslanops.com/admin',
            field: 'admin'
        },
        {
            label: '🖥️ Backend API',
            value: 'https://arslanops-web.onrender.com',
            link: 'https://arslanops-web.onrender.com',
            field: 'backend'
        },
        {
            label: '🚀 Frontend Hosting (Vercel)',
            value: 'https://vercel.com/giftlife20-designs-projects/arslanops-web',
            link: 'https://vercel.com/giftlife20-designs-projects/arslanops-web',
            field: 'vercel'
        },
        {
            label: '📦 Backend Hosting (Render)',
            value: 'https://dashboard.render.com',
            link: 'https://dashboard.render.com',
            field: 'render'
        },
        {
            label: '💻 GitHub Repo',
            value: 'https://github.com/giftlife20-design/arslanops-web',
            link: 'https://github.com/giftlife20-design/arslanops-web',
            field: 'github'
        },
        {
            label: '🌍 Domain (GoDaddy)',
            value: 'arslanops.com',
            link: 'https://dcc.godaddy.com/control/arslanops.com',
            field: 'godaddy'
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Server className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Yayın Bilgileri</h2>
                    <p className="text-sm text-gray-400">Site URL'leri, platform linkleri ve erişim bilgileri</p>
                </div>
            </div>

            {/* Site Linkleri */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-1">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#C5A55A]" />
                    Site & Platform Linkleri
                </h3>
                {infoItems.map(item => (
                    <div key={item.field} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/5 transition-colors group">
                        <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-400 block">{item.label}</span>
                            <span className="text-white text-sm font-mono truncate block">{item.value}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CopyBtn text={item.value} field={item.field} />
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                title="Aç"
                            >
                                <ExternalLink className="w-4 h-4 text-gray-400" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Giriş Bilgileri */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <LogIn className="w-4 h-4 text-[#C5A55A]" />
                    Admin Giriş Bilgileri
                </h3>
                <div className="space-y-1">
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/5 transition-colors group">
                        <div>
                            <span className="text-sm text-gray-400 block">🔑 Kullanıcı Adı</span>
                            <span className="text-white font-mono">admin</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <CopyBtn text="admin" field="user" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/5 transition-colors group">
                        <div>
                            <span className="text-sm text-gray-400 block">🔒 Şifre</span>
                            <span className="text-white font-mono">••••••••••••••</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <CopyBtn text="ArslanOps2026!Guclu" field="pass" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Notlar */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20 p-6">
                <h3 className="text-white font-semibold mb-3">📋 Önemli Notlar</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                        <span className="text-[#C5A55A] mt-0.5">•</span>
                        <span><strong>Render (Backend)</strong> ücretsiz planda 15 dk hareketsizlikte uyku moduna geçer. İlk istek ~30 sn sürebilir.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-[#C5A55A] mt-0.5">•</span>
                        <span><strong>Vercel (Frontend)</strong> otomatik deploy yapar — GitHub&apos;a push yapıldığında site güncellenir.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-[#C5A55A] mt-0.5">•</span>
                        <span><strong>SSL (HTTPS)</strong> Vercel tarafından otomatik sağlanır.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-[#C5A55A] mt-0.5">•</span>
                        <span><strong>İçerik değişiklikleri</strong> bu admin panelden yapılır — platformlara girmenize gerek yoktur.</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
