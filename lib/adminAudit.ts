import { supabase } from "./supabaseClient";

export async function logAdminAction(
  action: string,
  targetId?: string,
  metadata?: any
) {
  const { data } = await supabase.auth.getSession();
  const adminId = data.session?.user.id;

  if (!adminId) return;

  await supabase.from("admin_audit_logs").insert({
    admin_id: adminId,
    action,
    target_id: targetId,
    metadata,
  });
}
