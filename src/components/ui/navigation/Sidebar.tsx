"use client"

import { siteConfig } from "@/config/site"
import { cx, focusRing } from "@/extra-lib/utils"
import {
  RiHome2Line,
  RiLinkM,
  RiListCheck,
  RiSettings5Line,
  RiStickyNoteAddFill,
  RiColorFilterFill,
} from "@remixicon/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import MobileSidebar from "./MobileSidebar"
import {
  WorkspacesDropdownDesktop,
  WorkspacesDropdownMobile,
} from "./SidebarWorkspacesDropdown"
import { UserProfileDesktop, UserProfileMobile } from "./UserProfile"
import { useScrollDirection } from "@/extra-lib/useScrollDirection"

const navigation = [
  { name: "Overview", href: siteConfig.baseLinks.overview, icon: RiHome2Line },
  { name: "Orders", href: siteConfig.baseLinks.orders, icon: RiListCheck },
  {
    name: "goto Filter Table",
    href: "/filter",
    icon: RiColorFilterFill,
  },
  {
    name: "Settings",
    href: siteConfig.baseLinks.settings.general,
    icon: RiSettings5Line,
  },
] as const

const shortcuts = [
  {
    name: "Add new user",
    href: "/settings/users",
    icon: RiLinkM,
  },
  {
    name: "Workspace usage",
    href: "/settings/billing#billing-overview",
    icon: RiLinkM,
  },
  {
    name: "Cost spend control",
    href: "/settings/billing#cost-spend-control",
    icon: RiLinkM,
  },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const scrollDirection = useScrollDirection()

  const isActive = (itemHref: string) => {
    if (itemHref === siteConfig.baseLinks.settings.general) {
      return pathname.startsWith("/settings")
    }
    return pathname === itemHref || pathname.startsWith(itemHref)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <aside className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <WorkspacesDropdownDesktop />
          <nav
            aria-label="core navigation links"
            className="flex flex-1 flex-col space-y-10"
          >
            <ul role="list" className="space-y-0.5">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cx(
                      isActive(item.href)
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-700 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                      "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition hover:bg-gray-100 hover:dark:bg-gray-900",
                      focusRing,
                    )}
                  >
                    <item.icon className="size-4 shrink-0" aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div>
              <span className="text-xs font-medium leading-6 text-gray-500">
                Shortcuts
              </span>
              <ul aria-label="shortcuts" role="list" className="space-y-0.5">
                {shortcuts.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cx(
                        pathname === item.href || pathname.startsWith(item.href)
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-700 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                        "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition hover:bg-gray-100 hover:dark:bg-gray-900",
                        focusRing,
                      )}
                    >
                      <item.icon
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* CTA button and profile at bottom */}
          <div className="mt-auto space-y-4">
            <Link
              href="/new-order/products"
              className={cx(
                "inline-flex w-full items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:ring-offset-gray-950",
                focusRing,
              )}
            >
              <RiStickyNoteAddFill className="size-4 shrink-0" />
              New Customer Order
            </Link>

            <UserProfileDesktop />
          </div>
        </aside>
      </nav>

      {/* Mobile Bottom Nav with New Order Button */}
      <div
        className={cx(
          "fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-t border-gray-200 bg-white px-4 shadow transition-transform duration-300 lg:hidden dark:border-gray-800 dark:bg-gray-950",
          scrollDirection === "down" ? "translate-y-full" : "translate-y-0"
        )}
      >
        {/* Left: New Order Button */}
        <Link
          href="/new-order/products"
          className={cx(
            "flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:ring-offset-gray-950",
            focusRing
          )}
        >
          <RiStickyNoteAddFill className="size-4 shrink-0" />
          New Order
        </Link>

        {/* Right: User & Menu */}
        <div className="flex items-center gap-2">
          <UserProfileMobile />
          <MobileSidebar />
        </div>
      </div>

    </>
  )
}
