import type { AnalysisFrame, AnalyzedChannel } from "@/domain/analysis/types";
import type { ChannelLookup } from "@/ports/channel-lookup-resolver";
import type { CompetitorChannelSource, SourceChannelSnapshot, SourceChannelVideo } from "@/ports/competitor-channel-source";
import { ApplicationError } from "@/shared/application-error";

const API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const CACHE_TTL_MS = 15 * 60 * 1000;
const snapshotCache = new Map<string, { expiresAt: number; value: SourceChannelSnapshot }>();

type YouTubeChannelResponse = {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      customUrl?: string;
      thumbnails?: {
        maxres?: { url: string };
        high?: { url: string };
        medium?: { url: string };
        default?: { url: string };
      };
    };
    statistics?: {
      subscriberCount?: string;
    };
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
  error?: {
    errors?: Array<{
      reason?: string;
      message?: string;
    }>;
    message?: string;
  };
};

type PlaylistItemsResponse = {
  nextPageToken?: string;
  items?: Array<{
    contentDetails?: {
      videoId?: string;
      videoPublishedAt?: string;
    };
    snippet?: {
      publishedAt?: string;
    };
  }>;
  error?: {
    errors?: Array<{
      reason?: string;
      message?: string;
    }>;
    message?: string;
  };
};

type VideosResponse = {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      publishedAt?: string;
      thumbnails?: {
        maxres?: { url: string };
        high?: { url: string };
        medium?: { url: string };
        default?: { url: string };
      };
    };
    statistics?: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
    contentDetails?: {
      duration?: string;
    };
  }>;
  error?: {
    errors?: Array<{
      reason?: string;
      message?: string;
    }>;
    message?: string;
  };
};

function getRequiredApiKey(apiKey?: string) {
  const resolvedApiKey = apiKey ?? process.env.YOUTUBE_API_KEY;

  if (!resolvedApiKey) {
    throw new ApplicationError(
      "CONFIGURATION_ERROR",
      "YOUTUBE_API_KEY is missing. Add it locally and in Vercel before running live analysis.",
      500,
      "Live competitor analysis is unavailable right now.",
    );
  }

  return resolvedApiKey;
}

function buildQuery(path: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  return `${API_BASE_URL}/${path}?${searchParams.toString()}`;
}

function pickThumbnail(
  thumbnails?: {
    maxres?: { url: string };
    high?: { url: string };
    medium?: { url: string };
    default?: { url: string };
  },
) {
  return thumbnails?.maxres?.url ?? thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? "";
}

function mapLookupToParams(lookup: ChannelLookup): Record<string, string> {
  if (lookup.type === "handle") {
    return { forHandle: lookup.value };
  }

  if (lookup.type === "username") {
    return { forUsername: lookup.value };
  }

  return { id: lookup.value };
}

function mapApiError(status: number, payload: { error?: { errors?: Array<{ reason?: string; message?: string }>; message?: string } }) {
  const reason = payload.error?.errors?.[0]?.reason;
  const message = payload.error?.errors?.[0]?.message ?? payload.error?.message ?? "Upstream YouTube API request failed.";

  if (reason === "quotaExceeded") {
    return new ApplicationError(
      "YOUTUBE_QUOTA_EXCEEDED",
      "YouTube quota exceeded.",
      503,
      "Live competitor analysis is temporarily unavailable. Please try again shortly.",
    );
  }

  if (status === 404) {
    return new ApplicationError("CHANNEL_NOT_FOUND", "We could not find that YouTube channel.", 404);
  }

  return new ApplicationError(
    "YOUTUBE_API_ERROR",
    message,
    502,
    "Live competitor analysis is temporarily unavailable. Please try again shortly.",
  );
}

