import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ErrorsScreen } from "@/components/ErrorsScreen";

export default async function ErrosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <ErrorsScreen userEmail={user.email ?? ""} />;
}
