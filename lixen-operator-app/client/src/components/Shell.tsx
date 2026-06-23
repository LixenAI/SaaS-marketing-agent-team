import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useOperator } from "@/lib/operator";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Library,
  Bot,
  Rocket,
  Plug,
  ScrollText,
  LogOut,
  ShieldAlert,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, testid: "link-nav-dashboard" },
  { href: "/agents", label: "Agent Library", icon: Library, testid: "link-nav-agents" },
  { href: "/autopilot", label: "Autopilot Engine", icon: Bot, testid: "link-nav-autopilot" },
  { href: "/workflows", label: "Workflow Launch", icon: Rocket, testid: "link-nav-workflows" },
  { href: "/integrations", label: "Integrations", icon: Plug, testid: "link-nav-integrations" },
  { href: "/audit", label: "Audit Log", icon: ScrollText, testid: "link-nav-audit" },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  const { logout, status } = useOperator();
  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-4 h-16 flex items-center border-b border-sidebar-border">
        <div className="text-white">
          <Logo />
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} data-testid={item.testid}>
              <div
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                  active
                    ? "bg-sidebar-accent text-white font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-3 border-t border-sidebar-border">
        {status?.usingPreviewFallbackToken && (
          <div className="flex items-start gap-2 text-[11px] text-[#60AAFF] bg-white/5 rounded-md px-2.5 py-2 mb-2">
            <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Preview fallback token active. Set OPERATOR_TOKEN in Render.</span>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/80 hover:text-white hover:bg-sidebar-accent/60"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" /> Lock console
        </Button>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4 bg-sidebar text-white border-b border-sidebar-border">
        <Logo />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          data-testid="button-open-menu"
          className="p-2 rounded-md hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 shadow-xl">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-3 z-10 p-1.5 rounded-md text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="md:ml-60 min-w-0">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="sticky top-14 md:top-0 z-20 bg-background/85 backdrop-blur border-b border-border min-h-16 py-3 flex items-center justify-between px-5 md:px-8">
      <div>
        <h1 className="text-lg font-semibold tracking-tight" data-testid="text-page-title">
          {title}
        </h1>
        {subtitle && <p className="text-[13px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
