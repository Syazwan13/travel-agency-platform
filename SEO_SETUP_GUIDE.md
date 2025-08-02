# SEO Setup Guide for Travel Agency Platform

## 1. Domain Setup
- Purchase a domain (e.g., yourtravelagency.com)
- Point your domain's A record to your DigitalOcean droplet IP
- Wait for DNS propagation (can take up to 24 hours)

## 2. SSL Certificate
- Run the SSL setup script: `./setup-ssl.sh yourdomain.com`
- Ensure your site loads on HTTPS

## 3. Google Search Console Setup
1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Add your property (domain or URL prefix)
3. Verify ownership (HTML file method or DNS verification)
4. Submit your sitemap: `https://yourdomain.com/sitemap.xml`

## 4. Add SEO Meta Tags
Your React frontend should include these meta tags in the HTML head:

```html
<!-- Primary Meta Tags -->
<title>Travel Agency - Best Travel Packages & Deals</title>
<meta name="title" content="Travel Agency - Best Travel Packages & Deals">
<meta name="description" content="Discover amazing travel packages, compare prices, and book your dream vacation. Find the best deals on flights, hotels, and holiday packages.">
<meta name="keywords" content="travel agency, travel packages, vacation deals, holiday booking, flight deals, hotel booking">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://yourdomain.com/">
<meta property="og:title" content="Travel Agency - Best Travel Packages & Deals">
<meta property="og:description" content="Discover amazing travel packages, compare prices, and book your dream vacation.">
<meta property="og:image" content="https://yourdomain.com/og-image.jpg">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://yourdomain.com/">
<meta property="twitter:title" content="Travel Agency - Best Travel Packages & Deals">
<meta property="twitter:description" content="Discover amazing travel packages, compare prices, and book your dream vacation.">
<meta property="twitter:image" content="https://yourdomain.com/og-image.jpg">
```

## 5. Create Sitemap
Add this to your backend to generate sitemap:

```javascript
// Add to your Express routes
app.get('/sitemap.xml', (req, res) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/packages</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/comparison</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});
```

## 6. Robots.txt
Add this to your public folder:

```
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

## 7. Analytics Setup
1. Set up Google Analytics 4
2. Add tracking code to your React app
3. Set up Google Tag Manager (optional)

## 8. Performance Optimization
- Enable Gzip compression (already configured in Nginx)
- Optimize images (use WebP format)
- Minify CSS and JavaScript (Vite handles this)
- Set up CDN (optional)

## 9. Submit to Search Engines
- Google: Use Search Console
- Bing: Submit to Bing Webmaster Tools
- Direct submission: `https://www.google.com/ping?sitemap=https://yourdomain.com/sitemap.xml`

## 10. Local SEO (if applicable)
- Set up Google My Business
- Add local business schema markup
- Include contact information and address

## Monitoring
- Monitor indexing status in Google Search Console
- Check Core Web Vitals
- Monitor search rankings
- Set up Google Alerts for your brand
