import { describe, expect, it, vi } from "vitest";

import { InvalidChannelUrlError, createChannelLookupResolver } from "@/infrastructure/youtube/channel-url-resolver";

describe("createChannelLookupResolver", () => {
  it("resolves handle URLs with official support", async () => {
    const resolver = createChannelLookupResolver();

    await expect(resolver.resolve("https://www.youtube.com/@MKBHD")).resolves.toEqual({
      type: "handle",
      value: "MKBHD",
    });
  });

  it("resolves canonical channel id URLs", async () => {
    const resolver = createChannelLookupResolver();

    await expect(
      resolver.resolve("https://www.youtube.com/channel/UCXuqSBlHAE6Xw-yeJA0Tunw"),
    ).resolves.toEqual({
      type: "id",
      value: "UCXuqSBlHAE6Xw-yeJA0Tunw",
    });
  });

  it("resolves legacy custom channel URLs via canonical fallback", async () => {
    const fetchHtml = vi.fn().mockResolvedValue(`
      <html>
        <head>
          <link rel="canonical" href="https://www.youtube.com/channel/UCAuUUnT6oDeKwE6v1NGQxug" />
        </head>
      </html>
    `);
    const resolver = createChannelLookupResolver({ fetchHtml });

    await expect(resolver.resolve("https://www.youtube.com/c/GoogleDevelopers")).resolves.toEqual({
      type: "id",
      value: "UCAuUUnT6oDeKwE6v1NGQxug",
    });
    expect(fetchHtml).toHaveBeenCalledTimes(1);
  });

  it("rejects unsupported domains", async () => {
    const resolver = createChannelLookupResolver();

    await expect(resolver.resolve("https://example.com/not-youtube")).rejects.toBeInstanceOf(
      InvalidChannelUrlError,
    );
  });
});
