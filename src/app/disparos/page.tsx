import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DispatchScreen } from "@/components/DispatchScreen";

export default async function DisparosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <DispatchScreen userEmail={user.email ?? ""} />;
}
