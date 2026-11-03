
"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Ticket,
  Upload,
  Users,
} from "lucide-react";
import API_URL from "@/lib/api";

export default function CreateEvent() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    venue: "",
    category: "",
    regularPrice: "5000",
    vipPrice: "10000",
    regularSeats: "100",
    vipSeats: "50",
  });

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setImage(file);
    setImagePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return file ? URL.createObjectURL(file) : "";
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in before creating an event.");
      return;
    }

    const regularPrice = Number(formData.regularPrice);
    const vipPrice = Number(formData.vipPrice);
    const regularSeats = Number(formData.regularSeats);
    const vipSeats = Number(formData.vipSeats);

    if (
      !Number.isFinite(regularPrice) ||
      !Number.isFinite(vipPrice) ||
      regularPrice < 0 ||
      vipPrice < 0 ||
      !Number.isInteger(regularSeats) ||
      !Number.isInteger(vipSeats) ||
      regularSeats < 1 ||
      vipSeats < 1
    ) {
      setError(
        "Enter valid ticket prices and positive whole-number seat counts."
      );
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("description", formData.description.trim());
      data.append("date", formData.date);
      data.append("location", formData.location.trim());
      data.append("venue", formData.venue.trim());
      data.append("category", formData.category);
      data.append("regularPrice", String(regularPrice));
      data.append("vipPrice", String(vipPrice));
      data.append("regularSeats", String(regularSeats));
      data.append("vipSeats", String(vipSeats));

      if (image) data.append("image", image);

      const response = await fetch(`${API_URL}/event/createEvent`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
        }

        throw new Error(
          result.message || result.error || "Failed to create event."
        );
      }

      setSuccess("Event and tickets created successfully!");

      setTimeout(() => {
        router.push("/events");
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#E4DED3] bg-[#FFFEFA] px-4 py-3 text-sm text-[#292820] outline-none transition placeholder:text-[#A5A095] hover:border-[#CFC5B7] focus:border-[#A64B3C] focus:ring-4 focus:ring-[#A64B3C]/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[#292820]";

  const formatPrice = (value: string) =>
    Number(value || 0).toLocaleString("en-NG", {
      maximumFractionDigits: 0,
    });

  return (
    <main className="min-h-screen bg-[#F7F4EE] text-[#292820]">
      <header className="border-b border-[#E4DED3] bg-[#FFFEFA]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <button
            type="button"
            onClick={() => router.push("/events")}
            className="flex items-center gap-2 text-xl font-bold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A64B3C] text-sm text-white">
              E.
            </span>
            EventFlow
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-full border border-[#E4DED3] px-4 py-2.5 text-sm font-semibold transition hover:bg-[#E8E1D6]"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Go back</span>
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-9 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-14">
        <section className="min-w-0 animate-fade-up">
          <div className="mb-9">
            <p className="eyebrow mb-3">EVENT ORGANIZER / NEW EVENT</p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Bring your next big idea to life.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#77746B]">
              Create your event, set up your tickets, and give people
              something worth showing up for.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            <section className="surface p-5 sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8E1D6]">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#A64B3C]">
                    Step 01
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    Event information
                  </h2>
                  <p className="mt-1 text-sm text-[#77746B]">
                    Start with the details people need to know.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Event name <span className="text-[#A64B3C]">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ibadan Tech Conference"
                    className={inputClass}
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <label htmlFor="description" className={labelClass}>
                    Description <span className="text-[#A64B3C]">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="What makes this event special? Tell people what to expect..."
                    className={`${inputClass} min-h-36 resize-y`}
                    rows={5}
                    required
                  />
                  <p className="mt-2 text-right text-xs text-[#77746B]">
                    {formData.description.length} characters
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="date" className={labelClass}>
                      Date and time *
                    </label>
                    <input
                      id="date"
                      name="date"
                      type="datetime-local"
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().slice(0, 16)}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className={labelClass}>
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    >
                      <option value="">Choose a category</option>
                      <option value="sport">Sport</option>
                      <option value="travel">Travel</option>
                      <option value="conference">Conference</option>
                      <option value="business">Business</option>
                      <option value="festival">Festival</option>
                      <option value="music">Music</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="location" className={labelClass}>
                      City or location *
                    </label>
                    <div className="relative">
                      <MapPin
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77746B]"
                      />
                      <input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Ibadan, Oyo State"
                        className={`${inputClass} pl-10`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="venue" className={labelClass}>
                      Venue name *
                    </label>
                    <input
                      id="venue"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      placeholder="The Civic Centre"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="surface p-5 sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8E1D6]">
                  <Ticket size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#A64B3C]">
                    Step 02
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    Tickets and pricing
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[#77746B]">
                    Decide what each ticket costs and how many seats are
                    available.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-[#E4DED3] bg-[#FFFEFA] p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">Regular access</h3>
                      <p className="mt-1 text-xs text-[#77746B]">
                        Standard admission
                      </p>
                    </div>
                    <span className="rounded-full bg-[#E8E1D6] px-3 py-1 text-xs font-semibold">
                      Regular
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="regularPrice" className={labelClass}>
                        Ticket price (₦)
                      </label>
                      <input
                        id="regularPrice"
                        name="regularPrice"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.regularPrice}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="regularSeats" className={labelClass}>
                        Available seats
                      </label>
                      <div className="relative">
                        <Users
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77746B]"
                        />
                        <input
                          id="regularSeats"
                          name="regularSeats"
                          type="number"
                          min="1"
                          step="1"
                          value={formData.regularSeats}
                          onChange={handleChange}
                          className={`${inputClass} pl-10`}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 border-t border-[#E4DED3] pt-4 text-sm text-[#77746B]">
                    Price preview
                    <span className="float-right font-semibold text-[#292820]">
                      ₦{formatPrice(formData.regularPrice)}
                    </span>
                  </p>
                </div>

                <div className="rounded-2xl border border-[#A64B3C]/30 bg-[#A64B3C]/[0.035] p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">VIP access</h3>
                      <p className="mt-1 text-xs text-[#77746B]">
                        Premium admission
                      </p>
                    </div>
                    <span className="rounded-full bg-[#A64B3C] px-3 py-1 text-xs font-semibold text-white">
                      VIP
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="vipPrice" className={labelClass}>
                        Ticket price (₦)
                      </label>
                      <input
                        id="vipPrice"
                        name="vipPrice"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.vipPrice}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="vipSeats" className={labelClass}>
                        Available seats
                      </label>
                      <div className="relative">
                        <Users
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77746B]"
                        />
                        <input
                          id="vipSeats"
                          name="vipSeats"
                          type="number"
                          min="1"
                          step="1"
                          value={formData.vipSeats}
                          onChange={handleChange}
                          className={`${inputClass} pl-10`}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 border-t border-[#A64B3C]/15 pt-4 text-sm text-[#77746B]">
                    Price preview
                    <span className="float-right font-semibold text-[#A64B3C]">
                      ₦{formatPrice(formData.vipPrice)}
                    </span>
                  </p>
                </div>
              </div>

              <p className="mt-4 rounded-xl bg-[#F7F4EE] px-4 py-3 text-xs leading-5 text-[#77746B]">
                You can set a ticket price to ₦0 for free admission. Seat
                counts must be positive whole numbers.
              </p>
            </section>

            <section className="surface p-5 sm:p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8E1D6]">
                  <ImagePlus size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#A64B3C]">
                    Step 03
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    Event cover image
                  </h2>
                  <p className="mt-1 text-sm text-[#77746B]">
                    Add an image to help your event stand out.
                  </p>
                </div>
              </div>

              <label
                htmlFor="image"
                className="group flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#CFC5B7] bg-[#F7F4EE] text-center transition hover:border-[#A64B3C] hover:bg-[#A64B3C]/[0.035]"
              >
                {imagePreview ? (
                  <div className="w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Selected event cover preview"
                      className="max-h-72 w-full object-cover"
                    />
                    <div className="px-4 py-4 text-sm font-semibold text-[#A64B3C]">
                      Change cover image
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-10">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFFEFA] text-[#A64B3C] shadow-sm transition group-hover:scale-105">
                      <Upload size={23} />
                    </span>
                    <p className="mt-4 font-semibold">
                      Click to upload an image
                    </p>
                    <p className="mt-2 text-sm text-[#77746B]">
                      Choose a cover image from your device
                    </p>
                    <p className="mt-3 text-xs text-[#A5A095]">
                      Image files only
                    </p>
                  </div>
                )}
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>

              {image && (
                <p className="mt-3 break-all text-xs text-[#77746B]">
                  Selected: {image.name}
                </p>
              )}
            </section>

            {error && (
              <div
                role="alert"
                className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
              >
                <span className="font-bold">!</span>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
              >
                <CheckCircle2 size={20} />
                <p>{success}</p>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-[#77746B]">
                Fields marked * are required.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Creating event...
                  </>
                ) : (
                  <>
                    Create event
                    <ArrowUpRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
          <div className="overflow-hidden rounded-[24px] bg-[#292820] p-6 text-[#FFFEFA] sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#DDA69A]">
              YOUR EVENT CHECKLIST
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight">
              Make every detail count.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              A clear description, accurate venue details, and well-priced
              tickets help guests plan their visit.
            </p>

            <div className="mt-7 space-y-4">
              {[
                ["01", "Describe your event"],
                ["02", "Set date and location"],
                ["03", "Choose ticket prices"],
                ["04", "Add a cover image"],
              ].map(([number, label]) => (
                <div key={number} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs text-[#DDA69A]">
                    {number}
                  </span>
                  <span className="text-sm text-white/85">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-7 border-t border-white/15 pt-5">
              <div className="flex items-center gap-2 text-sm text-white/65">
                <Clock3 size={16} />
                Take your time and review your details.
              </div>
            </div>
          </div>

          <div className="surface p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#77746B]">
              QUICK PREVIEW
            </p>
            <h3 className="mt-3 break-words text-lg font-semibold">
              {formData.name.trim() || "Your event name"}
            </h3>
            <p className="mt-2 line-clamp-3 min-h-[60px] text-sm leading-5 text-[#77746B]">
              {formData.description.trim() ||
                "Your event description will appear here as you fill out the form."}
            </p>

            <div className="mt-5 space-y-3 border-t border-[#E4DED3] pt-4 text-sm">
              <div className="flex items-start gap-3">
                <CalendarDays
                  size={17}
                  className="mt-0.5 shrink-0 text-[#A64B3C]"
                />
                <span className="text-[#77746B]">
                  {formData.date
                    ? new Date(formData.date).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Event date and time"}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={17}
                  className="mt-0.5 shrink-0 text-[#A64B3C]"
                />
                <span className="text-[#77746B]">
                  {[formData.venue.trim(), formData.location.trim()]
                    .filter(Boolean)
                    .join(", ") || "Venue and location"}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <Ticket
                  size={17}
                  className="mt-0.5 shrink-0 text-[#A64B3C]"
                />
                <span className="text-[#77746B]">
                  Regular ₦{formatPrice(formData.regularPrice)} · VIP ₦
                  {formatPrice(formData.vipPrice)}
                </span>
              </div>
            </div>
          </div>

          <p className="px-2 text-xs leading-5 text-[#77746B]">
            Your event and ticket information will be submitted to EventFlow
            when you select Create event.
          </p>
        </aside>
      </div>

      <footer className="border-t border-[#E4DED3] px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-[#77746B] sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold tracking-tight text-[#292820]">
            EventFlow
          </span>
          <span>Good events bring people together.</span>
        </div>
      </footer>
    </main>
  );
}
