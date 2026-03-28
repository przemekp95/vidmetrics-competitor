"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { ArrowUpRight, Download, LoaderCircle, Save, Search, SlidersHorizontal } from "lucide-react";
import Image from "next/image";

import type {
  AnalysisSnapshotReadModel,
  ChannelAnalysisReadModel,
  CompetitorVideoReadModel,
  SaveAnalysisSnapshotResponse,
} from "@/application/read-models/analysis-read-model";
import type { UpgradeCheckoutReadModel } from "@/application/read-models/upgrade-checkout-read-model";
import { GatedWorkflowsPanel } from "@/components/gated-workflows-panel";
import { LegalLinks } from "@/components/legal-links";
import { PerformanceSummaryCards } from "@/components/performance-summary-cards";
import { SaasShellHeader } from "@/components/saas-shell-header";
import { SavedSnapshotsPanel } from "@/components/saved-snapshots-panel";
import { SessionUsageOverview } from "@/components/session-usage-overview";
import { UpgradeActivationCard } from "@/components/upgrade-activation-card";
import { UpgradeCheckoutDrawer } from "@/components/upgrade-checkout-drawer";
import { UpgradePromptBanner } from "@/components/upgrade-prompt-banner";
import { VideoMomentumChart } from "@/components/video-momentum-chart";
import { VideoResults } from "@/components/video-results";
import { durationTextToSeconds, formatInteger } from "@/lib/formatters";
import { readApiResponse } from "@/lib/read-api-response";

const SAMPLE_CHANNELS = [
  "https://www.youtube.com/@MKBHD",
  "https://www.youtube.com/@WSJ",
  "https://www.youtube.com/@MrBeast",
];
const WORKSPACE_SESSION_STORAGE_KEY = "vidmetrics:competitor-pulse-session-id";

type SortKey = "momentum" | "views" | "engagement" | "comments" | "recent";
type TrendFilter = "all" | CompetitorVideoReadModel["trend"];
type DurationFilter = "all" | "under10" | "10to20" | "20plus";
type UpgradePromptSource = "snapshot" | "export" | null;
type StatusMessage =
  | {
      tone: "success" | "error";
      text: string;
    }
  | null;

function sortVideos(videos: CompetitorVideoReadModel[], sortKey: SortKey) {
  return [...videos].sort((left, right) => {
    if (sortKey === "views") {
      return right.views - left.views;
    }

    if (sortKey === "engagement") {
      return right.engagementRate - left.engagementRate;
    }

    if (sortKey === "comments") {
      return right.comments - left.comments;
    }

    if (sortKey === "recent") {
      return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
    }

    return right.viewsPerDay - left.viewsPerDay;
  });
}

function matchesDurationFilter(video: CompetitorVideoReadModel, durationFilter: DurationFilter) {
  const seconds = durationTextToSeconds(video.durationText);

  if (durationFilter === "under10") {
    return seconds < 600;
  }

  if (durationFilter === "10to20") {
    return seconds >= 600 && seconds <= 1200;
  }

  if (durationFilter === "20plus") {
    return seconds > 1200;
  }

  return true;
}

