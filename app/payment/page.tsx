"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import API_URL from "@/lib/api";

type PaymentStatus = "verifying" | "success" | "error";

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<PaymentStatus>("verifying");
  const [message, setMessage] = useState(
    "Please wait while we confirm your payment."
  );

  const verificationStarted = useRef(false);

  useEffect(() => {
    if (verificationStarted.current) return;
    verificationStarted.current = true;

    const verifyPayment = async () => {
      const reference = searchParams.get("reference");

      if (!reference) {
        setStatus("error");
        setMessage(
          "We could not find a payment reference. Please check your transaction."
        );
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        setStatus("error");
        setMessage(
          "Your login session is missing. Please log in and check your transaction."
        );
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/user/verify-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reference }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "We could not verify your payment."
          );
        }

        setStatus("success");
        setMessage(
          data.message ||
            "Your payment has been verified and your registration is confirmed."
        );

        sessionStorage.removeItem("eventflow_payment_reference");
        toast.success("Payment verified successfully!");

        window.setTimeout(() => {
          router.push("/my-events");
        }, 2500);
      } catch (error) {
        console.error("PAYMENT VERIFICATION ERROR:", error);

        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Payment verification failed. Please try again."
        );

        toast.error("We could not confirm your payment.");
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12 text-[#0B1220]">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          {status === "verifying" && (
            <LoaderCircle className="animate-spin text-blue-600" size={32} />
          )}

          {status === "success" && (
            <CheckCircle2 className="text-green-600" size={34} />
          )}

          {status === "error" && (
            <XCircle className="text-red-600" size={34} />
          )}
        </div>

        <h1 className="mt-6 text-2xl font-bold">
          {status === "verifying" && "Verifying your payment"}
          {status === "success" && "Payment successful!"}
          {status === "error" && "Payment verification issue"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {message}
        </p>

        {status === "verifying" && (
          <p className="mt-6 text-xs text-slate-400">
            Please do not close this page.
          </p>
        )}

        {status === "success" && (
          <p className="mt-6 text-sm text-slate-500">
            Taking you to your event registrations...
          </p>
        )}

        {status === "error" && (
          <div className="mt-7 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Try verification again
            </button>

            <Link
              href="/my-events"
              className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              View my events
            </Link>

            <Link
              href="/events"
              className="text-sm text-slate-500 hover:text-blue-600"
            >
              Back to events
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
          <LoaderCircle
            className="animate-spin text-blue-600"
            size={36}
          />
        </main>
      }
    >
      <PaymentVerifyContent />
    </Suspense>
  );
}