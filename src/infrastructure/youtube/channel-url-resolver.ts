import type { ChannelLookupResolver } from "@/ports/channel-lookup-resolver";
import { ApplicationError } from "@/shared/application-error";

export class InvalidChannelUrlError extends ApplicationError {
  constructor(message: string) {
    super("INVALID_CHANNEL_URL", message, 400);
  }
}

function normalizeInput(input: string) {
  const trimmed = input.trim();

  if (trimmed.startsWith("@")) {
    return `https://www.youtube.com/${trimmed}`;
  }

  if (/^https?:\/\//u.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function parseCanonicalChannelId(html: string) {
  const canonicalMatch =
    /<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/www\.youtube\.com\/channel\/([A-Za-z0-9_-]+)["']/iu.exec(
      html,
    );

  return canonicalMatch?.[1] ?? null;
}

export function createChannelLookupResolver(options?: {
  fetchHtml?: (url: string) => Promise<string>;
}): ChannelLookupResolver {
  const fetchHtml =
    options?.fetchHtml ??
    (async (url: string) => {
      const response = await fetch(url, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new InvalidChannelUrlError("We could not resolve that channel URL.");
      }

      return response.text();
    });

  return {
    async resolve(channelUrl) {
      let url: URL;

      try {
        url = new URL(normalizeInput(channelUrl));
      } catch {
        throw new InvalidChannelUrlError("Enter a valid YouTube channel URL.");
      }

      if (!["youtube.com", "www.youtube.com"].includes(url.hostname)) {
        throw new InvalidChannelUrlError("Only YouTube channel URLs are supported.");
      }

      const segments = url.pathname.split("/").filter(Boolean);

      if (segments.length === 0) {
        throw new InvalidChannelUrlError("Enter a YouTube channel URL, not the site homepage.");
      }

      if (segments[0].startsWith("@")) {
        return {
          type: "handle",
          value: segments[0].slice(1),
        };
      }

      if (segments[0] === "channel" && segments[1]) {
        return {
          type: "id",
          value: segments[1],
        };
      }

      if (segments[0] === "user" && segments[1]) {
        return {
          type: "username",
          value: segments[1],
        };
      }

      if (segments[0] === "c" || segments.length === 1) {
        const html = await fetchHtml(url.toString());
        const channelId = parseCanonicalChannelId(html);

        if (!channelId) {
          throw new InvalidChannelUrlError(
            "We could not resolve that custom channel URL. Try a handle or canonical channel link.",
          );
        }

        return {
          type: "id",
          value: channelId,
        };
      }

      throw new InvalidChannelUrlError("That YouTube URL format is not supported in this MVP.");
    },
  };
}
