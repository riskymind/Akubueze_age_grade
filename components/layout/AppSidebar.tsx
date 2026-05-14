"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  CreditCard,
  Bell,
  BarChart2,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Members", href: "/members", icon: Users },
  { label: "Meetings", href: "/meetings", icon: Calendar },
  { label: "Attendance", href: "/attendance", icon: ClipboardCheck },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Announcements", href: "/announcements", icon: Bell },
  { label: "Reports", href: "/reports", icon: BarChart2 },
  { label: "Settings", href: "/settings", icon: Settings },
];

const initials = currentUser.fullName
  .split(" ")
  .slice(0, 2)
  .map((n) => n[0].toUpperCase())
  .join("");

function NavItems({
  collapsed = false,
  onNavClick,
}: {
  collapsed?: boolean;
  onNavClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              collapsed && "justify-center px-2",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function UserArea({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div
      className={cn(
        "border-t border-sidebar-border p-3 flex items-center gap-3 shrink-0",
        collapsed && "justify-center"
      )}
    >
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
      </Avatar>
      {!collapsed && (
        <span className="text-sm font-medium text-sidebar-foreground truncate">
          {currentUser.fullName}
        </span>
      )}
    </div>
  );
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border shrink-0 transition-[width] duration-300 overflow-hidden",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex items-center h-14 border-b border-sidebar-border shrink-0 px-4",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground">Akubueze</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>
        </div>

        <NavItems collapsed={collapsed} />
        <UserArea collapsed={collapsed} />
      </aside>

      {/* Mobile: Sheet drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden fixed top-3 left-3 z-40"
              aria-label="Open navigation"
            />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64 p-0 bg-sidebar gap-0"
          showCloseButton={false}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center h-14 px-4 border-b border-sidebar-border shrink-0">
              <span className="font-semibold text-sidebar-foreground">Akubueze</span>
            </div>
            <NavItems onNavClick={() => setMobileOpen(false)} />
            <UserArea />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
