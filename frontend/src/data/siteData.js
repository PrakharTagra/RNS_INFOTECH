// Site content for RNS INFOTECH — copy, catalogue, and page data.
// Product category aligned with reference: pen tablets, pen displays,
// stylus/pens, and accessories for digital artists, designers, and creators.
// Replace each export with a fetch/query later — component props are
// shaped to match these structures, so swapping is a data-only change.

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

// Driver/manual downloads, grouped by category so a product detail page
// can pull "downloads for this product's category" plus anything tagged
// universal. Placeholder hrefs ("#") match the pattern used elsewhere in
// this mock dataset (e.g. `downloads[].href` below) until real asset
// URLs exist.
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
    { label: "Returns & product support", href: "/return-policy" },
  ],
  newsletter: {
    title: "Get restock alerts & offers",
    body: "Occasional emails about new arrivals, price drops, and bulk-order deals. No spam.",
    placeholder: "you@studio.com",
    cta: "Subscribe",
  },
  // Placeholder hrefs ("#") match the pattern used elsewhere in this mock
  // dataset (e.g. `downloads[].href` above) until real social profile
  // URLs exist.
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

