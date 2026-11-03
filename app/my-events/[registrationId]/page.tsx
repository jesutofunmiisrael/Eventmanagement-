"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Ticket,
  Users,
  CheckCircle2,
} from "lucide-react";
import API_URL from "@/lib/api";
import { toast } from "sonner";

type TicketData = {
  registrationId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventVenue: string;
  eventCategory: string;
  registrationStatus: string;
  numberOfSeats: number;
  ticketPrice: number;
  ticketType: string;
};

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();

  const registrationId = params.registrationId as string;

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Please login to view your ticket.");
          router.push("/login");
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
          toast.error(data.message || "Failed to load ticket.");
          return;
        }

        const selectedTicket = data.events?.find(
          (event: TicketData) =>
            event.registrationId === registrationId
        );

        if (!selectedTicket) {
          toast.error("Ticket not found.");
          return;
        }

        setTicket(selectedTicket);
      } catch (error) {
        console.error("TICKET PAGE ERROR:", error);

        toast.error("Unable to load your ticket.", {
          description: "Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (registrationId) {
      fetchTicket();
    }
  }, [registrationId, router]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
          <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 h-[500px] animate-pulse rounded-3xl bg-slate-200" />
        </div>
      </main>
    );
  }

  if (!ticket) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-5">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Ticket size={28} />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#0B1220]">
            Ticket not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            We couldn't find this ticket. Please return to your
            registered events.
          </p>

          <button
            onClick={() => router.push("/my-events")}
            className="mt-7 rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Back to My Events
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* NAVBAR */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-5xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB]">
              <span className="text-sm font-bold text-white">E</span>
            </div>

            <span className="text-lg font-bold tracking-tight text-[#0B1220]">
              EventFlow
            </span>
          </div>

          <button
            onClick={() => router.push("/my-events")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#2563EB]"
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">
              My Events
            </span>
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        {/* HEADER */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563EB]">
            Your ticket
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0B1220] sm:text-4xl">
            {ticket.eventName}
          </h1>

          <p className="mt-2 text-slate-500">
            Your confirmed EventFlow ticket.
          </p>
        </div>

        {/* TICKET */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* TOP */}
          <div className="border-b border-dashed border-slate-200 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-[#2563EB]">
                  {ticket.eventCategory}
                </span>

                <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#0B1220] sm:text-3xl">
                  {ticket.eventName}
                </h2>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                <CheckCircle2 size={15} />
                {ticket.registrationStatus}
              </div>
            </div>
          </div>

          {/* EVENT DETAILS */}
          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                <CalendarDays size={20} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Date
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                  {formatDate(ticket.eventDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                <MapPin size={20} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Venue
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                  {ticket.eventVenue}, {ticket.eventLocation}
                </p>
              </div>
            </div>
          </div>

          {/* TICKET DETAILS */}
          <div className="border-t border-slate-100 bg-slate-50">
            <div className="grid grid-cols-1 sm:grid-cols-3">
              <div className="p-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <Ticket size={16} />

                  <span className="text-xs font-semibold">
                    Ticket type
                  </span>
                </div>

                <p className="mt-2 text-lg font-bold text-[#0B1220]">
                  {ticket.ticketType}
                </p>
              </div>

              <div className="border-t border-slate-200 p-6 sm:border-l sm:border-t-0">
                <div className="flex items-center gap-2 text-slate-400">
                  <Users size={16} />

                  <span className="text-xs font-semibold">
                    Seats
                  </span>
                </div>

                <p className="mt-2 text-lg font-bold text-[#0B1220]">
                  {ticket.numberOfSeats}
                </p>
              </div>

              <div className="border-t border-slate-200 p-6 sm:border-l sm:border-t-0">
                <p className="text-xs font-semibold text-slate-400">
                  Total paid
                </p>

                <p className="mt-2 text-lg font-bold text-[#0B1220]">
                  ₦{ticket.ticketPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* TICKET ID */}
          <div className="border-t border-dashed border-slate-200 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ticket reference
            </p>

            <p className="mt-2 break-all font-mono text-sm font-semibold text-slate-700">
              {ticket.registrationId}
            </p>
          </div>
        </div>

        {/* BACK BUTTON */}
        <div className="mt-6">
          <button
            onClick={() => router.push("/my-events")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-[#2563EB]"
          >
            <ArrowLeft size={17} />
            Back to My Events
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 EventFlow</p>

          <p>Discover · Create · Experience</p>
        </div>
      </footer>
    </main>
  );
}