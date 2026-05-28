import { Link, useLocation } from "@tanstack/react-router"
import { Menu } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import ThemeToggle from "./theme-toggle"

type NavItem = {
  label: string
  path: string
  match: "exact" | "startsWith"
}

const NAV_ITEMS: NavItem[] = [
  { label: "Data Table", path: "/", match: "exact" },
  { label: "Data Table Client", path: "/data-table-client", match: "startsWith" },
  { label: "Data Grid", path: "/data-grid", match: "startsWith" },
  { label: "POS", path: "/pos", match: "startsWith" }
]

export default function Header() {
  const { pathname } = useLocation()

  const isActive = (item: NavItem) => (item.match === "exact" ? pathname === item.path : pathname.startsWith(item.path))

  return (
    <nav className="sticky top-0 z-50 flex w-full flex-col border-border border-b bg-sidebar">
      {/* ── Row 1: Logo + Nav tabs (desktop) + User menu ── */}
      <div className="flex h-12 w-full items-center justify-between">
        {/* Left side: Logo + nav tabs */}
        <div className="flex h-full items-center">
          <Link
            to={NAV_ITEMS[0].path}
            className="flex h-full shrink-0 items-center gap-2 border-border border-r px-4 text-foreground"
          >
            <img src="/table.ico" alt="Logo" className="h-5 w-5" />
          </Link>

          {/* Mobile nav popover */}
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-9 w-9 rounded-md border md:hidden"
                  aria-label="Toggle navigation menu"
                />
              }
            >
              <Menu className="h-4 w-4" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-44 p-1 md:hidden">
              <ul className="flex flex-col">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item)
                  return (
                    <li key={`mobile-${item.path}`}>
                      <Link
                        to={item.path}
                        className={cn(
                          "block rounded-sm px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-accent font-medium text-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </PopoverContent>
          </Popover>

          {/* Desktop nav tabs */}
          <ul className="hidden h-full items-center md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item)
              return (
                <li key={item.path} className="h-full">
                  <Link
                    to={item.path}
                    className={cn(
                      "relative flex h-full items-center px-5 text-sm transition-colors",
                      active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                    {active && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-foreground" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Right side: Theme toggle + GitHub */}
        <div className="flex items-center gap-2 px-4">
          <ThemeToggle />

          <a
            href="https://github.com/zotodev/zoto-data-grid"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className={cn(buttonVariants({ size: "icon", variant: "ghost" }), "h-9 w-9 rounded-md border")}
          >
            <svg viewBox="0 0 128 128" className="h-full w-full" fill="none">
              <g transform="scale(1.2) translate(-10 -10)">
                <path
                  d="M56.7937 84.9688C44.4187 83.4688 35.7 74.5625 35.7 63.0313C35.7 58.3438 37.3875 53.2813 40.2 49.9063C38.9812 46.8125 39.1687 40.25 40.575 37.5313C44.325 37.0625 49.3875 39.0313 52.3875 41.75C55.95 40.625 59.7 40.0625 64.2937 40.0625C68.8875 40.0625 72.6375 40.625 76.0125 41.6563C78.9187 39.0313 84.075 37.0625 87.825 37.5313C89.1375 40.0625 89.325 46.625 88.1062 49.8125C91.1062 53.375 92.7 58.1563 92.7 63.0313C92.7 74.5625 83.9812 83.2813 71.4187 84.875C74.6062 86.9375 76.7625 91.4375 76.7625 96.5938L76.7625 106.344C76.7625 109.156 79.1062 110.75 81.9187 109.625C98.8875 103.156 112.2 86.1875 112.2 65.1875C112.2 38.6563 90.6375 17 64.1062 17C37.575 17 16.2 38.6562 16.2 65.1875C16.2 86 29.4187 103.25 47.2312 109.719C49.7625 110.656 52.2 108.969 52.2 106.438L52.2 98.9375C50.8875 99.5 49.2 99.875 47.7 99.875C41.5125 99.875 37.8562 96.5 35.2312 90.2188C34.2 87.6875 33.075 86.1875 30.9187 85.9063C29.7937 85.8125 29.4187 85.3438 29.4187 84.7813C29.4187 83.6563 31.2937 82.8125 33.1687 82.8125C35.8875 82.8125 38.2312 84.5 40.6687 87.9688C42.5437 90.6875 44.5125 91.9063 46.8562 91.9063C49.2 91.9063 50.7 91.0625 52.8562 88.9063C54.45 87.3125 55.6687 85.9063 56.7937 84.9688Z"
                  fill="currentColor"
                />
              </g>
            </svg>

            <span className="sr-only">Toggle theme</span>
          </a>
        </div>
      </div>
    </nav>
  )
}
