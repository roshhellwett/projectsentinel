import { Post } from '@/types';

export function newsArticleJsonLd(post: Post): object {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.headline,
    description: post.summary,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      '@type': 'Organization',
      name: 'India Verified',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'India Verified',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.svg`,
      },
    },
    articleSection: post.category,
    url: `${siteUrl}/news/${post.id}/`,
    image: [`${siteUrl}/opengraph-image.png`],
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'credibilityScore',
        value: post.credibility_score,
      },
      {
        '@type': 'PropertyValue',
        name: 'sourceCount',
        value: post.source_count,
      },
    ],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/news/${post.id}/`,
    },
  };
}

export function websiteJsonLd(): object {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'India Verified',
    url: siteUrl,
    description: 'Fully automated, AI-powered Indian news aggregator.',
    image: `${siteUrl}/opengraph-image.png`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationJsonLd(): object {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifiedindian.vercel.app';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'India Verified',
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
    image: `${siteUrl}/opengraph-image.png`,
    description: 'AI-powered, fully automated Indian news aggregator.',
    foundingDate: '2025',
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function jsonLdToString(data: object): string {
  return JSON.stringify(data);
}