function exportVideosToCsv(channelTitle: string, videos: CompetitorVideoReadModel[]) {
  const header = [
    "Title",
    "Published At",
    "Duration",
    "Views",
    "Views Per Day",
    "Engagement Rate",
    "Comments",
    "Trend",
    "Video URL",
  ];

  const rows = videos.map((video) => [
    video.title,
    video.publishedAt,
    video.durationText,
    video.views.toString(),
    video.viewsPerDay.toString(),
    video.engagementRate.toString(),
    video.comments.toString(),
    video.trend,
    video.videoUrl,
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${channelTitle.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}-competitor-analysis.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function CompetitorAnalysisWorkspace() {
  const [workspaceSessionId, setWorkspaceSessionId] = useState<string | null>(null);
  const [channelUrl, setChannelUrl] = useState("");
  const [analysis, setAnalysis] = useState<ChannelAnalysisReadModel | null>(null);
  const [checkout, setCheckout] = useState<UpgradeCheckoutReadModel | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkoutErrorMessage, setCheckoutErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState(true);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(true);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [isClearingSnapshots, setIsClearingSnapshots] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [isConfirmingCheckout, setIsConfirmingCheckout] = useState(false);
  const [savedSnapshots, setSavedSnapshots] = useState<AnalysisSnapshotReadModel[]>([]);
  const [snapshotMessage, setSnapshotMessage] = useState<StatusMessage>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("momentum");
  const [minViews, setMinViews] = useState("");
  const [trendFilter, setTrendFilter] = useState<TrendFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [upgradePromptSource, setUpgradePromptSource] = useState<UpgradePromptSource>(null);
  const [analyzedChannelIds, setAnalyzedChannelIds] = useState<string[]>([]);
  const [exportCount, setExportCount] = useState(0);

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filteredVideos = sortVideos(
    (analysis?.videos ?? []).filter((video) => {
      const matchesSearch =
        deferredSearchTerm.trim().length === 0 ||
        video.title.toLowerCase().includes(deferredSearchTerm.toLowerCase());
      const matchesMinViews = minViews.trim().length === 0 || video.views >= Number(minViews);
      const matchesTrend = trendFilter === "all" || video.trend === trendFilter;

      return matchesSearch && matchesMinViews && matchesTrend && matchesDurationFilter(video, durationFilter);
    }),
    sortKey,
  );

  const chartVideos = filteredVideos.length > 0 ? filteredVideos : analysis?.videos ?? [];

  const shellPlanLabel = checkout?.planLabel ?? "Explorer";
  const shellStatusLabel =
    checkout?.status === "submitted"
      ? "Pending activation"
      : checkout?.status === "draft"
        ? "Draft checkout"
        : "Mock billing ready";
  const usagePlanStatus =
    checkout?.status === "submitted"
      ? "Pending activation"
      : checkout?.status === "draft"
        ? "Draft checkout"
        : isLoadingCheckout
          ? "Loading billing"
          : "Explorer";

  useEffect(() => {
    const existingSessionId = window.sessionStorage.getItem(WORKSPACE_SESSION_STORAGE_KEY);

    if (existingSessionId) {
      setWorkspaceSessionId(existingSessionId);
      return;
    }

    const nextSessionId = window.crypto.randomUUID();
    window.sessionStorage.setItem(WORKSPACE_SESSION_STORAGE_KEY, nextSessionId);
    setWorkspaceSessionId(nextSessionId);
  }, []);

  async function loadSavedSnapshots(sessionId: string) {
    setIsLoadingSnapshots(true);

    try {
      const response = await fetch("/api/analysis-snapshots", {
        method: "GET",
        headers: {
          "x-vidmetrics-session-id": sessionId,
        },
      });

      const payload = await readApiResponse<{
        snapshots: AnalysisSnapshotReadModel[];
      }>(response, {
        errorMessage: "Unable to load saved snapshots.",
        unexpectedResponseMessage:
          "Saved snapshots are temporarily unavailable. Refresh and try again.",
      });

      startTransition(() => {
        setSavedSnapshots(payload.snapshots);
      });
    } catch (error) {
      setSnapshotMessage({
        tone: "error",
        text:
          error instanceof Error ? error.message : "Unable to load saved snapshots right now.",
      });
    } finally {
      setIsLoadingSnapshots(false);
    }
  }

  async function loadCheckoutState(sessionId: string) {
    setIsLoadingCheckout(true);

    try {
      const response = await fetch("/api/upgrade-checkout", {
        method: "GET",
        headers: {
          "x-vidmetrics-session-id": sessionId,
        },
      });

      const payload = await readApiResponse<{
        checkout: UpgradeCheckoutReadModel | null;
      }>(response, {
        errorMessage: "Unable to load checkout state.",
        unexpectedResponseMessage:
          "Billing state is temporarily unavailable. Refresh and try again.",
      });

      startTransition(() => {
        setCheckout(payload.checkout);
      });
      setCheckoutErrorMessage(null);
    } catch (error) {
      setCheckoutErrorMessage(
        error instanceof Error ? error.message : "Unable to load billing state right now.",
      );
    } finally {
      setIsLoadingCheckout(false);
    }
  }

  useEffect(() => {
    if (!workspaceSessionId) {
      return;
    }

    void loadSavedSnapshots(workspaceSessionId);
    void loadCheckoutState(workspaceSessionId);
  }, [workspaceSessionId]);

  async function runAnalysis(nextUrl: string) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          channelUrl: nextUrl,
        }),
      });

      const nextAnalysis = await readApiResponse<ChannelAnalysisReadModel>(response, {
        errorMessage: "Live analysis failed.",
        unexpectedResponseMessage:
          "The analysis service returned an unexpected response. Refresh and try again.",
      });

      startTransition(() => {
        setAnalysis(nextAnalysis);
        setSearchTerm("");
        setSortKey("momentum");
        setMinViews("");
        setTrendFilter("all");
        setDurationFilter("all");
        setAnalyzedChannelIds((currentIds) =>
          currentIds.includes(nextAnalysis.channel.id)
            ? currentIds
            : [...currentIds, nextAnalysis.channel.id],
        );
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while contacting the analysis service.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveSnapshot() {
    if (!analysis) {
      return;
    }

    setIsSavingSnapshot(true);
    setSnapshotMessage(null);

    try {
      if (!workspaceSessionId) {
        throw new Error("Snapshot session is still initializing. Try again in a moment.");
      }

      const response = await fetch("/api/analysis-snapshots", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-vidmetrics-session-id": workspaceSessionId,
        },
        body: JSON.stringify({
          analysis,
        }),
      });

      const saved = await readApiResponse<SaveAnalysisSnapshotResponse>(response, {
        errorMessage: "Unable to save this snapshot.",
        unexpectedResponseMessage:
          "Snapshot saving is temporarily unavailable. Refresh and try again.",
      });

      setSnapshotMessage({
        tone: "success",
        text: `Snapshot saved at ${new Date(saved.savedAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}.`,
      });
      setUpgradePromptSource("snapshot");
      await loadSavedSnapshots(workspaceSessionId);
    } catch (error) {
      setSnapshotMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Unable to save this snapshot right now.",
      });
    } finally {
      setIsSavingSnapshot(false);
    }
  }

  async function handleClearSnapshots() {
    if (!workspaceSessionId) {
      return;
    }

    setIsClearingSnapshots(true);
    setSnapshotMessage(null);

    try {
      const response = await fetch("/api/analysis-snapshots", {
        method: "DELETE",
        headers: {
          "x-vidmetrics-session-id": workspaceSessionId,
        },
      });

      await readApiResponse<{ cleared: boolean }>(response, {
        errorMessage: "Unable to clear this demo session.",
        unexpectedResponseMessage:
          "Session clearing is temporarily unavailable. Refresh and try again.",
      });

      startTransition(() => {
        setSavedSnapshots([]);
      });
      setSnapshotMessage({
        tone: "success",
        text: "Current-session snapshots cleared.",
      });
    } catch (error) {
      setSnapshotMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Unable to clear this demo session.",
      });
    } finally {
      setIsClearingSnapshots(false);
    }
  }

  async function handleStartCheckout(input: {
    planId: "team" | "enterprise";
    billingCycle: "monthly" | "annual";
    seats: number;
  }) {
    if (!workspaceSessionId) {
      const error = new Error("Browser session is still initializing. Try again in a moment.");
      setCheckoutErrorMessage(error.message);
      throw error;
    }

    setIsStartingCheckout(true);
    setCheckoutErrorMessage(null);

    try {
      const response = await fetch("/api/upgrade-checkout/start", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-vidmetrics-session-id": workspaceSessionId,
        },
        body: JSON.stringify(input),
      });

      const payload = await readApiResponse<{
        checkout: UpgradeCheckoutReadModel;
      }>(response, {
        errorMessage: "Unable to start checkout.",
        unexpectedResponseMessage:
          "Checkout is temporarily unavailable. Refresh and try again.",
      });

      startTransition(() => {
        setCheckout(payload.checkout);
      });
    } catch (error) {
      const nextError =
        error instanceof Error ? error : new Error("Unable to start checkout right now.");
      setCheckoutErrorMessage(nextError.message);
      throw nextError;
    } finally {
      setIsStartingCheckout(false);
    }
  }

  async function handleConfirmCheckout(input: {
    buyerName: string;
    buyerEmail: string;
    companyName: string;
  }) {
    if (!workspaceSessionId) {
      const error = new Error("Browser session is still initializing. Try again in a moment.");
      setCheckoutErrorMessage(error.message);
      throw error;
    }

    setIsConfirmingCheckout(true);
    setCheckoutErrorMessage(null);

    try {
      const response = await fetch("/api/upgrade-checkout/confirm", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-vidmetrics-session-id": workspaceSessionId,
        },
        body: JSON.stringify(input),
      });

      const payload = await readApiResponse<{
        checkout: UpgradeCheckoutReadModel;
      }>(response, {
        errorMessage: "Unable to submit checkout.",
        unexpectedResponseMessage:
          "Checkout submission is temporarily unavailable. Refresh and try again.",
      });

      startTransition(() => {
        setCheckout(payload.checkout);
        setUpgradePromptSource(null);
      });
    } catch (error) {
      const nextError =
        error instanceof Error ? error : new Error("Unable to submit checkout right now.");
      setCheckoutErrorMessage(nextError.message);
      throw nextError;
    } finally {
      setIsConfirmingCheckout(false);
    }
  }

  function handleOpenCheckout() {
    setCheckoutErrorMessage(null);
    setIsCheckoutOpen(true);
  }

  function handleCloseCheckout() {
    setCheckoutErrorMessage(null);
    setIsCheckoutOpen(false);
  }

  function handleExportCsv() {
    if (!analysis || filteredVideos.length === 0) {
      return;
    }

    exportVideosToCsv(analysis.channel.title, filteredVideos);
    setExportCount((currentCount) => currentCount + 1);
    setUpgradePromptSource("export");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!channelUrl.trim()) {
      setErrorMessage("Paste a YouTube channel URL to begin.");
      return;
    }

    await runAnalysis(channelUrl.trim());
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-360 flex-col gap-10 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <SaasShellHeader
        planLabel={shellPlanLabel}
        statusLabel={shellStatusLabel}
        onOpenCheckout={handleOpenCheckout}
      />

      <section
        id="overview"
        className="overflow-hidden rounded-[40px] border border-(--color-border) bg-[radial-gradient(circle_at_top_left,rgba(16,120,105,0.16),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,249,239,0.96))] px-6 py-8 shadow-[0_24px_70px_rgba(31,35,33,0.09)] sm:px-8 lg:px-10 lg:py-10"
      >
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-[rgba(16,120,105,0.18)] bg-[rgba(255,255,255,0.8)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-(--color-accent)">
              VidMetrics Competitor Pulse
            </p>
            <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-(--color-foreground) sm:text-5xl lg:text-6xl">
              See which competitor videos are winning this month.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-(--color-muted) sm:text-lg">
              Paste a YouTube channel URL to surface current-month uploads, rank them by public
              view velocity, and move cleanly from analysis into reports, exports, and mock
              activation.
            </p>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-(--color-border) bg-white/75 p-5 text-sm text-(--color-muted) lg:max-w-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[rgba(16,120,105,0.12)] p-2 text-(--color-accent)">
                <Search className="h-4 w-4" />
              </div>
              <p className="font-medium text-(--color-foreground)">
                Public competitor metrics only
              </p>
            </div>
            <p>
              Rankings use views per day and engagement from public YouTube data. Watch time, CTR,
              impressions, and retention are not available for competitor channels.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 rounded-4xl border border-(--color-border) bg-[rgba(255,255,255,0.88)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row">
            <label className="flex-1">
              <span className="sr-only">YouTube channel URL</span>
              <input
                value={channelUrl}
                onChange={(event) => setChannelUrl(event.target.value)}
                placeholder="https://www.youtube.com/@channelname"
                className="h-14 w-full rounded-2xl border border-(--color-border) bg-[rgba(255,252,246,0.92)] px-5 text-base text-(--color-foreground) outline-none transition focus:border-(--color-accent) focus:ring-4 focus:ring-[rgba(16,120,105,0.12)]"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-(--color-foreground) px-6 text-sm font-semibold text-(--color-background) transition hover:bg-(--color-accent) disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  Analyze channel
                  <ArrowUpRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {SAMPLE_CHANNELS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setChannelUrl(sample);
                  void runAnalysis(sample);
                }}
                className="rounded-full border border-(--color-border) bg-white px-3 py-2 text-xs font-medium text-(--color-muted) transition hover:border-(--color-accent) hover:text-(--color-accent)"
              >
                Try {sample.replace("https://www.youtube.com/", "")}
              </button>
            ))}
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-[rgba(191,87,70,0.2)] bg-[rgba(255,240,235,0.85)] px-4 py-3 text-sm text-(--color-danger)">
              {errorMessage}
            </div>
          ) : null}
        </form>
      </section>

      <SessionUsageOverview
        analyzedChannels={analyzedChannelIds.length}
        exportCount={exportCount}
        snapshotCount={savedSnapshots.length}
        planStatus={usagePlanStatus}
      />

      <UpgradeActivationCard checkout={checkout} onOpenCheckout={handleOpenCheckout} />

      <UpgradePromptBanner
        source={checkout?.status === "submitted" ? null : upgradePromptSource}
        onOpenCheckout={handleOpenCheckout}
      />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-4xl border border-(--color-border) bg-white/85 p-6 shadow-[0_18px_50px_rgba(31,35,33,0.07)]">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-(--color-muted)">
            What you get
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-(--color-foreground)">
                Velocity-first
              </p>
              <p className="mt-2 text-sm leading-6 text-(--color-muted)">
                Default ranking surfaces videos gathering views fastest right now, not only the
                biggest back-catalog hits.
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-(--color-foreground)">
                Client-ready
              </p>
              <p className="mt-2 text-sm leading-6 text-(--color-muted)">
                Summary cards, chart, filters, export, and mock checkout are designed for strategy
                calls, not just developer inspection.
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-(--color-foreground)">
                SaaS workflow
              </p>
              <p className="mt-2 text-sm leading-6 text-(--color-muted)">
                Analysts can move from raw competitor analysis into saved reports, upgrade paths,
                and a believable billing state without leaving VidMetrics.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-4xl border border-(--color-border) bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,244,219,0.92))] p-6 shadow-[0_18px_50px_rgba(31,35,33,0.07)]">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-(--color-muted)">
            Workspace workflow
          </p>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-(--color-muted)">
            <li>Paste a channel, analyze current-month uploads, and rank them by momentum.</li>
            <li>Save a session report or export the filtered shortlist for client handoff.</li>
            <li>Open billing to turn the demo into a mock enterprise checkout workflow.</li>
          </ul>
        </article>
      </section>

      {isSubmitting && !analysis ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-[28px] border border-(--color-border) bg-white/80 p-5 shadow-[0_18px_50px_rgba(31,35,33,0.05)]"
            >
              <div className="h-3 w-24 rounded-full bg-[rgba(31,35,33,0.08)]" />
              <div className="mt-4 h-8 w-3/4 rounded-full bg-[rgba(31,35,33,0.08)]" />
              <div className="mt-3 h-3 w-1/2 rounded-full bg-[rgba(31,35,33,0.08)]" />
            </div>
          ))}
        </section>
      ) : analysis ? (
        <>
          <section className="rounded-4xl border border-(--color-border) bg-white/88 p-6 shadow-[0_18px_50px_rgba(31,35,33,0.07)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src={analysis.channel.avatarUrl}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-2xl border border-(--color-border) object-cover"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold tracking-tight text-(--color-foreground)">
                      {analysis.channel.title}
                    </h2>
                    <span className="rounded-full bg-[rgba(16,120,105,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-accent)">
                      {analysis.window.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-(--color-muted)">
                    {formatInteger(analysis.channel.subscriberCount)} subscribers and public
                    competitor snapshot
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveSnapshot}
                  disabled={isSavingSnapshot}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-(--color-border) bg-white px-5 text-sm font-semibold text-(--color-foreground) transition hover:border-(--color-accent) hover:text-(--color-accent) disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingSnapshot ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save snapshot
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={filteredVideos.length === 0}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-(--color-border) bg-[rgba(255,252,246,0.9)] px-5 text-sm font-semibold text-(--color-foreground) transition hover:border-(--color-accent) hover:text-(--color-accent) disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  Export filtered CSV
                </button>
              </div>
            </div>
          </section>

          <PerformanceSummaryCards analysis={analysis} />

          <section className="rounded-4xl border border-(--color-border) bg-white/88 p-5 shadow-[0_18px_50px_rgba(31,35,33,0.07)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-(--color-muted)">
                  Filters
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-(--color-foreground)">
                  Refine the shortlist
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(31,35,33,0.05)] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-(--color-muted)">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {filteredVideos.length} of {analysis.videos.length} videos visible
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-(--color-muted)">Search title</span>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Find a headline"
                  className="h-12 rounded-2xl border border-(--color-border) bg-[rgba(255,252,246,0.92)] px-4 text-sm text-(--color-foreground) outline-none transition focus:border-(--color-accent) focus:ring-4 focus:ring-[rgba(16,120,105,0.12)]"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-(--color-muted)">Sort by</span>
                <select
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value as SortKey)}
                  className="h-12 rounded-2xl border border-(--color-border) bg-[rgba(255,252,246,0.92)] px-4 text-sm text-(--color-foreground) outline-none transition focus:border-(--color-accent) focus:ring-4 focus:ring-[rgba(16,120,105,0.12)]"
                >
                  <option value="momentum">Views / day</option>
                  <option value="views">Total views</option>
                  <option value="engagement">Engagement</option>
                  <option value="comments">Comments</option>
                  <option value="recent">Publish date</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-(--color-muted)">Minimum views</span>
                <input
                  value={minViews}
                  onChange={(event) => setMinViews(event.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 25000"
                  className="h-12 rounded-2xl border border-(--color-border) bg-[rgba(255,252,246,0.92)] px-4 text-sm text-(--color-foreground) outline-none transition focus:border-(--color-accent) focus:ring-4 focus:ring-[rgba(16,120,105,0.12)]"
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-(--color-muted)">Trend</span>
                  <select
                    value={trendFilter}
                    onChange={(event) => setTrendFilter(event.target.value as TrendFilter)}
                    className="h-12 rounded-2xl border border-(--color-border) bg-[rgba(255,252,246,0.92)] px-4 text-sm text-(--color-foreground) outline-none transition focus:border-(--color-accent) focus:ring-4 focus:ring-[rgba(16,120,105,0.12)]"
                  >
                    <option value="all">All trends</option>
                    <option value="hot">Hot</option>
                    <option value="above_avg">Above average</option>
                    <option value="steady">Steady</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-(--color-muted)">Duration</span>
                  <select
                    value={durationFilter}
                    onChange={(event) => setDurationFilter(event.target.value as DurationFilter)}
                    className="h-12 rounded-2xl border border-(--color-border) bg-[rgba(255,252,246,0.92)] px-4 text-sm text-(--color-foreground) outline-none transition focus:border-(--color-accent) focus:ring-4 focus:ring-[rgba(16,120,105,0.12)]"
                  >
                    <option value="all">All lengths</option>
                    <option value="under10">Under 10 min</option>
                    <option value="10to20">10-20 min</option>
                    <option value="20plus">20+ min</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <VideoMomentumChart videos={chartVideos} />
          <VideoResults videos={filteredVideos} />
        </>
      ) : (
        <section className="rounded-4xl border border-dashed border-(--color-border) bg-white/70 p-10 text-center shadow-[0_18px_50px_rgba(31,35,33,0.05)]">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-(--color-muted)">
            Ready when you are
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-(--color-foreground)">
            Paste a channel to generate a live competitor snapshot.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-(--color-muted)">
            You&apos;ll get summary cards, a velocity chart, a sortable video table, a CSV export,
            and a mock billing path that makes the workspace feel like a real SaaS product.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-(--color-border) bg-[rgba(255,252,246,0.85)] p-5 text-left">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-(--color-muted)">
                1
              </p>
              <p className="mt-3 text-xl font-semibold tracking-tight text-(--color-foreground)">
                Resolve the channel
              </p>
              <p className="mt-2 text-sm leading-6 text-(--color-muted)">
                Supports handle, canonical channel, username, and best-effort legacy custom URLs.
              </p>
            </div>
            <div className="rounded-3xl border border-(--color-border) bg-[rgba(255,252,246,0.85)] p-5 text-left">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-(--color-muted)">
                2
              </p>
              <p className="mt-3 text-xl font-semibold tracking-tight text-(--color-foreground)">
                Analyze current-month uploads
              </p>
              <p className="mt-2 text-sm leading-6 text-(--color-muted)">
                Ranks videos by views per day while preserving raw view, comment, and engagement
                context.
              </p>
            </div>
            <div className="rounded-3xl border border-(--color-border) bg-[rgba(255,252,246,0.85)] p-5 text-left">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-(--color-muted)">
                3
              </p>
              <p className="mt-3 text-xl font-semibold tracking-tight text-(--color-foreground)">
                Upgrade the workspace
              </p>
              <p className="mt-2 text-sm leading-6 text-(--color-muted)">
                Walk the client from one-off analysis into saved reports, recurring tracking, and
                a mock checkout that ends in pending activation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenCheckout}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-(--color-border) bg-white px-5 text-sm font-semibold text-(--color-foreground) transition hover:border-(--color-accent) hover:text-(--color-accent)"
          >
            Open pricing workflow
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </section>
      )}

      {snapshotMessage ? (
        <section
          className={`rounded-3xl border px-4 py-3 text-sm ${
            snapshotMessage.tone === "success"
              ? "border-[rgba(16,120,105,0.2)] bg-[rgba(232,247,243,0.9)] text-(--color-accent)"
              : "border-[rgba(191,87,70,0.2)] bg-[rgba(255,240,235,0.85)] text-(--color-danger)"
          }`}
        >
          {snapshotMessage.text}
        </section>
      ) : null}

      <SavedSnapshotsPanel
        snapshots={savedSnapshots}
        isLoading={isLoadingSnapshots}
        isClearing={isClearingSnapshots}
        onClear={handleClearSnapshots}
      />

      <GatedWorkflowsPanel checkout={checkout} onOpenCheckout={handleOpenCheckout} />

      <UpgradeCheckoutDrawer
        key={`${isCheckoutOpen ? "open" : "closed"}:${checkout?.status ?? "empty"}:${checkout?.confirmationCode ?? checkout?.planId ?? "none"}`}
        isOpen={isCheckoutOpen}
        checkout={checkout}
        isStarting={isStartingCheckout}
        isConfirming={isConfirmingCheckout}
        errorMessage={checkoutErrorMessage}
        onClose={handleCloseCheckout}
        onStartCheckout={handleStartCheckout}
        onConfirmCheckout={handleConfirmCheckout}
      />

      <footer className="flex flex-col gap-3 pb-8 text-sm text-(--color-muted)">
        <p>
          Built for fast demo review. Rankings reflect public YouTube data only and refresh on
          demand.
        </p>
        <LegalLinks linkClassName="font-medium text-(--color-foreground)" />
      </footer>
    </main>
  );
}
