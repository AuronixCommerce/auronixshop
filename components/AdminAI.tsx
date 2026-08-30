"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import type { Product } from "@/lib/types";
type Draft = Omit<Product, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: number };
export function AdminAI({ form, setForm }: { form: Draft; setForm: React.Dispatch<React.SetStateAction<Draft>> }) {
  const [brief, setBrief] = useState(""), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const generate = async () => {
    setBusy(true); setMessage("Groq is preparing your product listing…");
    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) throw new Error("Your admin session expired. Sign in again.");
      const response = await fetch("/api/admin/ai", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: form.title, brand: form.brand, brief }) });
      const raw = await response.text(), contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) throw new Error(response.ok ? "The AI service returned an invalid response." : "The AI route is unavailable. Redeploy after adding GROQ_API_KEY.");
      let data: any; try { data = JSON.parse(raw); } catch { throw new Error("The AI service returned malformed data. Please try again."); }
      if (!response.ok) throw new Error(data.error || `AI request failed (${response.status}).`);
      setForm((current) => ({ ...current, shortDescription: data.shortDescription || current.shortDescription, description: data.description || current.description, bullets: Array.isArray(data.bullets) ? data.bullets : current.bullets, tags: Array.isArray(data.tags) ? data.tags : current.tags, seoTitle: data.seoTitle || current.seoTitle, seoDescription: data.seoDescription || current.seoDescription }));
      setMessage("AI listing applied below. Add your price, Amazon link and picture links, review everything, then publish.");
    } catch (error: any) { setMessage(error.message || "AI generation failed."); } finally { setBusy(false); }
  };
  return <section className="aiPanel"><div className="eyebrow">Step 1 · AI listing assistant</div><h2>Paste product facts and let AI prepare the listing</h2><p>Enter the product name below, then paste verified Amazon details here. AI fills descriptions, feature bullets, tags and SEO. It never changes your price, affiliate link or pictures.</p><textarea value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="Paste the real product description, specifications and features here…"/><div className="aiActions"><button type="button" disabled={busy} onClick={generate}>{busy ? "Creating your listing…" : "AI: Create best product listing"}</button></div>{message && <p role="status">{message}</p>}</section>;
}
