/**
 * Türkçe karakter destekli font yükleyici (jsPDF için)
 * Roboto fontunu /public/fonts/ dizininden yükler
 */

export async function loadTurkishFont(doc: any): Promise<boolean> {
    try {
        const toBase64 = async (url: string): Promise<string> => {
            const res = await fetch(url);
            const buf = await res.arrayBuffer();
            const bytes = new Uint8Array(buf);
            let binary = '';
            const chunk = 8192;
            for (let i = 0; i < bytes.length; i += chunk) {
                binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
            }
            return btoa(binary);
        };

        const [regularB64, boldB64] = await Promise.all([
            toBase64('/fonts/Roboto-Regular.ttf'),
            toBase64('/fonts/Roboto-Bold.ttf'),
        ]);

        doc.addFileToVFS('Roboto-Regular.ttf', regularB64);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

        doc.addFileToVFS('Roboto-Bold.ttf', boldB64);
        doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

        doc.setFont('Roboto');
        return true;
    } catch (e) {
        console.warn('Türkçe font yüklenemedi, Helvetica kullanılacak:', e);
        return false;
    }
}
