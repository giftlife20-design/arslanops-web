/**
 * Türkçe karakter destekli font yükleyici (jsPDF için)
 * Roboto Variable fontunu /public/fonts/ dizininden yükler
 */

export async function loadTurkishFont(doc: any): Promise<boolean> {
    try {
        const toBase64 = async (url: string): Promise<string> => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
            const buf = await res.arrayBuffer();
            const bytes = new Uint8Array(buf);
            let binary = '';
            const chunk = 8192;
            for (let i = 0; i < bytes.length; i += chunk) {
                binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
            }
            return btoa(binary);
        };

        const b64 = await toBase64('/fonts/Roboto-Variable.ttf');

        doc.addFileToVFS('Roboto-Variable.ttf', b64);
        doc.addFont('Roboto-Variable.ttf', 'Roboto', 'normal');
        doc.addFont('Roboto-Variable.ttf', 'Roboto', 'bold');

        doc.setFont('Roboto');
        return true;
    } catch (e) {
        console.warn('Türkçe font yüklenemedi, Helvetica kullanılacak:', e);
        return false;
    }
}
