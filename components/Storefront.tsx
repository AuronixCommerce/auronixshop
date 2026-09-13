"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, ExternalLink, Grid2X2, Heart, List, Search, ShieldCheck, SlidersHorizontal, Sparkles, Star, TrendingUp, X } from "lucide-react";
import { useCatalog } from "@/lib/catalog";
import { money, type Product } from "@/lib/types";
import { Footer, Header } from "./Chrome";
import { SmartFinder } from "./SmartFinder";

type ViewMode = "grid" | "list";

export function Storefront({ homepage = false }: { homepage?: boolean }) {
  const { products, categories, loading, error } = useCatalog();
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState("featured");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("grid");
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => { try { setSaved(JSON.parse(localStorage.getItem("auronix-saved") || "[]")); } catch {} }, []);
  const toggleSaved = (id: string) => setSaved(current => {
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    localStorage.setItem("auronix-saved", JSON.stringify(next)); return next;
  });
  const brands = useMemo(() => Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort(), [products]);
  const shown = useMemo(() => products.filter(p => {
    const haystack = `${p.title} ${p.brand} ${p.category} ${p.shortDescription} ${(p.tags || []).join(" ")}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (!category || p.categoryId === category || p.subcategoryId === category) && (!brand || p.brand === brand);
  }).sort((a, b) => sort === "newest" ? b.createdAt - a.createdAt : sort === "low" ? (a.price ?? Infinity) - (b.price ?? Infinity) : sort === "high" ? (b.price ?? -1) - (a.price ?? -1) : sort === "rating" ? (b.rating ?? 0) - (a.rating ?? 0) : Number(b.featured) - Number(a.featured) || (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || b.createdAt - a.createdAt), [products, category, brand, sort, query]);
  const clearFilters = () => { setCategory(""); setBrand(""); setQuery(""); };
  const activeFilters = Number(Boolean(category)) + Number(Boolean(brand)) + Number(Boolean(query));

  return <>
    <Header savedCount={saved.length} />
    <main>
      {homepage && <>
        <section className="premiumHero"><div className="ambient ambientOne"/><div className="ambient ambientTwo"/>
          <div className="wrap premiumHeroGrid">
            <div className="heroCopy"><div className="heroPill"><Sparkles size={14}/> Product discovery, refined</div><h1>Better finds.<br/><span>Fewer guesses.</span></h1><p>Explore a focused collection of useful products, clear comparisons, and buying details—curated by Auronix Commerce.</p><div className="heroActions"><a className="primaryAction" href="#catalog">Explore collection <ArrowRight size={18}/></a><Link className="quietAction" href="/smart-finder">Try Smart Finder <Sparkles size={16}/></Link></div><div className="heroProof"><span><Check size={15}/> Human-managed catalog</span><span><ShieldCheck size={15}/> Secure Amazon checkout</span></div></div>
            <div className="heroShowcase" aria-label="Auronix shopping benefits"><div className="showcaseCard showcaseMain"><span className="showcaseIcon"><TrendingUp/></span><small>CURATED THIS WEEK</small><strong>{loading ? "—" : products.filter(p => p.featured).length || products.length}</strong><p>standout products selected for easier discovery</p></div><div className="showcaseCard showcaseFloat"><ShieldCheck/><div><b>Clear choices</b><span>Details that matter</span></div></div><div className="showcaseCard showcaseFloat second"><Sparkles/><div><b>Smart Finder</b><span>Match by your needs</span></div></div></div>
          </div>
        </section>
        <section className="benefitStrip"><div className="wrap benefitGrid">{["Curated, not crowded","Useful product details","Easy side-by-side thinking","Checkout stays on Amazon"].map((x,i)=><div key={x}><span>0{i+1}</span><b>{x}</b></div>)}</div></section>
        <SmartFinder compact />
      </>}

      <section className="catalogSection" id="catalog"><div className="wrap">
        <div className="catalogIntro"><div><span className="sectionKicker">THE AURONIX EDIT</span><h2>{homepage ? "Products worth a closer look" : "Explore the collection"}</h2><p>Focused choices with the facts you need before visiting Amazon.</p></div><div className="catalogCount"><b>{loading ? "—" : products.length}</b><span>curated products</span></div></div>
        <div className="catalogSearch"><Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products, brands, categories or needs…"/><kbd>⌘ K</kbd>{query && <button aria-label="Clear search" onClick={()=>setQuery("")}><X size={17}/></button>}</div>
        <div className="mobileCategoryRail"><button className={!category ? "active" : ""} onClick={()=>setCategory("")}>All</button>{categories.sort((a,b)=>a.sortOrder-b.sortOrder).map(c=><button className={category===c.id?"active":""} onClick={()=>setCategory(c.id)} key={c.id}>{c.name}</button>)}</div>
        <div className="catalogLayout">
          <aside className={`premiumFilters ${filtersOpen ? "open" : ""}`}><div className="filterTop"><div><SlidersHorizontal size={17}/><b>Filters</b></div><button className="filterClose" onClick={()=>setFiltersOpen(false)}><X/></button></div><Filter title="Categories"><button className={!category?"active":""} onClick={()=>setCategory("")}><span>All products</span><small>{products.length}</small></button>{categories.sort((a,b)=>a.sortOrder-b.sortOrder).map(c=><button className={category===c.id?"active":""} onClick={()=>setCategory(c.id)} key={c.id}><span>{c.name}</span><small>{products.filter(p=>p.categoryId===c.id).length}</small></button>)}</Filter>{brands.length > 0 && <Filter title="Brands"><button className={!brand?"active":""} onClick={()=>setBrand("")}><span>All brands</span><small>{brands.length}</small></button>{brands.map(b=><button className={brand===b?"active":""} onClick={()=>setBrand(b)} key={b}><span>{b}</span></button>)}</Filter>}{activeFilters > 0 && <button className="clearAll" onClick={clearFilters}>Clear all filters</button>}</aside>
          {filtersOpen && <button className="filterBackdrop" aria-label="Close filters" onClick={()=>setFiltersOpen(false)}/>} 
          <div className="catalogResults"><div className="premiumToolbar"><div><button className="filterTrigger" onClick={()=>setFiltersOpen(true)}><SlidersHorizontal size={16}/> Filters {activeFilters>0&&<i>{activeFilters}</i>}</button><span>{loading ? "Loading collection" : `${shown.length} result${shown.length===1?"":"s"}`}</span></div><div className="viewControls"><label>Sort <select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured first</option><option value="newest">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="rating">Top rated</option></select><ChevronDown size={14}/></label><button className={view==="grid"?"active":""} onClick={()=>setView("grid")} aria-label="Grid view"><Grid2X2/></button><button className={view==="list"?"active":""} onClick={()=>setView("list")} aria-label="List view"><List/></button></div></div>
            {error && <div className="catalogMessage error"><b>We couldn’t load the collection.</b><span>Please refresh in a moment.</span></div>}{loading ? <LoadingGrid/> : shown.length===0 ? <div className="catalogMessage"><Search/><h3>No matching products</h3><p>Try a broader search or clear your filters.</p><button onClick={clearFilters}>Reset filters</button></div> : <div className={`premiumProducts ${view}`}>{shown.map(p=><ProductCard key={p.id} product={p} saved={saved.includes(p.id)} onSave={()=>toggleSaved(p.id)}/>)}</div>}
          </div>
        </div>
      </div></section>
      {homepage && <section className="editorialBand"><div className="wrap editorialGrid"><div><span className="sectionKicker">SHOP WITH CONTEXT</span><h2>Know what matters before you choose.</h2></div><div className="editorialLinks">{[["/guides","Buying guides","Understand the details that make a real difference."],["/how-it-works","How Auronix works","See how discovery and Amazon checkout connect."],["/categories","Browse categories","Move through the full catalog by product family."]].map((x,i)=><Link href={x[0]} key={x[0]}><span>0{i+1}</span><div><b>{x[1]}</b><p>{x[2]}</p></div><ArrowRight/></Link>)}</div></div></section>}
    </main><Footer />
  </>;
}

function LoadingGrid(){return <div className="premiumProducts grid" aria-label="Loading products" aria-busy="true">{Array.from({length:8}).map((_,i)=><div className="premiumCard loadingCard" key={i}><div className="skeleton photoSkeleton"/><div className="skeleton tinySkeleton"/><div className="skeleton lineSkeleton"/><div className="skeleton halfSkeleton"/></div>)}</div>}
function Filter({title,children}:{title:string;children:React.ReactNode}){return <div className="premiumFilterGroup"><h3>{title}</h3>{children}</div>}
export function ProductCard({product:p,saved=false,onSave}:{product:Product;saved?:boolean;onSave?:()=>void}){return <article className="premiumCard"><div className="productVisual"><Link href={`/product/${p.slug}`}><img src={p.mainImageUrl} alt={p.title}/></Link><div className="badgeStack">{p.badges?.slice(0,2).map(x=><span key={x}>{x}</span>)}</div>{onSave&&<button className={`saveButton ${saved?"saved":""}`} onClick={onSave} aria-label={saved?"Remove from saved":"Save product"}><Heart fill={saved?"currentColor":"none"}/></button>}</div><div className="productBody"><div className="productMeta"><span>{p.brand||p.category||"Auronix pick"}</span>{typeof p.rating==="number"&&<span className="productRating"><Star fill="currentColor"/> {p.rating}{p.ratingCount&&<small> ({p.ratingCount})</small>}</span>}</div><Link href={`/product/${p.slug}`}><h3>{p.title}</h3></Link>{p.shortDescription&&<p className="productExcerpt">{p.shortDescription}</p>}<div className="productFooter"><div className="premiumPrice"><b>{money(p.price,p.currency)||"View price"}</b>{p.oldPrice&&<del>{money(p.oldPrice,p.currency)}</del>}</div><a href={p.amazonUrl} target="_blank" rel="sponsored nofollow noopener noreferrer">View on Amazon <ExternalLink/></a></div></div></article>}
