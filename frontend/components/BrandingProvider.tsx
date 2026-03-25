'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface BrandingData {
    logo_url?: string;
    logo_text?: string;
}

interface BrandingContextType {
    branding: BrandingData;
    loaded: boolean;
}

const BrandingContext = createContext<BrandingContextType>({
    branding: {},
    loaded: false,
});

export function BrandingProvider({ children }: { children: ReactNode }) {
    const [branding, setBranding] = useState<BrandingData>({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/api/content/branding`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) setBranding(data);
                setLoaded(true);
            })
            .catch(() => {
                setLoaded(true);
            });
    }, []);

    return (
        <BrandingContext.Provider value={{ branding, loaded }}>
            {children}
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    return useContext(BrandingContext);
}
