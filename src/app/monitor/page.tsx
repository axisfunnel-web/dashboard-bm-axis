import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MonitorScreen } from "@/components/MonitorScreen";

export default async function MonitorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <MonitorScreen userEmail={user.email ?? ""} />;
}
