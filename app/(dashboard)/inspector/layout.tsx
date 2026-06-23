import { auth } from "@/auth";
import { redirect } from "next/navigation";
import InspectorSidebar from "@/components/inspector/InspectorSidebar";
import InspectorHeader from "@/components/inspector/InspectorHeader";

interface InspectorLayoutProps {
  children: React.ReactNode;
}

export default async function InspectorLayout({ children }: InspectorLayoutProps) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "INSPECTOR") {
    redirect("/inspector-login");
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* Sidebar Nav */}
      <InspectorSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <InspectorHeader user={user} />

        {/* Dashboard Pages view */}
        <main className="flex-1 overflow-y-auto bg-secondary/10 p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
