"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type HistoryItem = {
  id: number;
  education: string;
  skills: string;
  interest: string;
  ai_response: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"user" | "admin">("user");

  useEffect(() => {
    init();
  }, []);

  // 🔐 Check session → role → history (STRICT ORDER)
  async function init() {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    const userId = session.user.id;

    // 🔑 Fetch role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (!profileError && profile?.role) {
      setRole(profile.role);
    }

    // 📥 Fetch history AFTER auth is confirmed
    await fetchHistory(userId);
    setLoading(false);
  }

  // 📥 Fetch user-specific history (RLS SAFE)
  async function fetchHistory(userId: string) {
    setError(null);

    const { data, error } = await supabase
      .from("user_requests")
      .select("*")
      .eq("user_id", userId) // 🔥 REQUIRED for RLS
      .order("created_at", { ascending: false });

    if (error) {
      //console.error("History fetch error:", error);
      setError("Failed to load history");
      return;
    }

    setHistory(data || []);
  }

  // 🚪 Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      {/* 🔝 Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Career Guidance History
          </h1>

          {/* 🛡 Admin Badge */}
          {role === "admin" && (
            <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded bg-green-700 text-white">
              Admin Access
            </span>
          )}
        </div>

        {/* 🚪 Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
        >
          Logout
        </button>
      </div>

      {loading && (
        <p className="text-center text-gray-400">
          Loading history...
        </p>
      )}

      {error && (
        <p className="text-center text-red-500 font-medium">
          {error}
        </p>
      )}

      {!loading && history.length === 0 && !error && (
        <p className="text-center text-gray-400">
          No career guidance history found.
        </p>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 space-y-4"
          >
            <div className="text-sm text-gray-400">
              {new Date(item.created_at).toLocaleString()}
            </div>

            <div>
              <span className="font-semibold">Education:</span>{" "}
              {item.education}
            </div>

            <div>
              <span className="font-semibold">Skills:</span>{" "}
              {item.skills}
            </div>

            <div>
              <span className="font-semibold">Interest:</span>{" "}
              {item.interest}
            </div>

            <div className="border-t border-zinc-700 pt-4">
              <h3 className="font-semibold mb-2 text-lg">
                AI Recommendation
              </h3>

              <div className="space-y-2 text-gray-300">
                {item.ai_response
                  .split("\n")
                  .filter(Boolean)
                  .map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
