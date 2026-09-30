import curatedImages from '../data/curatedImages.json';

function qualityImage(url) {
  if (!url?.includes('images.unsplash.com')) return url;
  return url.replace(/w=\d+/, 'w=1200').replace(/q=\d+/, 'q=85');
}

export function adaptProduct(p) {
  const selectedImages = curatedImages[p.id] || null;
  return {
    id:            p.id,
    name:          p.id === 16 ? 'Dune' : p.name,
    slug:          p.slug,
    category:      p.category,
    brand:         p.brand || '',
    price:         Number(p.price),
    // Only expose a "was" price when there is a real discount — a fallback to
    // the current price makes every card render a bogus strikethrough.
    originalPrice:
      p.original_price && Number(p.original_price) > Number(p.price)
        ? Number(p.original_price)
        : null,
    rating:        Number(p.rating),
    reviews:       p.review_count,
    badge:
      p.tags?.find(t =>
        ['Best Seller', 'New Arrival', 'Hot Deal', 'Trending', 'Limited', 'Sale'].includes(t)
      ) || null,
    image:       selectedImages?.[0] || qualityImage(p.images?.[0]) || 'https://placehold.co/400x400?text=No+Image',
    images:      selectedImages || (p.images?.length ? p.images.map(qualityImage) : ['https://placehold.co/400x400?text=No+Image']),
    description: p.id === 16 ? "Frank Herbert's science-fiction classic follows Paul Atreides into the complex politics and stark beauty of Arrakis. An enduring story of power, ecology, and destiny." : p.description,
    colors:      p.tags?.filter(t => t.startsWith('color:')).map(t => t.replace('color:', '')) || [],
    sizes:       p.tags?.filter(t => t.startsWith('size:')).map(t => t.replace('size:', ''))   || [],
    inStock:     p.stock > 0,
    stockCount:  p.stock,
    tags:        p.tags || [],
  };
}

export function adaptProducts(list) {
  return list.map(adaptProduct);
}
