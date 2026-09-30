export default function Footer() {
  return (
    <footer className="nm-footer">
      <div className="nm-footer-grid">
        <div>
          <a href="#/" className="nm-header-logo" aria-label="NexMart home"><span className="nm-header-mark">N</span><span>nexmart</span></a>
          <p>Good things, all in one place. Discover a considered collection across technology, style, home and more.</p>
        </div>
        <div><h3>DISCOVER</h3><nav aria-label="Discover"><a href="#/shop">Shop all</a><a href="#/wishlist">Wishlist</a><a href="#/compare">Compare products</a><a href="#/rewards">Rewards</a></nav></div>
        <div><h3>YOUR ACCOUNT</h3><nav aria-label="Your account"><a href="#/account">Account</a><a href="#/cart">Cart</a><a href="#/track">Track order</a></nav></div>
        <div><h3>EXPLORE MORE</h3><nav aria-label="More collections"><a href="#/shop?category=Electronics">Electronics</a><a href="#/shop?category=Clothing">Clothing</a><a href="#/shop?category=Furniture">Furniture</a><a href="#/shop?category=Beauty">Beauty</a></nav></div>
      </div>
      <div className="nm-footer-bottom"><span>© {new Date().getFullYear()} NexMart</span><span>Portfolio demonstration. Products and checkout are illustrative.</span></div>
    </footer>
  );
}
