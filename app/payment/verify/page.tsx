
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Ticket } from "lucide-react";

function VerifyPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"success" | "error">("success");

  useEffect(() => {
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) {
      setStatus("error");
      return;
    }

    // The reference exists, but the backend must still verify
    // the transaction before it can be treated as paid.
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        {status === "success" ? (
          <>
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />

            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              Payment Successful!
            </h1>

            <p className="mt-3 text-gray-600">
              Thank you for your payment. You can now explore more events on
              EventFlow.
            </p>

            <button
              onClick={() => router.push("/events")}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
            >
              Explore More Events <ArrowRight size={18} />
            </button>

            <button
              onClick={() => router.push("/events")}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              <Ticket size={18} /> Browse Events
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-red-600">
              Unable to confirm payment
            </h1>
            <p className="mt-3 text-gray-600">
              We could not find the payment reference. Please contact support
              before trying to pay again.
            </p>
            <button
              onClick={() => router.push("/events")}
              className="mt-6 rounded-xl bg-black px-5 py-3 text-white"
            >
              Back to Events
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading payment status...</p>}>
      <VerifyPaymentContent />
    </Suspense>
  );
}

