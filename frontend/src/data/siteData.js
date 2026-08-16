// Site content for RNS INFOTECH — copy, catalogue, and page data.
// Product category aligned with reference: pen tablets, pen displays,
// stylus/pens, and accessories for digital artists, designers, and creators.
// Replace each export with a fetch/query later — component props are
// shaped to match these structures, so swapping is a data-only change.

// RNS INFOTECH is now the store's single, exclusive brand — every
// product carries this same value instead of a mix of third-party
// brand names, so there's nothing left to filter/browse "by brand".
export const BRAND_NAME = "RNS INFOTECH";

// announcement — kept only so any old single-message caller doesn't
// break; the storefront itself now renders the rotating `flashMessages`
// list below instead (see components/AnnouncementBar.jsx + lib/
// flashMessagesStore.js).
export const announcement = {
  message: "Authorized dealer pricing on pen displays this week — festive offers live.",
  cta: { label: "See offers", href: "#" },
};

// flashMessages — the rotating strip shown above the navbar on every
// page. Each message cycles in for `durationSeconds` before the next
// active one takes over; `type` just picks the accent color/icon shown
// (see TYPE_STYLES in components/AnnouncementBar.jsx). Editable from
// the Admin Portal's Website management → Flash messages tab.
export const flashMessages = [
  {
    id: "flash_login",
    type: "login",
    message: "Sign in to track orders, save addresses, and check out faster.",
    ctaLabel: "Log in",
    ctaHref: "/login",
    active: true,
    durationSeconds: 5,
  },
  {
    id: "flash_sale",
    type: "sale",
    message: "Festive offers live — authorized dealer pricing on pen displays this week.",
    ctaLabel: "See offers",
    ctaHref: "/products",
    active: true,
    durationSeconds: 5,
  },
  {
    id: "flash_newsletter",
    type: "newsletter",
    message: "Join our newsletter for early access to new arrivals and drops.",
    ctaLabel: "Subscribe",
    ctaHref: "/help#newsletter",
    active: true,
    durationSeconds: 5,
  },
];

export const nav = {
  logo: "RNS INFOTECH",
  links: [
    // Every catalogue link goes straight to its filtered /products view —
    // no dropdown/mega menu, since there's a single brand and nothing to
    // sub-browse before landing on the product grid.
    { label: "Pen Displays", href: "/products?category=pen-displays" },
    { label: "Pen Tablets", href: "/products?category=pen-tablets" },
    { label: "Stylus", href: "/products?category=stylus" },
    { label: "Accessories", href: "/products?category=accessories" },
    { label: "Support", href: "/help" },
  ],
  cta: { label: "Book a demo", href: "/demo" },
};

export const hero = {
  title: "Pen tablets and pen displays for artists, designers, and creators.",
  subtitle:
    "RNS INFOTECH designs and stocks pen displays, pen tablets, stylus pens, and accessories under one roof — with genuine warranty support and fast dispatch.",
  primaryCta: { label: "Browse catalogue", href: "#products" },
  secondaryCta: { label: "Book a demo", href: "/demo" },
  stats: [
    { label: "Years in operation", value: "12" },
    { label: "Creators served", value: "18,000+" },
    { label: "Avg. dispatch time", value: "2–3 days" },
  ],
};

export const categories = [
  { id: "pen-displays", name: "Pen Displays", count: 18, icon: "display",image:"/assets/categories/pendisplays.jpg" },
  { id: "pen-tablets", name: "Pen Tablets", count: 34, icon: "tablet",image:"/assets/categories/pentablets.jpg"  },
  { id: "stylus", name: "Stylus & Pens", count: 22, icon: "pen",image:"/assets/categories/stylus.jpg"  },
  { id: "accessories", name: "Accessories", count: 46, icon: "layers",image:"/assets/categories/accessories.jpg"  },
];

