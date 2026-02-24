import Link from "next/link";

export default function HomePage() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">
          Simple Appointment Booking
        </h1>
        <p className="text-gray-600 mb-8">
          Book appointments easily. Manage schedules efficiently.
        </p>

        <Link
          href="/book"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded text-lg hover:bg-blue-700"
        >
          Book an Appointment
        </Link>
      </div>
    </section>
  );
}
