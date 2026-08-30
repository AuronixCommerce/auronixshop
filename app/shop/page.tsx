import type { Metadata } from "next";
import { Storefront } from "@/components/Storefront";
export const metadata: Metadata = { title: "Shop", description: "Browse the complete Auronix Commerce affiliate product catalog." };
export default function ShopPage() { return <Storefront />; }
