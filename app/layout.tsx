import type{Metadata}from'next';import'./globals.css';import'./animations.css';import'./responsive-fixes.css';
export const metadata:Metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://shop.auronixcommerce.com'),title:{default:'Auronix Commerce Shop',template:'%s | Auronix Commerce Shop'},description:'Discover products curated by Auronix Commerce and shop securely on Amazon.',robots:{index:true,follow:true}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
