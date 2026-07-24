import { CreditCard, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "../components/GlassCard";
import { MagneticButton } from "../components/MagneticButton";
import { ProductCustomizer } from "../components/ProductCustomizer";
import { products } from "../data/mock";
import { formatCurrency } from "../lib/format";
import type { CartItem, Product } from "../types";

export function MarketplacePage() {
  const [selected, setSelected] = useState<Product>(products[0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cart]);

  function addToCart(item: CartItem) {
    setCart((current) => [...current, item]);
  }

  return (
    <main className="noise min-h-screen bg-ink px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/tapyfi-mark.svg" alt="" className="h-9 w-9 rounded-[8px]" />
            <span className="text-sm font-semibold uppercase text-white/70">Marketplace</span>
          </Link>
          <MagneticButton to="/dashboard" variant="secondary">Dashboard</MagneticButton>
        </nav>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-6">
            <section>
              <p className="text-sm uppercase text-ember">Luxury NFC products</p>
              <h1 className="mt-3 text-4xl font-semibold md:text-6xl">Customize, order, assign, and track.</h1>
            </section>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelected(product)}
                  className={`premium-focus rounded-[8px] border p-4 text-left transition ${
                    selected.id === product.id ? "border-signal bg-white/[0.11]" : "border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
                  }`}
                >
                  <div className={`h-40 rounded-[8px] bg-gradient-to-br ${product.imageTone}`} />
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="mt-1 text-sm text-white/50">{product.finish}</p>
                    </div>
                    <p className="text-sm font-semibold text-ember">{formatCurrency(product.price)}</p>
                  </div>
                </button>
              ))}
            </div>
            <ProductCustomizer product={selected} onAdd={addToCart} />
          </div>
          <aside className="lg:sticky lg:top-6">
            <GlassCard className="p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cart</h2>
                <ShoppingBag className="text-signal" size={20} />
              </div>
              <div className="grid gap-3">
                {cart.length === 0 ? (
                  <p className="rounded-[8px] border border-white/10 bg-white/[0.05] p-4 text-sm text-white/52">
                    Add a personalized NFC product to begin checkout.
                  </p>
                ) : (
                  cart.map((item, index) => (
                    <div key={`${item.product.id}-${index}`} className="rounded-[8px] border border-white/10 bg-white/[0.05] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="mt-1 text-xs text-white/50">{item.personalization.name} · QR {item.personalization.includeQr ? "on" : "off"}</p>
                        </div>
                        <p className="text-sm text-ember">{formatCurrency(item.product.price)}</p>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button className="rounded-full bg-white/10 p-1" aria-label="Decrease quantity"><Minus size={14} /></button>
                        <span className="text-sm">{item.quantity}</span>
                        <button className="rounded-full bg-white/10 p-1" aria-label="Increase quantity"><Plus size={14} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-5 border-t border-white/10 pt-5">
                <div className="flex justify-between text-sm text-white/56">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm text-white/56">
                  <span>Shipping estimate</span>
                  <span>{cart.length ? formatCurrency(249) : formatCurrency(0)}</span>
                </div>
                <div className="mt-4 flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(cart.length ? total + 249 : 0)}</span>
                </div>
                <MagneticButton className="mt-5 w-full" disabled={!cart.length}>
                  <CreditCard size={16} />
                  Checkout
                </MagneticButton>
                <p className="mt-4 flex items-center gap-2 text-xs text-white/45">
                  <Truck size={14} />
                  Stripe and Razorpay hooks are scaffolded in the API.
                </p>
              </div>
            </GlassCard>
          </aside>
        </div>
      </div>
    </main>
  );
}
