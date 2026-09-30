import { useMemo, useState } from 'react';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { useStore } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import PCard from '../../components/PCard';
import RecentlyViewedRow from '../../components/RecentlyViewedRow';

const categoryDescriptions = {
  Electronics: 'The tech you reach for every day',
  Clothing: 'Pieces with staying power',
  Fashion: 'A wardrobe worth making room for',
  Furniture: 'Make yourself at home',
  'Home & Living': 'Objects with a point of view',
  Kitchen: 'Better moments, made at home',
  Beauty: 'A little time for yourself',
  Sports: 'Made for your next move',
  Gaming: 'Play in your element',
  Books: 'Find your next good read',
};

const categoryImage = {
  Electronics: '/editorial/technology.jpg',
  Clothing: '/editorial/style.jpg',
  Fashion: '/editorial/style.jpg',
  Furniture: '/editorial/living.jpg',
  'Home & Living': '/editorial/living.jpg',
  Kitchen: '/editorial/kitchen.jpg',
  Sports: '/editorial/sports.jpg',
  Books: '/editorial/books.jpg',
};

function SectionHeading({ eyebrow, title, copy, href = '#/shop', link = 'Explore all' }) {
  return (
    <div className="nm-section-heading">
      <div>
        <span className="nm-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
      <a href={href} className="nm-text-link">{link}<span aria-hidden="true">↗</span></a>
    </div>
  );
}

