import type { Metadata } from "next";
import { AppSidebar } from "@/components/dashboard/layout/app-sidebar";
import { HeaderNotifications } from "@/components/dashboard/layout/header-notifications";
import { HeaderUser } from "@/components/dashboard/layout/header-user";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Backoffice - Super App Naiera",
  description: "Dashboard internal untuk pengelolaan layanan digital Kabupaten Naiera",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <HeaderNotifications />
            <HeaderUser user={user} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