export const products = [
  {
    id: "p1",
    name: "SketchDisplay 24 Touch Pen Display",
    category: "Pen Displays",
    categoryId: "pen-displays",
    brand: BRAND_NAME,
    sku: "RNS-SD24T",
    price: 148990,
    mrp: 150990,
    tag: "featured",
    stock: "in-stock",
    image: "/assets/categories/pendisplays.jpg",
    images: ["/assets/categories/pendisplays.jpg", "/assets/categories/pendisplays.jpg", "/assets/categories/pendisplays.jpg"],
    shortDescription: "A 24-inch touch-enabled pen display with 8,192 levels of pressure sensitivity, built for studios that draw straight on screen.",
    description: "A 24-inch touch-enabled pen display with 8,192 levels of pressure sensitivity, built for studios that draw straight on screen. Built for daily studio use, it pairs dependable hardware with genuine manufacturer warranty handled directly by RNS INFOTECH.",
    highlights: [
      "23.8\" anti-glare display, 92% Adobe RGB coverage",
      "8,192 pressure levels with tilt recognition",
      "10-point multi-touch for gesture navigation",
      "Adjustable stand included, VESA mountable",
    ],
    specs: [
      { label: "Screen size", value: "23.8 inches" },
      { label: "Resolution", value: "1920 x 1080 (Full HD)" },
      { label: "Pressure sensitivity", value: "8,192 levels" },
      { label: "Color gamut", value: "92% Adobe RGB" },
      { label: "Connectivity", value: "USB-C, HDMI" },
      { label: "Compatibility", value: "Windows, macOS" },
      { label: "Warranty", value: "2 years manufacturer warranty" },
    ],
    rating: 4.8,
    reviewCount: 4,
    reviews: [
      { name: "Aditya Rao", rating: 5, date: "4 days ago", comment: "Ordered on a Monday, had it running by Thursday. Genuine product with warranty card included, as promised." },
      { name: "Farhan Sheikh", rating: 4, date: "9 days ago", comment: "Solid value for the price. Would've liked a carrying case included, but otherwise no complaints." },
      { name: "Rohan Verma", rating: 5, date: "15 days ago", comment: "Exactly what I needed for my illustration work. Pen response feels natural right out of the box." },
      { name: "Ishaan Bhatt", rating: 5, date: "22 days ago", comment: "Been using it daily for freelance work for two months now — zero issues, very consistent." },
    ],
  },
  {
    id: "p2",
    name: "DrawPad Pro Medium Tablet",
    category: "Pen Tablets",
    categoryId: "pen-tablets",
    brand: BRAND_NAME,
    sku: "RNS-DPM",
    price: 34500,
    mrp: 39990,
    tag: "featured",
    stock: "in-stock",
    image: "/assets/categories/pentablets.jpg",
    images: ["/assets/categories/pentablets.jpg", "/assets/categories/pentablets.jpg", "/assets/categories/pentablets.jpg"],
    shortDescription: "A medium-format graphics tablet with a battery-free stylus, tuned for illustration and concept art work.",
    description: "A medium-format graphics tablet with a battery-free stylus, tuned for illustration and concept art work. Built for daily studio use, it pairs dependable hardware with genuine manufacturer warranty handled directly by RNS INFOTECH.",
    highlights: [
      "Battery-free stylus with 8,192 pressure levels",
      "Medium active area — 10 x 6.25 inches",
      "8 customizable express keys",
      "Works over Bluetooth or USB-C",
    ],
    specs: [
      { label: "Active area", value: "10 x 6.25 inches" },
      { label: "Pressure sensitivity", value: "8,192 levels" },
      { label: "Report rate", value: "266 RPS" },
      { label: "Express keys", value: "8 customizable" },
      { label: "Connectivity", value: "USB-C, Bluetooth" },
      { label: "Compatibility", value: "Windows, macOS, select Android" },
      { label: "Warranty", value: "1 year manufacturer warranty" },
    ],
    rating: 4.3,
    reviewCount: 3,
    reviews: [
      { name: "Rohan Verma", rating: 5, date: "4 days ago", comment: "Exactly what I needed for my illustration work. Pen response feels natural right out of the box." },
      { name: "Ishaan Bhatt", rating: 5, date: "9 days ago", comment: "Been using it daily for freelance work for two months now — zero issues, very consistent." },
      { name: "Vikram Singh", rating: 3, date: "15 days ago", comment: "Does the job, but the surface feels slightly slippery for my taste. Might add a matte film." },
    ],
  },
  {
    id: "p3",
    name: "3-Nib Pro Stylus Pen",
    category: "Stylus",
    categoryId: "stylus",
    brand: BRAND_NAME,
    sku: "RNS-STY3N",
    price: 6499,
    mrp: 7299,
    tag: "featured",
    stock: "low-stock",
    image: "/assets/categories/stylus.jpg",
    images: ["/assets/categories/stylus.jpg", "/assets/categories/stylus.jpg", "/assets/categories/stylus.jpg"],
    shortDescription: "A battery-free pro stylus with tilt support and three interchangeable nib types for different line feels.",
    description: "A battery-free pro stylus with tilt support and three interchangeable nib types for different line feels. Built for daily studio use, it pairs dependable hardware with genuine manufacturer warranty handled directly by RNS INFOTECH.",
    highlights: [
      "8,192 levels of pressure sensitivity",
      "±60° tilt recognition for natural shading",
      "Three nib types included: standard, felt, brush",
      "Compatible with most RNS pen tablets and displays",
    ],
    specs: [
      { label: "Pressure sensitivity", value: "8,192 levels" },
      { label: "Tilt support", value: "Up to 60°" },
      { label: "Battery", value: "Battery-free (EMR)" },
      { label: "Included nibs", value: "Standard, felt, brush (3 total)" },
      { label: "Compatibility", value: "RNS pen tablets & displays" },
      { label: "Warranty", value: "1 year manufacturer warranty" },
    ],
    rating: 4.0,
    reviewCount: 4,
    reviews: [
      { name: "Sneha Kapoor", rating: 5, date: "4 days ago", comment: "Upgraded my whole workflow with this. Pressure sensitivity feels miles better than my old device." },
      { name: "Farhan Sheikh", rating: 4, date: "9 days ago", comment: "Solid value for the price. Would've liked a carrying case included, but otherwise no complaints." },
      { name: "Vikram Singh", rating: 3, date: "15 days ago", comment: "Does the job, but the surface feels slightly slippery for my taste. Might add a matte film." },
      { name: "Priya Nair", rating: 4, date: "22 days ago", comment: "Great build quality and the calibration guide was clear. Docked one star since the box contents felt a little sparse." },
    ],
  },
  {
    id: "p5",
    name: "DrawPad Pro Small Tablet",
    category: "Pen Tablets",
    categoryId: "pen-tablets",
    brand: BRAND_NAME,
    sku: "RNS-DPS",
    price: 23950,
    mrp: 25990,
    tag: "new",
    stock: "in-stock",
    image: "/assets/categories/pentablets.jpg",
    images: ["/assets/categories/pentablets.jpg", "/assets/categories/pentablets.jpg", "/assets/categories/pentablets.jpg"],
    shortDescription: "A compact, travel-friendly graphics tablet that keeps the full DrawPad Pro feature set in a smaller footprint.",
    description: "A compact, travel-friendly graphics tablet that keeps the full DrawPad Pro feature set in a smaller footprint. Built for daily studio use, it pairs dependable hardware with genuine manufacturer warranty handled directly by RNS INFOTECH.",
    highlights: [
      "Battery-free stylus with 8,192 pressure levels",
      "Small active area — 7 x 4.4 inches, easy to carry",
      "6 customizable express keys",
      "USB-C connection with included cable",
    ],
    specs: [
      { label: "Active area", value: "7 x 4.4 inches" },
      { label: "Pressure sensitivity", value: "8,192 levels" },
      { label: "Report rate", value: "266 RPS" },
      { label: "Express keys", value: "6 customizable" },
      { label: "Connectivity", value: "USB-C" },
      { label: "Compatibility", value: "Windows, macOS, select Android" },
      { label: "Warranty", value: "1 year manufacturer warranty" },
    ],
    rating: 4.8,
    reviewCount: 4,
    reviews: [
      { name: "Farhan Sheikh", rating: 4, date: "4 days ago", comment: "Solid value for the price. Would've liked a carrying case included, but otherwise no complaints." },
      { name: "Meera Iyer", rating: 5, date: "9 days ago", comment: "Support team walked me through setup on a call. Rare to get that kind of service these days." },
      { name: "Aditya Rao", rating: 5, date: "15 days ago", comment: "Ordered on a Monday, had it running by Thursday. Genuine product with warranty card included, as promised." },
      { name: "Ishaan Bhatt", rating: 5, date: "22 days ago", comment: "Been using it daily for freelance work for two months now — zero issues, very consistent." },
    ],
  },
  {
    id: "p6",
    name: "SketchDisplay Mobile 13\"",
    category: "Pen Displays",
    categoryId: "pen-displays",
    brand: BRAND_NAME,
    sku: "RNS-SDM13",
    price: 64990,
    mrp: 69990,
    tag: "new",
    stock: "in-stock",
    image: "/assets/categories/pendisplays.jpg",
    images: ["/assets/categories/pendisplays.jpg", "/assets/categories/pendisplays.jpg", "/assets/categories/pendisplays.jpg"],
    shortDescription: "A 13-inch portable pen display for artists who want on-screen drawing without giving up desk space or portability.",
    description: "A 13-inch portable pen display for artists who want on-screen drawing without giving up desk space or portability. Built for daily studio use, it pairs dependable hardware with genuine manufacturer warranty handled directly by RNS INFOTECH.",
    highlights: [
      "13.3\" full-lamination display, minimal parallax",
      "8,192 pressure levels with tilt recognition",
      "Lightweight design built for travel",
      "USB-C single-cable connection to most laptops",
    ],
    specs: [
      { label: "Screen size", value: "13.3 inches" },
      { label: "Resolution", value: "1920 x 1080 (Full HD)" },
      { label: "Pressure sensitivity", value: "8,192 levels" },
      { label: "Color gamut", value: "88% NTSC" },
      { label: "Connectivity", value: "USB-C" },
      { label: "Compatibility", value: "Windows, macOS" },
      { label: "Warranty", value: "2 years manufacturer warranty" },
    ],
    rating: 4.7,
    reviewCount: 3,
    reviews: [
      { name: "Priya Nair", rating: 4, date: "4 days ago", comment: "Great build quality and the calibration guide was clear. Docked one star since the box contents felt a little sparse." },
      { name: "Sneha Kapoor", rating: 5, date: "9 days ago", comment: "Upgraded my whole workflow with this. Pressure sensitivity feels miles better than my old device." },
      { name: "Aditya Rao", rating: 5, date: "15 days ago", comment: "Ordered on a Monday, had it running by Thursday. Genuine product with warranty card included, as promised." },
    ],
  },
  {
    id: "p7",
    name: "Replacement Nib Pack (10x)",
    category: "Accessories",
    categoryId: "accessories",
    brand: BRAND_NAME,
    sku: "RNS-NIB10",
    price: 899,
    mrp: 1099,
    tag: "new",
    stock: "low-stock",
    image: "/assets/categories/stylus.jpg",
    images: ["/assets/categories/stylus.jpg", "/assets/categories/stylus.jpg", "/assets/categories/stylus.jpg"],
    shortDescription: "A pack of 10 genuine standard nibs to keep your stylus gliding smoothly as the originals wear down.",
    description: "A pack of 10 genuine standard nibs to keep your stylus gliding smoothly as the originals wear down. Built for daily studio use, it pairs dependable hardware with genuine manufacturer warranty handled directly by RNS INFOTECH.",
    highlights: [
      "10 genuine standard-type nibs",
      "Compatible with most RNS stylus pens",
      "Includes nib removal tool",
      "Maintains consistent pen feel over time",
    ],
    specs: [
      { label: "Contents", value: "10x standard nibs, 1x removal tool" },
      { label: "Compatibility", value: "RNS stylus pens (standard nib type)" },
      { label: "Material", value: "POM plastic" },
      { label: "Warranty", value: "Not applicable (consumable part)" },
    ],
    rating: 4.8,
    reviewCount: 4,
    reviews: [
      { name: "Meera Iyer", rating: 5, date: "4 days ago", comment: "Support team walked me through setup on a call. Rare to get that kind of service these days." },
      { name: "Priya Nair", rating: 4, date: "9 days ago", comment: "Great build quality and the calibration guide was clear. Docked one star since the box contents felt a little sparse." },
      { name: "Sneha Kapoor", rating: 5, date: "15 days ago", comment: "Upgraded my whole workflow with this. Pressure sensitivity feels miles better than my old device." },
      { name: "Rohan Verma", rating: 5, date: "22 days ago", comment: "Exactly what I needed for my illustration work. Pen response feels natural right out of the box." },
    ],
  },
  {
    id: "p8",
    name: "DrawPad Pro Large Tablet",
    category: "Pen Tablets",
    categoryId: "pen-tablets",
    brand: BRAND_NAME,
    sku: "RNS-DPL",
    price: 45949,
    mrp: 52990,
    tag: "best-seller",
    stock: "in-stock",
    image: "/assets/categories/pentablets.jpg",
    images: ["/assets/categories/pentablets.jpg", "/assets/categories/pentablets.jpg", "/assets/categories/pentablets.jpg"],
    shortDescription: "A large-format graphics tablet built for animation and detailed illustration work that needs room to move.",
    description: "A large-format graphics tablet built for animation and detailed illustration work that needs room to move. Built for daily studio use, it pairs dependable hardware with genuine manufacturer warranty handled directly by RNS INFOTECH.",
    highlights: [
      "Battery-free stylus with 8,192 pressure levels",
      "Large active area — 13.6 x 8.5 inches",
      "10 customizable express keys plus touch ring",
      "USB-C connection with braided cable",
    ],
    specs: [
      { label: "Active area", value: "13.6 x 8.5 inches" },
      { label: "Pressure sensitivity", value: "8,192 levels" },
      { label: "Report rate", value: "266 RPS" },
      { label: "Express keys", value: "10 customizable + touch ring" },
      { label: "Connectivity", value: "USB-C" },
      { label: "Compatibility", value: "Windows, macOS, select Android" },
      { label: "Warranty", value: "1 year manufacturer warranty" },
    ],
    rating: 5.0,
    reviewCount: 3,
    reviews: [
      { name: "Sneha Kapoor", rating: 5, date: "4 days ago", comment: "Upgraded my whole workflow with this. Pressure sensitivity feels miles better than my old device." },
      { name: "Aditya Rao", rating: 5, date: "9 days ago", comment: "Ordered on a Monday, had it running by Thursday. Genuine product with warranty card included, as promised." },
      { name: "Ishaan Bhatt", rating: 5, date: "15 days ago", comment: "Been using it daily for freelance work for two months now — zero issues, very consistent." },
    ],
  },
  {
    id: "p9",
    name: "SketchDisplay Pro 17",
    category: "Pen Displays",
    categoryId: "pen-displays",
    brand: BRAND_NAME,
    sku: "RNS-SDP17",
    price: 226990,
    mrp: 242990,
    tag: "best-seller",
    stock: "in-stock",
    image: "/assets/categories/pendisplays.jpg",
    images: ["/assets/categories/pendisplays.jpg", "/assets/categories/pendisplays.jpg", "/assets/categories/pendisplays.jpg"],
    shortDescription: "A flagship 17-inch pen display for animation and VFX studios, with full lamination and near-zero parallax.",
    description: "A flagship 17-inch pen display for animation and VFX studios, with full lamination and near-zero parallax. Built for daily studio use, it pairs dependable hardware with genuine manufacturer warranty handled directly by RNS INFOTECH.",
    highlights: [
      "17\" full-lamination display, 99% Adobe RGB",
      "8,192 pressure levels with 60° tilt recognition",
      "Adjustable stand with multiple viewing angles",
      "Dual USB-C connectivity for flexible desk setups",
    ],
    specs: [
      { label: "Screen size", value: "17 inches" },
      { label: "Resolution", value: "2560 x 1440 (QHD)" },
      { label: "Pressure sensitivity", value: "8,192 levels" },
      { label: "Color gamut", value: "99% Adobe RGB" },
      { label: "Connectivity", value: "USB-C, HDMI" },
      { label: "Compatibility", value: "Windows, macOS" },
      { label: "Warranty", value: "2 years manufacturer warranty" },
    ],
    rating: 4.8,
    reviewCount: 4,
    reviews: [
      { name: "Ishaan Bhatt", rating: 5, date: "4 days ago", comment: "Been using it daily for freelance work for two months now — zero issues, very consistent." },
      { name: "Farhan Sheikh", rating: 4, date: "9 days ago", comment: "Solid value for the price. Would've liked a carrying case included, but otherwise no complaints." },
      { name: "Aditya Rao", rating: 5, date: "15 days ago", comment: "Ordered on a Monday, had it running by Thursday. Genuine product with warranty card included, as promised." },
      { name: "Meera Iyer", rating: 5, date: "22 days ago", comment: "Support team walked me through setup on a call. Rare to get that kind of service these days." },
    ],
  },
  {
    id: "p10",
    name: "Tablet Sleeve & Glove Kit",
    category: "Accessories",
    categoryId: "accessories",
    brand: BRAND_NAME,
    sku: "RNS-SLVGLV",
    price: 1799,
    mrp: 2199,
    tag: "best-seller",
    stock: "in-stock",
    image: "/assets/categories/stylus.jpg",
    images: ["/assets/categories/stylus.jpg", "/assets/categories/stylus.jpg", "/assets/categories/stylus.jpg"],
    shortDescription: "A protective sleeve for your pen tablet or display, bundled with an artist's drawing glove for smoother screen contact.",
    description: "A protective sleeve for your pen tablet or display, bundled with an artist's drawing glove for smoother screen contact. Built for daily studio use, it pairs dependable hardware with genuine manufacturer warranty handled directly by RNS INFOTECH.",
    highlights: [
      "Padded sleeve fits most medium tablets and 13\"–15\" displays",
      "Two-finger drawing glove, one size fits most",
      "Water-resistant exterior fabric",
      "Compact enough for a backpack side pocket",
    ],
    specs: [
      { label: "Sleeve fit", value: "Medium tablets & 13\"–15\" displays" },
      { label: "Glove size", value: "One size, two-finger" },
      { label: "Material", value: "Water-resistant polyester, elastane glove" },
      { label: "Warranty", value: "Not applicable (accessory)" },
    ],
    rating: 4.3,
    reviewCount: 3,
    reviews: [
      { name: "Rohan Verma", rating: 5, date: "4 days ago", comment: "Exactly what I needed for my illustration work. Pen response feels natural right out of the box." },
      { name: "Sneha Kapoor", rating: 5, date: "9 days ago", comment: "Upgraded my whole workflow with this. Pressure sensitivity feels miles better than my old device." },
      { name: "Vikram Singh", rating: 3, date: "15 days ago", comment: "Does the job, but the surface feels slightly slippery for my taste. Might add a matte film." },
    ],
  },
];
export const whyChooseUs = [
  {
    icon: "truck",
    title: "Fastest delivery",
    body: "Orders reach your doorstep within 2–3 working days across the region.",
  },
  {
    icon: "headset",
    title: "Great customer support",
    body: "Professional technical assistance from a team that actually knows pen tablets and displays, not a generic call center.",
  },
  {
    icon: "layers",
    title: "Wide compatibility",
    body: "Devices work across Windows, macOS, and select Android & Linux setups, tested against commonly used creative software.",
  },
  {
    icon: "shield",
    title: "Authentic & genuine",
    body: "We are an authorized dealer — every unit sold is 100% genuine, with full manufacturer warranty honored.",
  },
];

