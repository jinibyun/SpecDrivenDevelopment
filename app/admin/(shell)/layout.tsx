import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-10 pt-8.5 pb-15">{children}</main>
    </div>
  );
}
