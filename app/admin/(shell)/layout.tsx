import { AdminSidebar } from "@/components/admin/sidebar";
import { auth } from "@/lib/auth/server";

// Reads the session on every request; proxy.ts already redirects unauthenticated
// visitors before this ever renders.
export const dynamic = "force-dynamic";

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = await auth.getSession();

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar adminEmail={session?.user?.email ?? ""} />
      <main className="min-w-0 flex-1 px-10 pt-8.5 pb-15">{children}</main>
    </div>
  );
}