export default function HomePage() {
  const products = useProducts();
  const categories = useCategories(100);
  const { currency } = useStore();
  const [activeCategory, setActiveCategory] = useState('All');

  const categoryNames = useMemo(() => categories.map(category => category.name), [categories]);
  const edit = useMemo(() => {
    const collection = activeCategory === 'All'
      ? products
      : products.filter(product => product.category === activeCategory);
    return collection.slice(0, activeCategory === 'All' ? 12 : 8);
  }, [activeCategory, products]);

  const freshAcrossCategories = useMemo(() => categoryNames
    .map(name => products.find(product => product.category === name && product.id >= 1000))
    .filter(Boolean), [categoryNames, products]);

  const spotlight = products.find(product => product.category === 'Electronics') || products[0];
  const secondSpotlight = products.find(product => product.category === 'Furniture' || product.category === 'Home & Living') || products[1];

  return (
    <div className="nm-home">
      <section className="nm-hero" aria-labelledby="nm-hero-title">
        <div className="nm-hero-copy">
          <span className="nm-eyebrow nm-eyebrow-light"><span className="nm-eyebrow-line" /> THE EVERYDAY, RECONSIDERED</span>
          <h1 id="nm-hero-title">Good things.<br /><em>All in one place.</em></h1>
          <p>Explore useful, beautiful finds across technology, style, home and everything in between.</p>
          <div className="nm-hero-actions">
            <a className="nm-button nm-button-light" href="#/shop">Explore the collection <span aria-hidden="true">↗</span></a>
            <a className="nm-hero-secondary" href="#categories">Shop by category <span aria-hidden="true">↓</span></a>
          </div>
          <div className="nm-hero-index"><span>01 / 01</span><span className="nm-hero-rule" /><span>THE NEXMART EDIT</span></div>
        </div>
        <div className="nm-hero-art">
          <img src="/editorial/living.jpg" alt="Warm, contemporary living room with thoughtfully selected furnishings" fetchPriority="high" />
          <div className="nm-hero-art-label"><span>CURATED LIVING</span><span>Discover more ↗</span></div>
        </div>
      </section>

      <div className="nm-value-bar" aria-label="Shopping features">
        <span>Thoughtfully selected products</span><i aria-hidden="true" />
        <span>Search across the collection</span><i aria-hidden="true" />
        <span>Save and compare favorites</span>
      </div>

      <section className="nm-container nm-categories-section" id="categories">
        <SectionHeading eyebrow="01 / DISCOVER" title="Explore by category" copy="Whatever you are looking for, start somewhere inspiring." />
        <div className="nm-categories-grid">
          {categories.map((category, index) => (
            <a
              key={category.name}
              className="nm-category-card"
              href={`#/shop?category=${encodeURIComponent(category.name)}`}
              style={{ '--cat-order': index }}
            >
              <img src={categoryImage[category.name] || category.img} alt="" loading="lazy" decoding="async" />
              <span className="nm-category-shade" />
              <span className="nm-category-top">{String(index + 1).padStart(2, '0')} <span aria-hidden="true">↗</span></span>
              <span className="nm-category-bottom">
                <strong>{category.name}</strong>
                <small>{categoryDescriptions[category.name] || `${category.count} pieces to explore`}</small>
              </span>
            </a>
          ))}
        </div>
      </section>

      {spotlight && secondSpotlight && (
        <section className="nm-container nm-feature-grid" aria-label="Featured collections">
          <a className="nm-feature nm-feature-dark" href={`#/product/${spotlight.id}`}>
            <div><span className="nm-eyebrow nm-eyebrow-light">THE TECH EDIT</span><h2>Future ready,<br /><em>right now.</em></h2><span className="nm-feature-link">Discover {spotlight.category} ↗</span></div>
            <img src="/editorial/technology.jpg" alt="Refined technology collection" loading="lazy" />
          </a>
          <a className="nm-feature nm-feature-light" href={`#/product/${secondSpotlight.id}`}>
            <div><span className="nm-eyebrow">THE LIVING EDIT</span><h2>Make room for<br /><em>better living.</em></h2><span className="nm-feature-link">Explore the collection ↗</span></div>
            <img src={secondSpotlight.image} alt={secondSpotlight.name} loading="lazy" />
          </a>
        </section>
      )}

      <section className="nm-container nm-product-section" id="collection">
        <SectionHeading eyebrow="02 / THE COLLECTION" title="Find something exceptional" copy="A considered selection from across the entire catalog." />
        <div className="nm-category-tabs" role="group" aria-label="Filter featured products by category">
          {['All', ...categoryNames].map(name => (
            <button
              key={name}
              type="button"
              className={activeCategory === name ? 'is-active' : ''}
              aria-pressed={activeCategory === name}
              onClick={() => setActiveCategory(name)}
            >{name}</button>
          ))}
        </div>
        <div className="nm-product-grid">
          {edit.map((product, index) => <PCard key={product.id} product={product} index={index} />)}
        </div>
        <a className="nm-button nm-button-outline" href="#/shop">Shop the full collection <span aria-hidden="true">↗</span></a>
      </section>

      <section className="nm-story">
        <div className="nm-story-photo"><img src="/editorial/style.jpg" alt="Contemporary fashion in natural light" loading="lazy" /></div>
        <div className="nm-story-copy">
          <span className="nm-eyebrow nm-eyebrow-light">A BETTER WAY TO BROWSE</span>
          <h2>More to explore.<br /><em>Less to settle for.</em></h2>
          <p>From the pieces you need to the ones you did not know you wanted, discover a collection built for the way you live.</p>
          <a href="#/shop" className="nm-button nm-button-light">Explore all products <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      {freshAcrossCategories.length > 0 && (
        <section className="nm-container nm-product-section" aria-label="Fresh finds across categories">
          <SectionHeading eyebrow="03 / FRESH FINDS" title="New perspectives" copy="More to love, from every corner of the collection." />
          <div className="nm-product-grid">
            {freshAcrossCategories.map((product, index) => <PCard key={product.id} product={product} index={index} />)}
          </div>
          <a className="nm-button nm-button-outline" href="#/shop">Discover all {products.length} products <span aria-hidden="true">↗</span></a>
        </section>
      )}

      <section className="nm-container nm-discovery">
        <SectionHeading eyebrow="04 / MADE FOR DISCOVERY" title="Shopping that feels effortless" copy="The little details that make finding the right thing easier." href="#/shop" link="Start exploring" />
        <div className="nm-discovery-grid">
          <a href="#/search" className="nm-discovery-card"><span>01</span><strong>Find it faster.</strong><p>Search products and brands without digging through endless pages.</p><b>Explore search ↗</b></a>
          <a href="#/wishlist" className="nm-discovery-card"><span>02</span><strong>Keep what you love.</strong><p>Save your favorites and come back when the moment is right.</p><b>Open wishlist ↗</b></a>
          <a href="#/shop" className="nm-discovery-card"><span>03</span><strong>Choose with confidence.</strong><p>Filter, sort and compare the details that matter to you.</p><b>Browse products ↗</b></a>
        </div>
      </section>

      <div className="nm-container"><RecentlyViewedRow /></div>
    </div>
  );
}
