import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const response = await fetch("https://api.streamable.com/videos/93ruep");
    if (!response.ok) {
      throw new Error(`Failed to fetch from Streamable API: ${response.statusText}`);
    }
    const data: any = await response.json();
    const mp4Url = data.files?.mp4?.url || data.files?.["mp4-mobile"]?.url;
    if (!mp4Url) {
      throw new Error("No MP4 video URL found in Streamable metadata");
    }
    return res.json({ url: mp4Url });
  } catch (error: any) {
    console.error("Error fetching dynamic Streamable link:", error);
    return res.json({ url: "/hero-video.mp4" });
  }
}
