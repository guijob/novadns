"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  updates: {
    label: "Updates",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface Props {
  data: { time: string; updates: number }[]
}

export function UpdateActivityChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">No update activity to display</p>
        <p className="text-xs text-muted-foreground mt-1">Updates will appear here once your hosts start sending DDNS updates.</p>
      </div>
    )
  }

  const formatted = data.map(d => ({
    time: new Date(d.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    updates: d.updates,
  }))

  return (
    <div className="border border-border p-4">
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <BarChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            allowDecimals={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="updates" fill="var(--color-updates)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
