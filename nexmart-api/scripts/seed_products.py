"""
Product seeder — run from the nexmart-api directory:
    python scripts/seed_products.py
"""
import asyncio
import os
import sys

import httpx

# Windows consoles default to cp1252, which can't print the emoji used below.
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

BASE = os.environ.get("NEXMART_API_URL", "http://localhost:8001") + "/api/v1"
ADMIN_EMAIL = os.environ.get("NEXMART_ADMIN_EMAIL", "admin@nexmart.com")
ADMIN_PASSWORD = os.environ.get("NEXMART_ADMIN_PASSWORD", "")

if not ADMIN_PASSWORD:
    print("Set NEXMART_ADMIN_PASSWORD (and optionally NEXMART_ADMIN_EMAIL / NEXMART_API_URL) before seeding.")
    sys.exit(1)

PRODUCTS = [
    # ── Electronics ───────────────────────────────────────────────────────────
    {
        "name": "MacBook Pro 16\" M3 Max",
        "description": "Apple's most powerful laptop with the M3 Max chip delivers exceptional performance for pro workflows. The Liquid Retina XDR display with 120Hz ProMotion makes every pixel stunning. Perfect for video editing, 3D rendering, and software development.",
        "price": 2499.99, "original_price": 2799.99, "stock": 45,
        "category": "Electronics", "brand": "Apple",
        "images": ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
                   "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80"],
        "tags": ["Best Seller", "Hot Deal", "color:Space Gray", "color:Silver"],
        "rating": 4.9, "review_count": 312,
    },
    {
        "name": "iPhone 15 Pro Max",
        "description": "The iPhone 15 Pro Max features a titanium design and the powerful A17 Pro chip. The 48MP main camera with 5x optical zoom captures stunning photos in any lighting. USB-C with USB 3 speeds makes data transfer lightning fast.",
        "price": 1199.99, "original_price": None, "stock": 120,
        "category": "Electronics", "brand": "Apple",
        "images": ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
                   "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80"],
        "tags": ["New Arrival", "Trending", "color:Natural Titanium", "color:Black Titanium", "color:White Titanium"],
        "rating": 4.8, "review_count": 541,
    },
    {
        "name": "Sony WH-1000XM5 Headphones",
        "description": "Industry-leading noise cancellation with eight microphones and two processors eliminates noise for extraordinary listening. Up to 30-hour battery life with quick charging gets you 3 hours of playback in just 3 minutes. The lightweight design with soft fit leather provides all-day comfort.",
        "price": 279.99, "original_price": 349.99, "stock": 88,
        "category": "Electronics", "brand": "Sony",
        "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
                   "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80"],
        "tags": ["Best Seller", "Hot Deal", "color:Black", "color:Silver"],
        "rating": 4.7, "review_count": 892,
    },
    {
        "name": "Samsung 65\" 4K OLED TV",
        "description": "Experience cinema-quality visuals with Samsung's S95C OLED panel featuring self-lit pixels for perfect blacks. The Neural Quantum Processor 4K uses AI upscaling to make every scene look its best. Dolby Atmos and Object Tracking Sound+ create an immersive surround experience.",
        "price": 1499.99, "original_price": 1999.99, "stock": 22,
        "category": "Electronics", "brand": "Samsung",
        "images": ["https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=800&q=80",
                   "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80"],
        "tags": ["Hot Deal", "Sale"],
        "rating": 4.6, "review_count": 178,
    },
    # ── Clothing ──────────────────────────────────────────────────────────────
    {
        "name": "Nike Air Max 90",
        "description": "The iconic Air Max 90 stays true to its OG running roots with the iconic Waffle outsole, stitched overlays, and classic TPU details. Nike Air cushioning adds comfort to your journey as you move through the day. A timeless silhouette that pairs with everything.",
        "price": 109.99, "original_price": 139.99, "stock": 210,
        "category": "Clothing", "brand": "Nike",
        "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
                   "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80"],
        "tags": ["Best Seller", "Hot Deal", "color:White", "color:Black", "color:Red",
                 "size:US 7", "size:US 8", "size:US 9", "size:US 10", "size:US 11"],
        "rating": 4.6, "review_count": 1204,
    },
    {
        "name": "Levi's 501 Original Jeans",
        "description": "The original jean since 1873. The 501 Original is the jean that started it all — a straight leg that sits at the waist with a button fly. Made from heavyweight denim that gets better with age, these jeans are built to last a lifetime.",
        "price": 79.99, "original_price": None, "stock": 350,
        "category": "Clothing", "brand": "Levi's",
        "images": ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
                   "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&q=80"],
        "tags": ["Best Seller", "color:Dark Wash", "color:Light Wash", "color:Black",
                 "size:28", "size:30", "size:32", "size:34", "size:36"],
        "rating": 4.5, "review_count": 2341,
    },
    {
        "name": "Patagonia Better Sweater Fleece",
        "description": "A cozy fleece jacket with a sweater-like appearance made from 100% recycled polyester. The Patagonia Better Sweater features a full-zip design with a shawl collar and zippered hand pockets. Fair Trade Certified sewn, it's good for you and good for the planet.",
        "price": 119.00, "original_price": 149.00, "stock": 95,
        "category": "Clothing", "brand": "Patagonia",
        "images": ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
                   "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80"],
        "tags": ["Sale", "color:Navy", "color:Black", "color:Forest Green",
                 "size:XS", "size:S", "size:M", "size:L", "size:XL"],
        "rating": 4.8, "review_count": 567,
    },
    {
        "name": "Ray-Ban Aviator Classic",
        "description": "An American icon worn by military pilots since 1937, the Aviator Classic features teardrop-shaped lenses in a lightweight metal frame. Crystal lenses provide unparalleled optical clarity and 100% UV protection. Timeless style that complements every face shape.",
        "price": 163.00, "original_price": None, "stock": 145,
        "category": "Clothing", "brand": "Ray-Ban",
        "images": ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
                   "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80"],
        "tags": ["Trending", "color:Gold", "color:Silver", "color:Gunmetal"],
        "rating": 4.7, "review_count": 423,
    },
    # ── Furniture ─────────────────────────────────────────────────────────────
    {
        "name": "Herman Miller Aeron Chair",
        "description": "The Aeron Chair redefined ergonomic seating with its PostureFit SL back support and 8Z Pellicle suspension. Three sizes fit a vast range of body types and work styles. Tilt limiter and seat angle allow you to calibrate recline for different tasks throughout the day.",
        "price": 1395.00, "original_price": 1695.00, "stock": 18,
        "category": "Furniture", "brand": "Herman Miller",
        "images": ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
                   "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"],
        "tags": ["Best Seller", "Hot Deal", "color:Graphite", "color:Black"],
        "rating": 4.9, "review_count": 731,
    },
    {
        "name": "IKEA KALLAX Shelf Unit",
        "description": "A versatile shelf unit that works as a room divider, storage solution, or display case. The 4x4 grid design fits 13\" vinyl records perfectly. Compatible with a wide range of KALLAX inserts for customizable storage.",
        "price": 119.99, "original_price": None, "stock": 67,
        "category": "Furniture", "brand": "IKEA",
        "images": ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
                   "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80"],
        "tags": ["color:White", "color:Black-Brown", "color:Oak Effect"],
        "rating": 4.4, "review_count": 3210,
    },
    {
        "name": "Casper Original Foam Mattress",
        "description": "Casper's best-selling mattress features four layers of premium foam engineered for cool, comfortable sleep. Zoned Support gently cradles your hips while firming up under your back. The breathable cover wicks away heat so you sleep cool all night.",
        "price": 895.00, "original_price": 1095.00, "stock": 40,
        "category": "Furniture", "brand": "Casper",
        "images": ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
                   "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80"],
        "tags": ["Best Seller", "Sale"],
        "rating": 4.6, "review_count": 892,
    },
    # ── Sports ────────────────────────────────────────────────────────────────
    {
        "name": "Wilson Pro Staff 97 Tennis Racket",
        "description": "The Pro Staff 97 is a player's racket for serious competitors demanding precision and feel. The Braided Graphite construction delivers exceptional feel and stability on every shot. Used by legends of the game, this is where performance meets craftsmanship.",
        "price": 229.00, "original_price": 269.00, "stock": 55,
        "category": "Sports", "brand": "Wilson",
        "images": ["https://images.unsplash.com/photo-1617083934555-ac7d4fee8909?w=800&q=80",
                   "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80"],
        "tags": ["Hot Deal", "color:Black"],
        "rating": 4.7, "review_count": 312,
    },
    {
        "name": "Yeti Rambler 36oz Bottle",
        "description": "The YETI Rambler 36 oz Bottle is built for serious hydration. The double-wall vacuum insulation keeps drinks cold for 24 hours or hot for 12. The 18/8 stainless steel construction won't pick up flavors and resists dents and rust.",
        "price": 50.00, "original_price": None, "stock": 320,
        "category": "Sports", "brand": "Yeti",
        "images": ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
                   "https://images.unsplash.com/photo-1575377222312-dd1a63a51638?w=800&q=80"],
        "tags": ["Best Seller", "color:White", "color:Navy", "color:Black", "color:Seafoam"],
        "rating": 4.8, "review_count": 2156,
    },
    {
        "name": "Garmin Fenix 7X Pro Sapphire",
        "description": "A rugged GPS smartwatch built for serious athletes and outdoor adventurers. Solar charging extends battery life up to 37 days in smartwatch mode. Advanced training metrics including HRV status and training readiness help you perform at your best.",
        "price": 749.99, "original_price": 899.99, "stock": 33,
        "category": "Sports", "brand": "Garmin",
        "images": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
                   "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=80"],
        "tags": ["Hot Deal", "Sale", "color:Carbon Gray", "color:Silver"],
        "rating": 4.8, "review_count": 478,
    },
    # ── Books ─────────────────────────────────────────────────────────────────
    {
        "name": "Atomic Habits",
        "description": "James Clear's #1 New York Times bestseller reveals how tiny changes can produce remarkable results. Learn the proven framework for improving every day by just 1%. Over 15 million copies sold worldwide.",
        "price": 14.99, "original_price": 18.99, "stock": 500,
        "category": "Books", "brand": "Avery",
        "images": ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
                   "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80"],
        "tags": ["Best Seller", "Trending"],
        "rating": 4.9, "review_count": 8921,
    },
    {
        "name": "Dune (Illustrated Edition)",
        "description": "Frank Herbert's masterpiece of science fiction comes to life in this stunning illustrated edition featuring original artwork by Sam Weber. The epic story of Paul Atreides and his destiny on the desert planet Arrakis has never looked more magnificent.",
        "price": 34.99, "original_price": None, "stock": 180,
        "category": "Books", "brand": "Ace Books",
        "images": ["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
                   "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80"],
        "tags": ["New Arrival", "Trending"],
        "rating": 4.8, "review_count": 1243,
    },
    {
        "name": "Clean Code by Robert Martin",
        "description": "A Handbook of Agile Software Craftsmanship. In this book Robert C. Martin presents a revolutionary paradigm with Clean Code, a handbook of agile software craftsmanship. You will learn the principles, patterns, practices, and heuristics that make code clean.",
        "price": 39.99, "original_price": 49.99, "stock": 290,
        "category": "Books", "brand": "Pearson",
        "images": ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
                   "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80"],
        "tags": ["Best Seller"],
        "rating": 4.7, "review_count": 5632,
    },
    # ── Beauty ────────────────────────────────────────────────────────────────
    {
        "name": "Dyson Airwrap Complete",
        "description": "The Dyson Airwrap uses a phenomenon called the Coanda effect to attract and wrap hair around the barrel, with no extreme heat. Includes a full set of attachments for curling, waving, smoothing, and drying all hair types. Engineered for flyaways, frizz, and volume.",
        "price": 549.99, "original_price": 599.99, "stock": 42,
        "category": "Beauty", "brand": "Dyson",
        "images": ["https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80",
                   "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80"],
        "tags": ["Best Seller", "Hot Deal", "color:Nickel/Copper", "color:Prussian Blue"],
        "rating": 4.7, "review_count": 2134,
    },
    {
        "name": "La Mer Moisturizing Cream",
        "description": "La Mer's legendary Crème de la Mer is powered by the Miracle Broth, a fermented blend of sea kelp, vitamins, minerals, and lime tea. It deeply hydrates, repairs the look of damage, and soothes skin. Experience the transformation that has made it iconic worldwide.",
        "price": 190.00, "original_price": None, "stock": 78,
        "category": "Beauty", "brand": "La Mer",
        "images": ["https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=800&q=80",
                   "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80"],
        "tags": ["Trending", "Limited"],
        "rating": 4.6, "review_count": 892,
    },
    {
        "name": "Olaplex Hair Perfector No.3",
        "description": "Olaplex No. 3 is a weekly at-home treatment that reduces breakage and visibly strengthens hair. Works by repairing broken disulfide bonds caused by chemical, thermal, and mechanical damage. A single bottle with just one weekly use lasts 30+ treatments.",
        "price": 28.00, "original_price": 32.00, "stock": 420,
        "category": "Beauty", "brand": "Olaplex",
        "images": ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
                   "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"],
        "tags": ["Best Seller"],
        "rating": 4.8, "review_count": 7821,
    },
    # ── Kitchen ───────────────────────────────────────────────────────────────
    {
        "name": "Le Creuset 5.5Qt Dutch Oven",
        "description": "Le Creuset's iconic round Dutch oven is crafted from enameled cast iron, providing superior heat distribution and retention. The tight-fitting lid seals in moisture for perfectly moist braises and stews. Dishwasher safe and compatible with all stovetops including induction.",
        "price": 319.95, "original_price": 379.95, "stock": 65,
        "category": "Kitchen", "brand": "Le Creuset",
        "images": ["https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80",
                   "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"],
        "tags": ["Best Seller", "Hot Deal", "color:Flame", "color:Marseille", "color:Cerise"],
        "rating": 4.9, "review_count": 3421,
    },
    {
        "name": "KitchenAid Artisan Stand Mixer",
        "description": "The KitchenAid Artisan Series 5-Qt Stand Mixer is perfect for mixing, kneading, and whipping. The powerful 325-watt motor handles everything from thick cookie dough to delicate meringues. Choose from over 50 colors to match your kitchen aesthetic.",
        "price": 379.99, "original_price": 449.99, "stock": 54,
        "category": "Kitchen", "brand": "KitchenAid",
        "images": ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
                   "https://images.unsplash.com/photo-1594842328933-b2a7e6e6e4d0?w=800&q=80"],
        "tags": ["Best Seller", "Sale", "color:Empire Red", "color:Onyx Black", "color:Ice Blue"],
        "rating": 4.8, "review_count": 5123,
    },
    {
        "name": "Vitamix A3500 Ascent Blender",
        "description": "The Vitamix A3500 is the most advanced blender in the Ascent Series. Five program settings allow you to walk away while the blender optimizes blend times. Wireless connectivity allows the machine to read container sizes and adjust speeds automatically.",
        "price": 549.95, "original_price": 649.95, "stock": 36,
        "category": "Kitchen", "brand": "Vitamix",
        "images": ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80",
                   "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&q=80"],
        "tags": ["Best Seller", "Hot Deal", "color:Black", "color:White"],
        "rating": 4.8, "review_count": 1893,
    },
    {
        "name": "Nespresso Vertuo Next Coffee Maker",
        "description": "Brew a full range of cup sizes from a single machine. Centrifusion technology reads the barcode on each Nespresso capsule and automatically adjusts the brewing parameters for the perfect cup. Connects to Wi-Fi for automatic updates to your machine.",
        "price": 149.00, "original_price": 179.00, "stock": 112,
        "category": "Kitchen", "brand": "Nespresso",
        "images": ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
                   "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80"],
        "tags": ["Hot Deal", "Sale", "color:Black", "color:White"],
        "rating": 4.5, "review_count": 4312,
    },
    # ── Gaming ────────────────────────────────────────────────────────────────
    {
        "name": "PS5 DualSense Wireless Controller",
        "description": "Experience a new era of haptic feedback with the DualSense wireless controller. Adaptive triggers provide varying degrees of resistance to simulate the tension of drawing a bow or pressing the accelerator in a racing game. Built-in microphone and speaker for gaming on the go.",
        "price": 64.99, "original_price": None, "stock": 280,
        "category": "Gaming", "brand": "Sony",
        "images": ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
                   "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80"],
        "tags": ["Best Seller", "color:White", "color:Midnight Black", "color:Cosmic Red"],
        "rating": 4.8, "review_count": 6231,
    },
    {
        "name": "Razer BlackWidow V4 Pro Keyboard",
        "description": "The BlackWidow V4 Pro features Razer's finest mechanical switches with a satisfying tactile bump and audible click. The 8-zone RGB backlighting with Chroma RGB creates stunning lighting effects synced to your games. A fully programmable multi-function dial and media keys put control at your fingertips.",
        "price": 139.99, "original_price": 169.99, "stock": 67,
        "category": "Gaming", "brand": "Razer",
        "images": ["https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&q=80",
                   "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80"],
        "tags": ["Hot Deal", "color:Black"],
        "rating": 4.6, "review_count": 892,
    },
    {
        "name": "Nintendo Switch OLED Model",
        "description": "The Nintendo Switch OLED Model features a vibrant 7-inch OLED screen with vivid colors and crisp contrast for tabletop and handheld mode. The enhanced audio and a wide adjustable stand create a better experience when playing in tabletop mode.",
        "price": 329.99, "original_price": 349.99, "stock": 98,
        "category": "Gaming", "brand": "Nintendo",
        "images": ["https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&q=80",
                   "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&q=80"],
        "tags": ["Best Seller", "color:White", "color:Neon Blue/Red"],
        "rating": 4.7, "review_count": 4521,
    },
    {
        "name": "SteelSeries Arctis Nova Pro Headset",
        "description": "The Arctis Nova Pro Wireless features a multi-system hub that supports simultaneous connections to two systems, letting you switch between PC and PS5 instantly. The hot-swappable dual battery system means you never have to stop gaming to charge.",
        "price": 249.99, "original_price": 279.99, "stock": 44,
        "category": "Gaming", "brand": "SteelSeries",
        "images": ["https://images.unsplash.com/photo-1599669454699-248893623440?w=800&q=80",
                   "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80"],
        "tags": ["Hot Deal", "color:Black", "color:White"],
        "rating": 4.7, "review_count": 1123,
    },
    {
        "name": "LG 27GP950-B 4K Gaming Monitor",
        "description": "A 27-inch 4K UHD Nano IPS display with a 144Hz refresh rate and 1ms response time for smooth, responsive gaming. NVIDIA G-SYNC Compatible and AMD FreeSync Premium Pro eliminate screen tearing. DisplayHDR 600 delivers vivid HDR gaming visuals.",
        "price": 599.99, "original_price": 799.99, "stock": 28,
        "category": "Gaming", "brand": "LG",
        "images": ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
                   "https://images.unsplash.com/photo-1593640408182-31c228b63b50?w=800&q=80"],
        "tags": ["Hot Deal", "Sale", "Limited"],
        "rating": 4.8, "review_count": 678,
    },
    {
        "name": "Logitech MX Master 3S Mouse",
        "description": "The MX Master 3S features an 8K DPI sensor that tracks on glass and an ultra-fast MagSpeed scroll wheel that can scroll 1,000 lines per second. Connect to up to 3 devices and switch between them with one click. The ergonomic shape provides all-day comfort.",
        "price": 94.99, "original_price": 109.99, "stock": 156,
        "category": "Gaming", "brand": "Logitech",
        "images": ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
                   "https://images.unsplash.com/photo-1563297007-0686b7370c56?w=800&q=80"],
        "tags": ["Best Seller", "Hot Deal", "color:Black", "color:Pale Gray"],
        "rating": 4.9, "review_count": 3892,
    },
]


