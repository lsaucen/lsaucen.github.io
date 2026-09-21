"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  BadgeCheckIcon,
  CompassIcon,
  FilterIcon,
  GaugeIcon,
  MousePointer2Icon,
  RotateCcwIcon,
  RouteIcon,
  UsersIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type PeriodKey = "30d" | "14d" | "7d"
type ChannelKey = "all" | "Organic" | "Paid Search" | "Direct" | "Referral" | "Email"
type DeviceKey = "all" | "Mobile" | "Desktop" | "Tablet"
type AudienceKey = "all" | "New" | "Returning"
type HeatmapMetric = "sessions" | "conversion" | "engagement"

type DetailState = {
  eyebrow: string
  title: string
  description: string
  metrics: Array<{ label: string; value: string }>
} | null

type ChannelRow = {
  channel: Exclude<ChannelKey, "all">
  sessions: number
  share: number
  engagement: number
  conversion: number
  revenue: number
  cpa: number | null
}

type PageRow = {
  page: string
  title: string
  sessions: number
  engagement: number
  conversion: number
  exitRate: number
  avgTime: number
}

type CampaignRow = {
  campaign: string
  source: string
  sessions: number
  conversions: number
  conversion: number
  cost: number
  revenue: number
}

const trendBase = [
  { day: "Aug 23", sessions: 5.1, users: 3.8 },
  { day: "Aug 25", sessions: 5.4, users: 4.0 },
  { day: "Aug 27", sessions: 5.9, users: 4.2 },
  { day: "Aug 29", sessions: 5.6, users: 4.1 },
  { day: "Aug 31", sessions: 6.0, users: 4.4 },
  { day: "Sep 2", sessions: 6.2, users: 4.5 },
  { day: "Sep 4", sessions: 5.8, users: 4.2 },
  { day: "Sep 6", sessions: 6.4, users: 4.6 },
  { day: "Sep 8", sessions: 6.8, users: 4.8 },
  { day: "Sep 10", sessions: 7.5, users: 5.2 },
  { day: "Sep 12", sessions: 8.0, users: 5.5 },
  { day: "Sep 14", sessions: 7.7, users: 5.3 },
  { day: "Sep 16", sessions: 6.9, users: 4.8 },
  { day: "Sep 18", sessions: 7.2, users: 5.0 },
  { day: "Sep 20", sessions: 7.4, users: 5.1 },
]

const channels: ChannelRow[] = [
  { channel: "Organic", sessions: 70.2, share: 38, engagement: 64.3, conversion: 3.9, revenue: 171.4, cpa: null },
  { channel: "Paid Search", sessions: 44.3, share: 24, engagement: 57.8, conversion: 3.7, revenue: 116.8, cpa: 24.6 },
  { channel: "Direct", sessions: 33.2, share: 18, engagement: 63.2, conversion: 3.3, revenue: 74.1, cpa: null },
  { channel: "Referral", sessions: 22.2, share: 12, engagement: 61.0, conversion: 2.5, revenue: 38.7, cpa: 18.4 },
  { channel: "Email", sessions: 14.8, share: 8, engagement: 66.4, conversion: 4.4, revenue: 27.6, cpa: 9.8 },
]

const channelColors: Record<Exclude<ChannelKey, "all">, string> = {
  Organic: "var(--chart-1)",
  "Paid Search": "var(--chart-2)",
  Direct: "var(--chart-3)",
  Referral: "var(--chart-4)",
  Email: "var(--chart-5)",
}

const weeklyChannel = [
  { week: "W1", total: 40.7, Organic: 15.4, "Paid Search": 10.2, Direct: 7.2, Referral: 4.8, Email: 3.1 },
  { week: "W2", total: 42.8, Organic: 16.2, "Paid Search": 10.6, Direct: 7.8, Referral: 5.0, Email: 3.2 },
  { week: "W3", total: 46.4, Organic: 17.8, "Paid Search": 11.1, Direct: 8.4, Referral: 5.5, Email: 3.6 },
  { week: "W4", total: 54.8, Organic: 20.8, "Paid Search": 12.4, Direct: 9.8, Referral: 6.9, Email: 4.9 },
]

const rankHistory: Record<Exclude<ChannelKey, "all">, number[]> = {
  Organic: [1, 1, 1, 1],
  "Paid Search": [2, 2, 2, 2],
  Direct: [3, 3, 3, 3],
  Referral: [4, 4, 4, 4],
  Email: [5, 5, 5, 4],
}