export const solutions = [
  {
    icon: "pen",
    title: "Digital Illustration & Concept Art",
    body: "Pressure-sensitive pen tablets and displays tuned for line work, inking, and painting.",
  },
  {
    icon: "display",
    title: "Animation & VFX",
    body: "Larger pen displays and tilt-sensitive styluses for frame-by-frame and rigging work.",
  },
  {
    icon: "tablet",
    title: "Photo & Video Editing",
    body: "Precise cursor control for retouching, color grading, and timeline editing.",
  },
  {
    icon: "chip",
    title: "Architecture & CAD",
    body: "Accurate pen input for drafting, annotation, and design review workflows.",
  },
  {
    icon: "disc",
    title: "Education & Online Teaching",
    body: "Affordable pen tablets for whiteboard-style teaching and remote classes.",
  },
];

export const promo = {
  eyebrow: "Festive offer",
  title: "Upgrade to a pro pen display before the festive season ends.",
  body: "Bundle a pen display, stylus, and screen protector — priced as one line item, with EMI available.",
  cta: { label: "View pen display bundles", href: "#products" },
};

export const testimonials = [
  {
    quote:
      "The pen display arrived in two days and the calibration guide got me set up in Photoshop within minutes. Genuine warranty card included.",
    name: "Ananya Sharma",
    role: "Freelance Illustrator",
    rating: 5,
  },
  {
    quote:
      "We equipped our entire animation team with pen tablets through RNS. Bulk pricing was straightforward and support has stayed responsive since.",
    name: "Karan Mehta",
    role: "Studio Lead, Framewright Animation",
    rating: 5,
  },
  {
    quote:
      "Picked up a compact pen tablet for our design intern's onboarding kit. Setup was simple and the support team answered every question I had.",
    name: "Divya Iyer",
    role: "Branch Operations, Novon Finance",
    rating: 4,
  },
];

