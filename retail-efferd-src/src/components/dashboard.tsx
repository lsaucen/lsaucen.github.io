"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
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
  { day: "Aug 23", sessions: 5.1, users: 3.8, conversions: 166 },
  { day: "Aug 25", sessions: 5.4, users: 4.0, conversions: 171 },
  { day: "Aug 27", sessions: 5.9, users: 4.2, conversions: 182 },
  { day: "Aug 29", sessions: 5.6, users: 4.1, conversions: 176 },
  { day: "Aug 31", sessions: 6.0, users: 4.4, conversions: 187 },
  { day: "Sep 2", sessions: 6.2, users: 4.5, conversions: 193 },
  { day: "Sep 4", sessions: 5.8, users: 4.2, conversions: 181 },
  { day: "Sep 6", sessions: 6.4, users: 4.6, conversions: 202 },
  { day: "Sep 8", sessions: 6.8, users: 4.8, conversions: 214 },
  { day: "Sep 10", sessions: 7.5, users: 5.2, conversions: 242 },
  { day: "Sep 12", sessions: 8.0, users: 5.5, conversions: 267 },
  { day: "Sep 14", sessions: 7.7, users: 5.3, conversions: 258 },
  { day: "Sep 16", sessions: 6.9, users: 4.8, conversions: 229 },
  { day: "Sep 18", sessions: 7.2, users: 5.0, conversions: 244 },
  { day: "Sep 20", sessions: 7.4, users: 5.1, conversions: 252 },
]

const channels: ChannelRow[] = [
  { channel: "Organic", sessions: 70.2, share: 38, engagement: 64.3, conversion: 3.9, revenue: 171.4, cpa: null },
  { channel: "Paid Search", sessions: 44.3, share: 24, engagement: 57.8, conversion: 3.7, revenue: 116.8, cpa: 24.6 },
  { channel: "Direct", sessions: 33.2, share: 18, engagement: 63.2, conversion: 3.3, revenue: 74.1, cpa: null },
  { channel: "Referral", sessions: 22.2, share: 12, engagement: 61.0, conversion: 2.5, revenue: 38.7, cpa: 18.4 },
  { channel: "Email", sessions: 14.8, share: 8, engagement: 66.4, conversion: 4.4, revenue: 27.6, cpa: 9.8 },
]

const channelTrend = [
  { week: "W1", organic: 15.4, paidSearch: 10.2, direct: 7.2, referral: 4.8, email: 3.1 },
  { week: "W2", organic: 16.2, paidSearch: 10.6, direct: 7.8, referral: 5.0, email: 3.2 },
  { week: "W3", organic: 17.8, paidSearch: 11.1, direct: 8.4, referral: 5.5, email: 3.6 },
  { week: "W4", organic: 20.8, paidSearch: 12.4, direct: 9.8, referral: 6.9, email: 4.9 },
]

const funnelBase = [
  { stage: "Landing sessions", value: 184700, rate: 100 },
  { stage: "Product views", value: 112400, rate: 60.9 },
  { stage: "Pricing / offer", value: 49300, rate: 26.7 },
  { stage: "Checkout start", value: 12400, rate: 6.7 },
  { stage: "Conversions", value: 6317, rate: 3.42 },
]

