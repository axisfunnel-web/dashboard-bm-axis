import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LimitsScreen } from "@/components/LimitsScreen";

export default async function LimitesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <LimitsScreen userEmail={user.email ?? ""} />;
}
