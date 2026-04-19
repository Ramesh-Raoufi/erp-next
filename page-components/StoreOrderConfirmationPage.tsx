"use client";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { StoreLayout } from "@/components/store/StoreLayout";

export function StoreOrderConfirmationPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  return (
    <StoreLayout>
      <section className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
        <div className="rounded-3xl border border-black/10 bg-white/80 p-10 shadow-sm">
          <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)]/70">
            Order confirmed
          </div>
          <h1 className="store-font-display mt-4 text-3xl font-semibold">
            Thank you for shopping with us.
          </h1>
          <p className="mt-3 text-sm text-[color:var(--store-forest)]/70">
            Your order has been placed successfully. We will send a delivery
            update within 24 hours.
          </p>
          <div className="mt-6 flex flex-col items-center gap-2 text-sm">
            <div className="rounded-full border border-[color:var(--store-forest)]/30 px-4 py-2">
              Order ID: <span className="font-semibold">#{id}</span>
            </div>
            {code ? (
              <div className="rounded-full border border-[color:var(--store-forest)]/30 px-4 py-2">
                Confirmation code: <span className="font-semibold">{code}</span>
              </div>
            ) : null}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="rounded-full bg-[color:var(--store-forest)] px-6 py-3 text-sm font-semibold text-white"
            >
              Continue shopping
            </Link>
            <Link
              href="/"
              className="rounded-full border border-[color:var(--store-forest)]/40 px-6 py-3 text-sm font-semibold text-[color:var(--store-forest)]"
            >
              Return home
            </Link>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