export const faqs = [
  {
    q: "Are these genuine, authorized products?",
    a: "Yes — RNS INFOTECH is an authorized dealer, and every pen tablet, pen display, and stylus we sell is 100% genuine with full manufacturer warranty.",
  },
  {
    q: "Which operating systems and software are these compatible with?",
    a: "Most pen tablets and displays work across Windows, macOS, and select Android & Linux setups, and are tested against commonly used creative software such as Photoshop, Clip Studio Paint, and Blender.",
  },
  {
    q: "How long does delivery take?",
    a: "In-stock orders are dispatched within 2–3 working days, with tracking shared on shipment.",
  },
  {
    q: "Do you offer bulk pricing for studios or institutions?",
    a: "Yes, bulk quotes are available for animation studios, design schools, and offices ordering multiple pen tablets or displays.",
  },
  {
    q: "What's covered under warranty, and how do I claim it?",
    a: "Manufacturer warranty applies as standard (typically 1–2 years depending on model), and we handle the claim process on your behalf rather than redirecting you to the brand directly.",
  },
  {
    q: "Can I try a pen display before buying?",
    a: "Yes, select models can be experienced at our demo center — book a slot and our team will walk you through calibration and pen feel.",
  },
];


export const about = {
  eyebrow: "About us",
  title: "Built by people who actually use this hardware.",
  intro:
    "RNS INFOTECH is an authorized dealer of pen tablets, pen displays, stylus pens, and creative accessories — run by a team that tests every model before it goes on the shelf.",
  story: [
    "RNS INFOTECH started out supplying pen displays to a handful of local animation studios. Years later, the same principle still holds: don't sell what you wouldn't use yourself.",
    "Today we work with independent illustrators, design schools, animation studios, and offices moving to paperless approvals — sourcing genuine hardware directly through authorized brand channels and handling every warranty claim ourselves instead of redirecting people to the manufacturer.",
  ],
  values: [
    {
      icon: "shield",
      title: "Genuine, always",
      body: "Every unit is sourced through authorized channels — no grey-market imports, ever.",
    },
    {
      icon: "disc",
      title: "Tested before we stock it",
      body: "If a model doesn't hold up on our own desks, it doesn't go on the site.",
    },
    {
      icon: "headset",
      title: "Warranty, handled directly",
      body: "Claims go through our own team, not a call center in another country.",
    },
  ],
};

