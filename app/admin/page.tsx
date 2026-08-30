"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { get, push, ref, remove, set } from "firebase/database";
import { auth, db, firebaseConfigured } from "@/lib/firebase";
import { useCatalog } from "@/lib/catalog";
import { blankProduct, type Product } from "@/lib/types";
import { AdminAI } from "@/components/AdminAI";
type Draft = ReturnType<typeof blankProduct> & {
  id?: string;
  createdAt?: number;
};
function editableProduct(p: Product): Draft {
  return {
    ...blankProduct(),
    ...p,
    galleryImageUrls: Array.isArray(p.galleryImageUrls) ? p.galleryImageUrls : [],
    bullets: Array.isArray(p.bullets) ? p.bullets : [],
    badges: Array.isArray(p.badges) ? p.badges : [],
    tags: Array.isArray(p.tags) ? p.tags : [],
    specifications: p.specifications && typeof p.specifications === "object" ? p.specifications : {},
  };
}
export default function Admin() {
  const [user, setUser] = useState<User | null | undefined>(),
    [allowed, setAllowed] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState("");
  useEffect(() => {
    if (!auth) {
      setUser(null);
      return;
    }
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u || !db) {
        setAllowed(false);
        return;
      }
      const role = (await get(ref(db, `users/${u.uid}/role`))).val();
      setAllowed(role === "admin");
      if (role !== "admin")
        setMessage("This account does not have Auronix admin access.");
    });
  }, []);
  if (!firebaseConfigured)
    return (
      <div className="login">
        <div className="loginCard">
          <h1>Store configuration required</h1>
          <p>
            Add the seven NEXT_PUBLIC_FIREBASE_* variables in Vercel. The public
            site will remain online instead of returning a 500.
          </p>
        </div>
      </div>
    );
  if (!user || !allowed)
    return (
      <div className="login">
        <form
          className="loginCard"
          onSubmit={async (e) => {
            e.preventDefault();
            setMessage("Signing in…");
            try {
              if (auth) await signInWithEmailAndPassword(auth, email, password);
            } catch {
              setMessage("Email or password is incorrect.");
            }
          }}
        >
          <h1>Auronix Shop Admin</h1>
          <p>Use the existing Auronix administrator account.</p>
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="adminBtn">Sign in</button>
          {message && <p>{message}</p>}
        </form>
      </div>
    );
  return <Dashboard onLogout={() => auth && signOut(auth)} />;
}
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { products, categories } = useCatalog(true),
    [form, setForm] = useState<Draft>(blankProduct()),
    [categoryName, setCategoryName] = useState(""),
    [message, setMessage] = useState("");
  const change = (k: keyof Draft, v: any) => setForm((x) => ({ ...x, [k]: v }));
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    try {
      const a = new URL(form.amazonUrl),
        i = new URL(form.mainImageUrl);
      if (a.protocol !== "https:" || i.protocol !== "https:") throw new Error();
    } catch {
      return setMessage("Image and Amazon URLs must be complete HTTPS URLs.");
    }
    if (!form.title || !form.slug || !form.categoryId)
      return setMessage("Title, slug and category are required.");
    const now = Date.now(),
      target = form.id
        ? ref(db, `affiliateShop/products/${form.id}`)
        : push(ref(db, "affiliateShop/products")),
      price =
        form.price === undefined || String(form.price) === ""
          ? null
          : Number(form.price),
      oldPrice =
        form.oldPrice === undefined || String(form.oldPrice) === ""
          ? null
          : Number(form.oldPrice);
    try {
      const { id: _id, ...productData } = form;
      await set(target, {
        ...productData,
        createdAt: form.createdAt || now,
        updatedAt: now,
        price,
        oldPrice,
      });
      const wasEditing = Boolean(form.id);
      setForm(blankProduct());
      setMessage(wasEditing ? "Product updated successfully." : "Product created successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Firebase rejected the save. Check the admin database rules and try again.");
    }
  };
  const edit = (p: Product) => {
    setForm(editableProduct(p));
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMessage(`Editing “${p.title}”. Make changes and choose Save product.`);
  };
  return (
    <div className="admin">
      <div className="adminTop">
        <div
          className="wrap"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <b>AURONIX SHOP ADMIN</b>
          <div>
            <Link href="/" target="_blank" style={{ marginRight: 20 }}>
              View store
            </Link>
            <button className="adminBtn" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </div>
      </div>
      <main className="wrap adminMain">
        <h1>Affiliate catalog</h1>
        <AdminAI form={form} setForm={setForm} />
        <div className="stats">
          {[
            ["Products", products.length],
            [
              "Published",
              products.filter((p) => p.status === "published").length,
            ],
            ["Drafts", products.filter((p) => p.status === "draft").length],
            ["Categories", categories.length],
          ].map(([x, n]) => (
            <div className="stat" key={x}>
              <span>{x}</span>
              <b>{n}</b>
            </div>
          ))}
        </div>
        <div className="adminGrid">
          <form className="panel" onSubmit={save}>
            <h2>{form.id ? "Edit product" : "Add product"}</h2>
            {message && <p className="notice">{message}</p>}
            <div className="formGrid">
              <Field
                label="Product title *"
                value={form.title}
                onChange={(v) => {
                  change("title", v);
                  if (!form.id)
                    change(
                      "slug",
                      v
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, ""),
                    );
                }}
              />
              <Field
                label="Slug *"
                value={form.slug}
                onChange={(v) => change("slug", v)}
              />
              <Field
                label="Brand"
                value={form.brand}
                onChange={(v) => change("brand", v)}
              />
              <label className="field">
                Category *
                <select
                  value={form.categoryId}
                  onChange={(e) => {
                    const c = categories.find((x) => x.id === e.target.value);
                    setForm((x) => ({
                      ...x,
                      categoryId: e.target.value,
                      category: c?.name || "",
                    }));
                  }}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="Current price"
                type="number"
                value={form.price ?? ""}
                onChange={(v) => change("price", v)}
              />
              <Field
                label="Old price"
                type="number"
                value={form.oldPrice ?? ""}
                onChange={(v) => change("oldPrice", v)}
              />
              <Field
                label="Currency"
                value={form.currency}
                onChange={(v) => change("currency", v)}
              />
              <Field
                label="Discount label"
                value={form.discountLabel || ""}
                onChange={(v) => change("discountLabel", v)}
              />
              <Field
                label="Main image URL *"
                value={form.mainImageUrl}
                onChange={(v) => change("mainImageUrl", v)}
              />
              <Field
                label="Amazon affiliate URL *"
                value={form.amazonUrl}
                onChange={(v) => change("amazonUrl", v)}
              />
              <Field
                label="ASIN / SKU"
                value={form.asin || ""}
                onChange={(v) => change("asin", v)}
              />
              <Field
                label="Availability"
                value={form.availability || ""}
                onChange={(v) => change("availability", v)}
              />
              <Field
                label="Rating"
                type="number"
                value={form.rating ?? ""}
                onChange={(v) => change("rating", v)}
              />
              <Field
                label="Rating count"
                value={form.ratingCount || ""}
                onChange={(v) => change("ratingCount", v)}
              />
              <Area
                label="Short description"
                value={form.shortDescription}
                onChange={(v) => change("shortDescription", v)}
              />
              <Area
                label="Full description"
                value={form.description}
                onChange={(v) => change("description", v)}
              />
              <Area
                label="Gallery URLs — one per line"
                value={form.galleryImageUrls.join("\n")}
                onChange={(v) =>
                  change("galleryImageUrls", v.split("\n").filter(Boolean))
                }
              />
              <Area
                label="Feature bullets — one per line"
                value={form.bullets.join("\n")}
                onChange={(v) =>
                  change("bullets", v.split("\n").filter(Boolean))
                }
              />
              <Field
                label="Badges — comma separated"
                value={form.badges.join(", ")}
                onChange={(v) =>
                  change(
                    "badges",
                    v
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  )
                }
              />
              <label className="field">
                Status
                <select
                  value={form.status}
                  onChange={(e) => change("status", e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>
            <div className="actions">
              <label>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => change("featured", e.target.checked)}
                />{" "}
                Featured
              </label>
              <button className="adminBtn">Save product</button>
              {form.id && (
                <button type="button" onClick={() => setForm(blankProduct())}>
                  Cancel
                </button>
              )}
            </div>
          </form>
          <aside>
            <div className="panel">
              <h2>Categories</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ width: "100%", padding: 10 }}
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="New category"
                />
                <button
                  className="adminBtn"
                  onClick={async () => {
                    if (!db || !categoryName.trim()) return;
                    const x = push(ref(db, "affiliateShop/categories"));
                    await set(x, {
                      name: categoryName,
                      slug: categoryName
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-"),
                      published: true,
                      sortOrder: categories.length,
                      updatedAt: Date.now(),
                    });
                    setCategoryName("");
                  }}
                >
                  Add
                </button>
              </div>
              {categories.map((c) => (
                <div className="row" key={c.id}>
                  <span>{c.name}</span>
                  <button
                    onClick={() =>
                      db && remove(ref(db, `affiliateShop/categories/${c.id}`))
                    }
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
            <div className="panel" style={{ marginTop: 20 }}>
              <h2>Products</h2>
              {products
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((p) => (
                  <div className="row" key={p.id}>
                    <img src={p.mainImageUrl} alt="" />
                    <span>
                      <b>{p.title}</b>
                      <small style={{ display: "block" }}>{p.status}</small>
                    </span>
                    <button type="button" onClick={() => edit(p)}>Edit</button>
                    <button type="button"
                      onClick={() =>
                        confirm(`Delete ${p.title}?`) &&
                        db &&
                        remove(ref(db, `affiliateShop/products/${p.id}`))
                      }
                    >
                      Delete
                    </button>
                  </div>
                ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="field">
      {label}
      <input
        type={type}
        step={type === "number" ? "0.01" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="field full">
      {label}
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
