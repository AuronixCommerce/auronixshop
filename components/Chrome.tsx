"use client";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import { useState } from "react";

const links = [["/shop","Shop"],["/categories","Categories"],["/smart-finder","Smart Finder"],["/guides","Guides"],["/about","About"]];

export function Header({savedCount=0}:{savedCount?:number}) {
  const [q,setQ]=useState(""); const [open,setOpen]=useState(false);
  return <>
    <div className="premiumUtility"><div className="wrap"><span><Sparkles size={12}/> Independent product discovery by Auronix Commerce</span><span>Purchases completed securely on Amazon</span></div></div>
    <header className="premiumHeader"><div className="wrap premiumHead">
      <Link className="premiumLogo" href="/"><span className="premiumMark"><ShoppingBag/></span><span>AURONIX<small>COMMERCE SHOP</small></span></Link>
      <form className="headerSearch" action="/smart-finder"><Search/><input name="q" value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/><button>Search</button></form>
      <div className="headActions"><Link href="/smart-finder" aria-label="Smart Finder"><Sparkles/><span>Finder</span></Link><button type="button" aria-label="Saved products"><Heart/><span>Saved</span>{savedCount>0&&<i>{savedCount}</i>}</button><button className="menuButton" onClick={()=>setOpen(!open)} aria-label="Menu">{open?<X/>:<Menu/>}</button></div>
    </div><nav className={`premiumNav ${open?"open":""}`}><div className="wrap">{links.map(([href,label])=><Link href={href} key={href} onClick={()=>setOpen(false)}>{label}</Link>)}<Link href="/how-it-works" onClick={()=>setOpen(false)}>How it works</Link><Link href="/contact" onClick={()=>setOpen(false)}>Contact</Link><a className="companyLink" href="https://auronixcommerce.com" target="_blank" rel="noopener noreferrer">Corporate site ↗</a></div></nav></header>
  </>;
}

export function Footer(){return <footer className="premiumFooter"><div className="wrap"><div className="footerBrand"><Link className="premiumLogo inverted" href="/"><span className="premiumMark"><ShoppingBag/></span><span>AURONIX<small>COMMERCE SHOP</small></span></Link><p>A focused product-discovery experience by Auronix Commerce LLC. We help visitors research products; Amazon handles purchases and fulfillment.</p></div><div className="footerColumns"><div><b>Discover</b><Link href="/shop">Shop all</Link><Link href="/categories">Categories</Link><Link href="/smart-finder">Smart Finder</Link><Link href="/guides">Buying guides</Link></div><div><b>Company</b><Link href="/about">About</Link><Link href="/how-it-works">How it works</Link><Link href="/contact">Contact</Link><a href="https://auronixcommerce.com">Corporate site</a></div><div><b>Legal</b><Link href="/affiliate-disclosure">Affiliate disclosure</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/info/accessibility">Accessibility</Link></div></div></div><div className="footerBottom"><div className="wrap"><span>© {new Date().getFullYear()} Auronix Commerce LLC</span><span>As an Amazon Associate, Auronix Commerce earns from qualifying purchases.</span></div></div></footer>}
