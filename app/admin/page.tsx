"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    verifyAdmin();
  }, []);

  async function verifyAdmin() {
    setLoading(true);

    // 1️⃣ Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    // 2️⃣ Fetch role AFTER session exists
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    // 3️⃣ HARD BLOCK non-admins
    if (error || profile?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    // ✅ Admin confirmed
    setAuthorized(true);
    setLoading(false);
  }

  // ⏳ Prevent premature render
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Verifying admin access...</p>
      </div>
    );
  }

  // 🛑 Extra safety
  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
        <p className="text-green-400 font-semibold">
          ✅ Admin access granted
        </p>

        <p className="text-gray-400 mt-2">
          You can manage users, view all requests, and access analytics here.
        </p>
      </div>
    </main>
  );
}
