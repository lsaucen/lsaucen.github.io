import type { ReactNode } from "react"
import {
  ActivityIcon,
  ArrowUpRightIcon,
  CalendarDaysIcon,
  CircleDollarSignIcon,
  DatabaseIcon,
  LayoutDashboardIcon,
  RouteIcon,
  TrendingDownIcon,
  UsersIcon,
} from "lucide-react"

export type SidebarNavItem = {
  title: string
  url: string
  icon: ReactNode
  isActive?: boolean
}

export type SidebarNavGroup = {
  label?: string
  items: SidebarNavItem[]
}

export const navGroups: SidebarNavGroup[] = [
  {
    label: "Customer retention",
    items: [
      { title: "Overview", url: "#overview", icon: <LayoutDashboardIcon />, isActive: true },
      { title: "Cohorts", url: "#cohorts", icon: <CalendarDaysIcon /> },
      { title: "Churn", url: "#churn", icon: <TrendingDownIcon /> },
      { title: "Lifecycle", url: "#lifecycle", icon: <RouteIcon /> },
      { title: "Economics", url: "#economics", icon: <CircleDollarSignIcon /> },
      { title: "Segments", url: "#segments", icon: <UsersIcon /> },
    ],
  },
]

export const footerNavLinks: SidebarNavItem[] = [
  { title: "Methodology", url: "#methodology", icon: <DatabaseIcon /> },
  { title: "Main portfolio", url: "https://lsaucen.github.io/", icon: <ArrowUpRightIcon /> },
]

export const navLinks: SidebarNavItem[] = [
  ...navGroups.flatMap((group) => group.items),
  ...footerNavLinks,
]

export const dashboardIdentity = {
  name: "Retention Intelligence",
  subtitle: "Cohort & churn analysis",
  icon: <ActivityIcon />,
}

export const sectionLabels: Record<string, string> = {
  overview: "Overview",
  cohorts: "Cohorts",
  churn: "Churn",
  lifecycle: "Lifecycle",
  economics: "Economics",
  segments: "Segments",
  methodology: "Methodology",
}