const funnelBase = [
  { stage: "Landing sessions", value: 184700, rate: 100, fill: "var(--chart-1)" },
  { stage: "Product views", value: 112400, rate: 60.9, fill: "var(--chart-2)" },
  { stage: "Pricing / offer", value: 49300, rate: 26.7, fill: "var(--chart-3)" },
  { stage: "Checkout start", value: 12400, rate: 6.7, fill: "var(--chart-4)" },
  { stage: "Conversions", value: 6317, rate: 3.42, fill: "var(--chart-5)" },
]

const journeyNodes = [
  { id: "landing", label: "Landing", x: 36, y: 74, h: 110 },
  { id: "blog", label: "Blog", x: 36, y: 220, h: 70 },
  { id: "campaign", label: "Campaign", x: 36, y: 324, h: 64 },
  { id: "product", label: "Product", x: 290, y: 94, h: 132 },
  { id: "search", label: "Search", x: 290, y: 270, h: 66 },
  { id: "pricing", label: "Pricing", x: 544, y: 116, h: 118 },
  { id: "exit", label: "Exit", x: 798, y: 264, h: 90 },
  { id: "checkout", label: "Checkout", x: 798, y: 92, h: 108 },
  { id: "conversion", label: "Conversion", x: 1038, y: 104, h: 88 },
]

const journeyLinks = [
  { from: "landing", to: "product", value: 52, color: "var(--chart-1)", fromOffset: 28, toOffset: 34 },
  { from: "blog", to: "product", value: 31, color: "var(--chart-2)", fromOffset: 30, toOffset: 86 },
  { from: "campaign", to: "product", value: 22, color: "var(--chart-3)", fromOffset: 26, toOffset: 112 },
  { from: "landing", to: "search", value: 24, color: "var(--chart-4)", fromOffset: 80, toOffset: 28 },
  { from: "product", to: "pricing", value: 78, color: "var(--chart-1)", fromOffset: 54, toOffset: 54 },
  { from: "search", to: "exit", value: 22, color: "var(--chart-4)", fromOffset: 32, toOffset: 42 },
  { from: "pricing", to: "checkout", value: 39, color: "var(--chart-2)", fromOffset: 46, toOffset: 44 },
  { from: "pricing", to: "exit", value: 27, color: "var(--chart-5)", fromOffset: 86, toOffset: 74 },
  { from: "checkout", to: "conversion", value: 25, color: "var(--chart-3)", fromOffset: 52, toOffset: 42 },
  { from: "checkout", to: "exit", value: 14, color: "var(--chart-5)", fromOffset: 84, toOffset: 20 },
]

const pages: PageRow[] = [
  { page: "/pricing", title: "Pricing", sessions: 28.4, engagement: 69.1, conversion: 5.8, exitRate: 24.1, avgTime: 176 },
  { page: "/product/analytics", title: "Analytics product", sessions: 24.7, engagement: 66.4, conversion: 4.9, exitRate: 28.8, avgTime: 208 },
  { page: "/resources/reporting", title: "Reporting resource", sessions: 19.8, engagement: 63.0, conversion: 2.7, exitRate: 31.5, avgTime: 232 },
  { page: "/case-studies/retail", title: "Retail case study", sessions: 16.2, engagement: 71.8, conversion: 3.9, exitRate: 22.4, avgTime: 264 },
  { page: "/blog/dashboard-design", title: "Dashboard design", sessions: 12.9, engagement: 74.2, conversion: 1.8, exitRate: 36.7, avgTime: 291 },
  { page: "/integrations", title: "Integrations", sessions: 10.7, engagement: 58.6, conversion: 3.2, exitRate: 33.1, avgTime: 148 },
  { page: "/features", title: "Features", sessions: 9.8, engagement: 62.5, conversion: 3.6, exitRate: 29.6, avgTime: 187 },
]

const devices = [
  { device: "Mobile", share: 55, engagement: 58.6, conversion: 2.8, color: "var(--chart-1)" },
  { device: "Desktop", share: 39, engagement: 67.2, conversion: 4.2, color: "var(--chart-2)" },
  { device: "Tablet", share: 6, engagement: 60.1, conversion: 3.1, color: "var(--chart-3)" },
]

const campaigns: CampaignRow[] = [
  { campaign: "Brand Search", source: "Google Ads", sessions: 14.2, conversions: 812, conversion: 5.7, cost: 18.6, revenue: 71.4 },
  { campaign: "Analytics Q3", source: "LinkedIn", sessions: 8.9, conversions: 348, conversion: 3.9, cost: 21.4, revenue: 32.7 },
  { campaign: "Reporting Guide", source: "Email", sessions: 7.4, conversions: 326, conversion: 4.4, cost: 3.2, revenue: 24.6 },
  { campaign: "Retargeting", source: "Display", sessions: 6.8, conversions: 204, conversion: 3.0, cost: 11.8, revenue: 17.9 },
  { campaign: "Partner Launch", source: "Referral", sessions: 5.3, conversions: 164, conversion: 3.1, cost: 5.6, revenue: 14.8 },
]

const heatmapDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const heatmapSlots = ["00–04", "04–08", "08–12", "12–16", "16–20", "20–24"]
const heatmaps: Record<HeatmapMetric, number[][]> = {
  sessions: [
    [18, 24, 62, 88, 94, 51], [17, 27, 68, 91, 97, 56], [15, 26, 72, 96, 100, 61],
    [16, 25, 69, 93, 98, 59], [19, 28, 64, 86, 90, 67], [22, 31, 47, 58, 71, 74], [24, 33, 42, 51, 66, 70],
  ],
  conversion: [
    [22, 28, 41, 63, 72, 38], [20, 29, 46, 68, 76, 42], [18, 26, 49, 71, 79, 45],
    [19, 27, 47, 69, 77, 43], [23, 31, 44, 64, 70, 50], [26, 34, 38, 46, 55, 58], [28, 35, 36, 42, 51, 54],
  ],
  engagement: [
    [36, 42, 59, 72, 78, 66], [34, 45, 63, 75, 81, 69], [33, 44, 66, 78, 85, 72],
    [35, 43, 64, 76, 83, 70], [38, 47, 61, 73, 79, 75], [42, 51, 57, 63, 71, 78], [44, 53, 55, 60, 69, 76],
  ],
}

const trendConfig = {
  sessions: { label: "Sessions", color: "var(--chart-1)" },
  users: { label: "Users", color: "var(--chart-2)" },
} satisfies ChartConfig

const emptyConfig = {} satisfies ChartConfig
const periodFactor: Record<PeriodKey, number> = { "30d": 1, "14d": 0.49, "7d": 0.25 }
const channelFactor: Record<ChannelKey, number> = { all: 1, Organic: 0.38, "Paid Search": 0.24, Direct: 0.18, Referral: 0.12, Email: 0.08 }
const deviceFactor: Record<DeviceKey, number> = { all: 1, Mobile: 0.55, Desktop: 0.39, Tablet: 0.06 }
const audienceFactor: Record<AudienceKey, number> = { all: 1, New: 0.615, Returning: 0.385 }

function compact(value: number) {
  if (value >= 1000) return (value / 1000).toFixed(value >= 100000 ? 1 : 2) + "K"
  return Math.round(value).toLocaleString()
}

function moneyK(value: number) {
  return "$" + value.toFixed(1) + "K"
}

