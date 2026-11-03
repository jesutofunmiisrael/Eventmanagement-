
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  MapPin,
  Ticket,
  Sparkles,
  LogOut,
  LoaderCircle,
  Menu,
  X,
  Music2,
  BriefcaseBusiness,
  Trophy,
  Plane,
  Users,
} from "lucide-react";
import { GRAPHQL_URL } from "@/lib/api";

type EventItem = {
  id: string;
  name: string;
  description?: string;
  date: string;
  location: string;
  category: string;
  image?: string;
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85",
];

const categories = [
  { name: "Music", icon: Music2, value: "music" },
  { name: "Business", icon: BriefcaseBusiness, value: "business" },
  { name: "Sports", icon: Trophy, value: "sport" },
  { name: "Travel", icon: Plane, value: "travel" },
  { name: "Conferences", icon: Users, value: "conference" },
  { name: "Festivals", icon: Sparkles, value: "festival" },
];

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

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDay(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return { day: "--", month: "TBA" };
  }

  return {
    day: parsed.toLocaleDateString("en-NG", { day: "2-digit" }),
    month: parsed.toLocaleDateString("en-NG", { month: "short" }),
  };
}

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const token = getValidToken();
    setLoggedIn(Boolean(token));

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
                  category
                  image
                }
              }
            `,
          }),
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || result.errors) {
          console.error("Failed to fetch events:", result.errors);
          return;
        }

        if (active) setEvents(result.data?.events ?? []);
      } catch (error) {
        console.error("HOME PAGE ERROR:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchEvents();

    return () => {
      active = false;
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    window.location.href = "/home";
  };

  const upcomingEvents = events
    .filter((event) => {
      const date = new Date(event.date).getTime();
      return !Number.isNaN(date) && date >= Date.now();
    })
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const filteredEvents =
    activeCategory === "all"
      ? upcomingEvents
      : upcomingEvents.filter(
          (event) => event.category.toLowerCase() === activeCategory
        );

  const heroEvent = upcomingEvents[0];
  const featuredEvents = filteredEvents.slice(0, 6);

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F4EE] text-[#292820]">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-[#E4DED3] bg-[#F7F4EE]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
          <Link href="/home" className="flex shrink-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A64B3C] text-lg font-bold text-white">
              E.
            </span>
            <span className="text-xl font-bold tracking-tight">
              EventFlow<span className="text-[#A64B3C]">.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#events"
              className="text-sm font-medium text-[#77746B] transition hover:text-[#A64B3C]"
            >
              Discover
            </a>
            <a
              href="#categories"
              className="text-sm font-medium text-[#77746B] transition hover:text-[#A64B3C]"
            >
              Categories
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-[#77746B] transition hover:text-[#A64B3C]"
            >
              About
            </a>
            {loggedIn && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-[#77746B] transition hover:text-[#A64B3C]"
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            {loggedIn ? (
              <>
                <Link
                  href="/create-event"
                  className="btn-secondary min-h-10 px-4 py-2 text-sm"
                >
                  Host an event
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Log out"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E4DED3] transition hover:bg-[#E8E1D6]"
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2.5 text-sm font-semibold transition hover:text-[#A64B3C]"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary min-h-10 px-5 py-2 text-sm"
                >
                  Get started <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenu((value) => !value)}
            aria-label={mobileMenu ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E4DED3] md:hidden"
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenu && (
          <div className="border-t border-[#E4DED3] bg-[#FFFEFA] px-5 py-5 md:hidden">
            <nav className="flex flex-col gap-1">
              {[
                ["Discover", "#events"],
                ["Categories", "#categories"],
                ["About", "#about"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileMenu(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#F7F4EE]"
                >
                  {label}
                </a>
              ))}

              {loggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenu(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#F7F4EE]"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/create-event"
                    onClick={() => setMobileMenu(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#F7F4EE]"
                  >
                    Host an event
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-[#A64B3C] hover:bg-[#F7F4EE]"
                  >
                    <LogOut size={16} /> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenu(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#F7F4EE]"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenu(false)}
                    className="btn-primary mt-2"
                  >
                    Create an account <ArrowRight size={16} />
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-12 lg:pt-16">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
          <div className="animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D9C9B8] bg-[#FFFEFA] px-4 py-2 text-xs font-semibold text-[#A64B3C] sm:text-sm">
              <Sparkles size={15} />
              Make room for memorable moments
            </div>

            <h1 className="max-w-2xl text-[clamp(2.8rem,6.4vw,5.7rem)] font-semibold leading-[0.99] tracking-[-0.065em]">
              Life is better
              <br />
              <span className="font-serif italic font-normal text-[#A64B3C]">
                when we gather.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-[#77746B] sm:text-lg sm:leading-8">
              From unforgettable live music to inspiring conferences,
              discover the experiences that bring people together.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={loggedIn ? "/events" : "/login"}
                className="btn-primary px-6"
              >
                Explore events <ArrowRight size={18} />
              </Link>
              {loggedIn ? (
                <Link href="/create-event" className="btn-secondary px-6">
                  Host an event
                </Link>
              ) : (
                <Link href="/signup" className="btn-secondary px-6">
                  Join EventFlow
                </Link>
              )}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-[#E4DED3] pt-6">
              <div>
                <p className="text-2xl font-semibold tracking-tight">
                  {events.length}
                </p>
                <p className="mt-1 text-xs text-[#77746B]">Events listed</p>
              </div>
              <div className="h-10 w-px bg-[#E4DED3]" />
              <div>
                <p className="text-2xl font-semibold tracking-tight">6</p>
                <p className="mt-1 text-xs text-[#77746B]">Categories</p>
              </div>
              <div className="h-10 w-px bg-[#E4DED3]" />
              <div className="flex items-center gap-2 text-sm text-[#77746B]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8E1D6] text-[#A64B3C]">
                  <Users size={16} />
                </span>
                Find your people
              </div>
            </div>
          </div>

          <div className="relative animate-fade-up lg:pl-2">
            <div className="relative h-[390px] overflow-hidden rounded-[28px] bg-[#292820] sm:h-[510px] lg:h-[590px]">
              {/* Main hero photography */}
              <img
                src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1800&q=90"
                alt="A live music event with a crowd enjoying the performance"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171611]/85 via-[#171611]/10 to-black/10" />

              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md sm:left-7 sm:top-7">
                <span className="h-2 w-2 rounded-full bg-[#DDA69A]" />
                Experiences worth sharing
              </div>

              <div className="absolute inset-x-5 bottom-6 sm:inset-x-8 sm:bottom-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#EBC0B5]">
                  YOUR NEXT STORY STARTS HERE
                </p>
                <h2 className="mt-3 max-w-lg text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                  Make the moments that matter.
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/75 sm:text-base">
                  Discover something new, meet new people, and make memories
                  that stay with you.
                </p>
                <a
                  href="#events"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FFFEFA] px-5 py-3 text-sm font-semibold text-[#292820] transition hover:bg-[#E8E1D6]"
                >
                  Find your next event <ArrowDownRight size={17} />
                </a>
              </div>
            </div>

            {heroEvent && (
              <Link
                href={loggedIn ? `/events/${heroEvent.id}` : "/login"}
                className="absolute -bottom-5 right-4 flex max-w-[280px] items-center gap-3 rounded-2xl border border-[#E4DED3] bg-[#FFFEFA] p-3 shadow-xl shadow-[#292820]/10 transition hover:-translate-y-1 sm:-bottom-6 sm:right-7 sm:max-w-[340px] sm:p-4"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#E8E1D6] sm:h-16 sm:w-16">
                  <img
                    src={
                      heroEvent.image ||
                      fallbackImages[
                        Math.max(0, events.findIndex((e) => e.id === heroEvent.id)) %
                          fallbackImages.length
                      ]
                    }
                    alt={heroEvent.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#A64B3C]">
                    UPCOMING EVENT
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm font-semibold">
                    {heroEvent.name}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#77746B]">
                    <CalendarDays size={12} />
                    {formatDate(heroEvent.date)}
                  </p>
                </div>
                <ArrowRight size={17} className="shrink-0 text-[#A64B3C]" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="border-y border-[#E4DED3] bg-[#FFFEFA] px-5 py-10 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">FIND YOUR THING</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                What are you in the mood for?
              </h2>
            </div>
            <p className="text-sm text-[#77746B]">
              A world of experiences, all in one place.
            </p>
          </div>

          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                activeCategory === "all"
                  ? "border-[#A64B3C] bg-[#A64B3C] text-white"
                  : "border-[#E4DED3] bg-[#FFFEFA] hover:border-[#A64B3C] hover:text-[#A64B3C]"
              }`}
            >
              <Sparkles size={17} />
              All events
            </button>

            {categories.map(({ name, icon: Icon, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveCategory(value)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                  activeCategory === value
                    ? "border-[#A64B3C] bg-[#A64B3C] text-white"
                    : "border-[#E4DED3] bg-[#FFFEFA] hover:border-[#A64B3C] hover:text-[#A64B3C]"
                }`}
              >
                <Icon size={17} />
                {name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Event cards */}
      <section
        id="events"
        className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
      >
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">THE GOOD STUFF</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Upcoming experiences
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#77746B] sm:text-base">
              Find your next reason to get out, connect, and experience
              something different.
            </p>
          </div>

          <Link
            href={loggedIn ? "/events" : "/login"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#A64B3C] transition hover:gap-3"
          >
            View all events <ArrowRight size={17} />
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-[#E4DED3] bg-[#FFFEFA]"
              >
                <div className="h-56 bg-[#E8E1D6]" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 rounded bg-[#E8E1D6]" />
                  <div className="h-5 w-3/4 rounded bg-[#E8E1D6]" />
                  <div className="h-3 w-1/2 rounded bg-[#E8E1D6]" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredEvents.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((event, index) => {
              const fallbackImage =
                fallbackImages[
                  Math.max(0, events.findIndex((e) => e.id === event.id)) %
                    fallbackImages.length
                ];
              const image = event.image || fallbackImage;
              const dateParts = formatDay(event.date);

              return (
                <article
                  key={event.id || `${event.name}-${index}`}
                  className="group overflow-hidden rounded-[22px] border border-[#E4DED3] bg-[#FFFEFA] transition duration-300 hover:-translate-y-1 hover:border-[#D3C7B7] hover:shadow-xl hover:shadow-[#292820]/[0.07]"
                >
                  <Link
                    href={loggedIn ? `/events/${event.id}` : "/login"}
                    className="block"
                  >
                    <div className="relative h-56 overflow-hidden bg-[#E8E1D6] sm:h-60">
                      <img
                        src={image}
                        alt={event.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/5" />

                      <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-[#FFFEFA]/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#292820]">
                        {event.category}
                      </span>

                      <div className="absolute bottom-4 left-4 flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-[#FFFEFA] shadow-lg">
                        <span className="text-xl font-bold leading-none">
                          {dateParts.day}
                        </span>
                        <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#A64B3C]">
                          {dateParts.month}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <p className="flex items-center gap-2 text-xs font-medium text-[#77746B]">
                        <CalendarDays size={14} className="text-[#A64B3C]" />
                        {formatDate(event.date)}
                      </p>

                      <h3 className="mt-3 line-clamp-2 text-xl font-semibold tracking-tight transition group-hover:text-[#A64B3C]">
                        {event.name}
                      </h3>

                      <p className="mt-2 flex items-center gap-2 text-sm text-[#77746B]">
                        <MapPin size={15} className="shrink-0 text-[#A64B3C]" />
                        <span className="truncate">{event.location}</span>
                      </p>

                      <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-[#77746B]">
                        {event.description ||
                          "Discover this experience and find out what makes it special."}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-[#E4DED3] pt-4">
                        <span className="text-sm font-semibold text-[#A64B3C]">
                          {loggedIn ? "Discover event" : "Log in to explore"}
                        </span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4DED3] transition group-hover:border-[#A64B3C] group-hover:bg-[#A64B3C] group-hover:text-white">
                          <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-[24px] border border-dashed border-[#D3C7B7] bg-[#FFFEFA] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8E1D6] text-[#A64B3C]">
              <CalendarDays size={27} />
            </div>
            <h3 className="mt-5 text-xl font-semibold">
              {activeCategory === "all"
                ? "Your next experience is waiting."
                : `No upcoming ${activeCategory} events yet.`}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#77746B]">
              {activeCategory === "all"
                ? "There are no upcoming events in the current API response. Check your event dates and backend data."
                : "Try another category to see available events."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {activeCategory !== "all" && (
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className="btn-secondary"
                >
                  View all categories
                </button>
              )}
              <Link
                href={loggedIn ? "/events" : "/login"}
                className="btn-primary"
              >
                Explore events <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Organizer call to action */}
      <section id="about" className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <div className="mx-auto grid max-w-[1440px] overflow-hidden rounded-[28px] bg-[#292820] lg:grid-cols-2">
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#DDA69A]">
              FOR THE PEOPLE WITH IDEAS
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Have something worth bringing people together for?
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/60 sm:text-base">
              Create an event, set up your tickets, and share your next
              experience with the EventFlow community.
            </p>
            <div className="mt-7">
              <Link
                href={loggedIn ? "/create-event" : "/signup"}
                className="inline-flex items-center gap-2 rounded-full bg-[#A64B3C] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#893A2E]"
              >
                {loggedIn ? "Create an event" : "Join EventFlow"}
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div className="relative min-h-[280px] overflow-hidden sm:min-h-[360px]">
            <img
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=85"
              alt="A crowd enjoying a live music performance"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#292820]/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-black/30 px-4 py-3 text-white backdrop-blur-md sm:bottom-8 sm:left-8">
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
      <footer className="border-t border-[#E4DED3] bg-[#FFFEFA] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/home" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A64B3C] text-sm font-bold text-white">
              E.
            </span>
            <span className="font-bold tracking-tight">EventFlow.</span>
          </Link>

          <p className="text-xs text-[#77746B]">
            © {new Date().getFullYear()} EventFlow. Discover experiences worth
            remembering.
          </p>

          <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-[#77746B]">
            {loggedIn ? (
              <>
                <Link href="/dashboard" className="hover:text-[#A64B3C]">
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="hover:text-[#A64B3C]"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-[#A64B3C]">
                  Log in
                </Link>
                <Link href="/signup" className="hover:text-[#A64B3C]">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </main>
  );
}
