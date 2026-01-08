import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl border max-w-md mx-auto">
        <h1 className="text-9xl font-bold text-gray-200 mb-4 font-display">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          Whoops! Looks like you took a wrong turn. Let's get you back to saving.
        </p>
        <Link href="/" className="
          inline-block px-6 py-3 rounded-xl font-semibold
          bg-primary text-white shadow-lg shadow-primary/25
          hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5
          transition-all duration-200
        ">
          Return Home
        </Link>
      </div>
    </div>
  );
}
