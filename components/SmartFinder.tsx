"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { useCatalog } from "@/lib/catalog";
import { ProductCard } from "./Storefront";

export function SmartFinder({ compact = false }: { compact?: boolean }) {
  const { products, loading } = useCatalog();
  const [query, setQuery] = useState("");
  useEffect(() => {
    const incoming = new URLSearchParams(window.location.search).get("q");
    if (incoming) setQuery(incoming);
  }, []);
  const results = useMemo(() => {
    const clean = query.toLowerCase().trim();
    if (!clean) return compact ? products.slice(0, 4) : products.slice(0, 8);
    const tokens = clean.split(/\s+/).filter((word) => word.length > 1);
    const budget = clean.match(/(?:under|below|less than|max)\s*\$?([\d.]+)/)?.[1];
    return products.map((product) => {
      const title = product.title.toLowerCase(), brand = product.brand.toLowerCase();
      const tags = (product.tags || []).join(" ").toLowerCase();
      const details = [product.category, product.subcategory, product.shortDescription, product.description, ...(product.bullets || [])].join(" ").toLowerCase();
      let score = tokens.reduce((total, token) => total + (title.includes(token) ? 9 : 0) + (brand.includes(token) ? 6 : 0) + (tags.includes(token) ? 5 : 0) + (details.includes(token) ? 2 : 0), 0);
      if (clean.includes("best rated")) score += (product.rating || 0) * 2;
      if (clean.includes("deal") || clean.includes("discount")) score += product.oldPrice ? 8 : 0;
      return { product, score };
    }).filter(({ product, score }) => score > 0 && (!budget || (product.price ?? Infinity) <= Number(budget)))
      .sort((a, b) => b.score - a.score || Number(b.product.featured) - Number(a.product.featured))
      .slice(0, compact ? 4 : 12).map(({ product }) => product);
  }, [products, query, compact]);
  return <section className={`section smartFinder ${compact ? "compact" : ""}`}>
    <div className="wrap">
      <div className="smartIntro"><span className="smartIcon"><Sparkles /></span><div><div className="eyebrow">Auronix Smart Finder</div><h2>Describe what you need</h2><p>Search naturally, such as “wireless headphones under $100,” “best rated kitchen tools,” or a brand name.</p></div></div>
      <div className="smartSearch"><Search/><input aria-label="Describe the product you need" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="What are you looking for?"/><button onClick={() => setQuery(query.trim())}>Find products</button></div>
      {loading ? <p className="smartStatus">Analyzing the catalog…</p> : query && !results.length ? <div className="empty"><h3>No close match found</h3><p>Try a broader need, category, brand or a different budget.</p></div> : <div className="products smartResults">{results.map((product) => <ProductCard key={product.id} product={product}/>)}</div>}
      <p className="smartNote">Smart Finder ranks only published Auronix catalog information. Product facts and current availability should be confirmed on Amazon.</p>
    </div>
  </section>;
}