export const support = {
  email: "support@rnsinfotech.in",
  phone: "+91 98765 43210",
  // Digits-only, country code first — the format wa.me links require.
  whatsapp: "919876543210",
  hours: "Mon–Sat, 10:00 AM – 7:00 PM IST",
  address: "RNS INFOTECH, MG Road, Bengaluru, Karnataka 560001",
  emailResponseTime: "Usually within 24 hours",
  chatResponseTime: "Usually within a few minutes during business hours",
};

// Driver/manual downloads, grouped by category so a product detail page
// can pull "downloads for this product's category" plus anything tagged
// universal. Placeholder hrefs ("#") match the pattern used elsewhere in
// this mock dataset (e.g. `announcement.cta.href`) until real asset URLs
// exist.
export const downloads = [
  {
    id: "dl-universal-driver",
    label: "RNS Universal Tablet Driver",
    categoryId: "universal",
    type: "driver",
    fileType: "EXE / DMG",
    size: "84 MB",
    version: "v6.2.1",
    href: "#",
  },
  {
    id: "dl-pen-displays-driver",
    label: "Pen Display Driver Suite",
    categoryId: "pen-displays",
    type: "driver",
    fileType: "EXE / DMG",
    size: "142 MB",
    version: "v4.8.0",
    href: "#",
  },
  {
    id: "dl-pen-displays-manual",
    label: "Pen Display User Manual",
    categoryId: "pen-displays",
    type: "manual",
    fileType: "PDF",
    size: "6.1 MB",
    version: null,
    href: "#",
  },
  {
    id: "dl-pen-tablets-driver",
    label: "Pen Tablet Driver Suite",
    categoryId: "pen-tablets",
    type: "driver",
    fileType: "EXE / DMG",
    size: "98 MB",
    version: "v5.1.3",
    href: "#",
  },
  {
    id: "dl-pen-tablets-manual",
    label: "Pen Tablet Quick Start Guide",
    categoryId: "pen-tablets",
    type: "manual",
    fileType: "PDF",
    size: "3.4 MB",
    version: null,
    href: "#",
  },
  {
    id: "dl-stylus-manual",
    label: "Stylus Pairing & Care Guide",
    categoryId: "stylus",
    type: "manual",
    fileType: "PDF",
    size: "1.8 MB",
    version: null,
    href: "#",
  },
  {
    id: "dl-accessories-manual",
    label: "Accessories Setup Guide",
    categoryId: "accessories",
    type: "manual",
    fileType: "PDF",
    size: "1.2 MB",
    version: null,
    href: "#",
  },
];

