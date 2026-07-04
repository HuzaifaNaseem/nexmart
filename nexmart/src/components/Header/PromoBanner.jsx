export default function PromoBanner(){
  return(
    <div className="bg-gradient-to-r from-accent via-orange-600 to-accent2 text-white py-2 overflow-hidden">
      <div className="marquee-track whitespace-nowrap">
        {[1,2].map(k=>(
          <span key={k} className="inline-block mx-8 text-xs sm:text-sm font-medium">
            🚚 FREE SHIPPING on orders over $50 &nbsp;·&nbsp; 🔄 30-Day Returns &nbsp;·&nbsp; 💬 24/7 Support &nbsp;·&nbsp; 🔒 Secure Payment &nbsp;·&nbsp; ⭐ 50,000+ Happy Customers &nbsp;·&nbsp; 🎁 New Arrivals Every Week &nbsp;·&nbsp;
            🚚 FREE SHIPPING on orders over $50 &nbsp;·&nbsp; 🔄 30-Day Returns &nbsp;·&nbsp; 💬 24/7 Support &nbsp;·&nbsp; 🔒 Secure Payment &nbsp;·&nbsp; ⭐ 50,000+ Happy Customers &nbsp;·&nbsp; 🎁 New Arrivals Every Week &nbsp;·&nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}