async function requestJson<T>(
  input: string,
  fetchImpl: typeof fetch,
): Promise<T> {
  const response = await fetchImpl(input, {
    headers: {
      accept: "application/json",
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as T & {
    error?: {
      errors?: Array<{ reason?: string; message?: string }>;
      message?: string;
    };
  };

  if (!response.ok) {
    throw mapApiError(response.status, payload);
  }

  return payload;
}

function mapChannel(item: NonNullable<YouTubeChannelResponse["items"]>[number]): AnalyzedChannel {
  const customUrl = item.snippet?.customUrl?.replace(/^@/u, "");

  return {
    id: item.id,
    title: item.snippet?.title ?? "Unknown channel",
    avatarUrl: pickThumbnail(item.snippet?.thumbnails),
    subscriberCount: Number(item.statistics?.subscriberCount ?? 0),
    channelUrl: customUrl ? `https://www.youtube.com/@${customUrl}` : `https://www.youtube.com/channel/${item.id}`,
  };
}

async function getChannel(
  lookup: ChannelLookup,
  apiKey: string,
  fetchImpl: typeof fetch,
) {
  const payload = await requestJson<YouTubeChannelResponse>(
    buildQuery("channels", {
      ...mapLookupToParams(lookup),
      key: apiKey,
      part: "snippet,statistics,contentDetails",
    }),
    fetchImpl,
  );

  const item = payload.items?.[0];

  if (!item?.contentDetails?.relatedPlaylists?.uploads) {
    throw new ApplicationError("CHANNEL_NOT_FOUND", "We could not find that YouTube channel.", 404);
  }

  return {
    channel: mapChannel(item),
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
  };
}

async function listPlaylistVideoIds(params: {
  uploadsPlaylistId: string;
  apiKey: string;
  fetchImpl: typeof fetch;
  window: AnalysisFrame;
  maxVideos: number;
}) {
  const startAt = new Date(params.window.startAt).getTime();
  const endAt = new Date(params.window.endAt).getTime();
  const videoIds: string[] = [];
  let pageToken: string | undefined;
  let shouldContinue = true;

  while (shouldContinue && videoIds.length < params.maxVideos) {
    const payload = await requestJson<PlaylistItemsResponse>(
      buildQuery("playlistItems", {
        key: params.apiKey,
        part: "contentDetails,snippet",
        playlistId: params.uploadsPlaylistId,
        maxResults: "50",
        ...(pageToken ? { pageToken } : {}),
      }),
      params.fetchImpl,
    );

    for (const item of payload.items ?? []) {
      const publishedAt = new Date(
        item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt ?? "",
      ).getTime();

      if (!publishedAt) {
        continue;
      }

      if (publishedAt < startAt) {
        shouldContinue = false;
        break;
      }

      if (publishedAt >= endAt) {
        continue;
      }

      if (item.contentDetails?.videoId) {
        videoIds.push(item.contentDetails.videoId);
      }

      if (videoIds.length >= params.maxVideos) {
        shouldContinue = false;
        break;
      }
    }

    pageToken = payload.nextPageToken;
    if (!pageToken) {
      break;
    }
  }

  return videoIds;
}

async function getVideosByIds(params: {
  videoIds: string[];
  apiKey: string;
  fetchImpl: typeof fetch;
}): Promise<SourceChannelVideo[]> {
  const chunks: string[][] = [];

  for (let index = 0; index < params.videoIds.length; index += 50) {
    chunks.push(params.videoIds.slice(index, index + 50));
  }

  const videos: SourceChannelVideo[] = [];

  for (const chunk of chunks) {
    const payload = await requestJson<VideosResponse>(
      buildQuery("videos", {
        key: params.apiKey,
        part: "snippet,statistics,contentDetails",
        id: chunk.join(","),
      }),
      params.fetchImpl,
    );

    for (const item of payload.items ?? []) {
      videos.push({
        id: item.id,
        title: item.snippet?.title ?? "Untitled video",
        publishedAt: item.snippet?.publishedAt ?? new Date().toISOString(),
        duration: item.contentDetails?.duration ?? "PT0S",
        viewCount: Number(item.statistics?.viewCount ?? 0),
        likeCount: Number(item.statistics?.likeCount ?? 0),
        commentCount: Number(item.statistics?.commentCount ?? 0),
        thumbnailUrl: pickThumbnail(item.snippet?.thumbnails),
      });
    }
  }

  return videos;
}

export function createYouTubeDataApiSource(options?: {
  apiKey?: string;
  fetchImpl?: typeof fetch;
}): CompetitorChannelSource {
  const fetchImpl = options?.fetchImpl ?? fetch;

  return {
    async fetchCurrentMonthVideos({ lookup, window, maxVideos }) {
      const apiKey = getRequiredApiKey(options?.apiKey);
      const cacheKey = `${lookup.type}:${lookup.value}:${window.monthKey}:${maxVideos}`;
      const cached = snapshotCache.get(cacheKey);

      if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
      }

      const { channel, uploadsPlaylistId } = await getChannel(lookup, apiKey, fetchImpl);
      const videoIds = await listPlaylistVideoIds({
        uploadsPlaylistId,
        apiKey,
        fetchImpl,
        window,
        maxVideos,
      });
      const videos = await getVideosByIds({
        videoIds,
        apiKey,
        fetchImpl,
      });

      const snapshot: SourceChannelSnapshot = {
        channel,
        videos,
        source: {
          provider: "youtube-data-api-v3",
          cache: "memory-ttl",
        },
      };

      snapshotCache.set(cacheKey, {
        value: snapshot,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return snapshot;
    },
  };
}