async def get_or_create_admin(client: httpx.AsyncClient) -> str:
    """Login as admin, creating the account if it doesn't exist. Returns access token."""
    # Try login first
    r = await client.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code == 200:
        print("✓ Logged in as existing admin")
        return r.json()["access_token"]

    # Register a new account
    print("  Admin account not found — creating...")
    r = await client.post("/auth/register", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
        "first_name": "Admin",
        "last_name": "Nexmart",
    })
    if r.status_code not in (200, 201):
        print(f"✗ Failed to create admin: {r.text}")
        sys.exit(1)

    token = r.json()["access_token"]
    print("✓ Admin account created — please manually set is_admin=TRUE in the database:")
    print(f"  UPDATE users SET is_admin = true WHERE email = '{ADMIN_EMAIL}';")
    return token


def _ssl_context():
    """Verify TLS using the OS trust store when available.

    Some Windows machines run TLS-inspecting antivirus whose root CA is in the
    system store but not in certifi, which would otherwise fail verification.
    """
    try:
        import ssl

        import truststore

        return truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    except ImportError:
        return True


async def seed():
    print("\n🌱  NEXMART Product Seeder")
    print("=" * 50)
    print(f"   Target: {BASE}")

    async with httpx.AsyncClient(base_url=BASE, timeout=60, verify=_ssl_context()) as client:
        token = await get_or_create_admin(client)
        headers = {"Authorization": f"Bearer {token}"}

        # Check if products already exist
        r = await client.get("/products/?limit=1")
        if r.status_code == 200 and r.json().get("total", 0) > 0:
            existing = r.json()["total"]
            print(f"\n⚠  Database already has {existing} products.")
            answer = input("   Continue seeding anyway? [y/N] ").strip().lower()
            if answer != "y":
                print("Aborted.")
                return

        print(f"\n📦  Seeding {len(PRODUCTS)} products...\n")
        created = 0
        skipped = 0

        for p in PRODUCTS:
            payload = {
                "name": p["name"],
                "description": p["description"],
                "price": p["price"],
                "original_price": p.get("original_price"),
                "stock": p["stock"],
                "category": p["category"],
                "brand": p["brand"],
                "images": p["images"],
                "tags": p["tags"],
                "rating": p.get("rating", 0),
                "review_count": p.get("review_count", 0),
                "is_active": True,
            }
            r = await client.post("/products/", json=payload, headers=headers)
            if r.status_code == 201:
                name = r.json()["name"]
                price = f"${p['price']:.2f}"
                orig = f" (was ${p['original_price']:.2f})" if p.get("original_price") else ""
                print(f"  ✓  {name:<45} {price}{orig}  [{p['category']}]")
                created += 1
            elif r.status_code == 409:
                print(f"  ⚠  Skipped (already exists): {p['name']}")
                skipped += 1
            else:
                print(f"  ✗  Failed: {p['name']} — {r.status_code} {r.text[:80]}")

        print(f"\n{'=' * 50}")
        print(f"🎉  Done! Created: {created}  Skipped: {skipped}  Total: {len(PRODUCTS)}")


if __name__ == "__main__":
    asyncio.run(seed())
