import { useEffect, useRef, useState } from 'react';
import './storeIntro.css';
import BrandLogo, { BrandMark } from './BrandLogo';

const INTRO_KEY = 'nexmart-opening-seen-v1';
const INTRO_DURATION = 3300;
const EXIT_DURATION = 760;

function shouldPlayIntro() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return window.sessionStorage.getItem(INTRO_KEY) !== '1';
  } catch {
    return true;
  }
}

/**
 * A one-time, skippable opening for the storefront. It is an introduction,
 * not a loading gate: the real page renders behind it while it plays.
 */
export default function StoreIntro() {
  const [visible, setVisible] = useState(shouldPlayIntro);
  const [leaving, setLeaving] = useState(false);
  const skipRef = useRef(null);
  const closingRef = useRef(false);
  const exitTimerRef = useRef(null);

  const finish = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setLeaving(true);
    try { window.sessionStorage.setItem(INTRO_KEY, '1'); } catch { /* storage may be disabled */ }
    exitTimerRef.current = window.setTimeout(() => setVisible(false), EXIT_DURATION);
  };

  useEffect(() => {
    if (!visible) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    skipRef.current?.focus({ preventScroll: true });

    // Keep keyboard focus inside the short-lived modal even though the shop
    // itself is already mounted behind it.
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        finish();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        skipRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    const introTimer = window.setTimeout(finish, INTRO_DURATION);

    return () => {
      window.clearTimeout(introTimer);
      window.clearTimeout(exitTimerRef.current);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected && previousFocus !== document.body) {
        previousFocus.focus({ preventScroll: true });
      } else {
        document.getElementById('main-content')?.focus({ preventScroll: true });
      }
    };
    // This effect represents one complete intro lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`nm-intro${leaving ? ' nm-intro--leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="NexMart opening experience"
    >
      <div className="nm-intro__grain" aria-hidden="true" />
      <div className="nm-intro__aura nm-intro__aura--one" aria-hidden="true" />
      <div className="nm-intro__aura nm-intro__aura--two" aria-hidden="true" />

      <div className="nm-intro__topline">
        <div className="nm-intro__eyebrow"><span className="nm-intro__eyebrow-line" /> A NEW WAY TO DISCOVER</div>
        <button className="nm-intro__skip" type="button" ref={skipRef} onClick={finish}>
          Skip intro <span aria-hidden="true">↗</span>
        </button>
      </div>

      <div className="nm-intro__world" aria-hidden="true">
        <div className="nm-intro__orbit nm-intro__orbit--outer" />
        <div className="nm-intro__orbit nm-intro__orbit--inner" />
        <div className="nm-intro__halo" />
        <div className="nm-intro__scene">
          <div className="nm-intro__card nm-intro__card--left">
            <img src="/editorial/style.jpg" alt="" />
            <div className="nm-intro__card-caption"><span>01 / STYLE</span><span>CURATED FOR YOU</span></div>
          </div>
          <div className="nm-intro__card nm-intro__card--right">
            <img src="/editorial/technology.jpg" alt="" />
            <div className="nm-intro__card-caption"><span>03 / TECH</span><span>WHAT'S NEXT</span></div>
          </div>
          <div className="nm-intro__card nm-intro__card--front">
            <img src="/editorial/living.jpg" alt="" />
            <div className="nm-intro__card-caption"><span>02 / LIVING</span><span>YOUR SPACE, REIMAGINED</span></div>
          </div>
          <div className="nm-intro__monogram"><BrandMark /></div>
        </div>
      </div>

      <div className="nm-intro__copy">
        <div className="nm-intro__number" aria-hidden="true">N° 001 — THE NEW COLLECTION</div>
        <h1>Find your <em>next</em> thing.</h1>
        <div className="nm-intro__bottomline">
          <p>Objects of desire. Everyday discoveries.<br />All in one extraordinary place.</p>
          <div className="nm-intro__brand" aria-label="NexMart">
            <BrandLogo className="nm-brand--inverse" />
          </div>
        </div>
      </div>

      <div className="nm-intro__progress" aria-hidden="true"><span /></div>
    </div>
  );
}
