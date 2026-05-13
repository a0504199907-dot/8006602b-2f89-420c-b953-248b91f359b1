/**
 * SEO Hook for Dynamic Meta Tags
 * Works with React 18 by directly manipulating document meta tags
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router';

// Site Constants
const SITE_NAME = 'הציבור החרדי';
const SITE_TITLE = 'הציבור החרדי - המגזין המצולם החרדי המוביל';
const BASE_URL = 'https://hatzibur.co.il';
const DEFAULT_DESCRIPTION = 'הציבור החרדי - המגזין המצולם החרדי המוביל והמופץ ביותר בעולם היהודי. חדשות, תמונות, אירועים ושמחות מכל החסידויות.';
const DEFAULT_IMAGE = '/og-image.jpeg';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noIndex?: boolean;
  section?: string;
}

/**
 * Set or update a meta tag
 */
function setMetaTag(property: string, content: string, isProperty = false): void {
  const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  
  if (!element) {
    element = document.createElement('meta');
    if (isProperty) {
      element.setAttribute('property', property);
    } else {
      element.setAttribute('name', property);
    }
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

/**
 * Set or update a link tag
 */
function setLinkTag(rel: string, href: string): void {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  
  element.setAttribute('href', href);
}

/**
 * Add JSON-LD structured data
 */
function setJsonLd(data: object): void {
  const id = 'seo-json-ld';
  let element = document.getElementById(id) as HTMLScriptElement | null;
  
  if (!element) {
    element = document.createElement('script');
    element.id = id;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }
  
  element.textContent = JSON.stringify(data);
}

/**
 * Main SEO Hook - Call in every page component
 */
export function useSEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  noIndex = false,
  section
}: SEOProps = {}): void {
  const location = useLocation();
  
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_TITLE;
    const fullUrl = `${BASE_URL}${url || location.pathname}`;
    const fullImage = image?.startsWith('http') ? image : `${BASE_URL}${image}`;
    
    // Set document title
    document.title = fullTitle;
    
    // Basic meta tags
    setMetaTag('description', description);
    
    // Open Graph
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', fullImage, true);
    setMetaTag('og:url', fullUrl, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:site_name', SITE_NAME, true);
    setMetaTag('og:locale', 'he_IL', true);
    
    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', fullImage);
    
    // Article specific
    if (type === 'article') {
      if (publishedTime) {
        setMetaTag('article:published_time', publishedTime, true);
      }
      if (modifiedTime) {
        setMetaTag('article:modified_time', modifiedTime, true);
      }
      if (author) {
        setMetaTag('article:author', author, true);
      }
      if (section) {
        setMetaTag('article:section', section, true);
      }
    }
    
    // Robots
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow');
    }
    
    // Canonical URL
    setLinkTag('canonical', fullUrl);
    
    // Cleanup function to reset title on unmount
    return () => {
      // Reset to default on route change will be handled by next useSEO call
    };
  }, [title, description, image, url, type, publishedTime, modifiedTime, author, noIndex, section, location.pathname]);
}

/**
 * Article Schema Hook - Call for article/blog pages
 */
export function useArticleSchema({
  title,
  description,
  image,
  url,
  publishedTime,
  modifiedTime,
  authorName,
  section
}: {
  title: string;
  description: string;
  image?: string;
  url: string;
  publishedTime: string;
  modifiedTime?: string;
  authorName: string;
  section?: string;
}): void {
  useEffect(() => {
    const fullUrl = `${BASE_URL}${url}`;
    const fullImage = image?.startsWith('http') ? image : image ? `${BASE_URL}${image}` : `${BASE_URL}${DEFAULT_IMAGE}`;
    
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      image: fullImage,
      url: fullUrl,
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      author: {
        '@type': 'Person',
        name: authorName
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: BASE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/og-image.jpeg`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': fullUrl
      },
      ...(section && { articleSection: section })
    };
    
    setJsonLd(schema);
    
    return () => {
      // Clean up JSON-LD on unmount
      const element = document.getElementById('seo-json-ld');
      if (element) {
        element.remove();
      }
    };
  }, [title, description, image, url, publishedTime, modifiedTime, authorName, section]);
}

/**
 * Organization Schema - Call once on homepage
 */
export function useOrganizationSchema(): void {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/og-image.jpeg`
      },
      sameAs: [],
      description: DEFAULT_DESCRIPTION
    };
    
    setJsonLd(schema);
    
    return () => {
      const element = document.getElementById('seo-json-ld');
      if (element) {
        element.remove();
      }
    };
  }, []);
}

/**
 * Breadcrumb Schema Hook
 */
export function useBreadcrumbSchema(items: Array<{ name: string; url: string }>): void {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${BASE_URL}${item.url}`
      }))
    };
    
    // Use different ID for breadcrumbs
    const id = 'seo-breadcrumb-ld';
    let element = document.getElementById(id) as HTMLScriptElement | null;
    
    if (!element) {
      element = document.createElement('script');
      element.id = id;
      element.type = 'application/ld+json';
      document.head.appendChild(element);
    }
    
    element.textContent = JSON.stringify(schema);
    
    return () => {
      const el = document.getElementById(id);
      if (el) {
        el.remove();
      }
    };
  }, [items]);
}

export { SITE_NAME, BASE_URL, DEFAULT_DESCRIPTION, DEFAULT_IMAGE };
