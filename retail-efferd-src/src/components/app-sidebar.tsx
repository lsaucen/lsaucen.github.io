"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  dashboardIdentity,
  footerNavLinks,
  navGroups,
} from "@/components/app-shared"
import { useActiveSection } from "@/hooks/use-active-section"

export function AppSidebar() {
  const activeSection = useActiveSection()

  return (
    <Sidebar
      className="*:data-[slot=sidebar-inner]:bg-background"
      collapsible="offcanvas"
      variant="sidebar"
    >
      <SidebarHeader className="h-16 justify-center border-b px-3 py-0">
        <a
          className="flex h-11 items-center gap-3 rounded-lg px-2 transition-colors hover:bg-muted"
          href="#overview"
        >
          <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground [&>svg]:size-4">
            {dashboardIdentity.icon}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{dashboardIdentity.name}</div>
            <div className="truncate text-xs text-muted-foreground">
              {dashboardIdentity.subtitle}
            </div>
          </div>
        </a>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group, index) => (
          <SidebarGroup key={"sidebar-group-" + index}>
            {group.label && (
              <SidebarGroupLabel className="font-normal">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {group.items.map((item) => {
                const sectionId = item.url.replace("#", "")
                const isActive = sectionId === activeSection

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <a href={item.url}>
                        {item.icon}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="gap-0 border-t p-2">
        <div className="mb-2 rounded-lg border bg-muted/35 p-3">
          <p className="text-[11px] font-medium">Portfolio case study</p>
          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
            Synthetic subscription dataset created for cohort, churn, lifecycle and revenue-retention analysis.
          </p>
        </div>
        <SidebarMenu>
          {footerNavLinks.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className="text-muted-foreground"
                isActive={item.url === "#methodology" && activeSection === "methodology"}
                size="sm"
              >
                <a href={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
