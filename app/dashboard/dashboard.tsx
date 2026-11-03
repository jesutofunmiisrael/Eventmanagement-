
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  ChartNoAxesCombined,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Plus,
  Search,
  Ticket,
  Users,
  X,
  MapPin,
  Sparkles,
} from "lucide-react";
import API_URL from "@/lib/api";

type EventItem = {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  date: string;
  location: string;
  venue?: string;
  category: string;
  image?: string;
};

type Registration = {
  registrationId?: string;
  numberOfSeats?: number;
  ticketPrice?: number;
  eventName?: string;
};

export default function Dashboard() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/home";
  };

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/home";
        return;
      }

      try {
        const payload = token.split(".")[1];

        if (!payload) {
          logout();
          return;
        }

        const decoded = JSON.parse(
          atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        );

        if (!decoded.exp || decoded.exp * 1000 <= Date.now()) {
          logout();
          return;
        }
      } catch {
        logout();
        return;
      }

      try {
        const [eventResponse, registrationResponse] = await Promise.all([
          fetch(`${API_URL}/event/getEvent`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }),
          fetch(`${API_URL}/user/myregister-event`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }),
        ]);

        if (
          eventResponse.status === 401 ||
          eventResponse.status === 403 ||
          registrationResponse.status === 401 ||
          registrationResponse.status === 403
        ) {
          logout();
          return;
        }

        const eventData = eventResponse.ok
          ? await eventResponse.json()
          : null;

        const registrationData = registrationResponse.ok
          ? await registrationResponse.json()
          : null;

        if (!active) return;

        const eventList = Array.isArray(eventData?.events)
          ? eventData.events
          : Array.isArray(eventData?.result)
            ? eventData.result
            : Array.isArray(eventData)
              ? eventData
              : [];

        const registrationList = Array.isArray(registrationData?.events)
          ? registrationData.events
          : Array.isArray(registrationData?.registrations)
            ? registrationData.registrations
            : [];

        setEvents(eventList);
        setRegistrations(registrationList);

        if (!eventResponse.ok && !registrationResponse.ok) {
          setError("Unable to load dashboard data. Please try again.");
        }
      } catch (err) {
        console.error("Dashboard error:", err);

        if (active) {
          setError(
            "Cannot connect to the backend. Make sure your backend is running."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const filteredEvents = events.filter((event) =>
    `${event.name} ${event.category} ${event.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalSeats = registrations.reduce(
    (total, registration) =>
      total + (Number(registration.numberOfSeats) || 0),
    0
  );

  const recordedValue = registrations.reduce(
    (total, registration) =>
      total + (Number(registration.ticketPrice) || 0),
    0
  );

  const formatDate = (date: string) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Date unavailable";

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const money = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);

  const navigation = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Explore events", href: "/events", icon: CalendarDays },
    { label: "My registrations", href: "/my-events", icon: Ticket },
  ];

  const stats = [
    {
      label: "Events available",
      value: events.length,
      description: "Events returned by the API",
      icon: CalendarDays,
    },
    {
      label: "Registered seats",
      value: totalSeats,
      description: "Seats in your registrations",
      icon: Users,
    },
    {
      label: "My registrations",
      value: registrations.length,
      description: "Your recorded bookings",
      icon: Ticket,
    },
    {
      label: "Recorded value",
      value: money(recordedValue),
      description: "Not verified payment revenue",
      icon: CircleDollarSign,
    },
  ];

  const sidebar = (
    <div className="flex h-full flex-col bg-[#292820] text-[#FFFEFA]">
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
        <Link href="/home" className="flex items-center gap-3 text-xl font-bold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A64B3C] text-sm text-white">
            E.
          </span>
          EventFlow
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenu(false)}
          className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="px-4 pt-8">
        <p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
          Your workspace
        </p>

        <nav className="space-y-2">
          {navigation.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenu(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition ${
                href === "/dashboard"
                  ? "bg-[#A64B3C] text-white"
                  : "text-white/65 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <Icon size={19} />
              {label}
              {href === "/dashboard" && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A64B3C]/20 text-[#DDA69A]">
            <CalendarPlus size={21} />
          </div>
          <h3 className="mt-4 font-semibold">Have an event idea?</h3>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Turn your idea into an experience people can discover.
          </p>

          <Link href="/create-event" className="btn-primary mt-4 w-full text-sm">
            <Plus size={17} />
            Create event
          </Link>
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-red-400/10 hover:text-red-300"
        >
          <LogOut size={19} />
          Logout
        </button>

        <Link
          href="/home"
          className="mt-1 block rounded-xl px-4 py-3 text-sm text-white/50 transition hover:bg-white/[0.06] hover:text-white"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F7F4EE] text-[#292820]">
      {mobileMenu && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-40 bg-[#292820]/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        {sidebar}
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 lg:hidden ${
          mobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#E4DED3] bg-[#FFFEFA]/90 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenu(true)}
              className="rounded-xl border border-[#E4DED3] p-2.5 transition hover:bg-[#E8E1D6] lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="hidden text-xs text-[#77746B] sm:block">
                EventFlow / Workspace
              </p>
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-[#E4DED3] px-3 py-2.5 text-sm font-semibold transition hover:bg-[#F7F4EE] sm:px-4"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <Link href="/create-event" className="btn-primary min-h-10 px-4 py-2 text-sm">
              <Plus size={17} />
              <span className="hidden sm:inline">Create event</span>
              <span className="sm:hidden">Create</span>
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-10">
          <section className="animate-fade-up">
            <p className="eyebrow">YOUR EVENT WORKSPACE</p>

            <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Welcome back.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#77746B] sm:text-base">
                  Your space to discover events, keep track of your
                  registrations, and bring your next event to life.
                </p>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-full border border-[#E4DED3] bg-[#FFFEFA] px-4 py-2.5 text-sm text-[#77746B]">
                <span className="h-2 w-2 rounded-full bg-[#42765B]" />
                Workspace overview
              </div>
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              <p>{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 font-semibold underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          )}

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  className={`surface card-hover animate-fade-up p-5 sm:p-6 ${
                    index === 1 ? "animate-delay-100" : ""
                  } ${index === 2 ? "animate-delay-200" : ""} ${
                    index === 3 ? "animate-delay-300" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#77746B]">
                        {stat.label}
                      </p>
                      <div className="mt-4 break-words text-2xl font-semibold tracking-tight">
                        {loading ? (
                          <LoaderCircle
                            size={25}
                            className="animate-spin text-[#CFC5B7]"
                          />
                        ) : (
                          stat.value
                        )}
                      </div>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8E1D6] text-[#A64B3C]">
                      <Icon size={21} />
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-[#77746B]">
                    {stat.description}
                  </p>
                </article>
              );
            })}
          </section>

          <section className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
            <div className="surface min-w-0 overflow-hidden">
              <div className="flex flex-col justify-between gap-4 border-b border-[#E4DED3] p-5 sm:flex-row sm:items-center sm:p-6">
                <div>
                  <p className="eyebrow">DISCOVER</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight">
                    Explore events
                  </h3>
                  <p className="mt-1 text-sm text-[#77746B]">
                    Find something worth showing up for.
                  </p>
                </div>

                <Link href="/events" className="btn-secondary min-h-10 w-fit px-4 py-2 text-sm">
                  View all
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="border-b border-[#E4DED3] p-4 sm:px-6">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77746B]"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, category or location..."
                    className="w-full rounded-xl border border-[#E4DED3] bg-[#F7F4EE] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#A5A095] focus:border-[#A64B3C] focus:bg-[#FFFEFA] focus:ring-4 focus:ring-[#A64B3C]/10"
                  />
                </div>
              </div>

              {loading ? (
                <div className="space-y-4 p-6">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex animate-pulse gap-4">
                      <div className="h-20 w-24 shrink-0 rounded-xl bg-[#E8E1D6]" />
                      <div className="flex-1 space-y-3 py-2">
                        <div className="h-4 w-2/3 rounded bg-[#E8E1D6]" />
                        <div className="h-3 w-1/2 rounded bg-[#E8E1D6]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="divide-y divide-[#E4DED3]">
                  {filteredEvents.slice(0, 6).map((event, index) => {
                    const id = event._id || event.id;

                    return (
                      <article
                        key={id || `${event.name}-${index}`}
                        className="flex flex-col gap-4 p-4 transition hover:bg-[#F7F4EE]/70 sm:flex-row sm:items-center sm:px-6"
                      >
                        <div className="h-36 w-full shrink-0 overflow-hidden rounded-xl bg-[#E8E1D6] sm:h-20 sm:w-24">
                          {event.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={event.image}
                              alt={event.name}
                              className="h-full w-full object-cover transition duration-500 hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#E8E1D6] to-[#F1DCD4]">
                              <CalendarDays
                                size={30}
                                className="text-[#A64B3C]/60"
                              />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="break-words font-semibold">
                              {event.name}
                            </h4>
                            <span className="rounded-full bg-[#E8E1D6] px-2.5 py-1 text-[11px] font-semibold capitalize text-[#665D51]">
                              {event.category}
                            </span>
                          </div>

                          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#77746B]">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={14} />
                              {formatDate(event.date)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={14} />
                              {event.location}
                            </span>
                          </p>
                        </div>

                        {id && (
                          <Link
                            href={`/events/${id}`}
                            className="btn-secondary min-h-10 shrink-0 px-3 py-2 text-sm"
                          >
                            View event
                            <ChevronRight size={16} />
                          </Link>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="px-6 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8E1D6] text-[#A64B3C]">
                    <CalendarDays size={26} />
                  </div>
                  <h4 className="mt-4 font-semibold">
                    {search ? "No matching events" : "No events available yet"}
                  </h4>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#77746B]">
                    {search
                      ? "Try another search term to find an event."
                      : "Events returned by your API will appear here when available."}
                  </p>

                  {!search && (
                    <Link href="/events" className="btn-primary mt-5">
                      Explore events
                      <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              )}

              {!loading && filteredEvents.length > 6 && (
                <div className="border-t border-[#E4DED3] p-4 text-center">
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#A64B3C] transition hover:text-[#893A2E]"
                  >
                    View all events
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <section className="surface p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow">MAKE IT HAPPEN</p>
                    <h3 className="mt-2 text-lg font-semibold">
                      Quick actions
                    </h3>
                    <p className="mt-1 text-sm text-[#77746B]">
                      Pick up where you left off.
                    </p>
                  </div>
                  <ChartNoAxesCombined
                    size={22}
                    className="text-[#A64B3C]"
                  />
                </div>

                <div className="mt-5 space-y-3">
                  <Link
                    href="/create-event"
                    className="group flex items-center gap-3 rounded-2xl border border-[#E4DED3] p-4 transition hover:border-[#A64B3C]/40 hover:bg-[#F7F4EE]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8E1D6] text-[#A64B3C]">
                      <Plus size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">
                        Create an event
                      </span>
                      <span className="mt-1 block text-xs text-[#77746B]">
                        Publish your next event
                      </span>
                    </span>
                    <ArrowRight
                      size={17}
                      className="text-[#A5A095] transition group-hover:translate-x-1 group-hover:text-[#A64B3C]"
                    />
                  </Link>

                  <Link
                    href="/my-events"
                    className="group flex items-center gap-3 rounded-2xl border border-[#E4DED3] p-4 transition hover:border-[#A64B3C]/40 hover:bg-[#F7F4EE]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8E1D6] text-[#A64B3C]">
                      <Ticket size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">
                        My registrations
                      </span>
                      <span className="mt-1 block text-xs text-[#77746B]">
                        Review your registered events
                      </span>
                    </span>
                    <ArrowRight
                      size={17}
                      className="text-[#A5A095] transition group-hover:translate-x-1 group-hover:text-[#A64B3C]"
                    />
                  </Link>
                </div>
              </section>

              <section className="relative overflow-hidden rounded-[24px] bg-[#292820] p-6 text-[#FFFEFA] sm:p-7">
                <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -right-1 -top-1 h-24 w-24 rounded-full border border-white/10" />

                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#DDA69A]">
                    <Sparkles size={22} />
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#DDA69A]">
                    YOUR NEXT CHAPTER
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold leading-tight">
                    Got an idea worth sharing?
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    Bring people together. Add your event details, set your
                    ticket prices, and let people discover it.
                  </p>
                  <Link
                    href="/create-event"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#A64B3C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#893A2E]"
                  >
                    Create an event
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </section>
            </div>
          </section>

          <footer className="mt-10 flex flex-col gap-3 border-t border-[#E4DED3] py-6 text-xs text-[#77746B] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} EventFlow. Discover. Create.
              Experience.
            </p>
            <Link
              href="/home"
              className="font-medium transition hover:text-[#A64B3C]"
            >
              Return to home
            </Link>
          </footer>
        </div>
      </div>
    </main>
  );
}
