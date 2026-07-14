import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-blue-600">404</h1>

        <h2 className="text-3xl font-semibold mt-4">Page Not Found</h2>

        <p className="text-gray-600 mt-3">
          The page you're looking for doesn't exist.
        </p>

        <Link href="/">
          <button className="primary-btn mt-8">Go Home</button>
        </Link>
      </div>
    </main>
  );
}
