"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import API_URL from "@/lib/api";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Invalid email or password");
        return;
      }

      localStorage.setItem("token", data.token);

      toast.success("Welcome back!", {
        description: "You have successfully logged in.",
      });

      setTimeout(() => {
        router.push("/events");
      }, 700);
    } catch (error) {
      toast.error("Unable to connect", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-5 py-10">

      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-[0_20px_70px_rgba(28,25,23,0.14)] border border-stone-200">

        <div className="grid lg:grid-cols-2">

          {/* LEFT */}
          <div className="relative hidden min-h-[650px] overflow-hidden lg:block bg-[#1C1917]">

            <img
              src="/images/First.jpg"
              alt="EventFlow event"
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/75 to-[#1C1917]/20" />

            <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">

              {/* LOGO */}
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B3202F]">
                  <span className="font-bold text-lg text-white">
                    E
                  </span>
                </div>

                <span className="text-xl font-bold">
                  EventFlow
                </span>
              </Link>

              {/* TEXT */}
              <div className="max-w-md">

                <span className="mb-5 inline-block rounded-full border border-[#F4B6BB]/30 bg-white/10 px-4 py-2 text-sm text-[#F4B6BB] backdrop-blur">
                  Discover experiences
                </span>

                <h1 className="text-4xl font-bold leading-tight">
                  Find events worth
                  <br />
                  <span className="text-[#FF8A93]">showing up for.</span>
                </h1>

                <p className="mt-5 text-slate-300 leading-7">
                  Discover events, connect with people and create
                  experiences your community will remember.
                </p>

              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center px-6 py-12 sm:px-12 lg:px-16">

            <div className="mx-auto w-full max-w-md">

              {/* MOBILE LOGO */}
              <Link
                href="/"
                className="mb-10 flex items-center gap-3 lg:hidden"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B3202F]">
                  <span className="font-bold text-lg text-white">
                    E
                  </span>
                </div>

                <span className="text-xl font-bold text-[#1C1917]">
                  EventFlow
                </span>
              </Link>

              {/* HEADER */}
              <div className="mb-9">
                <p className="mb-3 text-sm font-semibold tracking-wider text-[#B3202F]">
                  WELCOME BACK
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-[#1C1917]">
                  Sign in to EventFlow
                </h2>

                <p className="mt-3 text-slate-500">
                  Access your events and discover what's happening.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleLogin} className="space-y-5">

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#B3202F] focus:ring-4 focus:ring-[#B3202F]/15"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>
                  </div>

                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#B3202F] focus:ring-4 focus:ring-[#B3202F]/15"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-[#B3202F] font-semibold text-white shadow-sm transition hover:bg-[#8E1825] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B3202F]/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>

              </form>

              {/* SIGNUP */}
              <p className="mt-8 text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-[#B3202F] hover:text-[#8E1825]"
                >
                  Create an account
                </Link>
              </p>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}