// VASKY product catalog — server-side source of truth.
// Prices/stock here are authoritative; checkout re-validates against this file.
const SIZES_MEN = ["40", "41", "42", "43", "44", "45", "46"];
const SIZES_WOMEN = ["36", "37", "38", "39", "40", "41", "42"];
const SIZES_KIDS = ["28", "29", "30", "31", "32", "33", "34", "35"];

// Deterministic pseudo-stock so every server restart agrees.
function stockFor(id, size) {
  let h = 0;
  const s = id + ":" + size;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  if (h % 13 === 0) return 0; // a few sizes sold out
  return 3 + (h % 9); // 3..11 pairs
}

// Real product photography (Unsplash CDN, verified live).
// `art` remains as an instant fallback if a photo ever fails to load.
const IMG = {
  "vsk-001": "photo-1608231387042-66d1773070a5",
  "vsk-002": "photo-1491553895911-0055eca6402d",
  "vsk-003": "photo-1549298916-b41d501d3772",
  "vsk-004": "photo-1514989940723-e8e51635b782",
  "vsk-005": "photo-1525966222134-fcfa99b8ae77",
  "vsk-006": "photo-1552346154-21d32810aba3",
  "vsk-007": "photo-1560769629-975ec94e6a86",
  "vsk-008": "photo-1512374382149-233c42b6a83b",
  "vsk-009": "photo-1542291026-7eec264c27ff",
  "vsk-010": "photo-1600185365483-26d7a4cc7519",
  "vsk-011": "photo-1449505278894-297fdb3edbc1",
  "vsk-012": "photo-1584735175315-9d5df23860e6",
  "vsk-013": "photo-1606107557195-0e29a4b5b4aa",
  "vsk-014": "photo-1539185441755-769473a23570",
  "vsk-015": "photo-1543163521-1bf539c55dd2",
  "vsk-016": "photo-1605348532760-6753d2c43329",
  "vsk-017": "photo-1579338559194-a162d19bf842",
  "vsk-018": "photo-1465453869711-7e174808ace9",
  "vsk-019": "photo-1562183241-b937e95585b6",
  "vsk-020": "photo-1608667508764-33cf0726b13a",
  "vsk-021": "photo-1595950653106-6c9ebd614d3a",
  "vsk-022": "photo-1605348532760-6753d2c43329",
  "vsk-023": "photo-1603808033192-082d6919d3e1",
  "vsk-024": "photo-1595341888016-a392ef81b7de",
};

function mk(p) {
  const stock = {};
  p.sizes.forEach((s) => { stock[s] = stockFor(p.id, s); });
  const img = "https://images.unsplash.com/" + IMG[p.id] + "?w=900&q=80&auto=format&fit=crop";
  return { rating: 4.2, reviews: 18, ...p, stock, img };
}

