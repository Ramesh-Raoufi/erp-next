"use client";
import { Suspense } from "react";
import { StoreOrderConfirmationPage } from "@/page-components/StoreOrderConfirmationPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <StoreOrderConfirmationPage />
    </Suspense>
  );
}
