import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../apps/web/dist');
const BASE_URL = 'https://mirstoera.in';

const routes = [
  {
    path: '/',
    title: 'MIRSTOERA — Royal Moments Experience Platform | Coimbatore',
    description: 'Every Moment Deserves a Crown. Coimbatore’s premier surprise experience planners for secret gift deliveries, mini movie proposals, cinematic birthday reveals, and heroic entries.',
    h1: 'Your Story Deserves a Royal Moment.',
    snippet: 'MIRSTOERA creates cinema-inspired surprise experiences across Coimbatore, Tamil Nadu. Handcrafted letters, ambient decor, and vertical memory reels starting from ₹799.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'MIRSTOERA — Royal Moments Experience Platform',
      image: `${BASE_URL}/logo.png`,
      telephone: '+919876543210',
      email: 'concierge@mirstoera.in',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Coimbatore',
        addressRegion: 'Tamil Nadu',
        addressCountry: 'IN',
      },
      priceRange: '₹₹',
      url: BASE_URL,
    },
  },
  {
    path: '/experiences',
    title: 'Curated Surprise Experiences | MIRSTOERA Coimbatore',
    description: 'Explore our four signature celebration packages in Coimbatore: Secret Gift Delivery (₹799), Mini Movie Proposal (₹1,499), Cinematic Birthday Surprise (₹1,799), and Cinematic Hero Entry (₹1,299).',
    h1: 'Royal Moments Experiences Catalog',
    snippet: 'Browse our complete catalog of private celebration packages tailored for relationships, milestones, and cinematic reveals in Coimbatore.',
  },
  {
    path: '/experiences/secret-gift',
    title: 'Secret Gift Delivery — Starting ₹799 | MIRSTOERA Coimbatore',
    description: 'Personalized surprise gift delivery in Coimbatore featuring gift box, chocolates, handwritten calligraphy letter, and doorstep reveal coordination.',
    h1: 'Secret Gift Delivery',
    snippet: 'Surprise someone you cherish with an unexpected, beautifully wrapped gift box delivered to their doorstep in Coimbatore.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Secret Gift Delivery',
      provider: { '@type': 'LocalBusiness', name: 'MIRSTOERA' },
      areaServed: 'Coimbatore',
      offers: {
        '@type': 'Offer',
        price: '799',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    },
  },
  {
    path: '/experiences/mini-proposal',
    title: 'Mini Movie Proposal — Starting ₹1,499 | MIRSTOERA Coimbatore',
    description: 'Intimate cinematic marriage and relationship proposals in Coimbatore. Three roses, personalized love letter, romantic setup, and vertical keepsake video.',
    h1: 'Mini Movie Proposal',
    snippet: 'Turn your love story into a cinematic movie moment. Intimate, respectful, emotional coordination in Coimbatore.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Mini Movie Proposal',
      provider: { '@type': 'LocalBusiness', name: 'MIRSTOERA' },
      areaServed: 'Coimbatore',
      offers: {
        '@type': 'Offer',
        price: '1499',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    },
  },
  {
    path: '/experiences/birthday-surprise',
    title: 'Cinematic Birthday Surprise — Starting ₹1,799 | MIRSTOERA Coimbatore',
    description: 'Movie-inspired birthday reveals with balloon decoration, birthday banner, fairy lights, personalized birthday letter, and keepsake video.',
    h1: 'Cinematic Birthday Surprise',
    snippet: 'Make their birthday unforgettable with storytelling reveal, fairy light ambience, and emotional music cues.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Cinematic Birthday Surprise',
      provider: { '@type': 'LocalBusiness', name: 'MIRSTOERA' },
      areaServed: 'Coimbatore',
      offers: {
        '@type': 'Offer',
        price: '1799',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    },
  },
  {
    path: '/experiences/hero-entry',
    title: 'Cinematic Hero Entry — Starting ₹1,299 | MIRSTOERA Coimbatore',
    description: 'Movie-style entrance choreography for grooms, birthday VIPs, and celebrations in Coimbatore. High-energy coordination and edited vertical reel.',
    h1: 'Cinematic Hero Entry',
    snippet: 'Enter your celebration like a movie star. Smartphone filming, background music cueing, and coordinated styling props.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Cinematic Hero Entry',
      provider: { '@type': 'LocalBusiness', name: 'MIRSTOERA' },
      areaServed: 'Coimbatore',
      offers: {
        '@type': 'Offer',
        price: '1299',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    },
  },
  {
    path: '/book',
    title: 'Book a Surprise Experience Consultation | MIRSTOERA Coimbatore',
    description: 'Reserve your royal surprise experience in Coimbatore. Submit your celebration details for Secret Gift Delivery, Proposals, Birthday Surprises, or Hero Entries.',
    h1: 'Book Your Royal Moment',
    snippet: 'Every surprise begins with an idea. Fill in your event preferences and our Coimbatore concierge team will craft an unforgettable experience tailored to your vision.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ReserveAction',
      name: 'Book Royal Surprise Experience Consultation',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/book`,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      result: {
        '@type': 'Reservation',
        name: 'Surprise Experience Consultation',
      },
      provider: {
        '@type': 'LocalBusiness',
        name: 'MIRSTOERA — Royal Moments Experience Platform',
        telephone: '+919876543210',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Coimbatore',
          addressRegion: 'Tamil Nadu',
          addressCountry: 'IN',
        },
      },
    },
  },
  {
    path: '/our-story',
    title: 'Our Story & Royal Philosophy | MIRSTOERA Coimbatore',
    description: 'Learn why MIRSTOERA was born in Coimbatore to bring back heartfelt sentiment, cinema-inspired romance, and regal elegance to celebrations.',
    h1: 'The Story Behind MIRSTOERA',
    snippet: 'Crafted with devotion in Coimbatore. Learn about our founding philosophy: Every Moment Deserves a Crown.',
  },
  {
    path: '/gallery',
    title: 'Visual Moments & Concept Gallery | MIRSTOERA Coimbatore',
    description: 'Browse photos, aesthetic concepts, balloon decor palettes, and calligraphy letter styles created by MIRSTOERA in Coimbatore.',
    h1: 'Visual Moments Gallery',
    snippet: 'Discover the royal aesthetic that makes MIRSTOERA experiences unmistakable.',
  },
  {
    path: '/contact',
    title: 'Contact Coimbatore Concierge | MIRSTOERA',
    description: 'Direct contact with MIRSTOERA surprise planning concierge in Coimbatore. Phone +91 98765 43210, WhatsApp chat, and coverage area details.',
    h1: 'Contact MIRSTOERA Concierge',
    snippet: 'Ready to plan a surprise? Connect directly with our private event concierge in Coimbatore.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy & Data Notice | MIRSTOERA',
    description: 'Our commitment to data privacy, customer phone number protection, and client media confidentiality.',
    h1: 'Privacy Notice',
    snippet: 'MIRSTOERA client media privacy: We never publish customer photos or reels without prior written consent.',
  },
  {
    path: '/terms',
    title: 'Booking Conditions & Terms of Service | MIRSTOERA',
    description: 'Terms of service, quotation rules, cancellation conditions, and safety standards for MIRSTOERA surprise experiences in Coimbatore.',
    h1: 'Booking Conditions',
    snippet: 'Transparent business guidelines, venue permission obligations, and safety policies.',
  },
  {
    path: '/admin/login',
    title: 'MIRSTOERA Concierge Portal | Admin Login',
    description: 'Internal concierge portal for MIRSTOERA booking administration.',
    h1: 'MIRSTOERA Concierge Portal',
    snippet: 'Internal administrative access.',
  },
  {
    path: '/admin',
    title: 'MIRSTOERA Concierge Portal | Dashboard',
    description: 'Internal concierge portal for MIRSTOERA booking administration.',
    h1: 'MIRSTOERA Concierge Portal',
    snippet: 'Internal administrative access.',
  },
];

async function prerender() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error(`Template not found at ${templatePath}. Build apps/web first.`);
    process.exit(1);
  }

  let template = fs.readFileSync(templatePath, 'utf8');

  // Clean existing injected tags so repeated runs are 100% idempotent
  template = template
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '')
    .replace(/<link rel="canonical"[^>]*?>\s*/g, '')
    .replace(/<div id="prerendered-content"[\s\S]*?<\/div>\s*/g, '');

  for (const route of routes) {
    let html = template;
    const url = `${BASE_URL}${route.path}`;

    // 1. Replace title
    html = html.replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`);

    // 2. Replace meta description
    html = html.replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${route.description}" />`
    );

    // 3. Update OpenGraph and Twitter tags
    html = html.replace(
      /<meta property="og:url" content=".*?" \/>/,
      `<meta property="og:url" content="${url}" />`
    );
    html = html.replace(
      /<meta property="og:title" content=".*?" \/>/,
      `<meta property="og:title" content="${route.title}" />`
    );
    html = html.replace(
      /<meta property="og:description" content=".*?" \/>/,
      `<meta property="og:description" content="${route.description}" />`
    );
    html = html.replace(
      /<meta property="twitter:title" content=".*?" \/>/,
      `<meta property="twitter:title" content="${route.title}" />`
    );
    html = html.replace(
      /<meta property="twitter:description" content=".*?" \/>/,
      `<meta property="twitter:description" content="${route.description}" />`
    );

    // 4. Inject Canonical URL
    const canonicalTag = `<link rel="canonical" href="${url}" />`;
    if (!html.includes('rel="canonical"')) {
      html = html.replace('</head>', `  ${canonicalTag}\n  </head>`);
    } else {
      html = html.replace(/<link rel="canonical" href=".*?" \/>/, canonicalTag);
    }

    // 5. Inject Structured Data JSON-LD
    if (route.schema) {
      const scriptTag = `  <script type="application/ld+json">\n${JSON.stringify(route.schema, null, 2)}\n  </script>\n`;
      html = html.replace('</head>', `${scriptTag}</head>`);
    }

    // 6. Inject SEO static markup inside #root for crawlers
    const staticCrawlerContent = `
      <div id="prerendered-content" style="display:none;" aria-hidden="true">
        <h1>${route.h1}</h1>
        <p>${route.snippet}</p>
      </div>
    `;
    html = html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${staticCrawlerContent}</div>`);

    // 7. Write to appropriate directory
    let targetDir = DIST_DIR;
    let targetFile = path.join(DIST_DIR, 'index.html');

    if (route.path !== '/') {
      targetDir = path.join(DIST_DIR, route.path.replace(/^\//, ''));
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      targetFile = path.join(targetDir, 'index.html');
    }

    fs.writeFileSync(targetFile, html, 'utf8');
    console.log(`Prerendered: ${route.path} -> ${targetFile}`);
  }

  console.log(`\nSuccessfully prerendered ${routes.length} public routes with SEO and JSON-LD!`);
}

prerender().catch((err) => {
  console.error('Prerendering failed:', err);
  process.exit(1);
});
