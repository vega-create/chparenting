import { useState } from 'react';

// 首頁心情卡（改版規劃 4.2）：點選只更新本頁推薦與選取狀態，不跳頁、不記錄、不推斷心理狀態。
const moods = [
  { key: 'calm', label: '還不錯', message: '太好了，保持這份好心情。' },
  { key: 'neutral', label: '普通', message: '普通也很好，不需要每天都能量滿滿。' },
  { key: 'tired', label: '有點累', message: '辛苦了。先停一下，給自己一點時間。' },
  { key: 'hug', label: '需要抱抱', message: '抱抱你。你已經做得夠好了，今天對自己溫柔一點。' },
] as const;

type MoodKey = typeof moods[number]['key'];

interface Rec { title: string; hint: string; href: string; icon: string; others: { name: string; href: string }[] }

const recommendations: Record<'default' | MoodKey, Rec> = {
  default: { title: '3 分鐘呼吸練習', hint: '先留 3 分鐘給自己', href: '/tools/breathing/', icon: '/images/ui/tools/breathing.png', others: [{ name: '白噪音', href: '/tools/white-noise/' }, { name: '正能量卡片', href: '/tools/affirmation/' }] },
  calm: { title: '今日正能量卡片', hint: '留住這一點好心情', href: '/tools/affirmation/?mood=happy', icon: '/images/ui/tools/affirmation.png', others: [{ name: '每日媽媽笑話', href: '/tools/jokes/' }, { name: '心情日記', href: '/tools/mood-diary/' }] },
  neutral: { title: '白噪音播放器', hint: '給今天一點安靜的空間', href: '/tools/white-noise/', icon: '/images/ui/tools/white-noise.png', others: [{ name: '正能量卡片', href: '/tools/affirmation/?mood=tired' }, { name: '媽媽安心籤', href: '/tools/fortune/' }] },
  tired: { title: '3 分鐘呼吸練習', hint: '用舒服的節奏，慢慢來', href: '/tools/breathing/', icon: '/images/ui/tools/breathing.png', others: [{ name: '白噪音', href: '/tools/white-noise/' }, { name: '正能量卡片', href: '/tools/affirmation/?mood=tired' }] },
  hug: { title: '媽媽加油卡', hint: '先收下一句溫暖的話', href: '/tools/cheer/', icon: '/images/ui/tools/cheer.png', others: [{ name: '呼吸練習', href: '/tools/breathing/' }, { name: '心情日記', href: '/tools/mood-diary/' }] },
};

export default function MoodCheck() {
  const [selected, setSelected] = useState<MoodKey | null>(null);
  const mood = moods.find((m) => m.key === selected);
  const rec = recommendations[selected ?? 'default'];

  return (
    <div className="grid gap-4">
      <section className="tl-card" aria-labelledby="mood-title">
        <div className="sm:flex sm:items-start sm:justify-between sm:gap-6 mb-4">
          <h2 id="mood-title" className="tl-section-title">今天的你，還好嗎？</h2>
          <p className="text-sm tl-muted mt-1 sm:mt-0 sm:text-right">每一種情緒，都值得被理解。<br className="hidden sm:block" />先停下來，感受一下現在的自己吧。</p>
        </div>
        <div className="grid grid-cols-2 min-[390px]:grid-cols-4 gap-2.5" role="group" aria-label="選擇現在的心情">
          {moods.map((m) => (
            <button
              key={m.key}
              type="button"
              className="tl-option flex-col justify-center !px-2 py-3 text-center"
              aria-pressed={selected === m.key}
              onClick={() => setSelected(m.key)}
            >
              <img src={`/images/ui/moods/${m.key}.png`} alt="" width="44" height="44" className="w-11 h-11" />
              <span className="font-bold text-[15px]">{m.label}{selected === m.key ? ' ✓' : ''}</span>
            </button>
          ))}
        </div>
        {mood && (
          <p className="mt-4 text-[15px] text-warmgray-800" role="status">{mood.message}</p>
        )}
      </section>

      <section className="tl-card !bg-[#FBF3EA] !border-[#F0DDC9] flex flex-col sm:flex-row sm:items-center gap-4" aria-labelledby="rec-title">
        <img src={rec.icon} alt="" width="56" height="56" className="w-14 h-14 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm tl-muted">立即喘息推薦</p>
          <h3 id="rec-title" className="font-bold text-lg text-warmgray-800">{rec.hint}</h3>
          <p className="text-sm tl-muted">
            {rec.title}。也可以試試：
            {rec.others.map((o, i) => (
              <span key={o.href}>{i > 0 && '、'}<a href={o.href} className="underline underline-offset-2 text-peach-700">{o.name}</a></span>
            ))}
          </p>
        </div>
        <a href={rec.href} className="tl-btn tl-btn-primary shrink-0">開始 {rec.title.replace('播放器', '').replace('今日', '')}</a>
      </section>
    </div>
  );
}
