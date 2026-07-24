import { Check, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import type { CartItem, Product } from "../types";
import { formatCurrency } from "../lib/format";
import { GlassCard } from "./GlassCard";
import { MagneticButton } from "./MagneticButton";

export function ProductCustomizer({
  product,
  onAdd
}: {
  product: Product;
  onAdd: (item: CartItem) => void;
}) {
  const [name, setName] = useState("Faraz Khan");
  const [title, setTitle] = useState("Founder");
  const [color, setColor] = useState(product.color);
  const [includeQr, setIncludeQr] = useState(true);

  const item = useMemo<CartItem>(
    () => ({
      product,
      quantity: 1,
      personalization: { name, title, color, includeQr }
    }),
    [color, includeQr, name, product, title]
  );

  return (
    <GlassCard className="p-5">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="card-preview flex min-h-72 items-center justify-center rounded-[8px] border border-white/10 bg-black/25 p-5">
          <div
            className={`relative aspect-[1.58/1] w-full max-w-md overflow-hidden rounded-[22px] bg-gradient-to-br ${product.imageTone} p-6 text-white shadow-gold`}
            style={{ borderColor: color }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.22),transparent)] opacity-60" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">tapyfi</p>
                  <p className="mt-1 text-xs text-white/55">NFC identity card</p>
                </div>
                {includeQr ? (
                  <div className="grid h-14 w-14 grid-cols-3 gap-1 rounded-[8px] bg-white p-2">
                    {Array.from({ length: 9 }).map((_, index) => (
                      <span key={index} className={index % 2 ? "bg-transparent" : "bg-ink"} />
                    ))}
                  </div>
                ) : null}
              </div>
              <div>
                <p className="text-xl font-semibold">{name}</p>
                <p className="text-sm text-white/62">{title}</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase text-white/45">Product studio</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">{product.name}</h3>
          <p className="mt-2 text-sm text-white/58">{product.finish} · {formatCurrency(product.price)}</p>
          <div className="mt-5 grid gap-3">
            <label className="grid gap-2 text-sm text-white/70">
              Name
              <input className="premium-focus rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="grid gap-2 text-sm text-white/70">
              Title
              <input className="premium-focus rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2" value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label className="grid gap-2 text-sm text-white/70">
              Accent color
              <input className="h-11 w-full rounded-[8px] border border-white/10 bg-transparent" type="color" value={color} onChange={(event) => setColor(event.target.value)} />
            </label>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={includeQr} onChange={(event) => setIncludeQr(event.target.checked)} />
              Print dynamic QR on product
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <MagneticButton onClick={() => onAdd(item)}>
              <ShoppingBag size={16} />
              Add to cart
            </MagneticButton>
            <div className="flex items-center gap-2 text-sm text-leaf">
              <Check size={16} />
              {product.inventory} in stock
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
