import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">AI Career Guidance System</h1>
        <p className="text-gray-400">
          Personalized career recommendations powered by AI
        </p>

        <Link
          href="/career"
          className="inline-block px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}
