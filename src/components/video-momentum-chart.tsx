"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { CompetitorVideoReadModel } from "@/application/read-models/analysis-read-model";
import { formatCompactNumber } from "@/lib/formatters";

const trendColors: Record<CompetitorVideoReadModel["trend"], string> = {
  hot: "var(--color-accent)",
  above_avg: "var(--color-sun)",
  steady: "var(--color-foreground-soft)",
};

export function VideoMomentumChart({
  videos,
}: {
  videos: CompetitorVideoReadModel[];
}) {
  const chartData = videos.slice(0, 6).map((video) => ({
    id: video.id,
    title: video.title.length > 24 ? `${video.title.slice(0, 24)}...` : video.title,
    viewsPerDay: video.viewsPerDay,
    trend: video.trend,
  }));

  if (chartData.length === 0) {
    return (
      <section className="rounded-[32px] border border-dashed border-[color:var(--color-border)] bg-white/70 p-8">
        <h2 className="text-xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
          Momentum snapshot
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[color:var(--color-muted)]">
          Once a channel has uploads in the active month, this chart highlights which videos are
          accelerating fastest on public view velocity.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[32px] border border-[color:var(--color-border)] bg-white/90 p-6 shadow-[0_18px_50px_rgba(31,35,33,0.07)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Momentum chart
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            View velocity leaders
          </h2>
        </div>
        <p className="max-w-xs text-right text-sm leading-6 text-[color:var(--color-muted)]">
          Ranked by views per day from currently public metrics.
        </p>
      </div>

      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 0, right: 12, top: 6, bottom: 8 }}>
            <CartesianGrid stroke="rgba(109, 116, 106, 0.14)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="title"
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tickFormatter={(value) => formatCompactNumber(Number(value))}
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <Tooltip
              cursor={{ fill: "rgba(16, 120, 105, 0.08)" }}
              contentStyle={{
                borderRadius: 20,
                border: "1px solid rgba(216, 208, 194, 1)",
                background: "rgba(255, 252, 246, 0.98)",
                boxShadow: "0 16px 36px rgba(31, 35, 33, 0.12)",
              }}
              formatter={(value) => [
                `${formatCompactNumber(Number(value ?? 0))}/day`,
                "View velocity",
              ]}
            />
            <Bar dataKey="viewsPerDay" radius={[14, 14, 6, 6]}>
              {chartData.map((entry) => (
                <Cell key={entry.id} fill={trendColors[entry.trend]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
