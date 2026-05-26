import { redirect } from "next/navigation";

/**
 * Root route — redirect to /login.
 * The dashboard layout will redirect authenticated users to /dashboard automatically.
 */
export default function RootPage() {
  redirect("/login");
}
