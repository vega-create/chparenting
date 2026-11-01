import { useState, useEffect } from 'react';
import { CopyButton, track } from './ui';

const quotes = [
  { text: '我只是想上個廁所，為什麼這也要開會？', category: '日常崩潰' },
  { text: '「安靜」兩個字是我離婚前最浪漫的情話', category: '安靜渴望' },
  { text: '我的人生目標：今天不要吼小孩。結果：9:03 失敗。', category: '日常崩潰' },
  { text: '「媽媽我想要⋯」 不，你不想。', category: '購物篇' },
  { text: '生小孩之前我以為「累」是加班到12點。太天真了。', category: '疲勞篇' },
  { text: '我不是在收玩具，我是在做一場永無止境的尋寶遊戲', category: '家務篇' },
  { text: '煮了兩小時的飯，小孩吃了兩口說「不好吃」。微笑。', category: '廚房篇' },
  { text: '我的衣服上有不明液體，但我已經不在乎了', category: '日常崩潰' },
  { text: '「等一下」是我說最多的三個字', category: '日常崩潰' },
  { text: '睡前故事講到第三遍，睡著的是我', category: '睡眠篇' },
  { text: '我以為我很有耐心，直到我有了小孩', category: '自我認知' },
  { text: '出門前花30分鐘找鞋子，最後發現在冰箱裡', category: '日常崩潰' },
  { text: '「你好棒！」我對自己今天沒崩潰說的', category: '自我鼓勵' },
  { text: '我的休假 = 帶小孩去不同的地方崩潰', category: '假期篇' },
  { text: '以前追星，現在追著小孩跑', category: '人生感悟' },
  { text: '問我幾點？我只知道「小孩睡前」和「小孩睡後」', category: '時間篇' },
  { text: '生完小孩最大的改變：我現在可以站著睡覺', category: '疲勞篇' },
  { text: '「媽媽陪我玩」翻譯：媽媽坐在旁邊看我玩', category: '親子篇' },
  { text: '家裡最乾淨的時候：小孩不在家的時候', category: '家務篇' },
  { text: '我不是超人媽媽，我只是還沒倒下', category: '自我認知' },
];

// 外層用「」，內文原有的「」改成內層『』，避免重複包裹
const quoteInner = (text: string) => text.replace(/「/g, '『').replace(/」/g, '』');

const pickNext = (len: number, current: number) => {
  if (len <= 1) return 0;
  let n = Math.floor(Math.random() * len);
  if (n === current) n = (n + 1) % len;
  return n;
};

export default function QuotesGenerator() {
  // SSR 先固定第 0 句，掛載後再隨機，避免伺服器／瀏覽器輸出不一致
  const [current, setCurrent] = useState(0);
  useEffect(() => { setCurrent(pickNext(quotes.length, -1)); }, []);
  const quote = quotes[current];
  const display = `「${quoteInner(quote.text)}」`;
  const copyText = `${display}\n— 媽媽內心 OS\n\n— 媽媽生活復原力Lab`;

  const next = () => {
    setCurrent((c) => pickNext(quotes.length, c));
    track('tool_complete', { tool_id: 'quotes' });
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="rounded-[20px] px-5 sm:px-7 py-8" style={{ background: '#FAF6F1', border: '1px solid #E8DFD5' }} aria-live="polite">
        <p className="inline-block rounded-full px-3 py-1 text-sm font-bold mb-4" style={{ background: '#F3F7F1', color: '#6E8E6A' }}>
          {quote.category}
        </p>
        <p className="text-xl sm:text-[22px] font-bold leading-relaxed text-warmgray-800 select-text">{display}</p>
        <p className="text-sm tl-muted mt-4">— 媽媽內心 OS</p>
        <img src="/images/ui/illus/mom-sigh.webp" alt="" width="160" height="160" className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mt-4" />
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2.5 mt-5">
        <button type="button" className="tl-btn tl-btn-primary" onClick={next}>下一句</button>
        <CopyButton text={copyText} label="複製這句話" toolId="quotes" />
      </div>
    </div>
  );
}
