import { getSupabaseClient } from "./supabaseClient";

export async function logAdminAction(
  action: string,
  userId: string
) {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from("admin_audit").insert({
    action,
    user_id: userId,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Admin audit log failed:", error);
  }
}
