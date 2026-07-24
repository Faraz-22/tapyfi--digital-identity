import { ArrowLeft, Box, CreditCard, PackageCheck, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { GlassCard } from "../components/GlassCard";
import { MetricCard } from "../components/MetricCard";
import { products } from "../data/mock";
import { formatCurrency } from "../lib/format";

export function AdminPage() {
  return (
    <main className="noise min-h-screen bg-ink px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <Link to="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm text-white/58">
          <ArrowLeft size={16} />
          Dashboard
        </Link>
        <div className="mb-8">
          <p className="text-sm uppercase text-signal">Admin panel</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-6xl">Operations command center.</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="GMV" value="₹18.2L" delta="+22%" icon={CreditCard} />
          <MetricCard label="Inventory" value="532" delta="All products" icon={Box} />
          <MetricCard label="Orders" value="126" delta="24 pending" icon={PackageCheck} />
          <MetricCard label="Admins" value="6" delta="2FA active" icon={ShieldCheck} />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <GlassCard className="p-5">
            <h2 className="text-xl font-semibold">Inventory</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="text-white/44">
                  <tr>
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t border-white/10">
                      <td className="py-4">{product.name}</td>
                      <td>{product.category}</td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>{product.inventory}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Users className="text-ember" size={20} />
              Enterprise queue
            </h2>
            <div className="mt-5 grid gap-3">
              {["Venture studio rollout", "Luxury hotel concierge", "Fitness franchise", "Creator agency"].map((item, index) => (
                <div key={item} className="rounded-[8px] border border-white/10 bg-white/[0.05] p-4">
                  <p className="font-medium">{item}</p>
                  <p className="mt-1 text-sm text-white/48">{20 + index * 12} seats · custom NFC catalog requested</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
