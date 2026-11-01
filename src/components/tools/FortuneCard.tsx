import { useState } from 'react';
import { CopyButton, track } from './ui';

const fortunes = [
  { number: 1, title: '大吉', color: '#B8C4A0', poem: '春風輕拂暖心房', message: '今天會有意想不到的小確幸，保持開放的心迎接它吧！', advice: '放下手機 15 分鐘，好好享受一杯熱茶的時光。' },
  { number: 2, title: '吉', color: '#8BA888', poem: '細雨潤物無聲來', message: '你默默付出的一切，孩子都感受到了。你的愛正在發芽。', advice: '今天試著對自己說三次「我做得很好」。' },
  { number: 3, title: '大吉', color: '#B8C4A0', poem: '朝陽初昇萬物新', message: '新的機會正在靠近你！相信自己的直覺。', advice: '寫下一個你一直想做的事，今天就踏出第一步。' },
  { number: 4, title: '中吉', color: '#D4B896', poem: '靜水深流藏力量', message: '看似平凡的日子裡，你正在累積巨大的能量。', advice: '找一首喜歡的歌，閉上眼睛聽完整首。' },
  { number: 5, title: '吉', color: '#8BA888', poem: '微風送來花香氣', message: '今天適合和重要的人聊聊天，溫暖會在對話中流動。', advice: '傳一則訊息給好久沒聯絡的朋友。' },
  { number: 6, title: '大吉', color: '#B8C4A0', poem: '雲開月明照前路', message: '困擾你的事情即將有轉機，再堅持一下！', advice: '把煩惱寫在紙上，然後把紙折起來放到看不見的地方。' },
  { number: 7, title: '中吉', color: '#D4B896', poem: '小溪蜿蜒終入海', message: '不要急，你走的每一步都算數。慢慢來比較快。', advice: '今天做事放慢 20% 的速度，你會發現更多細節。' },
  { number: 8, title: '吉', color: '#8BA888', poem: '綠葉成蔭護花開', message: '你就是家裡最溫暖的存在，孩子因你而安心。', advice: '給自己一個擁抱，你值得被好好對待。' },
  { number: 9, title: '大吉', color: '#B8C4A0', poem: '彩虹橫跨萬里天', message: '今天的運氣特別好！把握機會，好事會接連發生。', advice: '做一件平常不會做的事，給自己一點小冒險。' },
  { number: 10, title: '中吉', color: '#D4B896', poem: '秋月圓滿照人間', message: '知足常樂。看看身邊，你已經擁有很多很多了。', advice: '拍一張今天讓你感恩的東西，存在手機裡。' },
  { number: 11, title: '吉', color: '#8BA888', poem: '竹節堅韌不畏風', message: '你比自己想像的更堅強。困難只是暫時的。', advice: '回想一次你成功克服困難的經歷，你做到過，就能再做到。' },
  { number: 12, title: '大吉', color: '#B8C4A0', poem: '桃花盛開迎春來', message: '好人緣今天特別旺！多和人互動會有好事發生。', advice: '對遇到的每個人微笑，快樂會加倍回來。' },
  { number: 13, title: '中吉', color: '#D4B896', poem: '星光點點引方向', message: '答案就在你心裡，靜下來聽聽自己的聲音。', advice: '找一個安靜的角落，閉眼深呼吸 10 次。' },
  { number: 14, title: '吉', color: '#8BA888', poem: '泉水清澈映天心', message: '今天適合整理思緒。理清了就會輕鬆很多。', advice: '花 5 分鐘寫下今天最重要的 3 件事。' },
  { number: 15, title: '大吉', color: '#B8C4A0', poem: '金風送爽豐收時', message: '你之前的努力開始有了回報！好好享受這份成就感。', advice: '犒賞自己一個小禮物，你值得。' },
  { number: 16, title: '中吉', color: '#D4B896', poem: '蝴蝶翩翩訪花園', message: '美好的事物正在向你飛來，保持耐心。', advice: '今天出門走走，大自然會給你力量。' },
  { number: 17, title: '吉', color: '#8BA888', poem: '暖陽輕灑滿窗台', message: '平凡的日常就是最大的幸福。好好珍惜每一刻。', advice: '跟孩子玩一個小遊戲，享受純粹的快樂。' },
  { number: 18, title: '大吉', color: '#B8C4A0', poem: '東風化雨萬物生', message: '今天開始的事情會順利發展！放膽去做吧。', advice: '那個你猶豫的決定，今天就做吧，宇宙支持你。' },
  { number: 19, title: '中吉', color: '#D4B896', poem: '明月千里寄相思', message: '今天特別適合表達愛意，讓身邊的人知道你在乎他們。', advice: '跟家人說一句「謝謝你」或「我愛你」。' },
  { number: 20, title: '吉', color: '#8BA888', poem: '松柏常青不畏寒', message: '你的堅持終究會被看見。繼續做對的事就好。', advice: '列出 3 個你很棒的優點，大聲唸出來。' },
];

