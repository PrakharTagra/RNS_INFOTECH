import React, { useEffect, useState } from "react";

import AnnouncementBar from "./components/AnnouncementBar";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedCategories from "./components/FeaturedCategories";
import ProductGrid from "./components/ProductGrid";
import WhyChooseUs from "./components/WhyChooseUs";
import Solutions from "./components/Solutions";
import PromoBanner from "./components/PromoBanner";
import Testimonials from "./components/Testimonials";
import FAQs from "./components/FAQs";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";
import SEO from "./components/SEO";
import Reveal from "./components/ui/Reveal";
import { Trace } from "./components/SectionHeader";
import { apiRequest, normalizeProduct } from "./lib/api";
import { getFaqContent } from "./lib/contentApi";

import {
  announcement,
  nav,
  footer,
} from "./data/siteData";

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RNS INFOTECH",
  url: typeof window !== "undefined" ? window.location.origin : undefined,
  description:
    "Authorized dealer of pen tablets, pen displays, and stylus hardware for artists, designers, and creators.",
  sameAs: [],
};

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [website, setWebsite] = useState({ hero: null, promo: null, whyChooseUs: [], solutions: [], testimonials: [] });
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const [catalogResult, websiteResult] = await Promise.allSettled([
        Promise.all([apiRequest("/categories"), apiRequest("/products?page=1&limit=24")]),
        Promise.all([apiRequest("/website"), getFaqContent()]),
      ]);

      if (ignore) return;

      if (catalogResult.status === "fulfilled") {
        const [categoriesRes, productsRes] = catalogResult.value;
        const nextCategories = (categoriesRes?.items || []).map((category) => ({
          id: category.slug || category._id,
          name: category.name,
          image: category.image?.url || category.image || "/assets/categories/pentablets.jpg",
          icon: "layers",
        }));
        setCategories(nextCategories);
        setProducts((productsRes?.items || []).map(normalizeProduct));
      }

      if (websiteResult.status === "fulfilled") {
        const [websiteResponse, faqResponse] = websiteResult.value;
        setWebsite(websiteResponse?.website || { hero: null, promo: null, whyChooseUs: [], solutions: [], testimonials: [] });
        setFaqs(faqResponse || []);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <SEO
        title="Pen Tablets, Pen Displays & Stylus Hardware"
        description="RNS INFOTECH is an authorized dealer of pen tablets, pen displays, and stylus hardware — genuine products, manufacturer warranty, and fast dispatch for artists, studios, and businesses."
        jsonLd={ORGANIZATION_JSON_LD}
      />
      <AnnouncementBar {...announcement} />
      <Navbar {...nav} />
      {website.hero && <Hero {...website.hero} />}

      <FeaturedCategories categories={categories} />

      <ProductGrid
        id="products"
        eyebrow="Catalogue"
        title="Featured products"
        subtitle="A cross-section of what businesses order most this quarter."
        products={products}
        filterTag="featured"
        altBg
        action={{ label: "View full catalogue", href: "/products" }}
      />

      <WhyChooseUs items={website.whyChooseUs} />
      <Solutions items={website.solutions} />

      <div className="rns-container" style={{ padding: "0 24px" }}>
        <Trace nodes={4} />
      </div>

      <Reveal as="div">
        {website.promo && <PromoBanner {...website.promo} />}
      </Reveal>

      <ProductGrid
        id="new-arrivals"
        eyebrow="Just in"
        title="New arrivals"
        subtitle="Recently added to the catalogue — first stock windows move fastest."
        products={products}
        filterTag="new"
        action={{ label: "View all new arrivals", href: "/products?tag=new" }}
      />

      <ProductGrid
        id="best-sellers"
        eyebrow="Most ordered"
        title="Best sellers"
        subtitle="What creators and studios keep reordering."
        products={products}
        filterTag="best-seller"
        altBg
        action={{ label: "View all best sellers", href: "/products?tag=best-seller" }}
      />

      <Testimonials items={website.testimonials} />
      <FAQs items={faqs} />

      <Reveal as="div">
        <CTASection
          eyebrow="Buying for a team?"
          title="Get bulk pricing for studios, offices, and institutions"
          body="Tell us what you need and how many — we'll come back with a line-item quote, typically within one business day."
          primaryCta={{ label: "See corporate sales", href: "/corporate-sales" }}
          secondaryCta={{ label: "Book a demo", href: "/demo" }}
        />
      </Reveal>
      <Footer logo={nav.logo} {...footer} whyChooseUs={website.whyChooseUs} />
    </>
  );
}
