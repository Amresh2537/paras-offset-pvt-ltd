"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard" },
  // Updated to match new job card routes (/dashboard/jobcards and /dashboard/jobcards/new)
  { href: "/dashboard/jobcards", label: "Job Card Management" },
  { href: "/dashboard/fms", label: "FMS" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/users", label: "User Management", admin: true },
];

async function fetchCurrentUser() {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchCurrentUser().then((u) => {
      if (!isMounted) return;
      setUser(u);
      setLoadingUser(false);
      if (!u) {
        router.replace("/");
      }
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/");
    }
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-parasWhite text-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-sm text-slate-500">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-parasWhite text-slate-900 flex flex-col md:flex-row">
      {/* Top bar on mobile */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-parasGray bg-parasWhite">
        <div className="flex items-center gap-2">
          <Image
            src="/paras-logo.png"
            alt="Paras Offset logo"
            width={32}
            height={32}
            className="rounded-md"
          />
          <div>
            <p className="text-xs font-semibold text-parasBlue uppercase tracking-wide">
              Paras Offset Pvt Ltd
            </p>
            <p className="text-[11px] text-slate-600">Operations Dashboard</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md border border-parasGray bg-parasWhite px-2 py-1 text-xs font-medium text-slate-800"
        >
          {sidebarOpen ? "Close" : "Menu"}
        </button>
      </header>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-[61px] z-40 h-[calc(100vh-61px)] w-72 max-w-[85vw] border-r border-parasGray bg-parasBlue/5 px-4 py-6 shadow-xl transition-transform duration-200 md:static md:z-auto md:h-auto md:w-64 md:max-w-none md:translate-x-0 md:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <div className="mb-6 hidden md:flex items-center gap-2">
          <Image
            src="/paras-logo.png"
            alt="Paras Offset logo"
            width={36}
            height={36}
            className="rounded-md bg-parasWhite"
          />
          <div>
            <p className="text-xs font-semibold text-parasBlue uppercase tracking-wide">
              Paras Offset Pvt Ltd
            </p>
            <p className="mt-0.5 text-xs text-slate-700">
              Operations Dashboard
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 text-sm mt-4 md:mt-0">
          {menuItems.map((item) => {
            if (item.admin && user.role !== "admin") return null;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 transition ${
                  isActive
                    ? "bg-parasBlue text-white"
                    : "text-slate-700 hover:bg-parasBlue/10 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 border-t border-parasGray pt-4 text-xs">
          <p className="mb-2 text-slate-600">
            Signed in as{" "}
            <span className="font-medium text-slate-900">{user.name}</span>
          </p>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-red-500/40 bg-red-50 px-3 py-2 text-red-700 text-xs font-medium hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-screen bg-parasWhite md:ml-0">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}

