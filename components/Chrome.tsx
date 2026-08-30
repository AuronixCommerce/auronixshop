"use client";
import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { useState } from "react";
export function Header() {
  const [q, setQ] = useState("");
  return (
    <>
      <div className="utility">
        Curated product discovery · Purchases are completed on Amazon
      </div>
      <header className="header">
        <div className="wrap head">
          <Link className="logo" href="/">
            <span className="mark">
              <ShoppingBag />
            </span>
            <span>
              AURONIX<small>COMMERCE SHOP</small>
            </span>
          </Link>
          <form className="search" action="/smart-finder">
            <input
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands and categories"
            />
            <button aria-label="Search">
              <Search size={20} />
            </button>
          </form>
        </div>
        <nav className="nav">
          <div className="wrap navin">
            <Link href="/shop">Shop</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/smart-finder">Smart Finder</Link>
            <Link href="/about">About Us</Link>
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/guides">Guides</Link>
            <Link href="/contact">Contact</Link>
            <Link className="officialLink" href="/auronix-commerce">Auronix Commerce ↗</Link>
          </div>
        </nav>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap foot">
        <div>
          <strong>AURONIX COMMERCE SHOP</strong>
          <p>
            A professionally managed product discovery storefront. Products are
            purchased from Amazon, not from Auronix Commerce.
          </p>
          <div className="footerLinks">
            <Link href="/about">About</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/guides">Guides</Link>
            <Link href="/auronix-commerce">Official Auronix pages</Link>
          </div>
        </div>
        <div>
          <strong>Amazon Associates disclosure</strong>
          <p>
            As an Amazon Associate, Auronix Commerce earns from qualifying
            purchases. Prices, availability, shipping, returns and warranties
            are confirmed on Amazon.
          </p>
          <div className="footerLinks">
            <Link href="/affiliate-disclosure">Disclosure</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/info/accessibility">Accessibility</Link>
            <a href="https://auronixcommerce.com" target="_blank" rel="noopener noreferrer">Official website</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
