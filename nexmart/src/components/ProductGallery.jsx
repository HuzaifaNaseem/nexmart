import { useState, useRef, useEffect, useCallback } from 'react';
import { Ic } from './icons';

/** Frames needed before a drag-to-spin view is honest rather than janky. */
const SPIN_MIN_FRAMES = 6;

/**
 * Product gallery: multiple angles, zoom, keyboard support, and a spin view
 * that switches itself on once a product carries enough frames.
 *
 * Images are rendered `object-contain` on a fixed square so a tall bottle and
 * a wide laptop occupy the same footprint — the brief's "keep same size for
 * all images" — and are never cropped through the middle of the product.
 */
export default function ProductGallery({ product }) {
  const images = product.images?.length ? product.images : [product.image];
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [loaded, setLoaded] = useState({});
  const [spinning, setSpinning] = useState(false);
  const frameRef = useRef(null);
  const dragRef = useRef(null);

  const canSpin = images.length >= SPIN_MIN_FRAMES;
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const go = useCallback((next) => {
    setIndex((i) => (next + images.length) % images.length);
    setZoomed(false);
  }, [images.length]);

  // Arrow keys move between angles while the gallery has focus.
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    else if (e.key === 'Escape') setZoomed(false);
  };

  // Preload neighbours so switching angle is instant.
  useEffect(() => {
    [index + 1, index - 1].forEach((i) => {
      const src = images[(i + images.length) % images.length];
      if (src) { const im = new Image(); im.src = src; }
    });
  }, [index, images]);

  const onMouseMove = (e) => {
    if (!zoomed || !frameRef.current) return;
    const r = frameRef.current.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  // Drag across the image to rotate through frames (spin mode only).
  const onPointerDown = (e) => {
    if (!spinning) return;
    dragRef.current = { x: e.clientX, index };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!spinning || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const step = Math.round(dx / 24);
    if (step) setIndex(((dragRef.current.index + step) % images.length + images.length) % images.length);
  };
  const onPointerUp = () => { dragRef.current = null; };

  const angleLabel = (i) =>
    images.length > 1 ? `${product.name} — view ${i + 1} of ${images.length}` : product.name;

  return (
    <div>
      {/* ── Main frame ── */}
      <div
        ref={frameRef}
        tabIndex={0}
        role="group"
        aria-label={`${product.name} image gallery, ${images.length} views. Use arrow keys to change view.`}
        onKeyDown={onKeyDown}
        onMouseMove={onMouseMove}
        onMouseLeave={() => setZoomed(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className={`relative aspect-square rounded-2xl overflow-hidden dm-surface border dm-border select-none
          ${spinning ? 'cursor-ew-resize' : zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
        onClick={() => !spinning && setZoomed((z) => !z)}
      >
        {!loaded[index] && <div className="absolute inset-0 skeleton-shimmer" aria-hidden="true" />}

        <img
          src={images[index]}
          alt={angleLabel(index)}
          onLoad={() => setLoaded((l) => ({ ...l, [index]: true }))}
          className="w-full h-full object-contain p-6 transition-transform duration-300 ease-warm"
          style={zoomed ? { transform: 'scale(2.2)', transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
          draggable={false}
        />

        {/* Status badges live on the image, per the brief */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
          {discount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-red-500 text-white text-[11px] font-bold shadow-sm">
              −{discount}%
            </span>
          )}
          {product.badge && (
            <span className="px-2.5 py-1 rounded-full bg-primary text-white text-[11px] font-bold shadow-sm">
              {product.badge}
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm ${
            product.stockCount === 0 ? 'bg-gray-700 text-white'
              : product.stockCount < 10 ? 'bg-amber-500 text-white'
              : 'bg-emerald-600 text-white'}`}>
            {product.stockCount === 0 ? 'Out of stock'
              : product.stockCount < 10 ? `Only ${product.stockCount} left`
              : 'In stock'}
          </span>
        </div>

        {/* Angle arrows */}
        {images.length > 1 && !zoomed && (
          <>
            <button onClick={(e) => { e.stopPropagation(); go(index - 1); }} aria-label="Previous view"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center dm-text hover:scale-105 transition">
              <span className="rotate-180"><Ic.Arrow s={16} /></span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); go(index + 1); }} aria-label="Next view"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center dm-text hover:scale-105 transition">
              <Ic.Arrow s={16} />
            </button>
          </>
        )}

        <div className="absolute bottom-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full glass text-[11px] font-medium dm-text pointer-events-none">
            {zoomed ? 'Click to zoom out' : spinning ? 'Drag to rotate' : '🔍 Click to zoom'}
          </span>
          {canSpin && (
            <button onClick={(e) => { e.stopPropagation(); setSpinning((s) => !s); setZoomed(false); }}
              aria-pressed={spinning}
              className="px-2.5 py-1 rounded-full glass text-[11px] font-semibold dm-text hover:scale-105 transition">
              360°
            </button>
          )}
        </div>

        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 px-2 py-1 rounded-full glass text-[11px] font-medium dm-text pointer-events-none">
            {index + 1}/{images.length}
          </span>
        )}
      </div>

      {/* ── Angle thumbnails ── */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1" role="tablist" aria-label="Product views">
          {images.map((img, i) => (
            <button key={i} role="tab" aria-selected={index === i} aria-label={`View ${i + 1}`}
              onClick={() => go(i)}
              className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all dm-surface
                ${index === i ? 'border-accent shadow-elev-1' : 'border-transparent hover:opacity-80'}`}>
              <img src={img} alt="" loading="lazy" className="w-full h-full object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