export const products = [
  mk({ id: "vsk-001", slug: "classic-leather-sneaker", name: "Classic Leather Sneaker", brand: "Vasky", price: 49, category: "women", sizes: SIZES_WOMEN, colors: [{ name: "Cloud White", hex: "#f2f2f5" }, { name: "Sand", hex: "#d8c39a" }], tags: ["new", "popular"], description: "A clean everyday sneaker with a soft, easy-wear feel and cushioned insole.", keywords: "leather white casual everyday", art: { style: "court", c1: "#f2f2f5", c2: "#2E2D88" } }),
  mk({ id: "vsk-002", slug: "urban-comfort-sneaker", name: "Urban Comfort Sneaker", brand: "Stride", price: 55, oldPrice: 65, category: "men", sizes: SIZES_MEN, colors: [{ name: "Midnight Blue", hex: "#23235e" }, { name: "Stone", hex: "#9a9a92" }], tags: ["sale", "bestseller"], description: "A lightweight style made for busy city days, with breathable knit.", keywords: "knit city lightweight sale", art: { style: "runner", c1: "#23235e", c2: "#7c7bd0" } }),
  mk({ id: "vsk-003", slug: "everyday-runner", name: "Everyday Runner", brand: "Vasky", price: 45, category: "women", sizes: SIZES_WOMEN, colors: [{ name: "Soft Sand", hex: "#e3cfae" }, { name: "Rose", hex: "#d9a0a8" }], tags: ["popular"], description: "Flexible comfort for the pace of everyday life.", keywords: "running flex sport", art: { style: "runner", c1: "#e3cfae", c2: "#b3543f" } }),
  mk({ id: "vsk-004", slug: "essential-casual-shoe", name: "Essential Casual Shoe", brand: "Court Classic", price: 52, category: "men", sizes: SIZES_MEN, colors: [{ name: "Stone", hex: "#9a9a92" }], tags: ["new"], description: "An understated, dependable shoe that works with everything.", keywords: "casual minimal", art: { style: "court", c1: "#9a9a92", c2: "#33334d" } }),
  mk({ id: "vsk-005", slug: "mini-comfort-sneaker", name: "Mini Comfort Sneaker", brand: "Vasky", price: 35, category: "kids", sizes: SIZES_KIDS, colors: [{ name: "Sky Blue", hex: "#8fc3e8" }, { name: "Lime", hex: "#b8d94e" }], tags: ["popular"], description: "Built for playground adventures and all-day movement.", keywords: "kids playground school", art: { style: "kids", c1: "#8fc3e8", c2: "#2E2D88" } }),
  mk({ id: "vsk-006", slug: "classic-city-sneaker", name: "Classic City Sneaker", brand: "Vasky", price: 59, oldPrice: 69, category: "women", sizes: SIZES_WOMEN, colors: [{ name: "Pearl", hex: "#efe9df" }], tags: ["sale"], description: "A streamlined sneaker with a polished city finish.", keywords: "city pearl sale", art: { style: "court", c1: "#efe9df", c2: "#8a6f4d" } }),
  mk({ id: "vsk-007", slug: "street-flex", name: "Street Flex", brand: "Stride", price: 48, category: "men", sizes: SIZES_MEN, colors: [{ name: "Deep Navy", hex: "#1d2a4a" }, { name: "Red", hex: "#c0392b" }], tags: ["bestseller"], description: "Relaxed street styling, designed to keep up.", keywords: "street skate", art: { style: "skate", c1: "#1d2a4a", c2: "#c0392b" } }),
  mk({ id: "vsk-008", slug: "daily-step", name: "Daily Step", brand: "Vasky", price: 32, category: "kids", sizes: SIZES_KIDS, colors: [{ name: "Lavender", hex: "#c3aee0" }], tags: ["new"], description: "Easy, cheerful comfort for little everyday steps.", keywords: "kids velcro easy", art: { style: "kids", c1: "#c3aee0", c2: "#5b4a8a" } }),
  mk({ id: "vsk-009", slug: "air-motion-runner", name: "Air Motion Runner", brand: "AirMotion", price: 89, oldPrice: 110, category: "men", sizes: SIZES_MEN, colors: [{ name: "Black/Volt", hex: "#222222" }, { name: "Grey Fog", hex: "#b9bec7" }], tags: ["sale", "popular", "bestseller"], description: "Responsive foam and air cushioning for daily miles.", keywords: "running air marathon performance", rating: 4.8, reviews: 214, art: { style: "runner", c1: "#222222", c2: "#c8e03a" } }),
  mk({ id: "vsk-010", slug: "court-heritage-low", name: "Court Heritage Low", brand: "Court Classic", price: 64, category: "women", sizes: SIZES_WOMEN, colors: [{ name: "White/Gum", hex: "#f5f3ec" }], tags: ["bestseller"], description: "A timeless court profile with premium leather and gum sole.", keywords: "tennis heritage retro", rating: 4.7, reviews: 156, art: { style: "court", c1: "#f5f3ec", c2: "#a5712f" } }),
  mk({ id: "vsk-011", slug: "trail-fox-gtx", name: "Trail Fox GTX", brand: "TrailFox", price: 99, category: "men", sizes: SIZES_MEN, colors: [{ name: "Forest", hex: "#2f4a3a" }, { name: "Ember", hex: "#c25a2b" }], tags: ["new"], description: "Water-resistant trail shoe with grippy lugs for weekend escapes.", keywords: "trail hiking outdoor waterproof", rating: 4.6, reviews: 89, art: { style: "trail", c1: "#2f4a3a", c2: "#c25a2b" } }),
  mk({ id: "vsk-012", slug: "cloud-slip-on", name: "Cloud Slip-On", brand: "Vasky", price: 39, category: "women", sizes: SIZES_WOMEN, colors: [{ name: "Oat", hex: "#ddd2bd" }, { name: "Black", hex: "#26262b" }], tags: ["popular"], description: "Slide in and go. Ultra-soft knit slip-on for home and street.", keywords: "slipon easy knit", art: { style: "slipon", c1: "#ddd2bd", c2: "#8a7a5e" } }),
  mk({ id: "vsk-013", slug: "junior-court-star", name: "Junior Court Star", brand: "Court Classic", price: 42, oldPrice: 50, category: "kids", sizes: SIZES_KIDS, colors: [{ name: "White/Red", hex: "#f5f5f5" }], tags: ["sale"], description: "Mini version of the classic court shoe, with easy straps.", keywords: "kids court straps sale", art: { style: "kids", c1: "#f5f5f5", c2: "#c0392b" } }),
  mk({ id: "vsk-014", slug: "marathon-elite", name: "Marathon Elite", brand: "AirMotion", price: 129, category: "men", sizes: SIZES_MEN, colors: [{ name: "Cobalt", hex: "#2743b0" }], tags: ["new", "popular"], description: "Carbon-plated racer for personal bests.", keywords: "marathon carbon race performance", rating: 4.9, reviews: 67, art: { style: "runner", c1: "#2743b0", c2: "#9fd4ff" } }),
  mk({ id: "vsk-015", slug: "rose-knit-trainer", name: "Rose Knit Trainer", brand: "Stride", price: 58, category: "women", sizes: SIZES_WOMEN, colors: [{ name: "Rose", hex: "#d9a0a8" }, { name: "Cream", hex: "#f0e6d6" }], tags: ["new"], description: "Featherlight knit trainer in soft seasonal tones.", keywords: "knit gym training", art: { style: "runner", c1: "#d9a0a8", c2: "#f0e6d6" } }),
  mk({ id: "vsk-016", slug: "skate-park-pro", name: "Skate Park Pro", brand: "Stride", price: 62, oldPrice: 75, category: "men", sizes: SIZES_MEN, colors: [{ name: "Washed Black", hex: "#33333a" }], tags: ["sale"], description: "Double-wrapped ollie pads and vulc sole for board feel.", keywords: "skate vulc", art: { style: "skate", c1: "#33333a", c2: "#e0e0e0" } }),
  mk({ id: "vsk-017", slug: "playground-sprint", name: "Playground Sprint", brand: "AirMotion", price: 44, category: "kids", sizes: SIZES_KIDS, colors: [{ name: "Volt Pop", hex: "#c8e03a" }, { name: "Navy", hex: "#23235e" }], tags: ["bestseller"], description: "Bouncy foam and tough toe caps for full-speed play.", keywords: "kids sport run school", rating: 4.5, reviews: 98, art: { style: "kids", c1: "#c8e03a", c2: "#23235e" } }),
  mk({ id: "vsk-018", slug: "desert-chukka", name: "Desert Chukka", brand: "Court Classic", price: 72, category: "men", sizes: SIZES_MEN, colors: [{ name: "Sand Suede", hex: "#c9a876" }], tags: [], description: "Soft suede chukka boot for smart-casual days.", keywords: "boot suede smart", art: { style: "boot", c1: "#c9a876", c2: "#5e4326" } }),
  mk({ id: "vsk-019", slug: "ballet-flex-flat", name: "Ballet Flex Flat", brand: "Vasky", price: 36, category: "women", sizes: SIZES_WOMEN, colors: [{ name: "Blush", hex: "#e8b8b0" }, { name: "Black", hex: "#26262b" }], tags: [], description: "Foldable ballet flat with flex groove sole.", keywords: "flat ballet office", art: { style: "flat", c1: "#e8b8b0", c2: "#8a4a44" } }),
  mk({ id: "vsk-020", slug: "winter-grip-boot", name: "Winter Grip Boot", brand: "TrailFox", price: 95, oldPrice: 115, category: "women", sizes: SIZES_WOMEN, colors: [{ name: "Chestnut", hex: "#7a4a2b" }], tags: ["sale"], description: "Insulated, waterproof boot with winter traction.", keywords: "winter boot waterproof snow sale", art: { style: "boot", c1: "#7a4a2b", c2: "#2b1d12" } }),
  mk({ id: "vsk-021", slug: "hoops-legacy-mid", name: "Hoops Legacy Mid", brand: "Court Classic", price: 78, category: "men", sizes: SIZES_MEN, colors: [{ name: "Royal", hex: "#2b3fa0" }, { name: "Bred", hex: "#1a1a1a" }], tags: ["popular", "bestseller"], description: "Retro basketball mid with cushioned collar.", keywords: "basketball retro high", rating: 4.7, reviews: 183, art: { style: "hightop", c1: "#2b3fa0", c2: "#d0d4ea" } }),
  mk({ id: "vsk-022", slug: "tiny-first-walker", name: "Tiny First Walker", brand: "Vasky", price: 28, category: "kids", sizes: ["24", "25", "26", "27"], colors: [{ name: "Mint", hex: "#a8d8c8" }], tags: ["new"], description: "Super-soft first walker with flexible sole.", keywords: "toddler first baby", art: { style: "kids", c1: "#a8d8c8", c2: "#4a8a7a" } }),
  mk({ id: "vsk-023", slug: "office-oxford", name: "Office Oxford", brand: "Court Classic", price: 84, category: "men", sizes: SIZES_MEN, colors: [{ name: "Cognac", hex: "#8a4f2b" }, { name: "Black", hex: "#1c1c20" }], tags: [], description: "Polished oxford with cushioned workday insole.", keywords: "formal office leather", art: { style: "formal", c1: "#8a4f2b", c2: "#3a2415" } }),
  mk({ id: "vsk-024", slug: "summer-slide", name: "Summer Slide", brand: "Vasky", price: 24, oldPrice: 30, category: "women", sizes: SIZES_WOMEN, colors: [{ name: "Lilac", hex: "#c3aee0" }, { name: "White", hex: "#f5f5f5" }], tags: ["sale"], description: "Cloud-soft slide with massage footbed.", keywords: "slide summer beach sale", art: { style: "slide", c1: "#c3aee0", c2: "#6a5a9a" } }),
];

export const brands = [...new Set(products.map((p) => p.brand))].sort();
export const categories = ["men", "women", "kids"];
export const allSizes = ["24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];
export const allColors = [...new Map(products.flatMap((p) => p.colors).map((c) => [c.name, c])).values()];

export function getProduct(idOrSlug) {
  return products.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
}

export function discountPct(p) {
  if (!p.oldPrice || p.oldPrice <= p.price) return 0;
  return Math.round((1 - p.price / p.oldPrice) * 100);
}
