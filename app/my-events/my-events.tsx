
"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Ticket,
  Users,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import API_URL from "@/lib/api";
import { toast } from "sonner";

type RegisteredEvent = {
  registrationId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventVenue: string;
  eventCategory: string;
  daysUntilEvent: number;
  registrationStatus: string;
  numberOfSeats: number;
  ticketPrice: number;
  ticketType: string;
};

export default function MyEvents() {
  const router = useRouter();

  const [events, setEvents] = useState<RegisteredEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Please login to view your events.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/user/myregister-event`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message || "Failed to load your events.");
          return;
        }

        setEvents(data.events || []);
      } catch (error) {
        console.error("MY EVENTS ERROR:", error);

        toast.error("Unable to load your events.", {
          description: "Please check your connection and try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/events");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewTicket = (registrationId: string) => {
    router.push(`/my-events/${registrationId}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F6F2]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="h-8 w-48 animate-pulse rounded-xl bg-stone-200" />
          <div className="mt-3 h-5 w-80 animate-pulse rounded-xl bg-stone-200" />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-3xl bg-stone-200"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F6F2]">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#B3202F]">
              <span className="text-sm font-bold text-white">E</span>
            </div>

            <span className="text-lg font-bold tracking-tight text-[#1C1917]">
              Event<span className="text-[#B3202F]">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-10 items-center gap-2 rounded-xl border border-stone-200 px-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B3202F]/20"
              aria-label="Go back to previous page"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>

            <span className="hidden text-sm font-semibold text-slate-500 sm:inline">
              My Events
            </span>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:py-14">
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B3202F]">
            Your activity
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#1C1917] sm:text-4xl">
            My Events
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            View the events you have registered for and keep track of your
            tickets.
          </p>
        </div>

        {/* EMPTY STATE */}
        {events.length === 0 && (
          <div className="rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center shadow-[0_20px_70px_rgba(28,25,23,0.14)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBEDEE] text-[#B3202F]">
              <Ticket size={25} />
            </div>

            <h2 className="mt-5 text-xl font-bold tracking-tight text-[#1C1917]">
              No registered events
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You haven't registered for an event yet. Explore EventFlow and
              find something worth showing up for.
            </p>

            <button
              type="button"
              onClick={() => router.push("/events")}
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#B3202F] px-5 text-sm font-semibold text-white transition hover:bg-[#8E1825]"
            >
              Explore Events
              <ArrowRight size={17} />
            </button>
          </div>
        )}

        {/* REGISTERED EVENTS */}
        <div className="grid gap-6 lg:grid-cols-2">
          {events.map((event) => (
            <article
              key={event.registrationId}
              className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:shadow-xl hover:shadow-[#1C1917]/10"
            >
              {/* EVENT HEADER */}
              <div className="border-b border-stone-100 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-[#FBEDEE] px-3 py-1 text-xs font-bold capitalize text-[#B3202F]">
                      {event.eventCategory}
                    </span>

                    <h2 className="mt-4 text-xl font-bold tracking-tight text-[#1C1917] transition group-hover:text-[#B3202F] sm:text-2xl">
                      {event.eventName}
                    </h2>
                  </div>

                  <span className="w-fit shrink-0 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold capitalize text-green-700">
                    {event.registrationStatus}
                  </span>
                </div>
              </div>

              {/* EVENT DETAILS */}
              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBEDEE] text-[#B3202F]">
                    <CalendarDays size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {formatDate(event.eventDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBEDEE] text-[#B3202F]">
                    <MapPin size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Venue
                    </p>

                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                      {event.eventVenue}, {event.eventLocation}
                    </p>
                  </div>
                </div>
              </div>

              {/* TICKET SUMMARY */}
              <div className="grid grid-cols-1 border-t border-stone-100 sm:grid-cols-3">
                <div className="p-5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Ticket size={15} />
                    <span className="text-xs font-semibold">Ticket</span>
                  </div>

                  <p className="mt-2 text-sm font-bold text-[#1C1917]">
                    {event.ticketType}
                  </p>
                </div>

                <div className="border-t border-stone-100 p-5 sm:border-l sm:border-t-0">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users size={15} />
                    <span className="text-xs font-semibold">Seats</span>
                  </div>

                  <p className="mt-2 text-sm font-bold text-[#1C1917]">
                    {event.numberOfSeats}
                  </p>
                </div>

                <div className="border-t border-stone-100 p-5 sm:border-l sm:border-t-0">
                  <p className="text-xs font-semibold text-slate-400">
                    Total
                  </p>

                  <p className="mt-2 text-sm font-bold text-[#1C1917]">
                    ₦{event.ticketPrice.toLocaleString("en-NG")}
                  </p>
                </div>
              </div>

              {/* CARD FOOTER */}
              <div className="border-t border-stone-100 bg-stone-50 p-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      {event.daysUntilEvent} days until event
                    </p>

                    <p className="mt-1 text-sm font-bold text-green-700">
                      Confirmed
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewTicket(event.registrationId)}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#B3202F] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8E1825] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B3202F]/30 active:scale-[0.99] sm:w-auto"
                  >
                    View Ticket
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1C1917]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 EventFlow</p>
          <p>Discover · Create · Experience</p>
        </div>
      </footer>
    </main>
  );
}
