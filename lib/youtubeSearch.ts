// YouTube Data API v3 — ค้นหาคลิปตัวอย่างตาม niche
// ใช้ YOUTUBE_API_KEY (Simple API key — ไม่ใช่ OAuth)
// Quota: 10,000 units/วัน (search = 100 units/req)

export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
  url: string
  publishedAt: string
}

// niche → search query (ภาษาไทย + English สำหรับ TH region)
const NICHE_QUERIES: Record<string, string> = {
  food:          'ช่อง youtube อาหาร viral shorts ทำอาหาร creator',
  beauty:        'ช่อง youtube สกินแคร์ ความงาม creator viral shorts',
  fitness:       'ช่อง youtube ออกกำลังกาย สุขภาพ creator viral shorts',
  fashion:       'ช่อง youtube แฟชั่น ไลฟ์สไตล์ ootd creator viral',
  review:        'ช่อง youtube รีวิวสินค้า creator viral shorts thailand',
  travel:        'ช่อง youtube ท่องเที่ยวไทย vlog creator viral',
  finance:       'ช่อง youtube การเงิน ลงทุน เงิน creator viral',
  entertainment: 'ช่อง youtube ตลก ความบันเทิง creator viral',
  pets:          'ช่อง youtube สัตว์เลี้ยง แมว หมา creator viral',
  education:     'ช่อง youtube สอน ทักษะ เรียน creator viral shorts',
  gaming:        'ช่อง youtube เกม gaming creator viral thailand',
  tech:          'ช่อง youtube เทคโนโลยี tech review creator viral',
  general:       'ช่อง youtube creator viral shorts thailand content',
}

function getNicheQuery(niche: string): string {
  const normalized = niche.toLowerCase().trim()
  // ตรง key เลย
  if (NICHE_QUERIES[normalized]) return NICHE_QUERIES[normalized]
  // หา partial match
  for (const [key, query] of Object.entries(NICHE_QUERIES)) {
    if (normalized.includes(key) || key.includes(normalized)) return query
  }
  return NICHE_QUERIES.general
}

export async function searchYouTubeByNiche(
  niche: string,
  apiKey: string,
  maxResults = 8
): Promise<YouTubeVideo[]> {
  const query = getNicheQuery(niche)

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    videoDuration: 'short',   // under 4 minutes
    order: 'viewCount',       // เรียงตาม views มากที่สุด
    maxResults: String(maxResults),
    regionCode: 'TH',
    relevanceLanguage: 'th',
    key: apiKey,
  })

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`,
    { next: { revalidate: 86400 } } // cache 24hr (Next.js fetch cache)
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`YouTube API error: ${res.status} — ${err}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await res.json() as { items?: any[] }

  return (data.items ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((item: any) => item.id?.videoId) // กรอง playlist/channel ออก
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any): YouTubeVideo => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail:
        item.snippet.thumbnails?.high?.url ??
        item.snippet.thumbnails?.medium?.url ??
        item.snippet.thumbnails?.default?.url ?? '',
      channelTitle: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      publishedAt: item.snippet.publishedAt,
    }))
}
