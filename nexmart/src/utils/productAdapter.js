export function adaptProduct(p) {
  return {
    id:            p.id,
    name:          p.name,
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
    image:       p.images?.[0]     || 'https://placehold.co/400x400?text=No+Image',
    images:      p.images?.length  ? p.images : ['https://placehold.co/400x400?text=No+Image'],
    description: p.description,
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