const journeyRows = [
  { path: ["Landing", "Product", "Pricing", "Checkout"], share: 24.6, conversion: 7.8 },
  { path: ["Blog", "Product", "Pricing", "Checkout"], share: 18.3, conversion: 5.9 },
  { path: ["Landing", "Search", "Product", "Exit"], share: 15.7, conversion: 0.0 },
  { path: ["Campaign", "Landing", "Product", "Checkout"], share: 11.8, conversion: 8.6 },
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
  { device: "Mobile", sessions: 101.6, share: 55, engagement: 58.6, conversion: 2.8, fill: "var(--chart-1)" },
  { device: "Desktop", sessions: 72.0, share: 39, engagement: 67.2, conversion: 4.2, fill: "var(--chart-2)" },
  { device: "Tablet", sessions: 11.1, share: 6, engagement: 60.1, conversion: 3.1, fill: "var(--chart-3)" },
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
const heatmap = [
  [18, 24, 62, 88, 94, 51],
  [17, 27, 68, 91, 97, 56],
  [15, 26, 72, 96, 100, 61],
  [16, 25, 69, 93, 98, 59],
  [19, 28, 64, 86, 90, 67],
  [22, 31, 47, 58, 71, 74],
  [24, 33, 42, 51, 66, 70],
]

const trendConfig = {
  sessions: { label: "Sessions", color: "var(--chart-1)" },
  users: { label: "Users", color: "var(--chart-2)" },
} satisfies ChartConfig

const channelConfig = {
  organic: { label: "Organic", color: "var(--chart-1)" },
  paidSearch: { label: "Paid Search", color: "var(--chart-2)" },
  direct: { label: "Direct", color: "var(--chart-3)" },
  referral: { label: "Referral", color: "var(--chart-4)" },
  email: { label: "Email", color: "var(--chart-5)" },
} satisfies ChartConfig

const emptyConfig = {} satisfies ChartConfig

const periodFactor: Record<PeriodKey, number> = { "30d": 1, "14d": 0.49, "7d": 0.25 }
const channelFactor: Record<ChannelKey, number> = {
  all: 1,
  Organic: 0.38,
  "Paid Search": 0.24,
  Direct: 0.18,
  Referral: 0.12,
  Email: 0.08,
}
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
  const [detail, setDetail] = useState<DetailState>(null)

  const scale = periodFactor[period] * channelFactor[channel] * deviceFactor[device] * audienceFactor[audience]

  const filteredTrend = useMemo(() => {
    const rows = period === "7d" ? trendBase.slice(-4) : period === "14d" ? trendBase.slice(-7) : trendBase
    return rows.map((row) => ({
      ...row,
      sessions: +(row.sessions * channelFactor[channel] * deviceFactor[device] * audienceFactor[audience]).toFixed(2),
      users: +(row.users * channelFactor[channel] * deviceFactor[device] * audienceFactor[audience]).toFixed(2),
      conversions: Math.round(row.conversions * channelFactor[channel] * deviceFactor[device] * audienceFactor[audience]),
    }))
  }, [period, channel, device, audience])

  const visibleChannels = channel === "all" ? channels : channels.filter((row) => row.channel === channel)
  const visibleDevices = device === "all" ? devices : devices.filter((row) => row.device === device)
  const visiblePages = pages.map((row) => ({
    ...row,
    sessions: +(row.sessions * periodFactor[period] * channelFactor[channel] * deviceFactor[device] * audienceFactor[audience]).toFixed(1),
  }))

  const sessions = 184700 * scale
  const users = 126300 * scale
  const returningRate = audience === "Returning" ? 100 : audience === "New" ? 0 : 38.5
  const engagementAdjustment = device === "Desktop" ? 4.6 : device === "Mobile" ? -3.2 : device === "Tablet" ? -1.7 : 0
  const channelConversion =
    channel === "all" ? 3.42 :
    channels.find((row) => row.channel === channel)?.conversion ?? 3.42
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
      description:
        row.conversion >= 3.8
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
      description:
        row.conversion >= 4
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
      description:
        row.revenue / row.cost >= 3
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
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Acquisition & journey analysis
              </h1>
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
            <Signal
              title="Mobile owns reach, desktop owns conversion"
              body="Mobile contributes 55% of sessions but converts 1.4 percentage points below desktop."
            />
            <Signal
              title="Pricing is the highest-intent content"
              body="/pricing combines strong volume with the best conversion rate among high-traffic pages."
            />
            <Signal
              title="Largest funnel loss happens before pricing"
              body="39% of landing sessions never reach a product page, making early journey quality the largest opportunity."
            />
          </div>
        </section>

        <section id="acquisition" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Acquisition"
            title="Traffic quality by source"
            description="Traffic volume alone is not enough. This view compares growth, audience quality and downstream conversion."
          />

          <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sessions and active users</CardTitle>
                <CardDescription>Traffic trend in thousands</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[330px] w-full" config={trendConfig}>
                  <AreaChart data={filteredTrend} margin={{ left: 8, right: 14, top: 10 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} />
                    <YAxis axisLine={false} tickLine={false} width={42} tickFormatter={(v) => v + "K"} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Area dataKey="sessions" fill="var(--color-sessions)" fillOpacity={0.14} stroke="var(--color-sessions)" strokeWidth={2.5} type="monotone" />
                    <Line dataKey="users" dot={false} stroke="var(--color-users)" strokeWidth={2} type="monotone" />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Acquisition mix</CardTitle>
                <CardDescription>Weekly channel contribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[330px] w-full" config={channelConfig}>
                  <BarChart data={channelTrend}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="organic" stackId="a" fill="var(--color-organic)" />
                    <Bar dataKey="paidSearch" stackId="a" fill="var(--color-paidSearch)" />
                    <Bar dataKey="direct" stackId="a" fill="var(--color-direct)" />
                    <Bar dataKey="referral" stackId="a" fill="var(--color-referral)" />
                    <Bar dataKey="email" stackId="a" fill="var(--color-email)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Channel quality scorecard</CardTitle>
              <CardDescription>Click a channel for drill-through.</CardDescription>
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
            title="Where intent drops"
            description="Each stage shows the share of landing sessions that survive to the next commercial step."
          />

          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversion funnel</CardTitle>
                <CardDescription>Filtered journey from landing session to conversion.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {funnel.map((stage, index) => {
                  const previous = index === 0 ? stage.value : funnel[index - 1].value
                  const stageConversion = previous ? (stage.value / previous) * 100 : 0
                  return (
                    <div className="grid grid-cols-[150px_1fr_90px] items-center gap-4" key={stage.stage}>
                      <div>
                        <div className="text-sm font-medium">{stage.stage}</div>
                        <div className="text-xs text-muted-foreground">{compact(stage.value)}</div>
                      </div>
                      <div className="h-10 overflow-hidden rounded-md border bg-muted/30">
                        <div
                          className="flex h-full items-center rounded-md bg-primary/85 px-3 text-xs font-medium text-primary-foreground transition-all"
                          style={{ width: Math.max(5, stage.rate) + "%" }}
                        >
                          {stage.rate.toFixed(stage.rate < 10 ? 2 : 1)}%
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="font-medium">{index === 0 ? "Entry" : stageConversion.toFixed(1) + "%"}</div>
                        <div className="text-muted-foreground">stage rate</div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Drop-off diagnosis</CardTitle>
                <CardDescription>Largest losses in the journey.</CardDescription>
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
            title="How users move through the experience"
            description="High-frequency paths reveal which sequences generate intent and which patterns end in exits."
          />

          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top navigation paths</CardTitle>
                <CardDescription>Share of observed sessions and conversion by path.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {journeyRows.map((row, index) => (
                  <div className="rounded-lg border p-4" key={row.path.join("-")}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-xs font-medium text-muted-foreground">Path {index + 1}</div>
                      <div className="flex gap-4 text-xs">
                        <span><strong>{row.share}%</strong> sessions</span>
                        <span><strong>{row.conversion}%</strong> conv.</span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {row.path.map((step, stepIndex) => (
                        <div className="flex items-center gap-2" key={step + stepIndex}>
                          <span className={"rounded-md border px-3 py-2 text-xs " + (step === "Exit" ? "border-destructive/30 bg-destructive/10 text-destructive" : "bg-muted/35")}>
                            {step}
                          </span>
                          {stepIndex < row.path.length - 1 && <ArrowUpRightIcon className="size-3.5 rotate-45 text-muted-foreground" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Traffic intensity heatmap</CardTitle>
                <CardDescription>Day of week × time of day.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-[44px_repeat(6,minmax(0,1fr))] gap-1 text-[10px]">
                  <div />
                  {heatmapSlots.map((slot) => <div className="pb-1 text-center text-muted-foreground" key={slot}>{slot}</div>)}
                  {heatmapDays.map((day, rowIndex) => (
                    <>
                      <div className="flex items-center text-muted-foreground" key={day + "-label"}>{day}</div>
                      {heatmap[rowIndex].map((value, colIndex) => (
                        <div
                          className="group relative h-9 rounded-sm border"
                          key={day + colIndex}
                          style={{
                            backgroundColor: "color-mix(in oklab, var(--primary) " + Math.max(10, value) + "%, transparent)",
                          }}
                          title={day + " " + heatmapSlots[colIndex] + ": " + value + " index"}
                        />
                      ))}
                    </>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Lower activity</span>
                  <div className="h-2 w-32 rounded-full bg-gradient-to-r from-primary/10 to-primary" />
                  <span>Higher activity</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="content" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Content"
            title="Engagement vs conversion"
            description="A page can be popular without being commercially useful. This view separates attention from outcome."
          />

          <div className="grid gap-4 xl:grid-cols-[1fr_1.35fr]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Page quality map</CardTitle>
                <CardDescription>X = engagement, Y = conversion, bubble = sessions.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[320px] w-full" config={emptyConfig}>
                  <ScatterChart margin={{ left: 8, right: 18, top: 8, bottom: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="engagement"
                      name="Engagement"
                      domain={[55, 78]}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => v + "%"}
                    />
                    <YAxis
                      type="number"
                      dataKey="conversion"
                      name="Conversion"
                      domain={[1, 6.5]}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => v + "%"}
                    />
                    <ZAxis type="number" dataKey="sessions" range={[90, 360]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Scatter data={visiblePages} fill="var(--chart-1)" name="Pages" />
                  </ScatterChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top content</CardTitle>
                <CardDescription>Click a row for page-level drill-through.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Page</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Conversion</TableHead>
                      <TableHead>Exit</TableHead>
                      <TableHead className="pr-6 text-right">Avg. time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visiblePages.map((row) => (
                      <TableRow className="cursor-pointer" key={row.page} onClick={() => openPage(row)}>
                        <TableCell className="pl-6">
                          <div className="font-medium">{row.title}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{row.page}</div>
                        </TableCell>
                        <TableCell>{row.sessions.toFixed(1)}K</TableCell>
                        <TableCell>{row.engagement.toFixed(1)}%</TableCell>
                        <TableCell>{row.conversion.toFixed(1)}%</TableCell>
                        <TableCell>{row.exitRate.toFixed(1)}%</TableCell>
                        <TableCell className="pr-6 text-right">{Math.floor(row.avgTime / 60)}m {row.avgTime % 60}s</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="devices" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Devices & campaigns"
            title="Experience quality by context"
            description="Device behavior exposes UX friction; campaign economics show whether acquired traffic is worth the cost."
          />

          <div className="grid gap-4 xl:grid-cols-[0.8fr_1.4fr]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Device mix</CardTitle>
                <CardDescription>Session share by device.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[290px] w-full" config={emptyConfig}>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="device" />} />
                    <Pie data={visibleDevices} dataKey="sessions" nameKey="device" innerRadius={58} outerRadius={96} paddingAngle={3}>
                      {visibleDevices.map((row) => <Cell fill={row.fill} key={row.device} />)}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ChartContainer>
                <div className="mt-2 space-y-2">
                  {visibleDevices.map((row) => (
                    <button
                      className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
                      key={row.device}
                      onClick={() => setDetail({
                        eyebrow: "Device drill-through",
                        title: row.device,
                        description: row.device === "Mobile" ? "Mobile supplies the most traffic but underperforms desktop on conversion, suggesting friction after intent is established." : "This device segment shows a distinct balance between reach, engagement and conversion.",
                        metrics: [
                          { label: "Sessions", value: row.sessions.toFixed(1) + "K" },
                          { label: "Share", value: row.share + "%" },
                          { label: "Engagement", value: row.engagement.toFixed(1) + "%" },
                          { label: "Conversion", value: row.conversion.toFixed(1) + "%" },
                        ],
                      })}
                    >
                      <span className="font-medium">{row.device}</span>
                      <span className="text-muted-foreground">{row.engagement.toFixed(1)}% engaged · {row.conversion.toFixed(1)}% conv.</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Campaign economics</CardTitle>
                <CardDescription>Paid and owned campaign quality, including ROAS.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Campaign</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Conversions</TableHead>
                      <TableHead>CVR</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead className="pr-6 text-right">ROAS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((row) => (
                      <TableRow className="cursor-pointer" key={row.campaign} onClick={() => openCampaign(row)}>
                        <TableCell className="pl-6 font-medium">{row.campaign}</TableCell>
                        <TableCell>{row.source}</TableCell>
                        <TableCell>{row.sessions.toFixed(1)}K</TableCell>
                        <TableCell>{row.conversions.toLocaleString()}</TableCell>
                        <TableCell>{row.conversion.toFixed(1)}%</TableCell>
                        <TableCell>{moneyK(row.cost)}</TableCell>
                        <TableCell className="pr-6 text-right">
                          <Badge variant={row.revenue / row.cost >= 3 ? "secondary" : "outline"}>
                            {(row.revenue / row.cost).toFixed(1)}x
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                All values are synthetic. The project demonstrates acquisition analysis, funnel diagnosis, journey exploration,
                behavioral segmentation, content quality, filter context and drill-through without exposing production analytics data.
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
              A useful drill-through should preserve the selected context and expose the next layer of behavior, not simply repeat the same KPI.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{eyebrow}</div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  delta,
  sublabel,
}: {
  icon: ReactNode
  label: string
  value: string
  delta: number
  sublabel: string
}) {
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

function Dropoff({
  rank,
  title,
  value,
  note,
}: {
  rank: string
  title: string
  value: string
  note: string
}) {
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
