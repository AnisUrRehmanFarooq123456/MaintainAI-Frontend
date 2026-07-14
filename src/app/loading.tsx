export default function Loading() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

        <p className="mt-5 text-lg font-medium text-gray-600">Loading...</p>
      </div>
    </main>
  );
}
