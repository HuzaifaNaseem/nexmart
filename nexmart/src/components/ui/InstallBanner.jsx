export default function InstallBanner({ show, onInstall, onDismiss }) {
  if (!show) return null;
  return (
    <div className="install-banner" role="banner">
      <div className="install-banner-text">
        <h4>📱 Install NEXMART</h4>
        <p>Add to your home screen for the best experience</p>
      </div>
      <button className="install-banner-btn" onClick={onInstall}
        aria-label="Install NEXMART app">
        Install App
      </button>
      <button className="install-banner-close" onClick={onDismiss}
        aria-label="Dismiss install banner">
        ×
      </button>
    </div>
  );
}
