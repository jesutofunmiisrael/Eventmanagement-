
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MapPin,
  Building2,
  Tag,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { GRAPHQL_URL } from "@/lib/api";

type Event = {
  _id: string;
  name: string;
  description?: string;
  date: string;
  location: string;
  category: string;
  venue: string;
  image?: string | null;
};

export default function EventDetails() {
  const pathname = usePathname();
  const router = useRouter();

  const eventId = pathname?.split("/").filter(Boolean).pop();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketLoading, setTicketLoading] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const getEvent = async () => {
      try {
        const response = await fetch(GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GetEvent($id: ID!) {
                event(id: $id) {
                  id
                  name
                  description
                  date
                  location
                  venue
                  category
                  image
                }
              }
            `,
            variables: { id: eventId },
          }),
        });

        const data = await response.json();

        if (!response.ok || data.errors) {
          throw new Error(
            data.errors?.[0]?.message || "Failed to load event."
          );
        }

        const eventData = data.data?.event;

        if (!eventData) {
          throw new Error("Event not found.");
        }

        if (!cancelled) {
          setEvent({
            _id: eventData.id,
            name: eventData.name,
            description: eventData.description,
            date: eventData.date,
            location: eventData.location,
            venue: eventData.venue,
            category: eventData.category,
            image: eventData.image,
          });
        }
      } catch (error) {
        console.error("EVENT DETAILS ERROR:", error);

        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load event."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    getEvent();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const formatDate = (date: string) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Date unavailable";
    }

    return parsed.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-5 w-32 animate-pulse rounded bg-surface-muted" />
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="aspect-[4/3] animate-pulse rounded-3xl bg-surface-muted" />
            <div className="space-y-5 py-4">
              <div className="h-4 w-28 animate-pulse rounded bg-surface-muted" />
              <div className="h-12 w-4/5 animate-pulse rounded bg-surface-muted" />
              <div className="h-5 w-full animate-pulse rounded bg-surface-muted" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-surface-muted" />
              <div className="mt-8 h-14 w-full animate-pulse rounded-xl bg-surface-muted" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
            <CalendarDays size={25} className="text-accent" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Event not found
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            This event may have been removed or does not exist. Head back to
            the events collection to discover something else.
          </p>
          <Link href="/events" className="btn-primary mt-6">
            <ArrowLeft size={17} />
            Back to events
          </Link>
        </div>
      </main>
    );
  }

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
            href="/events"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium transition hover:border-accent hover:text-accent"
          >
            <ArrowLeft size={16} />
            <span>All events</span>
          </Link>
        </nav>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-5 pt-7 sm:px-8 lg:px-10">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Link href="/events" className="transition hover:text-accent">
            Events
          </Link>
          <span>/</span>
          <span className="max-w-[220px] truncate text-foreground">
            {event.name}
          </span>
        </div>
      </div>

      {/* Event content */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-7 sm:px-8 sm:pb-20 lg:px-10 lg:pt-10">
        <div className="grid items-start gap-9 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          {/* Image */}
          <div className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-surface-muted sm:aspect-[5/4]">
              {event.image ? (
                <img
                  src={event.image}
                  alt={event.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#E8DCCB] to-[#D7C7B3]">
                  <CalendarDays
                    size={56}
                    strokeWidth={1.2}
                    className="text-[#8B6D58]"
                  />
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />

              <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/50 bg-[#FFFEFA]/95 px-4 py-2 text-xs font-semibold capitalize text-foreground backdrop-blur">
                <Sparkles size={14} className="text-accent" />
                {event.category}
              </span>

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  Discover with EventFlow
                </p>
                <p className="mt-2 text-lg font-medium sm:text-xl">
                  Make room for a memorable experience.
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-9">
              <p className="eyebrow">A closer look</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                About this event
              </h2>
              <p className="mt-4 whitespace-pre-line text-base leading-8 text-muted">
                {event.description ||
                  "Join us for an unforgettable EventFlow experience. Discover the details, plan your visit, and get ready to be part of something special."}
              </p>
            </div>
          </div>

          {/* Event information */}
          <aside className="min-w-0 lg:sticky lg:top-24">
            <div className="eyebrow">The details</div>

            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {event.name}
            </h1>

            <p className="mt-5 text-base leading-7 text-muted">
              Your next experience could start right here. Here's everything
              you need to know before you go.
            </p>

            <div className="surface mt-8 divide-y divide-border p-5 sm:p-6">
              <div className="flex items-start gap-4 py-4 first:pt-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-accent">
                  <CalendarDays size={20} />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Date
                  </p>
                  <p className="mt-1.5 text-sm font-semibold leading-6">
                    {formatDate(event.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-accent">
                  <MapPin size={20} />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Location
                  </p>
                  <p className="mt-1.5 break-words text-sm font-semibold leading-6">
                    {event.location}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-accent">
                  <Building2 size={20} />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Venue
                  </p>
                  <p className="mt-1.5 break-words text-sm font-semibold leading-6">
                    {event.venue || "Venue details to be announced"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 py-4 last:pb-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-accent">
                  <Tag size={20} />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Category
                  </p>
                  <p className="mt-1.5 text-sm font-semibold capitalize leading-6">
                    {event.category}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#292820] p-5 text-[#FFFEFA] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#D9A294]">
                Ready to be there?
              </p>
              <p className="mt-2 text-lg font-semibold">
                Your experience starts with a ticket.
              </p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Continue to explore the available ticket options for this
                event.
              </p>

              <button
                type="button"
                disabled={ticketLoading}
                onClick={() => {
                  setTicketLoading(true);
                  router.push(`/events/${eventId}/ticket`);
                }}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FFFEFA] px-5 py-3 text-sm font-semibold text-[#292820] transition hover:bg-[#E8E1D6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {ticketLoading ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Opening tickets...
                  </>
                ) : (
                  <>
                    Explore tickets
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          </aside>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <Link href="/home" className="text-xl font-bold tracking-tight text-foreground">
            event<span className="text-accent">flow</span>.
          </Link>
          <p>Discover experiences. Make memories.</p>
          <Link
            href="/events"
            className="transition-colors hover:text-accent"
          >
            Explore events <ArrowRight size={15} className="ml-1 inline" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
