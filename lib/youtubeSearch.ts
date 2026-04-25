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

// niche → search query — เน้น keyword ภาษาไทย เพื่อดึง Thai creator เท่านั้น
// ไม่ใส่ "viral" "shorts" ภาษาอังกฤษ เพราะดึง Indian/Global creator แทน
const NICHE_QUERIES: Record<string, string> = {
  food:          'ยูทูปไทย ทำอาหาร กินรีวิว คนไทย',
  beauty:        'ยูทูปไทย สกินแคร์ แต่งหน้า คนไทย',
  fitness:       'ยูทูปไทย ออกกำลังกาย ลดน้ำหนัก คนไทย',
  fashion:       'ยูทูปไทย แฟชั่น แต่งตัว ootd คนไทย',
  review:        'ยูทูปไทย รีวิวสินค้า ของดี คนไทย',
  travel:        'ยูทูปไทย ท่องเที่ยวไทย vlog คนไทย',
  finance:       'ยูทูปไทย การเงิน ลงทุน ออมเงิน คนไทย',
  entertainment: 'ยูทูปไทย ตลก ความบันเทิง คอนเทนต์ไทย',
  pets:          'ยูทูปไทย สัตว์เลี้ยง แมว หมา คนไทย',
  education:     'ยูทูปไทย สอน ความรู้ ทักษะ คนไทย',
  gaming:        'ยูทูปไทย เกม เล่นเกม คนไทย',
  tech:          'ยูทูปไทย เทคโนโลยี รีวิว gadget คนไทย',
  lifestyle:     'ยูทูปไทย ไลฟ์สไตล์ ชีวิตประจำวัน vlog คนไทย',
  mom_baby:      'ยูทูปไทย แม่และเด็ก เลี้ยงลูก คนไทย',
  cafe:          'ยูทูปไทย คาเฟ่ กาแฟ รีวิว คนไทย',
  business:      'ยูทูปไทย ธุรกิจ การตลาด freelance คนไทย',
  general:       'ยูทูปไทย คอนเทนต์ไทย creator คนไทย',
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
    videoDuration: 'short',     // under 4 minutes
    order: 'relevance',         // relevance ดีกว่า viewCount — viewCount ดึง Indian creator ที่ views สูงมาก
    maxResults: String(maxResults * 2), // ดึงเยอะกว่าที่ต้องการ เพื่อกรองทีหลัง
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

  // Thai Unicode range: \u0E00–\u0E7F
  const hasThai = (text: string) => /[\u0E00-\u0E7F]/.test(text)

  const allVideos: YouTubeVideo[] = (data.items ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((item: any) => item.id?.videoId)
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

  // แบ่ง Thai 70% + ต่างประเทศ 30% เพื่อให้ได้ไอเดียหลากหลาย
  const thaiVideos    = allVideos.filter(v => hasThai(v.title) || hasThai(v.channelTitle))
  const foreignVideos = allVideos.filter(v => !hasThai(v.title) && !hasThai(v.channelTitle))

  const thaiCount    = Math.ceil(maxResults * 0.7)   // 70% Thai
  const foreignCount = maxResults - thaiCount         // 30% ต่างประเทศ

  const mixed = [
    ...thaiVideos.slice(0, thaiCount),
    ...foreignVideos.slice(0, foreignCount),
  ]

  // fallback: ถ้าไม่มี Thai เลย คืน all ตามปกติ
  return mixed.length >= 3 ? mixed : allVideos.slice(0, maxResults)
}
