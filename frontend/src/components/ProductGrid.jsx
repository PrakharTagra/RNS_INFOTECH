import React from "react";
import { SectionHeader } from "./SectionHeader";
import ProductCard from "./ProductCard";
import Reveal from "./ui/Reveal";
import { EmptyState } from "./ui/Stateviews";

/**
 * ProductGrid — one section component reused for Featured Products,
 * New Arrivals, and Best Sellers. Pass a `filterTag` to select which
 * slice of the product list to show, or omit it to show all. Renders
 * an EmptyState instead of a blank grid if the tag matches nothing,
 * so a bad/renamed tag fails visibly instead of silently.
 */
export default function ProductGrid({
  id,
  eyebrow,
  title,
  subtitle,
  products = [],
  filterTag,
  limit,
  altBg = false,
  action,
}) {
  let list = Array.isArray(products) ? [...products] : [];
  if (filterTag) {
    list = list.filter((p) => p.tag === filterTag || (filterTag === "featured" && p.isFeatured));
  }
  if (limit) list = list.slice(0, limit);

  return (
    <section id={id} className={`rns-section ${altBg ? "rns-section--alt" : ""}`}>
      <div className="rns-container">
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} action={action} />
        {list.length === 0 ? (
          <EmptyState
            icon="layers"
            title="Nothing in this collection yet"
            message="Check back soon, or browse the full catalogue in the meantime."
            action={{ label: "Browse catalogue", href: "/products" }}
          />
        ) : (
          <div className="rns-grid rns-grid--4">
            {list.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 3)} style={{ height: "100%" }}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
