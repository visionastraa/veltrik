"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-3">403 Forbidden</h1>
        <p className="text-gray-500 mb-8">
          You do not have the required permissions to access this page. If you believe this is an error, please contact your administrator.
        </p>
        <Link href="/user">
          <Button className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
