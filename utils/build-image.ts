interface PollinationsImageOptions {
  prompt: string | number | boolean;
}
export function buildPollinationsImage(
  prompt: string,
  opts: {
    model?: string;
    width?: number;
    height?: number;
    negativePrompt?: string;
  } = {}
) {
  const params = new URLSearchParams({
    model: opts.model ?? "flux",
    width: String(opts.width ?? 1024),
    height: String(opts.height ?? 1024),
    negative_prompt: opts.negativePrompt ?? "worst quality, blurry",
    key: process.env.NEXT_PUBLIC_POLLINATIONS_KEY!
  });

  return `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?${params.toString()}`;
}