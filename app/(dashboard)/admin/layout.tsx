import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full">
      <AdminSidebar />
      <div className="flex-1 w-full min-w-0 p-4 md:p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
        {children}
      </div>
    </div>
  );
}
