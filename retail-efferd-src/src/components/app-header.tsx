"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AppBreadcrumbs } from "@/components/app-breadcrumbs"
import { navLinks } from "@/components/app-shared"
import { useActiveSection } from "@/hooks/use-active-section"
import { ArrowUpRightIcon } from "lucide-react"

export function AppHeader() {
  const activeSection = useActiveSection()
  const activeItem =
    navLinks.find((item) => item.url === "#" + activeSection) ??
    navLinks.find((item) => item.url === "#overview")

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Separator
          className="mr-2 data-[orientation=vertical]:h-4 md:hidden"
          orientation="vertical"
        />
        <AppBreadcrumbs page={activeItem} />
      </div>
      <div className="flex items-center gap-2">
        <Badge className="hidden sm:inline-flex" variant="outline">
          Synthetic portfolio data
        </Badge>
        <Button asChild size="sm" variant="outline">
          <a href="https://lsaucen.github.io/">
            Portfolio
            <ArrowUpRightIcon />
          </a>
        </Button>
      </div>
    </header>
  )
}
