import type { Metadata } from "next";
import { Header, Footer } from "@/components/Chrome";
import { SmartFinder } from "@/components/SmartFinder";
export const metadata: Metadata = { title: "Smart Product Finder", description: "Describe what you need and discover relevant products in the Auronix Commerce catalog." };
export default function SmartFinderPage() { return <><Header/><main><SmartFinder/></main><Footer/></>; }