type Fortune = typeof fortunes[number];
type Step = 'idle' | 'drawn' | 'revealed';

// 資料池多於一筆時避免緊接著重複
const pickNext = (len: number, current: number) => {
  if (len <= 1) return 0;
  let n = Math.floor(Math.random() * len);
  if (n === current) n = (n + 1) % len;
  return n;
};

export default function FortuneCard() {
  const [index, setIndex] = useState(-1);
  const [step, setStep] = useState<Step>('idle');
  const fortune: Fortune | null = index >= 0 ? fortunes[index] : null;

  const draw = () => {
    setIndex((i) => pickNext(fortunes.length, i));
    setStep('drawn');
    track('tool_start', { tool_id: 'fortune' });
  };

  const reveal = () => {
    setStep('revealed');
    track('tool_complete', { tool_id: 'fortune' });
  };

  const copyText = fortune
    ? `媽媽安心籤 第 ${fortune.number} 籤【${fortune.title}】\n` +
      `籤詩：${fortune.poem}\n` +
      `籤語：${fortune.message}\n` +
      `今日小行動：${fortune.advice}\n\n` +
      `— 媽媽生活復原力Lab\nhttps://chparenting.com/tools/fortune/`
    : '';

  return (
    <div className="text-center max-w-md mx-auto">
      {step === 'idle' && (
        <>
          <img src="/images/ui/illus/fortune-window.webp" alt="" width={200} height={200} className="w-44 h-44 sm:w-52 sm:h-52 mx-auto mb-2 object-contain" />
          <p className="text-lg font-bold text-warmgray-800 mb-1">抽一籤，給自己一句溫暖的話</p>
          <p className="text-sm tl-muted mb-6">靜下來，想著現在的自己，再按下方抽籤。</p>
          <button type="button" className="tl-btn tl-btn-primary w-full sm:w-auto sm:px-10" onClick={draw}>抽一籤</button>
        </>
      )}

      {step === 'drawn' && fortune && (
        <>
          <div
            className="mx-auto mb-5 flex items-center justify-center rounded-2xl"
            style={{ width: 96, height: 200, background: '#FBF0E5', border: '1px solid #E8DFD5' }}
            aria-hidden="true"
          >
            <span className="text-xl font-bold tracking-[0.4em] text-warmgray-800" style={{ writingMode: 'vertical-rl' }}>
              第{fortune.number}籤
            </span>
          </div>
          <p className="text-lg font-bold text-warmgray-800 mb-5" role="status">你抽到第 {fortune.number} 籤</p>
          <button type="button" className="tl-btn tl-btn-primary w-full sm:w-auto sm:px-10" onClick={reveal}>解籤</button>
        </>
      )}

      {step === 'revealed' && fortune && (
        <>
          <article className="rounded-[20px] p-5 sm:p-7 text-left" style={{ background: '#FAF6F1', border: '1px solid #E8DFD5' }} aria-live="polite">
            <header className="text-center mb-5">
              <p className="text-sm tl-muted">第 {fortune.number} 籤</p>
              <p className="inline-block rounded-xl px-5 py-1.5 mt-1 text-xl font-bold text-warmgray-800" style={{ background: '#F3F7F1', border: '1px solid #8BA888' }}>
                {fortune.title}
              </p>
            </header>
            <section className="mb-4">
              <h2 className="text-sm font-bold tl-muted mb-1">籤詩</h2>
              <p className="text-xl font-bold tracking-widest text-warmgray-800">{fortune.poem}</p>
            </section>
            <section className="mb-4">
              <h2 className="text-sm font-bold tl-muted mb-1">籤語</h2>
              <p className="text-base leading-relaxed text-warmgray-800">{fortune.message}</p>
            </section>
            <section className="rounded-2xl px-4 py-3" style={{ background: '#F3F7F1' }}>
              <h2 className="text-sm font-bold mb-1" style={{ color: '#6E8E6A' }}>今日小行動</h2>
              <p className="text-base leading-relaxed text-warmgray-800">{fortune.advice}</p>
            </section>
          </article>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2.5 mt-5">
            <button type="button" className="tl-btn tl-btn-primary" onClick={draw}>再抽一籤</button>
            <CopyButton text={copyText} label="複製籤詩" toolId="fortune" />
          </div>
        </>
      )}
    </div>
  );
}