export const demo = {
  eyebrow: "See it before you buy",
  title: "Book a demo",
  subtitle:
    "Try a pen display or tablet hands-on at our Bengaluru experience centre, or on a video call with a specialist — either way, tell us what you're after and we'll set it up.",
  steps: [
    {
      icon: "calendar",
      title: "Pick a slot",
      body: "Share your preferred date and whether you'd rather visit in person or hop on a video call.",
    },
    {
      icon: "headset",
      title: "We confirm by email",
      body: "A specialist reviews your request and confirms the slot, usually within a business day.",
    },
    {
      icon: "tablet",
      title: "Try the hardware",
      body: "Test pressure sensitivity, tilt, and screen response on the exact models you're considering.",
    },
  ],
  interests: [
    { id: "pen-displays", label: "Pen Displays" },
    { id: "pen-tablets", label: "Pen Tablets" },
    { id: "stylus", label: "Stylus & Pens" },
    { id: "not-sure", label: "Not sure yet" },
  ],
  modes: [
    { id: "in-person", label: "In person at the experience centre" },
    { id: "video-call", label: "Video call" },
  ],
};

export const footer = {
  about:
    "RNS INFOTECH is an authorized dealer of pen tablets, pen displays, stylus pens, and creative accessories for artists, designers, and studios.",
  columns: [
    {
      title: "Shop",
      links: [
        { label: "Pen Displays", href: "/products?category=pen-displays" },
        { label: "Pen Tablets", href: "/products?category=pen-tablets" },
        { label: "Stylus & Pens", href: "/products?category=stylus" },
        { label: "Accessories", href: "/products?category=accessories" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About us", href: "/about" },
        { label: "Demo/Experience Centre", href: "/demo" },
        { label: "Corporate sales", href: "/corporate-sales" },
        { label: "Contact", href: "/help" },
        { label: "Request a quote", href: "/request-quote" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Track an order", href: "/orders" },
        { label: "Warranty claim", href: "/warranty" },
        { label: "Downloads", href: "/downloads" },
        { label: "FAQs", href: "/help#faqs" },
      ],
    },
  ],
  legal: [
    { label: "Privacy policy", href: "/privacy-policy" },
    { label: "Terms of service", href: "/terms" },
    { label: "Return policy", href: "/return-policy" },
  ],
  newsletter: {
    title: "Get restock alerts & offers",
    body: "Occasional emails about new arrivals, price drops, and bulk-order deals. No spam.",
    placeholder: "you@studio.com",
    cta: "Subscribe",
  },
  // Placeholder hrefs ("#") match the pattern used elsewhere in this mock
  // dataset (e.g. `announcement.cta.href`, `downloads[].href`) until real
  // social profile URLs exist.
  social: [
    { name: "Instagram", href: "#", icon: "instagram" },
    { name: "Facebook", href: "#", icon: "facebook" },
    { name: "Twitter", href: "#", icon: "twitter" },
    { name: "LinkedIn", href: "#", icon: "linkedin" },
    { name: "YouTube", href: "#", icon: "youtube" },
  ],
};

export const requestQuote = {
  eyebrow: "Buying for a team or studio?",
  title: "Request a quote",
  subtitle:
    "Tell us which products and quantities you're after and we'll put together pricing — usually within a business day.",
};

export const privacyPolicy = {
  updated: "August 2026",
  intro:
    "This policy explains what information RNS INFOTECH collects when you use this site, how it's used, and the choices you have. This is placeholder content for a demo project and should be replaced with a policy reviewed by counsel before the site goes live with real customer data.",
  sections: [
    {
      title: "Information we collect",
      body: "Contact details you submit through forms on this site (name, email, phone, company), order and shipping information when you place an order, and basic usage data such as pages visited and device/browser type.",
    },
    {
      title: "How we use it",
      body: "To respond to enquiries and quote requests, process and ship orders, manage warranty claims, and improve the site. We do not sell personal information to third parties.",
    },
    {
      title: "Sharing",
      body: "Information is shared only where needed to fulfil an order (e.g. courier partners, payment processing) or where required by law.",
    },
    {
      title: "Cookies",
      body: "The site may use cookies to keep you signed in and to remember items in your cart. You can disable cookies in your browser, though some features may not work as expected.",
    },
    {
      title: "Your choices",
      body: "You can request a copy of the information we hold about you, ask us to correct it, or ask us to delete it, by emailing the address below.",
    },
    {
      title: "Contact",
      body: "Questions about this policy can be sent to support@rnsinfotech.in.",
    },
  ],
};

export const returnPolicy = {
  updated: "August 2026",
  intro:
    "This policy explains how returns, exchanges, and refunds work for orders placed through the RNS INFOTECH website. This is placeholder content for a demo project and should be replaced with a policy reviewed by counsel before the site goes live.",
  sections: [
    {
      title: "Return window",
      body: "Most products can be returned within 7 days of delivery. Pen displays and pen tablets must be unused, in their original packaging, with all accessories, manuals, and seals intact.",
    },
    {
      title: "Damaged or defective on arrival",
      body: "If an item arrives damaged or isn't working, email us within 48 hours of delivery with your order ID and photos or a short video of the issue — we'll arrange a replacement or full refund and cover the return shipping.",
    },
    {
      title: "Change of mind",
      body: "For change-of-mind returns, the item must be unopened and unused; return shipping is the customer's responsibility unless the order qualified for free returns at checkout.",
    },
    {
      title: "What can't be returned",
      body: "Stylus nibs and consumables once the packaging is opened, products with a broken hygiene or warranty seal, and items reported outside the 7-day window can't be accepted for return.",
    },
    {
      title: "How to start a return",
      body: "Email support@rnsinfotech.in with your order ID and reason for return, or use the Track an order page to find the order and start the request. We'll confirm eligibility and share the return address.",
    },
    {
      title: "Refunds",
      body: "Once the returned item passes inspection, refunds are issued to the original payment method within 5-7 business days. Orders paid via COD are refunded via bank transfer.",
    },
    {
      title: "Exchanges",
      body: "Prefer a different model instead of a refund? Let support know when you start the return and we'll set up an exchange, adjusting for any price difference.",
    },
    {
      title: "After the return window",
      body: "Issues that come up after 7 days are usually covered under manufacturer warranty rather than this return policy — see the Warranty claim section on the Help page.",
    },
  ],
};

export const termsAndConditions = {
  updated: "August 2026",
  intro:
    "These terms govern your use of the RNS INFOTECH website and any orders placed through it. This is placeholder content for a demo project and should be replaced with terms reviewed by counsel before the site goes live.",
  sections: [
    {
      title: "Orders and pricing",
      body: "Prices are shown in INR and may change without notice. An order is confirmed only once payment is received or, for offline arrangements, once RNS INFOTECH confirms it in writing.",
    },
    {
      title: "Payments",
      body: "Online payments are processed through a third-party payment gateway. RNS INFOTECH does not store your card details.",
    },
    {
      title: "Shipping",
      body: "Dispatch times shown on product pages are estimates. Risk in the goods passes to the courier on dispatch and to you on delivery.",
    },
    {
      title: "Warranty",
      body: "Products carry the manufacturer's standard warranty (typically 1–2 years depending on model). RNS INFOTECH handles the claim on your behalf — see the Warranty page for details.",
    },
    {
      title: "Returns",
      body: "Return and refund requests are handled case by case; contact support before sending anything back.",
    },
    {
      title: "Limitation of liability",
      body: "RNS INFOTECH's liability for any claim relating to an order is limited to the amount paid for that order.",
    },
    {
      title: "Governing law",
      body: "These terms are governed by the laws of India, and disputes are subject to the courts of Bengaluru, Karnataka.",
    },
  ],
};

// Warranty coverage by category — mirrors the "Warranty" row already
// present in each product's `specs` array, summarized so WarrantyPage
// doesn't have to scan every product to build a coverage table.
export const warranty = {
  updated: "August 2026",
  intro:
    "RNS INFOTECH is an authorized dealer, so every unit we sell carries the manufacturer's standard warranty — and we handle the claim directly rather than redirecting you to the brand. This is placeholder content for a demo project and should be replaced with a policy reviewed by counsel before the site goes live.",
  coverage: [
    { categoryId: "pen-displays", categoryLabel: "Pen Displays", duration: "2 years", note: "Covers the panel, digitizer, and included stand." },
    { categoryId: "pen-tablets", categoryLabel: "Pen Tablets", duration: "1 year", note: "Covers the tablet body and digitizer." },
    { categoryId: "stylus", categoryLabel: "Stylus & Pens", duration: "1 year", note: "Covers the pen electronics; included nibs are wear parts." },
    { categoryId: "accessories", categoryLabel: "Accessories", duration: "Not applicable", note: "Consumables (nibs, sleeves, gloves) are not covered once opened." },
  ],
  sections: [
    {
      title: "What's covered",
      body: "Manufacturing defects and hardware failures under normal use — dead pixels beyond the panel maker's threshold, digitizer or pressure-sensitivity faults, connectivity failures, and similar defects that aren't caused by accidental damage or misuse.",
    },
    {
      title: "What's not covered",
      body: "Accidental damage (drops, liquid, crushed cables), unauthorized repairs or modifications, cosmetic wear, and consumable parts like stylus nibs once the original packaging has been opened.",
    },
    {
      title: "How to file a claim",
      body: "Email support with your order ID, the product's serial number (usually on the underside or box), and a description of the issue — photos or a short video help us diagnose faster. We'll confirm coverage and next steps within one business day.",
    },
    {
      title: "Turnaround",
      body: "Most claims are resolved by mail-in repair or replacement. Once we receive the faulty unit, repairs typically take 7–10 business days; straightforward replacements usually ship within 2–3 business days of approval.",
    },
    {
      title: "Registering your product",
      body: "Registration isn't required to claim warranty — your order ID (visible under My Orders) is proof of purchase and coverage start date.",
    },
  ],
};

export const corporateSales = {
  eyebrow: "For studios, offices & institutions",
  title: "Corporate & bulk sales",
  subtitle:
    "Outfitting a design team, classroom, or studio? RNS INFOTECH supplies pen tablets, pen displays, and stylus hardware at volume with a single point of contact from quote to delivery.",
  benefits: [
    {
      icon: "tag",
      title: "Volume pricing",
      body: "Tiered discounts that scale with order size — the more units, the better the per-unit rate.",
    },
    {
      icon: "fileText",
      title: "GST invoicing",
      body: "Proper GST invoices for every order, so procurement and finance teams don't have to chase paperwork.",
    },
    {
      icon: "headset",
      title: "Dedicated account contact",
      body: "One person on our side who knows your order history and rollout timeline — no re-explaining your setup on every call.",
    },
    {
      icon: "creditCard",
      title: "Flexible payment terms",
      body: "Purchase orders and net-term invoicing available for registered institutions and businesses, on top of standard checkout.",
    },
    {
      icon: "truck",
      title: "Coordinated delivery",
      body: "Staggered or single bulk delivery to one address, timed around your rollout — not one box at a time.",
    },
    {
      icon: "shield",
      title: "Extended warranty options",
      body: "Ask about extending manufacturer warranty coverage for institutional deployments with heavy daily use.",
    },
  ],
  steps: [
    {
      icon: "edit",
      title: "Tell us what you need",
      body: "Products, quantities, and timeline — use the form below or call the team directly.",
    },
    {
      icon: "fileText",
      title: "Get a line-item quote",
      body: "A proposal with per-unit and total pricing, usually within one business day.",
    },
    {
      icon: "truck",
      title: "Coordinated rollout",
      body: "We confirm delivery timing and handle invoicing so your team can plan around it.",
    },
  ],
};

// Blog posts — short buying-guide / care-and-setup style content in the
// pen-tablet/pen-display niche. `categoryId` reuses the same ids as
// `categories` so BlogPage's filter chips and ProductsPage's category
// filter share one vocabulary; posts aren't required to reference a
// category (e.g. company/news posts use `categoryId: null`).
export const blogPosts = [
  {
    slug: "pen-tablet-vs-pen-display",
    title: "Pen tablet vs. pen display: which one actually fits your workflow?",
    excerpt:
      "Screen or no screen — the two most common creative-hardware formats solve different problems. Here's how to tell which one is right for you.",
    coverImage: "/assets/categories/pendisplays.jpg",
    categoryId: "pen-displays",
    category: "Pen Displays",
    author: "RNS Editorial",
    date: "2026-07-02",
    readTime: "5 min read",
    content: [
      "The pen-tablet-vs-pen-display question comes up in almost every first conversation we have with a new customer, and the honest answer is: it depends less on budget than people expect, and more on where you're looking while you draw.",
      "A pen tablet — the kind without a built-in screen — has you looking at your monitor while your hand moves on a separate surface. It takes a few hours to get used to, but once the hand-eye mapping clicks, most people find it fast, light on the desk, and easy to travel with. It's also the more affordable format, and the one most illustrators start on.",
      "A pen display puts the drawing surface and the screen in the same place, so you're drawing directly on the image. That direct feedback is why so many people prefer it once they've tried both — there's no mapping to learn — but it costs more, takes up more desk space, and for some people the glass surface has a slightly different feel than paper-like tablet textures.",
      "If you're new to digital art, we usually suggest starting on a pen tablet: it's the lower-cost way to find out whether the workflow suits you before committing to a pen display. If you already know digital art is part of your daily work, a pen display tends to be worth the jump.",
      "Either way, look at pressure sensitivity levels and tilt support before brand names — most current hardware in both formats covers professional use comfortably, and the difference in feel between models matters more than the spec sheet suggests. Come try both at our demo centre if you're unsure; that's exactly what it's for.",
    ],
  },
  {
    slug: "stylus-nib-care-guide",
    title: "Getting more life out of your stylus nibs",
    excerpt:
      "Nibs are a wear part, not a defect — a bit of care and knowing when to swap keeps your pen feeling consistent for longer.",
    coverImage: "/assets/categories/stylus.jpg",
    categoryId: "stylus",
    category: "Stylus & Pens",
    author: "RNS Editorial",
    date: "2026-06-18",
    readTime: "3 min read",
    content: [
      "Every stylus nib wears down eventually — it's the part of the pen actually touching the surface thousands of times a session, so some wear is normal and not a sign anything's wrong with the pen itself.",
      "The clearest sign it's time to swap is a change in how the pen sounds and feels against the surface: a worn nib tends to feel slightly rougher or looser, and cursor tracking can feel a touch less precise even though nothing's actually broken.",
      "A few habits extend nib life: keep the drawing surface free of dust and grit (a quick wipe with a microfiber cloth before a session helps), avoid pressing much harder than the pressure curve needs, and store the pen somewhere it won't roll off a desk edge onto the nib tip.",
      "Most pens ship with a small set of spare nibs and a removal tool in the box; if you're through those, a replacement nib pack is a low-cost accessory rather than a reason to replace the whole pen.",
    ],
  },
  {
    slug: "understanding-pressure-sensitivity",
    title: "What pressure sensitivity levels actually mean",
    excerpt:
      "8,192 levels sounds impressive on a spec sheet — here's what the number actually changes about how a line feels.",
    coverImage: "/assets/categories/pentablets.jpg",
    categoryId: "pen-tablets",
    category: "Pen Tablets",
    author: "RNS Editorial",
    date: "2026-05-30",
    readTime: "4 min read",
    content: [
      "Pressure sensitivity is how finely a tablet or display can distinguish between a light touch and a hard press, and it's what lets a single brush stroke taper naturally instead of staying one uniform width start to finish.",
      "Most current hardware — tablets and displays alike — sits at 8,192 levels, which is enough headroom that very few artists will feel a ceiling in practice. Going from, say, 2,048 to 8,192 levels is noticeable; going from 8,192 to a hypothetical higher number mostly isn't, at least not with today's software.",
      "What matters more day to day is the pressure curve — how quickly the software ramps from light to heavy pressure — which is usually adjustable in your creative software's tablet settings, independent of the hardware's maximum level count. If lines feel too sensitive or too stiff to control, that's almost always a curve setting to adjust, not a reason to look at higher-spec hardware.",
      "Tilt recognition is the other half of a natural-feeling line — it lets the software vary stroke width based on the angle you're holding the pen at, similar to shading with a real pencil on its side. Not every budget pen supports it, so if that matters to your style, check for it specifically rather than assuming it comes with high pressure levels.",
    ],
  },
  {
    slug: "multi-monitor-pen-display-setup",
    title: "Setting up a pen display alongside a second monitor",
    excerpt:
      "A pen display doesn't have to replace your main monitor — here's how most studios actually wire the two together.",
    coverImage: "/assets/categories/pendisplays.jpg",
    categoryId: "pen-displays",
    category: "Pen Displays",
    author: "RNS Editorial",
    date: "2026-05-10",
    readTime: "4 min read",
    content: [
      "A common worry before buying a pen display is desk space — people picture it replacing their main monitor entirely, which isn't usually how it works out in practice.",
      "Most setups keep the regular monitor for reference material, palettes, and anything that doesn't need a pen (browser tabs, layers panels if your software supports popping them out), and use the pen display purely as the canvas. That split actually reduces clutter on the drawing surface itself.",
      "On Windows and macOS, the pen display shows up as a second display in your display settings — the adjustable stand most displays ship with makes it easy to angle it toward you while the main monitor stays upright behind or beside it.",
      "One setting worth checking on day one: make sure the pen display is mapped to itself in your tablet driver (not stretched across both screens), so the pen tip lines up with the cursor exactly where you touch — most drivers default to this correctly, but it's worth a 30-second check after first setup.",
    ],
  },
  {
    slug: "buying-for-a-studio-bulk-guide",
    title: "A studio's guide to buying pen tablets in bulk",
    excerpt:
      "Outfitting a whole team is a different exercise than a single purchase — a few things worth deciding before you request a quote.",
    coverImage: "/assets/categories/accessories.jpg",
    categoryId: null,
    category: "Guides",
    author: "RNS Editorial",
    date: "2026-04-22",
    readTime: "4 min read",
    content: [
      "Buying one pen tablet is mostly about picking the right model. Buying twelve for a studio adds a few more questions worth settling upfront, before you request a quote.",
      "First: standardize on one or two models rather than letting everyone pick their favorite. It keeps driver support, spare parts, and onboarding simple, and it's usually what gets you the best volume pricing tier.",
      "Second: budget for a small number of spares — nibs at minimum, and ideally one or two spare pens — so a single worn part or DOA unit doesn't take a workstation offline while a replacement ships.",
      "Third: think about delivery timing before you order. If the team's moving desks or onboarding in stages, a staggered delivery lines up better than one large box arriving before anyone's ready to unbox a dozen tablets. Our corporate sales team can coordinate that as part of the quote.",
      "Last, ask about GST invoicing and payment terms upfront rather than at checkout — registered businesses and institutions can usually get purchase-order-based terms rather than paying online per unit.",
    ],
  },
];

