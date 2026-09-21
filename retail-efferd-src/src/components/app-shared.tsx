import type { ReactNode } from "react"
import {
  ActivityIcon,
  ArrowUpRightIcon,
  ChartNoAxesCombinedIcon,
  CircleDollarSignIcon,
  DatabaseIcon,
  LayoutDashboardIcon,
  LandmarkIcon,
  TrendingUpIcon,
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
    label: "Market research",
    items: [
      { title: "Overview", url: "#overview", icon: <LayoutDashboardIcon />, isActive: true },
      { title: "Risk & Return", url: "#risk", icon: <ChartNoAxesCombinedIcon /> },
      { title: "Regimes", url: "#regimes", icon: <LandmarkIcon /> },
      { title: "DCA", url: "#dca", icon: <CircleDollarSignIcon /> },
      { title: "Benchmark", url: "#benchmark", icon: <TrendingUpIcon /> },
      { title: "Momentum", url: "#momentum", icon: <ActivityIcon /> },
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
  name: "Market Intelligence",
  subtitle: "Risk, regime & allocation research",
  icon: <ChartNoAxesCombinedIcon />,
}

export const sectionLabels: Record<string, string> = {
  overview: "Overview",
  risk: "Risk & Return",
  regimes: "Regimes",
  dca: "DCA",
  benchmark: "Benchmark",
  momentum: "Momentum",
  methodology: "Methodology",
}
