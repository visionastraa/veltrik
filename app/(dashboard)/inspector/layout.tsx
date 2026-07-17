import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import InspectorSidebar from "@/components/inspector/InspectorSidebar";
import InspectorHeader from "@/components/inspector/InspectorHeader";

interface InspectorLayoutProps {
  children: React.ReactNode;
}

export default async function InspectorLayout({ children }: InspectorLayoutProps) {
  const session = await auth();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isInspectPage = pathname.startsWith("/inspector/inspect/");

  if (!session || !session.user) {
    redirect("/inspector-login");
  }

  const allowedRoles = isInspectPage ? ["INSPECTOR", "SELLER", "ADMIN", "MANAGER"] : ["INSPECTOR"];
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/inspector-login");
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  const isInspector = session.user.role === "INSPECTOR";

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* Sidebar Nav */}
      {isInspector && <InspectorSidebar />}

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
