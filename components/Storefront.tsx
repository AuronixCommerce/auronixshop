"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useCatalog } from "@/lib/catalog";
import { money, type Product } from "@/lib/types";
import { Footer, Header } from "./Chrome";
import { SmartFinder } from "./SmartFinder";
export function Storefront({ homepage = false }: { homepage?: boolean }) {
  const { products, categories, loading, error } = useCatalog(),
    [category, setCategory] = useState(""),
    [brand, setBrand] = useState(""),
    [sort, setSort] = useState("featured");
  const brands = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort(),
    [products],
  );
  const shown = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (!category ||
              p.categoryId === category ||
              p.subcategoryId === category) &&
            (!brand || p.brand === brand),
        )
        .sort((a, b) =>
          sort === "newest"
            ? b.createdAt - a.createdAt
            : sort === "low"
              ? (a.price ?? Infinity) - (b.price ?? Infinity)
              : sort === "high"
                ? (b.price ?? -1) - (a.price ?? -1)
                : sort === "rating"
                  ? (b.rating ?? 0) - (a.rating ?? 0)
                  : Number(b.featured) - Number(a.featured) ||
                    (a.sortOrder ?? 999) - (b.sortOrder ?? 999) ||
                    b.createdAt - a.createdAt,
        ),
    [products, category, brand, sort],
  );
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="wrap heroGrid">
            <div>
              <div className="eyebrow">Curated by Auronix Commerce</div>
              <h1>
                Discover well.
                <br />
                Decide confidently.
              </h1>
              <p>
                Explore a carefully managed catalog with full product details,
                useful filters and clear information—then complete your
                purchase securely on Amazon.
              </p>
              <a className="cta" href="#catalog">
                Explore the collection <ArrowRight size={19} />
              </a>
            </div>
            <div className="trust">
              <div>
                <ShieldCheck />
                <strong>Clear product details</strong>
                <span>Every listing is managed by the Auronix team.</span>
              </div>
              <div>
                <ShoppingCart />
                <strong>Amazon checkout</strong>
                <span>Payment, delivery and returns stay on Amazon.</span>
              </div>
            </div>
          </div>
        </section>
        {homepage && (
          <>
            <section className="featureRibbon">
              <div className="wrap featureRibbonGrid">
                <div><strong>Smart discovery</strong><span>Search by need, category or budget</span></div>
                <div><strong>Detailed comparisons</strong><span>Prices, features and specifications</span></div>
                <div><strong>Curated catalog</strong><span>Listings managed from one secure admin</span></div>
                <div><strong>Amazon checkout</strong><span>Complete purchases with Amazon</span></div>
              </div>
            </section>
            <SmartFinder compact />
            <section className="section discoveryLinks">
              <div className="wrap">
                <div className="sectionHead"><div><div className="eyebrow">Explore deeper</div><h2>Everything you need before choosing</h2></div></div>
                <div className="discoveryGrid">
                  <Link href="/categories"><b>Shop by category</b><span>Navigate the complete catalog by product family.</span><ArrowRight /></Link>
                  <Link href="/guides"><b>Buying guides</b><span>Learn what matters before comparing products.</span><ArrowRight /></Link>
                  <Link href="/how-it-works"><b>How Auronix works</b><span>Understand discovery, affiliate links and Amazon checkout.</span><ArrowRight /></Link>
                </div>
              </div>
            </section>
          </>
        )}
        <section className="section" id="catalog">
          <div className="wrap">
            <div className="sectionHead">
              <div>
                <div className="eyebrow" style={{ color: "#9a6200" }}>
                  Shop the catalog
                </div>
                <h2>Find the right product</h2>
              </div>
              <p>
                {loading
                  ? "Loading products…"
                  : `${shown.length} products available`}
              </p>
            </div>
            {error && (
              <div className="error">
                The product catalog is temporarily unavailable. Please return
                shortly or continue to our shopping guides.
              </div>
            )}
            <div className="shopGrid">
              <aside className="filters">
                <Filter title="Categories">
                  <button
                    className={!category ? "active" : ""}
                    onClick={() => setCategory("")}
                  >
                    All products
                  </button>
                  {categories
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((c) => (
                      <button
                        className={category === c.id ? "active" : ""}
                        onClick={() => setCategory(c.id)}
                        key={c.id}
                      >
                        {c.name}
                      </button>
                    ))}
                </Filter>
                <Filter title="Brands">
                  <button
                    className={!brand ? "active" : ""}
                    onClick={() => setBrand("")}
                  >
                    All brands
                  </button>
                  {brands.map((b) => (
                    <button
                      className={brand === b ? "active" : ""}
                      onClick={() => setBrand(b)}
                      key={b}
                    >
                      {b}
                    </button>
                  ))}
                </Filter>
              </aside>
              <div>
                <div className="toolbar">
                  <span>Showing {shown.length} results</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="low">Price: low to high</option>
                    <option value="high">Price: high to low</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
                {loading ? (
                  <LoadingGrid />
                ) : shown.length === 0 ? (
                  <div className="empty">
                    <h3>No products match this selection</h3>
                    <p>Try another category, brand, or sorting option.</p>
                  </div>
                ) : (
                  <div className="products">
                    {shown.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="section steps">
          <div className="wrap">
            <div className="sectionHead">
              <div>
                <h2>Shopping is simple</h2>
                <p>
                  Auronix helps you discover. Amazon handles the transaction.
                </p>
              </div>
            </div>
            <div className="stepsGrid">
              {[
                "Browse the Auronix catalog",
                "Review details and specifications",
                "Buy securely on Amazon",
              ].map((x, i) => (
                <div className="step" key={x}>
                  <b>0{i + 1}</b>
                  <h3>{x}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
function LoadingGrid() {
  return <div className="products" aria-label="Loading products" aria-busy="true">
    {Array.from({ length: 8 }).map((_, i) => <div className="card skeletonCard" key={i}><div className="skeleton skeletonPhoto"/><div className="skeleton skeletonLine short"/><div className="skeleton skeletonLine"/><div className="skeleton skeletonLine medium"/><div className="skeleton skeletonButton"/></div>)}
  </div>;
}
function Filter({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="filterGroup">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
export function ProductCard({ product: p }: { product: Product }) {
  return (
    <article className="card">
      <Link href={`/product/${p.slug}`}>
        <div className="photo">
          <img src={p.mainImageUrl} alt={p.title} />
          {p.badges?.[0] && <span className="badge">{p.badges[0]}</span>}
        </div>
        <div className="brand">{p.brand || p.category}</div>
        <h3>{p.title}</h3>
        {typeof p.rating === "number" && (
          <div className="rating">
            {p.rating} <Star size={13} fill="currentColor" />{" "}
            {p.ratingCount && `(${p.ratingCount})`}
          </div>
        )}
        <div className="price">
          {money(p.price, p.currency) || "See Amazon"}
          {p.oldPrice && <del>{money(p.oldPrice, p.currency)}</del>}
        </div>
      </Link>
      <a
        className="amazon"
        href={p.amazonUrl}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
      >
        Shop on Amazon <ExternalLink size={14} />
      </a>
    </article>
  );
}
