import { products, categories, solutions, faqs } from "../data/siteData";

// Pages that aren't otherwise represented in the catalogue data but
// are still reasonable things to land on from a site-wide search.
const STATIC_PAGES = [
  {
    title: "About RNS INFOTECH",
    subtitle: "Our story, mission, and the team behind RNS INFOTECH.",
    href: "/about",
    keywords: "about us company story mission team",
  },
  {
    title: "Book a demo",
    subtitle: "Try a pen display or tablet hands-on, in-store or on a call.",
    href: "/demo",
    keywords: "demo trial book appointment try before you buy",
  },
  {
    title: "Request a quote",
    subtitle: "Bulk pricing for studios, schools, and offices.",
    href: "/request-quote",
    keywords: "quote bulk pricing institution studio school office order",
  },
  {
    title: "Help & support",
    subtitle: "Contact us, browse FAQs, or start a chat with our team.",
    href: "/help",
    keywords: "help support contact chat warranty claim",
  },
  {
    title: "Return & refund policy",
    subtitle: "Return window, eligibility, refunds, and exchanges.",
    href: "/return-policy",
    keywords: "return refund exchange policy replace damaged defective",
  },
];

export const TYPE_LABELS = {
  product: "Products",
  category: "Categories",
  service: "Services",
  faq: "Help & FAQs",
  page: "Pages",
};

function buildIndex() {
  const items = [];

  products.forEach((p) => {
    items.push({
      type: "product",
      id: p.id,
      title: p.name,
      subtitle: `${p.category} · ₹${p.price.toLocaleString("en-IN")}`,
      image: p.image,
      href: `/products/${p.id}`,
      keywords: [p.name, p.category, p.sku, p.shortDescription].join(" ").toLowerCase(),
    });
  });

  categories.forEach((c) => {
    items.push({
      type: "category",
      id: c.id,
      title: c.name,
      subtitle: `Browse the ${c.name} category`,
      image: c.image,
      href: `/products?category=${c.id}`,
      keywords: c.name.toLowerCase(),
    });
  });

  solutions.forEach((s, i) => {
    items.push({
      type: "service",
      id: `solution-${i}`,
      title: s.title,
      subtitle: s.body,
      href: "/#solutions",
      keywords: `${s.title} ${s.body}`.toLowerCase(),
    });
  });

  faqs.forEach((f, i) => {
    items.push({
      type: "faq",
      id: `faq-${i}`,
      title: f.q,
      subtitle: f.a,
      href: "/help#faqs",
      keywords: `${f.q} ${f.a}`.toLowerCase(),
    });
  });

  STATIC_PAGES.forEach((pg, i) => {
    items.push({
      type: "page",
      id: `page-${i}`,
      title: pg.title,
      subtitle: pg.subtitle,
      href: pg.href,
      keywords: pg.keywords,
    });
  });

  return items;
}

let cachedIndex = null;
function getSearchIndex() {
  if (!cachedIndex) cachedIndex = buildIndex();
  return cachedIndex;
}

/**
 * searchSite — plain-text search across the whole catalogue and site
 * (products, categories, services, FAQs, static pages).
 * Every query word must appear somewhere in the item; results are
 * ranked with title matches weighted above description matches.
 */
export function searchSite(query, { limit } = {}) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const index = getSearchIndex();

  const results = index
    .map((item) => {
      const titleLower = item.title.toLowerCase();
      const haystack = `${titleLower} ${item.subtitle || ""} ${item.keywords || ""}`.toLowerCase();
      const matchesAll = terms.every((t) => haystack.includes(t));
      if (!matchesAll) return null;

      let score = 0;
      if (titleLower === q) score += 20;
      else if (titleLower.startsWith(q)) score += 12;
      else if (titleLower.includes(q)) score += 8;
      terms.forEach((t) => {
        if (titleLower.includes(t)) score += 3;
      });

      return { ...item, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  return typeof limit === "number" ? results.slice(0, limit) : results;
}
