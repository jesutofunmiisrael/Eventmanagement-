
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  CalendarDays,
  ArrowRight,
  Plus,
  LogOut,
  LoaderCircle,
  Sparkles,
  SlidersHorizontal,
  X,
  Music2,
  BriefcaseBusiness,
  Trophy,
  Plane,
  Users,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { GRAPHQL_URL } from "@/lib/api";

type EventItem = {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  date: string;
  location: string;
  category: string;
  venue?: string;
  image?: string;
};

const categories = [
  "All",
  "Music",
  "Conference",
  "Business",
  "Sport",
  "Travel",
  "Festival",
];

const categoryImages: Record<string, string> = {
  music:
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1000&q=85",
  conference:
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=85",
  business:
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85",
  sport:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=85",
  travel:
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=85",
  festival:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=85",
};

const defaultEventImage =
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=85";

const heroImage =
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=90";

const organizerImage =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=85";

const categoryIcons: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  Music: Music2,
  Conference: Users,
  Business: BriefcaseBusiness,
  Sport: Trophy,
  Travel: Plane,
  Festival: Sparkles,
};

function getValidToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = token.split(".")[1];

    if (!payload) throw new Error("Invalid token");

    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );

    if (!decoded.exp || decoded.exp * 1000 <= Date.now()) {
      localStorage.removeItem("token");
      return null;
    }

    return token;
  } catch {
    localStorage.removeItem("token");
    return null;
  }
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getEventImage(event: EventItem, index: number) {
  if (event.image) return event.image;

  const category = event.category?.toLowerCase();
  const categoryImage = categoryImages[category];

  if (categoryImage) return categoryImage;

  const fallbackImages = [
    defaultEventImage,
    categoryImages.conference,
    categoryImages.festival,
    categoryImages.business,
    categoryImages.sport,
    categoryImages.travel,
  ];

  return fallbackImages[index % fallbackImages.length];
}

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const token = getValidToken();

    if (!token) {
      window.location.replace("/home");
      return;
    }

    setLoggedIn(true);

    let active = true;

    async function fetchEvents() {
      try {
        const response = await fetch(GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query {
                events {
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
          }),
        });

        const data = await response.json();

        if (!response.ok || data.errors) {
          throw new Error(
            data.errors?.[0]?.message || "Unable to load events."
          );
        }

        if (active) {
          setEvents(data.data?.events ?? []);
        }
      } catch (error) {
        console.error("FAILED TO FETCH EVENTS:", error);

        if (active) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load events. Check your backend."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchEvents();

    return () => {
      active = false;
    };
  }, []);

  const requireLogin = (): boolean => {
    if (!getValidToken()) {
      setLoggedIn(false);
      toast.info("Your session has expired. Please log in again.");
      window.location.replace("/home");
      return false;
    }

    return true;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    window.location.replace("/home");
  };

  const filteredEvents = events.filter((event) => {
    const searchTerm = search.toLowerCase();

    const matchesSearch = [
      event.name,
      event.location,
      event.category,
      event.description || "",
      event.venue || "",
    ].some((value) => value.toLowerCase().includes(searchTerm));

    const eventCategory = event.category.toLowerCase();
    const selectedCategory = activeCategory.toLowerCase();

    const matchesCategory =
      activeCategory === "All" ||
      eventCategory === selectedCategory ||
      (activeCategory === "Sport" && eventCategory === "sports");

    return matchesSearch && matchesCategory;
  });

  const featuredEvents = filteredEvents.slice(0, 3);

  const formatDateParts = (date: string) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return { day: "--", month: "TBA" };
    }

    return {
      day: parsed.toLocaleDateString("en-GB", { day: "2-digit" }),
      month: parsed.toLocaleDateString("en-GB", { month: "short" }),
    };
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F4EE] text-[#292820]">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-[#E4DED3] bg-[#F7F4EE]/95 backdrop-blur-xl">
        <nav className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <Link
            href="/home"
            className="shrink-0 text-2xl font-bold tracking-tight"
          >
            event<span className="text-[#A64B3C]">flow.</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link href="/events" className="text-[#A64B3C]">
              Explore events
            </Link>
            <Link
              href="/create-event"
              onClick={(event) => {
                if (!requireLogin()) event.preventDefault();
              }}
              className="transition-colors hover:text-[#A64B3C]"
            >
              Host an event
            </Link>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-[#A64B3C]"
            >
              Dashboard
            </Link>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            {loggedIn && (
              <>
                <Link
                  href="/create-event"
                  onClick={(event) => {
                    if (!requireLogin()) event.preventDefault();
                  }}
                  className="btn-primary min-h-10 gap-2 px-4 text-sm"
                >
                  <Plus size={17} />
                  <span className="hidden sm:inline">Create event</span>
                  <span className="sm:hidden">Create</span>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  aria-label="Log out"
                  title="Log out"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E4DED3] transition hover:bg-[#E8E1D6]"
                >
                  <LogOut size={17} />
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenu((previous) => !previous)}
            aria-label={mobileMenu ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E4DED3] md:hidden"
          >
            {mobileMenu ? <X size={20} /> : <SlidersHorizontal size={20} />}
          </button>
        </nav>

        {mobileMenu && (
          <div className="border-t border-[#E4DED3] bg-[#FFFEFA] px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              <Link
                href="/events"
                onClick={() => setMobileMenu(false)}
                className="rounded-xl bg-[#F7F4EE] px-4 py-3 text-sm font-semibold text-[#A64B3C]"
              >
                Explore events
              </Link>

              <Link
                href="/create-event"
                onClick={(event) => {
                  if (!requireLogin()) event.preventDefault();
                  else setMobileMenu(false);
                }}
                className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#F7F4EE]"
              >
                Host an event
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setMobileMenu(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#F7F4EE]"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-[#A64B3C] hover:bg-[#F7F4EE]"
              >
                <LogOut size={16} /> Log out
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="border-b border-[#E4DED3] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-[1fr_0.92fr] lg:gap-14">
          <div className="animate-fade-up">
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-[#A64B3C]" />
              The EventFlow collection
            </p>

            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Good things
              <br />
              happen when we{" "}
              <span className="font-serif font-normal italic text-[#A64B3C]">
                gather.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-[#77746B] sm:text-lg sm:leading-8">
              Find your people, explore new interests, and discover
              experiences worth putting on your calendar.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#events" className="btn-primary">
                Explore experiences <ArrowRight size={17} />
              </a>
              <span className="text-sm text-[#77746B]">
                Music, culture, ideas and more.
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 border-t border-[#E4DED3] pt-6">
              <div>
                <p className="text-2xl font-semibold">{events.length}</p>
                <p className="mt-1 text-xs text-[#77746B]">Events listed</p>
              </div>

              <div className="h-10 w-px bg-[#E4DED3]" />

              <div>
                <p className="text-2xl font-semibold">6</p>
                <p className="mt-1 text-xs text-[#77746B]">Categories</p>
              </div>

              <div className="h-10 w-px bg-[#E4DED3]" />

              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8E1D6] text-[#A64B3C]">
                  <Sparkles size={17} />
                </span>
                <span className="text-sm text-[#77746B]">
                  Something for everyone
                </span>
              </div>
            </div>
          </div>

          {/* Unique events-page hero image */}
          <div className="relative animate-fade-up">
            <div className="relative h-[370px] overflow-hidden rounded-[26px] bg-[#E8E1D6] sm:h-[480px] lg:h-[560px]">
              <img
                src={heroImage}
                alt="A DJ performing at a live music event"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#171611]/80 via-black/5 to-black/10" />

              <div className="absolute left-5 top-5 rounded-full border border-white/30 bg-black/25 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md sm:left-7 sm:top-7">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#DDA69A]" />
                Experiences worth sharing
              </div>

              <div className="absolute inset-x-5 bottom-6 sm:inset-x-7 sm:bottom-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#E9B6A9]">
                  YOUR NEXT STORY STARTS HERE
                </p>

                <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  Make the moments that matter.
                </h2>

                <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">
                  Discover something new, meet new people, and make memories
                  that stay with you.
                </p>
              </div>
            </div>

            {events.length > 0 && (
              <div className="absolute -bottom-5 left-4 right-4 flex items-center gap-3 rounded-2xl border border-[#E4DED3] bg-[#FFFEFA] p-3 shadow-xl shadow-[#292820]/10 sm:-bottom-6 sm:left-7 sm:right-7 sm:p-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#E8E1D6]">
                  <img
                    src={getEventImage(events[0], 0)}
                    alt={events[0].name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#A64B3C]">
                    FEATURED FROM YOUR EVENTS
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold">
                    {events[0].name}
                  </p>

                  <p className="mt-1 text-xs text-[#77746B]">
                    {formatDate(events[0].date)}
                  </p>
                </div>

                <ArrowRight size={18} className="shrink-0 text-[#A64B3C]" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="border-b border-[#E4DED3] bg-[#FFFEFA] px-5 py-7 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow">FIND YOUR NEXT EXPERIENCE</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                What would you like to discover?
              </h2>
            </div>

            <div className="flex w-full items-center gap-3 rounded-2xl border border-[#E4DED3] bg-[#F7F4EE] px-4 transition focus-within:border-[#A64B3C] sm:max-w-md">
              <Search size={20} className="shrink-0 text-[#77746B]" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search events, places, interests..."
                aria-label="Search events"
                className="h-12 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#A5A095]"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[#E8E1D6]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-5 pt-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-center gap-3 overflow-x-auto pb-3">
            {categories.map((category) => {
              const active = activeCategory === category;
              const Icon = categoryIcons[category];

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={active}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                    active
                      ? "border-[#292820] bg-[#292820] text-white"
                      : "border-[#E4DED3] bg-[#FFFEFA] text-[#77746B] hover:border-[#A64B3C] hover:text-[#A64B3C]"
                  }`}
                >
                  {Icon ? <Icon size={16} /> : <Ticket size={16} />}
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Event cards */}
      <section
        id="events"
        className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">YOUR NEXT EXPERIENCE</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Explore events
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#77746B] sm:text-base">
              Find something worth showing up for, from live performances to
              ideas that bring people together.
            </p>
          </div>

          {!loading && (
            <p className="text-sm text-[#77746B]">
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "event" : "events"} found
            </p>
          )}
        </div>

        {/* Featured event strip */}
        {!loading && featuredEvents.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {featuredEvents.map((event, index) => {
              const eventId = event.id || event._id;
              const dateParts = formatDateParts(event.date);

              return (
                <Link
                  key={eventId || `${event.name}-${index}`}
                  href={eventId ? `/events/${eventId}` : "/events"}
                  onClick={(clickEvent) => {
                    if (!requireLogin() || !eventId) {
                      clickEvent.preventDefault();
                    }
                  }}
                  className="group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-[#E4DED3] bg-[#FFFEFA] p-3 transition hover:-translate-y-1 hover:shadow-lg sm:gap-4 sm:p-4"
                >
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[#E8E1D6] sm:h-24 sm:w-32">
                    <img
                      src={getEventImage(event, index)}
                      alt={event.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#A64B3C]">
                      {dateParts.day} {dateParts.month}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-5 sm:text-base">
                      {event.name}
                    </h3>

                    <p className="mt-2 flex items-center gap-1 text-xs text-[#77746B]">
                      <MapPin size={13} className="shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </p>
                  </div>

                  <ArrowRight
                    size={17}
                    className="shrink-0 text-[#A64B3C] transition-transform group-hover:translate-x-1"
                  />
                </Link>
              );
            })}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-[#E4DED3] bg-[#FFFEFA] text-[#77746B]">
            <LoaderCircle
              size={28}
              className="animate-spin text-[#A64B3C]"
            />
            <p className="mt-4 text-sm">Finding experiences for you...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredEvents.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-[#D3C7B7] bg-[#FFFEFA] px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8E1D6]">
              <CalendarDays size={25} className="text-[#A64B3C]" />
            </div>

            <h3 className="mt-5 text-xl font-semibold">
              {events.length === 0
                ? "Nothing on the calendar just yet"
                : "No events found"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#77746B]">
              {events.length === 0
                ? "Be the person who brings everyone together. Create the first event."
                : "Try another search or category to discover more experiences."}
            </p>

            {events.length === 0 ? (
              <button
                type="button"
                onClick={() => {
                  if (requireLogin()) {
                    window.location.href = "/create-event";
                  }
                }}
                className="btn-primary mt-6"
              >
                <Plus size={17} />
                Create an event
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="btn-secondary mt-6"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Full event gallery */}
        {!loading && filteredEvents.length > 0 && (
          <>
            <div className="mt-14 flex items-end justify-between gap-4 border-b border-[#E4DED3] pb-4">
              <div>
                <p className="eyebrow">THE FULL COLLECTION</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                  All experiences
                </h3>
              </div>

              <p className="hidden text-sm text-[#77746B] sm:block">
                Browse the collection
              </p>
            </div>

            <div className="mt-7 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event, index) => {
                const eventId = event.id || event._id;
                const dateParts = formatDateParts(event.date);

                return (
                  <article
                    key={eventId || `${event.name}-gallery-${index}`}
                    className="group min-w-0"
                  >
                    <Link
                      href={eventId ? `/events/${eventId}` : "/events"}
                      onClick={(clickEvent) => {
                        if (!requireLogin() || !eventId) {
                          clickEvent.preventDefault();
                        }
                      }}
                      aria-label={`View ${event.name}`}
                      className="block"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#E8E1D6]">
                        <img
                          src={getEventImage(event, index)}
                          alt={event.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent" />

                        <span className="absolute left-4 top-4 rounded-full border border-white/50 bg-[#FFFEFA]/95 px-3 py-1.5 text-xs font-semibold capitalize text-[#292820] backdrop-blur">
                          {event.category}
                        </span>

                        <div className="absolute bottom-4 left-4 flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-[#FFFEFA]">
                          <span className="text-xl font-bold leading-none">
                            {dateParts.day}
                          </span>
                          <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#A64B3C]">
                            {dateParts.month}
                          </span>
                        </div>

                        <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFEFA] text-[#292820] transition-colors group-hover:bg-[#A64B3C] group-hover:text-white">
                          <ArrowRight size={18} />
                        </span>
                      </div>

                      <div className="pt-5">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#A64B3C]">
                          <CalendarDays size={14} />
                          {formatDate(event.date)}
                        </div>

                        <h3 className="mt-3 line-clamp-2 text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-[#A64B3C]">
                          {event.name}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#77746B]">
                          {event.description ||
                            "Discover this experience and find out what makes it special."}
                        </p>

                        <div className="mt-4 flex items-start gap-2 text-sm text-[#77746B]">
                          <MapPin
                            size={16}
                            className="mt-0.5 shrink-0 text-[#A64B3C]"
                          />
                          <span className="line-clamp-1">
                            {event.location}
                            {event.venue ? ` · ${event.venue}` : ""}
                          </span>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-[#E4DED3] pt-4">
                          <span className="text-sm font-semibold">
                            Discover event
                          </span>

                          <ArrowRight
                            size={17}
                            className="text-[#A64B3C] transition-transform group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Organizer section with a different photo */}
      <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <div className="grid overflow-hidden rounded-[28px] bg-[#292820] lg:grid-cols-2">
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D9A294]">
              HAVE SOMETHING IN MIND?
            </p>

            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              Great experiences start with someone like you.
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-white/70 sm:text-base">
              Bring your community together. Create an event and invite people
              to be part of something special.
            </p>

            <button
              type="button"
              onClick={() => {
                if (requireLogin()) {
                  window.location.href = "/create-event";
                }
              }}
              className="mt-7 inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-full bg-[#FFFEFA] px-6 py-3 text-sm font-semibold text-[#292820] transition hover:bg-[#E8E1D6]"
            >
              Host an event
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="relative min-h-[280px] overflow-hidden sm:min-h-[360px]">
            <img
              src={organizerImage}
              alt="People gathered at an event venue"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#292820]/55 via-[#292820]/10 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-black/25 p-4 text-white backdrop-blur-md sm:bottom-8 sm:left-8 sm:right-8">
              <p className="text-xs uppercase tracking-[0.15em] text-white/70">
                The EventFlow spirit
              </p>
              <p className="mt-1 text-lg font-semibold">
                Discover. Create. Experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E4DED3] bg-[#FFFEFA]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-8 text-sm text-[#77746B] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <Link
            href="/home"
            className="text-xl font-bold tracking-tight text-[#292820]"
          >
            event<span className="text-[#A64B3C]">flow.</span>
          </Link>

          <p>Discover experiences. Make memories.</p>

          <Link
            href="/home"
            className="transition-colors hover:text-[#A64B3C]"
          >
            Back to home <ArrowRight size={15} className="ml-1 inline" />
          </Link>
        </div>
      </footer>
    </main>
  );
}

