import { useState, useEffect } from 'react';
import { CopyButton, track } from './ui';

const jokes = [
  { setup: '為什麼媽媽都很會數學？', punchline: '因為每天都在算「還有幾分鐘小孩才睡」' },
  { setup: '媽媽的超能力是什麼？', punchline: '可以一邊煮飯一邊接電話一邊阻止小孩把貓塞進洗衣機' },
  { setup: '什麼時候家裡最安靜？', punchline: '小孩在搗蛋你還沒發現的時候' },
  { setup: '媽媽的一天有幾個小時？', punchline: '24 小時，但屬於自己的大概 3 分鐘' },
  { setup: '為什麼媽媽記性不好？', punchline: '因為腦容量都被「孩子的水壺放哪了」佔滿了' },
  { setup: '媽媽的理想週末是什麼？', punchline: '一個人去超市，慢慢逛，不被叫「媽媽～」' },
  { setup: '什麼比恐怖片更可怕？', punchline: '浴室突然安靜下來' },
  { setup: '媽媽的時尚準則是什麼？', punchline: '今天這件衣服上面沒有食物殘渣' },
  { setup: '為什麼媽媽都是偵探？', punchline: '因為每天都在破解「是誰把牆壁畫成那樣」的懸案' },
  { setup: '媽媽最浪漫的夢是什麼？', punchline: '連續睡 8 小時' },
  { setup: '什麼東西永遠找不到？', punchline: '小孩的另一隻襪子' },
  { setup: '媽媽的早餐通常是什麼？', punchline: '小孩吃剩的半片吐司和冷掉的咖啡' },
  { setup: '為什麼媽媽說話要重複三次？', punchline: '第一次小孩沒聽到，第二次假裝沒聽到，第三次才是認真的' },
  { setup: '媽媽最害怕的四個字是什麼？', punchline: '「媽我無聊」' },
  { setup: '什麼時候媽媽跑最快？', punchline: '聽到「碰」一聲然後安靜三秒的時候' },
];

export default function DailyJokes() {
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // 以日期決定起始則，之後依序往下，不會緊接重複
  useEffect(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    setCurrent(seed % jokes.length);
  }, []);

  const next = () => {
    setRevealed(false);
    setCurrent((c) => (c + 1) % jokes.length);
  };

  const reveal = () => {
    setRevealed(true);
    track('tool_complete', { tool_id: 'jokes' });
  };

  const joke = jokes[current];
  const copyText = `Q：${joke.setup}\nA：${joke.punchline}\n\n— 媽媽生活復原力Lab`;

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-[20px] p-5 sm:p-6" style={{ background: '#FAF6F1', border: '1px solid #E8DFD5' }}>
        <div className="flex gap-3 items-start">
          <span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-warmgray-800" style={{ background: '#F3F7F1' }} aria-label="題目">Q</span>
          <p className="text-lg font-bold leading-relaxed text-warmgray-800 pt-1">{joke.setup}</p>
        </div>
        <div className="flex gap-3 items-start mt-4 min-h-[44px]" aria-live="polite">
          {revealed ? (
            <>
              <span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-warmgray-800" style={{ background: '#FBF0E5' }} aria-label="答案">A</span>
              <p className="text-lg leading-relaxed text-warmgray-800 pt-1 select-text">{joke.punchline}</p>
            </>
          ) : (
            <p className="text-sm tl-muted pl-12">答案還沒揭曉</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2.5 mt-5">
        {revealed ? (
          <>
            <button type="button" className="tl-btn tl-btn-primary" onClick={next}>下一則</button>
            <CopyButton text={copyText} label="複製這則笑話" toolId="jokes" />
          </>
        ) : (
          <>
            <button type="button" className="tl-btn tl-btn-primary" onClick={reveal}>看答案</button>
            <button type="button" className="tl-btn tl-btn-secondary" onClick={next}>下一則</button>
          </>
        )}
      </div>
    </div>
  );
}
