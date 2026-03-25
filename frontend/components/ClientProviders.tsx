'use client';

import { BrandingProvider } from '@/components/BrandingProvider';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return <BrandingProvider>{children}</BrandingProvider>;
}
