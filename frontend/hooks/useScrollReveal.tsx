'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Hook that adds 'visible' class to element when it enters viewport.
 * Use with CSS classes: reveal, reveal-scale, reveal-left, reveal-right, reveal-stagger
 */
export function useScrollReveal<T extends HTMLElement>(threshold = 0.15) {
    const ref = useRef<T>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Add visible class directly to DOM for CSS-only animations
                    entry.target.classList.add('visible');
                }
            },
            { threshold, rootMargin: '0px 0px -50px 0px' }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isVisible };
}

/**
 * Component that wraps children with scroll reveal animation.
 */
export function RevealOnScroll({
    children,
    className = '',
    animation = 'reveal',
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    animation?: 'reveal' | 'reveal-scale' | 'reveal-left' | 'reveal-right' | 'reveal-stagger';
    delay?: number;
}) {
    const { ref } = useScrollReveal<HTMLDivElement>();

    return (
        <div
            ref={ref}
            className={`${animation} ${className}`}
            style={delay ? { transitionDelay: `${delay}s` } : undefined}
        >
            {children}
        </div>
    );
}
