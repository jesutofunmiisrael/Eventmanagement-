
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  Ticket as TicketIcon,
  Users,
  Check,
  ShieldCheck,
  CalendarDays,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import API_URL from "@/lib/api";

type TicketData = {
  _id: string;
  eventId: string;
  type: string;
  sit: number;
  price: number;
};

export default function Ticket() {
  const pathname = usePathname();
  const router = useRouter();

  const eventId = pathname?.split("/").filter(Boolean).at(-2);

  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [selectedTicket, setSelectedTicket] =
    useState<TicketData | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const fetchTickets = async () => {
      try {
        const response = await fetch(
          `${API_URL}/event/getTicket/${eventId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load tickets.");
        }

        const availableTickets: TicketData[] = Array.isArray(data.tickets)
          ? data.tickets
          : [];

        setTickets(availableTickets);

        if (availableTickets.length > 0) {
          setSelectedTicket(availableTickets[0]);
        }
      } catch (error) {
        console.error("FETCH TICKETS ERROR:", error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load tickets."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [eventId]);

  const totalPrice = selectedTicket
    ? Number(selectedTicket.price) * quantity
    : 0;

  const formatNaira = (amount: number) =>
    `₦${Number(amount || 0).toLocaleString("en-NG")}`;

  const increaseQuantity = () => {
    if (!selectedTicket) return;

    if (quantity >= selectedTicket.sit) {
      toast.error("You cannot select more available seats.");
      return;
    }

    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleRegistration = async () => {
    if (registering) return;

    if (!eventId || !selectedTicket) {
      toast.error("Please select an available ticket.");
      return;
    }

    if (selectedTicket.sit < 1) {
      toast.error("This ticket type is sold out.");
      return;
    }

    if (quantity > selectedTicket.sit) {
      toast.error("The selected quantity exceeds available seats.");
      return;
    }

    if (!email.trim()) {
      toast.error("Email address is required.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in before purchasing a ticket.");
      router.push("/login");
      return;
    }

    setRegistering(true);

    try {
      const response = await fetch(
        `${API_URL}/user/registerforevent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ticketId: selectedTicket._id,
            eventId,
            email: email.trim(),
            numberOfSeats: quantity,
            ticketType: selectedTicket.type,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          toast.error("Your session has expired. Please log in again.");
          router.push("/login");
          return;
        }

        throw new Error(
          data.message || "Unable to initialize payment."
        );
      }

      if (
        typeof data.paymentUrl !== "string" ||
        !data.paymentUrl.startsWith("https://")
      ) {
        throw new Error("A valid Paystack payment link was not returned.");
      }

      if (
        typeof data.transactionId !== "string" ||
        !data.transactionId.trim()
      ) {
        throw new Error("The payment reference was not returned.");
      }

      sessionStorage.setItem(
        "eventflow_payment_reference",
        data.transactionId
      );

      window.location.assign(data.paymentUrl);
    } catch (error) {
      console.error("PAYMENT INITIALIZATION ERROR:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start payment. Please try again."
      );

      setRegistering(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
        <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <Link
            href="/home"
            className="shrink-0 text-2xl font-bold tracking-tight"
          >
            event<span className="text-accent">flow</span>
            <span className="text-accent">.</span>
          </Link>

          <Link
            href={eventId ? `/events/${eventId}` : "/events"}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium transition hover:border-accent hover:text-accent"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to event</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        {/* Page heading */}
        <div className="max-w-3xl">
          <p className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-accent" />
            Event registration
          </p>

          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Your next experience
            <br />
            starts with a{" "}
            <span className="font-serif font-normal italic text-accent">
              ticket.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-muted">
            Choose your ticket type, select your seats, and get ready for
            something memorable.
          </p>
        </div>

        {/* Checkout layout */}
        {loading ? (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <div className="h-40 animate-pulse rounded-2xl bg-surface-muted" />
              <div className="h-40 animate-pulse rounded-2xl bg-surface-muted" />
            </div>
            <div className="h-96 animate-pulse rounded-2xl bg-surface-muted" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-border bg-surface px-6 py-16 text-center sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
              <TicketIcon size={29} className="text-accent" />
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight">
              Tickets unavailable
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
              There are no tickets available for this event right now. Please
              check back later.
            </p>

            <Link href="/events" className="btn-primary mt-7">
              Explore other events
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-12">
            {/* Ticket options */}
            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Make it yours</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Choose your ticket
                  </h2>
                </div>

                <span className="text-sm text-muted">
                  {tickets.length} {tickets.length === 1 ? "option" : "options"}
                </span>
              </div>

              <div className="space-y-4">
                {tickets.map((ticket) => {
                  const selected = selectedTicket?._id === ticket._id;
                  const soldOut = ticket.sit <= 0;

                  return (
                    <button
                      key={ticket._id}
                      type="button"
                      disabled={soldOut || registering}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setQuantity(1);
                      }}
                      className={`group w-full rounded-2xl border p-5 text-left transition-all duration-200 sm:p-6 ${
                        selected
                          ? "border-accent bg-surface shadow-[0_0_0_1px_var(--accent)]"
                          : "border-border bg-surface hover:border-[#C5A99B]"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              selected
                                ? "bg-accent text-white"
                                : "bg-surface-muted text-muted"
                            }`}
                          >
                            {selected ? (
                              <Check size={21} />
                            ) : (
                              <TicketIcon size={21} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold">
                              {ticket.type}
                            </h3>

                            <p className="mt-1 text-sm text-muted">
                              {soldOut
                                ? "Sold out"
                                : ticket.type.toLowerCase() === "vip"
                                  ? "VIP event admission"
                                  : "Standard event admission"}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-lg font-semibold tracking-tight">
                            {formatNaira(ticket.price)}
                          </p>
                          <p className="mt-1 text-xs text-muted">per seat</p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                        <span className="flex items-center gap-2 text-sm text-muted">
                          <Users size={16} />
                          {ticket.sit} seats available
                        </span>

                        {selected && (
                          <span className="text-xs font-semibold text-accent">
                            Selected
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border p-4 sm:p-5">
                <CalendarDays
                  size={19}
                  className="mt-0.5 shrink-0 text-accent"
                />
                <p className="text-sm leading-6 text-muted">
                  Double-check your ticket type and number of seats before
                  continuing to payment.
                </p>
              </div>
            </div>

            {/* Order summary */}
            {selectedTicket && (
              <aside className="overflow-hidden rounded-3xl border border-border bg-surface lg:sticky lg:top-24">
                <div className="border-b border-border p-5 sm:p-6">
                  <p className="eyebrow">Almost there</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Order summary
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    Review your selection before checkout.
                  </p>
                </div>

                <div className="space-y-6 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Ticket type
                      </p>
                      <p className="mt-1.5 font-semibold">
                        {selectedTicket.type}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Price per seat
                      </p>
                      <p className="mt-1.5 font-semibold">
                        {formatNaira(selectedTicket.price)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold">
                      Number of seats
                    </label>

                    <div className="mt-3 flex items-center justify-between rounded-xl border border-border p-1.5">
                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1 || registering}
                        aria-label="Decrease seats"
                        className="flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-surface-muted disabled:opacity-40"
                      >
                        <Minus size={17} />
                      </button>

                      <span className="text-base font-semibold">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={increaseQuantity}
                        disabled={
                          quantity >= selectedTicket.sit || registering
                        }
                        aria-label="Increase seats"
                        className="flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-surface-muted disabled:opacity-40"
                      >
                        <Plus size={17} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold"
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      disabled={registering}
                      autoComplete="email"
                      className="mt-3 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:opacity-60"
                    />
                    <p className="mt-2 text-xs leading-5 text-muted">
                      Use an email address you can access.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border bg-[#F1ECE3] p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-muted">Total</span>
                    <span className="text-3xl font-semibold tracking-tight">
                      {formatNaira(totalPrice)}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={
                      registering ||
                      selectedTicket.sit < 1 ||
                      quantity > selectedTicket.sit ||
                      selectedTicket.price < 1
                    }
                    onClick={handleRegistration}
                    className="btn-primary mt-5 w-full rounded-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {registering ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        Redirecting to Paystack...
                      </>
                    ) : (
                      <>
                        Continue to payment
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
                    <ShieldCheck size={15} className="text-success" />
                    Secure payment powered by Paystack
                  </p>
                </div>
              </aside>
            )}
          </div>
        )}
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <Link href="/home" className="text-xl font-bold tracking-tight text-foreground">
            event<span className="text-accent">flow</span>.
          </Link>
          <p>Discover experiences. Make memories.</p>
          <Link href="/events" className="transition-colors hover:text-accent">
            Explore events
          </Link>
        </div>
      </footer>
    </main>
  );
}
