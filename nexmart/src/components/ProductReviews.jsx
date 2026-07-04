import { useState, useEffect, useContext } from 'react';
import { AppCtx } from '../context/AppContext';
import { getReviews, postReview } from '../api/reviews';
import { Stars } from './icons';

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1 mb-4">
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="text-3xl leading-none transition-transform hover:scale-110 focus:outline-none"
        style={{ color: n <= value ? '#F59E0B' : 'var(--border-color)', filter: n <= value ? 'none' : 'grayscale(1)', opacity: n <= value ? 1 : 0.4 }}
      >★</button>
    ))}
  </div>
);

const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-5 text-right dm-text-muted">{star}★</span>
      <div className="flex-1 h-2 rounded-full dm-surface overflow-hidden">
        <div className="h-full rounded-full bg-yellow-400 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 dm-text-muted">{pct}%</span>
    </div>
  );
};

export default function ProductReviews({ productId }) {
  const { user, setAuthModal } = useContext(AppCtx);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    getReviews(productId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return setFormErr('Please select a star rating');
    if (!title.trim()) return setFormErr('Please enter a title');
    if (!body.trim()) return setFormErr('Please write your review');
    setSubmitting(true);
    setFormErr('');
    try {
      const newReview = await postReview(productId, { rating, title, body });
      setData(prev => {
        const items = [newReview, ...(prev?.items || [])];
        const total = items.length;
        const avg = +(items.reduce((s, r) => s + r.rating, 0) / total).toFixed(2);
        const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        items.forEach(r => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
        return { items, avg_rating: avg, total, distribution: dist };
      });
      setRating(0); setTitle(''); setBody(''); setShowForm(false);
    } catch (err) {
      setFormErr(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="mt-10 space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="dm-card rounded-xl border dm-border p-4 animate-pulse">
          <div className="h-4 dm-surface rounded w-1/3 mb-2" />
          <div className="h-3 dm-surface rounded w-full mb-1" />
          <div className="h-3 dm-surface rounded w-3/4" />
        </div>
      ))}
    </div>
  );

  const dist = data?.distribution || {};
  const total = data?.total || 0;
  const avg = data?.avg_rating || 0;

  return (
    <div className="mt-10">
      <h2 className="font-heading text-xl font-bold dm-text mb-5">
        Customer Reviews {total > 0 && <span className="text-sm font-normal dm-text-muted">({total})</span>}
      </h2>

      {/* Rating Summary */}
      {total > 0 && (
        <div className="dm-card rounded-xl border dm-border p-5 mb-5 flex flex-col sm:flex-row gap-6 items-center">
          <div className="text-center shrink-0">
            <div className="text-5xl font-bold dm-text">{avg.toFixed(1)}</div>
            <Stars rating={avg} showCount={false} className="justify-center mt-1"/>
            <p className="text-xs dm-text-muted mt-1">{total} review{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 w-full space-y-1.5">
            {[5, 4, 3, 2, 1].map(s => (
              <RatingBar key={s} star={s} count={dist[s] || 0} total={total} />
            ))}
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {!showForm && (
        <button
          onClick={() => user ? setShowForm(true) : setAuthModal('login')}
          className="mb-5 px-5 py-2.5 border-2 border-accent text-accent font-semibold rounded-xl text-sm btn-press hover:bg-accent hover:text-white transition-all"
        >
          ✏️ Write a Review
        </button>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="dm-card rounded-xl border dm-border p-5 mb-5">
          <h3 className="font-semibold dm-text mb-3">Your Review</h3>
          <StarPicker value={rating} onChange={setRating} />
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium dm-text-muted block mb-1">Title</label>
              <input
                value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Summarize your experience" maxLength={100}
                className="w-full px-3 py-2 border dm-border rounded-lg text-sm dm-input"
              />
            </div>
            <div>
              <label className="text-xs font-medium dm-text-muted block mb-1">Review</label>
              <textarea
                value={body} onChange={e => setBody(e.target.value)}
                placeholder="Share the details of your experience..." maxLength={1000} rows={4}
                className="w-full px-3 py-2 border dm-border rounded-lg text-sm dm-input resize-none"
              />
              <p className="text-right text-xs dm-text-muted mt-0.5">{body.length}/1000</p>
            </div>
          </div>
          {formErr && <p className="text-sm text-red-500 mt-2">⚠️ {formErr}</p>}
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={submitting}
              className="px-5 py-2 bg-accent text-white font-semibold rounded-lg text-sm btn-press disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setFormErr(''); }}
              className="px-5 py-2 border dm-border dm-text-muted font-semibold rounded-lg text-sm btn-press">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {total === 0 ? (
        <div className="text-center py-10 dm-card rounded-xl border dm-border">
          <p className="text-4xl mb-2">💬</p>
          <p className="font-semibold dm-text">No reviews yet</p>
          <p className="text-sm dm-text-muted mt-1">Be the first to review this product</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map(r => (
            <div key={r.id} className="dm-card rounded-xl border dm-border p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold">
                    {r.reviewer_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold dm-text">{r.reviewer_name}</span>
                      {r.is_verified_purchase && (
                        <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓ Verified</span>
                      )}
                    </div>
                    <p className="text-xs dm-text-muted">{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <Stars rating={r.rating} showCount={false} />
              </div>
              <p className="text-sm font-semibold dm-text mb-1">{r.title}</p>
              <p className="text-sm dm-text-muted leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
