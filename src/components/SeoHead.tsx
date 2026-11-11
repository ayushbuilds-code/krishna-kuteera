import { useEffect } from 'react';
import { BRAND } from '@/config/brand';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Updates document title, meta description, Open Graph tags, canonical URL,
 * and optional JSON-LD structured data per route.
 */
export function SeoHead({
  title,
  description,
  canonicalPath = '/',
  jsonLd,
}: SeoHeadProps) {
  useEffect(() => {
    const fullTitle = title.includes(BRAND.name)
      ? title
      : `${title} | ${BRAND.name}`;
    document.title = fullTitle;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.includes('property=')) {
          const prop = selector.match(/property="([^"]+)"/)?.[1];
          if (prop) el.setAttribute('property', prop);
        } else {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) el.setAttribute('name', name);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    const siteUrl = (
      import.meta.env.VITE_SITE_URL || window.location.origin
    ).replace(/\/$/, '');
    const canonicalUrl = `${siteUrl}${canonicalPath}`;

    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    const scriptId = 'kk-route-jsonld';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) existingScript.remove();

    if (jsonLd) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [title, description, canonicalPath, jsonLd]);

  return null;
}