export function Dashboard() {
  const [period, setPeriod] = useState<PeriodKey>("30d")
  const [channel, setChannel] = useState<ChannelKey>("all")
  const [device, setDevice] = useState<DeviceKey>("all")
  const [audience, setAudience] = useState<AudienceKey>("all")
  const [heatmapMetric, setHeatmapMetric] = useState<HeatmapMetric>("sessions")
  const [detail, setDetail] = useState<DetailState>(null)

  const scale = periodFactor[period] * channelFactor[channel] * deviceFactor[device] * audienceFactor[audience]

  const filteredTrend = useMemo(() => {
    const rows = period === "7d" ? trendBase.slice(-4) : period === "14d" ? trendBase.slice(-7) : trendBase
    return rows.map((row) => ({
      ...row,
      sessions: +(row.sessions * channelFactor[channel] * deviceFactor[device] * audienceFactor[audience]).toFixed(2),
      users: +(row.users * channelFactor[channel] * deviceFactor[device] * audienceFactor[audience]).toFixed(2),
    }))
  }, [period, channel, device, audience])

  const visibleChannels = channel === "all" ? channels : channels.filter((row) => row.channel === channel)
  const visiblePages = pages.map((row) => ({
    ...row,
    sessions: +(row.sessions * scale).toFixed(1),
  }))

  const sessions = 184700 * scale
  const users = 126300 * scale
  const returningRate = audience === "Returning" ? 100 : audience === "New" ? 0 : 38.5
  const engagementAdjustment = device === "Desktop" ? 4.6 : device === "Mobile" ? -3.2 : device === "Tablet" ? -1.7 : 0
  const channelConversion = channel === "all" ? 3.42 : channels.find((row) => row.channel === channel)?.conversion ?? 3.42
  const deviceConversion = device === "Desktop" ? 4.2 : device === "Mobile" ? 2.8 : device === "Tablet" ? 3.1 : 3.42
  const conversion = channel === "all" ? deviceConversion : (channelConversion + deviceConversion) / 2
  const conversions = sessions * (conversion / 100)
  const revenue = 428.6 * scale * (conversion / 3.42)
  const engagement = 61.8 + engagementAdjustment

  const funnel = funnelBase.map((row) => ({
    ...row,
    value: Math.round(row.value * scale),
  }))

  function resetFilters() {
    setPeriod("30d")
    setChannel("all")
    setDevice("all")
    setAudience("all")
  }

  function openChannel(row: ChannelRow) {
    setDetail({
      eyebrow: "Acquisition drill-through",
      title: row.channel,
      description: row.conversion >= 3.8
        ? "This channel combines meaningful traffic with above-average conversion quality."
        : "This channel contributes useful volume, but its conversion efficiency trails the strongest acquisition sources.",
      metrics: [
        { label: "Sessions", value: row.sessions.toFixed(1) + "K" },
        { label: "Traffic share", value: row.share + "%" },
        { label: "Engagement", value: row.engagement.toFixed(1) + "%" },
        { label: "Conversion", value: row.conversion.toFixed(1) + "%" },
        { label: "Revenue", value: moneyK(row.revenue) },
        { label: "CPA", value: row.cpa ? "$" + row.cpa.toFixed(2) : "Organic" },
      ],
    })
  }

  function openPage(row: PageRow) {
    setDetail({
      eyebrow: "Content drill-through",
      title: row.page,
      description: row.conversion >= 4
        ? "This page shows strong commercial intent. The next question is which sources and journeys are feeding that behavior."
        : "This page contributes engagement, but conversion is weaker than the strongest commercial pages.",
      metrics: [
        { label: "Sessions", value: row.sessions.toFixed(1) + "K" },
        { label: "Engagement", value: row.engagement.toFixed(1) + "%" },
        { label: "Conversion", value: row.conversion.toFixed(1) + "%" },
        { label: "Exit rate", value: row.exitRate.toFixed(1) + "%" },
        { label: "Avg. time", value: Math.floor(row.avgTime / 60) + "m " + (row.avgTime % 60) + "s" },
      ],
    })
  }

  function openCampaign(row: CampaignRow) {
    setDetail({
      eyebrow: "Campaign drill-through",
      title: row.campaign,
      description: row.revenue / row.cost >= 3
        ? "This campaign is producing efficient commercial return relative to media cost."
        : "This campaign is generating traffic but requires closer review of cost, conversion and landing-page quality.",
      metrics: [
        { label: "Source", value: row.source },
        { label: "Sessions", value: row.sessions.toFixed(1) + "K" },
        { label: "Conversions", value: row.conversions.toLocaleString() },
        { label: "Conversion", value: row.conversion.toFixed(1) + "%" },
        { label: "Cost", value: moneyK(row.cost) },
        { label: "ROAS", value: (row.revenue / row.cost).toFixed(1) + "x" },
      ],
    })
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1380px] flex-col gap-7">
        <section id="overview" className="scroll-mt-20">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <Badge className="mb-3" variant="outline">Digital analytics · synthetic data</Badge>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Acquisition & journey analysis</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Understand where users come from, how they move through the site, where intent drops and which experiences produce conversion.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={period} onValueChange={(value) => setPeriod(value as PeriodKey)}>
                <SelectTrigger className="min-w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="14d">Last 14 days</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                </SelectContent>
              </Select>

              <Select value={channel} onValueChange={(value) => setChannel(value as ChannelKey)}>
                <SelectTrigger className="min-w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  <SelectItem value="Organic">Organic</SelectItem>
                  <SelectItem value="Paid Search">Paid Search</SelectItem>
                  <SelectItem value="Direct">Direct</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                </SelectContent>
              </Select>

              <Select value={device} onValueChange={(value) => setDevice(value as DeviceKey)}>
                <SelectTrigger className="min-w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All devices</SelectItem>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                  <SelectItem value="Desktop">Desktop</SelectItem>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>

              <Select value={audience} onValueChange={(value) => setAudience(value as AudienceKey)}>
                <SelectTrigger className="min-w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  <SelectItem value="New">New users</SelectItem>
                  <SelectItem value="Returning">Returning</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={resetFilters} size="sm" variant="ghost">
                <RotateCcwIcon />
                Reset
              </Button>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border bg-border">
            <div className="grid grid-cols-2 gap-px lg:grid-cols-3 xl:grid-cols-6">
              <MetricCard icon={<MousePointer2Icon />} label="Sessions" value={compact(sessions)} delta={14.2} sublabel="vs prior period" />
              <MetricCard icon={<UsersIcon />} label="Active users" value={compact(users)} delta={9.7} sublabel="unique users" />
              <MetricCard icon={<GaugeIcon />} label="Engagement rate" value={engagement.toFixed(1) + "%"} delta={4.1} sublabel="engaged sessions" />
              <MetricCard icon={<BadgeCheckIcon />} label="Conversion rate" value={conversion.toFixed(2) + "%"} delta={0.38} sublabel="primary conversion" />
              <MetricCard icon={<CompassIcon />} label="Conversions" value={compact(conversions)} delta={12.8} sublabel="completed goals" />
              <MetricCard icon={<RouteIcon />} label="Revenue" value={moneyK(revenue)} delta={11.6} sublabel={returningRate.toFixed(1) + "% returning users"} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Signal title="Mobile owns reach, desktop owns conversion" body="Mobile contributes 55% of sessions but converts 1.4 percentage points below desktop." />
            <Signal title="Pricing is the highest-intent content" body="/pricing combines strong volume with the best conversion rate among high-traffic pages." />
            <Signal title="Largest funnel loss happens before pricing" body="39% of landing sessions never reach a product page, making early journey quality the largest opportunity." />
          </div>
        </section>

        <section id="acquisition" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Acquisition"
            title="How channel position and mix are changing"
            description="Two complementary views: ranking movement over time and the changing composition of total traffic."
          />

          <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Channel rank evolution</CardTitle>
                <CardDescription>Bump chart · rank by weekly session volume</CardDescription>
              </CardHeader>
              <CardContent>
                <BumpChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Acquisition composition</CardTitle>
                <CardDescription>Marimekko · width = weekly traffic, height = channel share</CardDescription>
              </CardHeader>
              <CardContent>
                <MarimekkoChart />
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Channel quality scorecard</CardTitle>
              <CardDescription>Only one table in the dashboard; click a channel for drill-through.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Channel</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Share</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Conversion</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead className="pr-6 text-right">CPA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleChannels.map((row) => (
                    <TableRow className="cursor-pointer" key={row.channel} onClick={() => openChannel(row)}>
                      <TableCell className="pl-6 font-medium">{row.channel}</TableCell>
                      <TableCell>{row.sessions.toFixed(1)}K</TableCell>
                      <TableCell>{row.share}%</TableCell>
                      <TableCell>{row.engagement.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge variant={row.conversion >= 4 ? "secondary" : row.conversion >= 3 ? "outline" : "destructive"}>
                          {row.conversion.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>{moneyK(row.revenue)}</TableCell>
                      <TableCell className="pr-6 text-right">{row.cpa ? "$" + row.cpa.toFixed(2) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        <section id="funnel" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Funnel"
            title="Where intent collapses"
            description="A proportional funnel makes stage loss visible immediately instead of disguising it as a standard bar chart."
          />

          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Conversion funnel</CardTitle>
                <CardDescription>Width is proportional to surviving users.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[360px] w-full" config={emptyConfig}>
                  <FunnelChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Funnel data={funnel} dataKey="value" nameKey="stage" isAnimationActive>
                      <LabelList dataKey="stage" fill="var(--foreground)" position="right" stroke="none" />
                    </Funnel>
                  </FunnelChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Drop-off diagnosis</CardTitle>
                <CardDescription>Ranked by business impact.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dropoff rank="01" title="Landing → Product" value="39.1%" note="Largest absolute loss" />
                <Dropoff rank="02" title="Product → Pricing" value="56.1%" note="Intent not reaching offer" />
                <Dropoff rank="03" title="Pricing → Checkout" value="74.8%" note="Commercial friction" />
                <Dropoff rank="04" title="Checkout → Conversion" value="49.1%" note="Final-step abandonment" />
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="journeys" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Journeys"
            title="How sessions actually flow"
            description="The Sankey-style flow exposes the routes feeding conversion and the routes leaking users to exit."
          />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Journey flow</CardTitle>
              <CardDescription>Ribbon width approximates path volume.</CardDescription>
            </CardHeader>
            <CardContent>
              <JourneySankey />
            </CardContent>
          </Card>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">Behavior heatmap</CardTitle>
                  <CardDescription>Day of week × time of day</CardDescription>
                </div>
                <Select value={heatmapMetric} onValueChange={(value) => setHeatmapMetric(value as HeatmapMetric)}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sessions">Sessions</SelectItem>
                    <SelectItem value="conversion">Conversion</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <Heatmap metric={heatmapMetric} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sessions & active users</CardTitle>
                <CardDescription>Context trend for the selected filters</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[280px] w-full" config={trendConfig}>
                  <AreaChart data={filteredTrend} margin={{ left: 6, right: 12, top: 10 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} />
                    <YAxis axisLine={false} tickLine={false} width={38} tickFormatter={(v) => v + "K"} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Area dataKey="sessions" fill="var(--color-sessions)" fillOpacity={0.14} stroke="var(--color-sessions)" strokeWidth={2.5} type="monotone" />
                    <Area dataKey="users" fill="var(--color-users)" fillOpacity={0.06} stroke="var(--color-users)" strokeWidth={1.8} type="monotone" />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="content" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Content"
            title="Which pages create value"
            description="A quadrant bubble map separates high-attention pages from genuinely high-converting pages."
          />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Content quality quadrants</CardTitle>
              <CardDescription>X = engagement, Y = conversion, bubble size = sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <ChartContainer className="h-[390px] w-full" config={emptyConfig}>
                  <ScatterChart margin={{ left: 12, right: 24, top: 18, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="engagement" name="Engagement" domain={[55, 78]} axisLine={false} tickLine={false} tickFormatter={(v) => v + "%"} />
                    <YAxis type="number" dataKey="conversion" name="Conversion" domain={[1, 6.5]} axisLine={false} tickLine={false} tickFormatter={(v) => v + "%"} />
                    <ZAxis type="number" dataKey="sessions" range={[100, 420]} />
                    <ReferenceLine x={65} stroke="var(--muted-foreground)" strokeDasharray="5 5" />
                    <ReferenceLine y={3.5} stroke="var(--muted-foreground)" strokeDasharray="5 5" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Scatter data={visiblePages} fill="var(--chart-1)" name="Pages" />
                  </ScatterChart>
                </ChartContainer>
                <div className="pointer-events-none absolute inset-x-10 top-3 flex justify-between text-[10px] font-medium text-muted-foreground">
                  <span>High conversion / low engagement</span>
                  <span>High-value content</span>
                </div>
                <div className="pointer-events-none absolute inset-x-10 bottom-3 flex justify-between text-[10px] font-medium text-muted-foreground">
                  <span>Needs work</span>
                  <span>Engaging but under-converting</span>
                </div>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                {visiblePages.slice(0, 4).map((row) => (
                  <button className="rounded-lg border p-3 text-left transition-colors hover:bg-muted/50" key={row.page} onClick={() => openPage(row)}>
                    <div className="text-xs font-medium">{row.title}</div>
                    <div className="mt-1 font-mono text-[10px] text-muted-foreground">{row.page}</div>
                    <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
                      <span>{row.engagement.toFixed(1)}% engaged</span>
                      <span>{row.conversion.toFixed(1)}% conv.</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="devices" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Devices & campaigns"
            title="Context changes the quality of traffic"
            description="A waffle shows the device footprint at a glance; the campaign bubble plot adds media efficiency and conversion scale."
          />

          <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Device footprint</CardTitle>
                <CardDescription>Waffle chart · each square ≈ 1% of sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <WaffleChart />
                <div className="mt-5 space-y-2">
                  {devices.map((row) => (
                    <button
                      className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
                      key={row.device}
                      onClick={() => setDetail({
                        eyebrow: "Device drill-through",
                        title: row.device,
                        description: row.device === "Mobile"
                          ? "Mobile supplies the most traffic but underperforms desktop on conversion, suggesting friction after intent is established."
                          : "This device segment shows a distinct balance between reach, engagement and conversion.",
                        metrics: [
                          { label: "Traffic share", value: row.share + "%" },
                          { label: "Engagement", value: row.engagement.toFixed(1) + "%" },
                          { label: "Conversion", value: row.conversion.toFixed(1) + "%" },
                        ],
                      })}
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <span className="size-2.5 rounded-sm" style={{ backgroundColor: row.color }} />
                        {row.device}
                      </span>
                      <span className="text-muted-foreground">{row.share}% share · {row.conversion.toFixed(1)}% conv.</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Campaign efficiency map</CardTitle>
                <CardDescription>X = spend, Y = ROAS, bubble size = conversions</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[350px] w-full" config={emptyConfig}>
                  <ScatterChart margin={{ left: 10, right: 24, top: 16, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="cost" name="Spend" domain={[0, 24]} axisLine={false} tickLine={false} tickFormatter={(v) => "$" + v + "K"} />
                    <YAxis type="number" dataKey="roas" name="ROAS" domain={[1, 9]} axisLine={false} tickLine={false} tickFormatter={(v) => v + "x"} />
                    <ZAxis type="number" dataKey="conversions" range={[110, 520]} />
                    <ReferenceLine y={3} stroke="var(--chart-4)" strokeDasharray="5 5" label={{ value: "3x efficiency floor", fill: "var(--muted-foreground)", fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Scatter
                      data={campaigns.map((row) => ({ ...row, roas: +(row.revenue / row.cost).toFixed(2) }))}
                      fill="var(--chart-2)"
                      name="Campaigns"
                    />
                  </ScatterChart>
                </ChartContainer>

                <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {campaigns.slice(0, 3).map((row) => (
                    <button className="rounded-lg border p-3 text-left transition-colors hover:bg-muted/50" key={row.campaign} onClick={() => openCampaign(row)}>
                      <div className="text-xs font-medium">{row.campaign}</div>
                      <div className="mt-1 text-[10px] text-muted-foreground">{row.source}</div>
                      <div className="mt-3 text-sm font-semibold">{(row.revenue / row.cost).toFixed(1)}x ROAS</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="methodology" className="scroll-mt-20 rounded-xl border bg-muted/25 p-5">
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background">
              <FilterIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-medium">Portfolio methodology</h2>
              <p className="mt-1 max-w-4xl text-xs leading-5 text-muted-foreground">
                All values are synthetic. The project demonstrates acquisition analysis, funnel diagnosis, journey flow,
                behavioral heatmaps, content quadrants, device composition, campaign economics and drill-through without exposing production analytics data.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Sheet open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="border-b">
            <Badge className="mb-2 w-fit" variant="outline">{detail?.eyebrow}</Badge>
            <SheetTitle className="text-xl">{detail?.title}</SheetTitle>
            <SheetDescription>{detail?.description}</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3 px-4">
            {detail?.metrics.map((metric) => (
              <div className="rounded-lg border bg-muted/25 p-3" key={metric.label}>
                <div className="text-[11px] text-muted-foreground">{metric.label}</div>
                <div className="mt-1 text-base font-semibold tabular-nums">{metric.value}</div>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4">
            <h3 className="text-sm font-medium">Next analytical question</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Drill-through preserves the selected context and exposes the next layer of behavior instead of repeating the same KPI.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{eyebrow}</div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function MetricCard({ icon, label, value, delta, sublabel }: { icon: ReactNode; label: string; value: string; delta: number; sublabel: string }) {
  const positive = delta >= 0
  return (
    <div className="min-h-32 bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="grid size-7 place-items-center rounded-md border bg-muted/25 text-muted-foreground [&>svg]:size-3.5">{icon}</div>
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="mt-2 flex items-center gap-1 text-[11px]">
        <span className={positive ? "text-emerald-600" : "text-rose-600"}>
          {positive ? <ArrowUpRightIcon className="inline size-3" /> : <ArrowDownRightIcon className="inline size-3" />}
          {Math.abs(delta).toFixed(delta < 1 ? 2 : 1)}%
        </span>
        <span className="text-muted-foreground">{sublabel}</span>
      </div>
    </div>
  )
}

function Signal({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="text-xs font-medium">{title}</div>
      <div className="mt-1 text-[11px] leading-4 text-muted-foreground">{body}</div>
    </div>
  )
}

function Dropoff({ rank, title, value, note }: { rank: string; title: string; value: string; note: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="grid size-8 place-items-center rounded-md bg-muted text-xs font-semibold">{rank}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium">{title}</div>
        <div className="text-[11px] text-muted-foreground">{note}</div>
      </div>
      <div className="text-sm font-semibold text-rose-500">{value}</div>
    </div>
  )
}

function BumpChart() {
  const weeks = ["W1", "W2", "W3", "W4"]
  const x = [70, 255, 440, 625]
  const yForRank = (rank: number) => 36 + (rank - 1) * 48

  return (
    <div className="h-[300px] w-full">
      <svg className="h-full w-full" viewBox="0 0 700 280" role="img" aria-label="Channel rank bump chart">
        {weeks.map((week, index) => (
          <g key={week}>
            <line x1={x[index]} x2={x[index]} y1="28" y2="238" stroke="var(--border)" />
            <text x={x[index]} y="264" textAnchor="middle" fill="var(--muted-foreground)" fontSize="11">{week}</text>
          </g>
        ))}

        {Object.entries(rankHistory).map(([channelName, ranks]) => {
          const channel = channelName as Exclude<ChannelKey, "all">
          const points = ranks.map((rank, index) => x[index] + "," + yForRank(rank)).join(" ")
          return (
            <g key={channel}>
              <polyline
                points={points}
                fill="none"
                stroke={channelColors[channel]}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {ranks.map((rank, index) => (
                <circle key={index} cx={x[index]} cy={yForRank(rank)} r="6" fill={channelColors[channel]} stroke="var(--background)" strokeWidth="2" />
              ))}
              <text x="10" y={yForRank(ranks[0]) + 4} fill={channelColors[channel]} fontSize="11" fontWeight="600">{channel}</text>
              <text x="652" y={yForRank(ranks[ranks.length - 1]) + 4} fill={channelColors[channel]} fontSize="11" fontWeight="700">#{ranks[ranks.length - 1]}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function MarimekkoChart() {
  const maxTotal = Math.max(...weeklyChannel.map((row) => row.total))
  const channelOrder: Array<Exclude<ChannelKey, "all">> = ["Organic", "Paid Search", "Direct", "Referral", "Email"]

  return (
    <div>
      <div className="flex h-[250px] items-end gap-2 rounded-lg border bg-muted/10 p-3">
        {weeklyChannel.map((row) => (
          <div
            className="flex h-full flex-col justify-end"
            key={row.week}
            style={{ width: (row.total / maxTotal) * 25 + "%" }}
          >
            <div className="flex h-[210px] flex-col-reverse overflow-hidden rounded-md border bg-background">
              {channelOrder.map((channel) => {
                const value = row[channel] as number
                return (
                  <div
                    key={channel}
                    style={{
                      height: (value / row.total) * 100 + "%",
                      backgroundColor: channelColors[channel],
                    }}
                    title={channel + ": " + value.toFixed(1) + "K"}
                  />
                )
              })}
            </div>
            <div className="mt-2 text-center text-[10px] text-muted-foreground">
              {row.week}<br /><span className="font-medium text-foreground">{row.total.toFixed(1)}K</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {channelOrder.map((channel) => (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground" key={channel}>
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: channelColors[channel] }} />
            {channel}
          </div>
        ))}
      </div>
    </div>
  )
}

function JourneySankey() {
  const byId = Object.fromEntries(journeyNodes.map((node) => [node.id, node]))

  return (
    <div className="overflow-x-auto">
      <svg className="min-w-[1050px] w-full" viewBox="0 0 1160 430" role="img" aria-label="User journey Sankey diagram">
        {journeyLinks.map((link, index) => {
          const from = byId[link.from]
          const to = byId[link.to]
          const x1 = from.x + 22
          const y1 = from.y + link.fromOffset
          const x2 = to.x
          const y2 = to.y + link.toOffset
          const width = Math.max(5, link.value * 0.45)
          return (
            <path
              d={"M " + x1 + " " + y1 + " C " + (x1 + 90) + " " + y1 + ", " + (x2 - 90) + " " + y2 + ", " + x2 + " " + y2}
              fill="none"
              key={index}
              opacity="0.3"
              stroke={link.color}
              strokeLinecap="round"
              strokeWidth={width}
            />
          )
        })}

        {journeyNodes.map((node) => (
          <g key={node.id}>
            <rect x={node.x} y={node.y} width="22" height={node.h} rx="6" fill="var(--foreground)" opacity="0.9" />
            <text x={node.x + 32} y={node.y + 18} fill="var(--foreground)" fontSize="12" fontWeight="600">{node.label}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function Heatmap({ metric }: { metric: HeatmapMetric }) {
  const values = heatmaps[metric]
  const label = metric === "sessions" ? "activity index" : metric === "conversion" ? "conversion index" : "engagement index"

  return (
    <>
      <div className="grid grid-cols-[44px_repeat(6,minmax(0,1fr))] gap-1 text-[10px]">
        <div />
        {heatmapSlots.map((slot) => <div className="pb-1 text-center text-muted-foreground" key={slot}>{slot}</div>)}
        {heatmapDays.map((day, rowIndex) => (
          <div className="contents" key={day}>
            <div className="flex items-center text-muted-foreground">{day}</div>
            {values[rowIndex].map((value, colIndex) => (
              <div
                className="h-9 rounded-sm border"
                key={day + colIndex}
                style={{ backgroundColor: "color-mix(in oklab, var(--primary) " + Math.max(10, value) + "%, transparent)" }}
                title={day + " " + heatmapSlots[colIndex] + ": " + value + " " + label}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Lower {metric}</span>
        <div className="h-2 w-32 rounded-full bg-gradient-to-r from-primary/10 to-primary" />
        <span>Higher {metric}</span>
      </div>
    </>
  )
}

function WaffleChart() {
  const cells = Array.from({ length: 100 }, (_, index) => {
    if (index < 55) return devices[0]
    if (index < 94) return devices[1]
    return devices[2]
  })

  return (
    <div className="mx-auto grid max-w-[320px] grid-cols-10 gap-1.5">
      {cells.map((device, index) => (
        <div
          className="aspect-square rounded-[3px]"
          key={index}
          style={{ backgroundColor: device.color }}
          title={device.device}
        />
      ))}
    </div>
  )
}
