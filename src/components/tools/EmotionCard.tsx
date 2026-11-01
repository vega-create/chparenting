import { useState, useEffect, useRef } from 'react';
import { track } from './ui';

type Mode = 'child' | 'parent';

// 孩子版固定三段：身體感覺／照顧者可以這樣說／可以一起做的小行動
// 媽媽版用第一人稱：身體感覺／我可以對自己說／我可以試試
const emotions = [
  {
    name: '開心', icon: 'happy',
    child: { body: '嘴角上揚、眼睛亮亮的', say: '「你現在看起來很開心呢！是什麼事讓你這麼高興？」', act: '一起把開心的事畫下來或說給家人聽。' },
    parent: { body: '肩膀放鬆、想笑、想分享', say: '「這份開心是我的，我可以好好享受它。」', act: '把這一刻記在手機備忘錄，低潮時拿出來看。' },
  },
  {
    name: '難過', icon: 'sad',
    child: { body: '眼睛紅紅、想哭、肩膀垂下來', say: '「你看起來有點難過。想跟我說說嗎？沒關係，哭出來也可以。」', act: '抱一抱，或一起安靜地坐一會兒。' },
    parent: { body: '胸口悶悶的、提不起勁、想哭', say: '「我現在很難過，這是可以的。我不需要馬上好起來。」', act: '給自己五分鐘，喝杯溫水，或傳訊息給一個信任的人。' },
  },
  {
    name: '生氣', icon: 'angry',
    child: { body: '臉紅紅、握拳頭、想大叫', say: '「你現在在生氣。生氣是可以的。我們一起深呼吸好不好？」', act: '一起找個舒服的位置，慢慢吐氣三次。' },
    parent: { body: '臉熱熱的、拳頭緊緊的、聲音變大', say: '「我在生氣，代表有件事讓我很在意。我可以先停一下。」', act: '離開現場一分鐘，慢慢吐氣，再回來處理。' },
  },
  {
    name: '害怕', icon: 'scared',
    child: { body: '身體縮起來、心跳很快', say: '「你是不是有點害怕？我在這裡，我會陪著你。」', act: '握住孩子的手，一起數到十。' },
    parent: { body: '心跳很快、手心出汗、腦中一直轉', say: '「我會害怕，是因為我在乎。此刻我是安全的。」', act: '把擔心的事寫下來，分成「現在能做」和「現在不能做」。' },
  },
  {
    name: '驚訝', icon: 'surprised',
    child: { body: '眼睛睜大、嘴巴張開', say: '「哇！你嚇到了嗎？是什麼讓你這麼驚訝？」', act: '一起說說剛才發生了什麼，再決定要不要做什麼。' },
    parent: { body: '愣住、一時說不出話', say: '「我被嚇到了，先深呼吸，給自己一點時間反應。」', act: '先停三秒，再開口回應。' },
  },
  {
    name: '累了', icon: 'exhausted',
    child: { body: '打哈欠、揉眼睛、軟趴趴', say: '「你看起來累了。要不要休息一下？我陪你。」', act: '關小燈、放慢速度，一起躺一下。' },
    parent: { body: '眼皮重、沒力氣、什麼都不想做', say: '「我累了，這不是我不夠好，是我做了很多。」', act: '放下一件今天可以不做的事。' },
  },
  {
    name: '被愛', icon: 'loved',
    child: { body: '想要抱抱、感覺溫暖', say: '「你知道嗎？我好愛你。來，讓我抱抱你。」', act: '一起說一件喜歡對方的地方。' },
    parent: { body: '心裡暖暖的、想靠近家人', say: '「我值得被愛，也值得被好好對待。」', act: '對自己說一句平常會對好朋友說的話。' },
  },
  {
    name: '挫折', icon: 'frustrated',
    child: { body: '跺腳、想放棄', say: '「做不到很氣對不對？沒關係，我們可以慢慢來，或者換個方式試試。」', act: '把事情拆成小步，先做第一步就好。' },
    parent: { body: '想嘆氣、覺得怎麼做都不對', say: '「這件事不順，不代表我做不好。我可以換個方式，或先放一放。」', act: '選一件最小的事完成，給自己一個「做到了」。' },
  },
];

export default function EmotionCard() {
  const [mode, setMode] = useState<Mode>('child');
  const [selected, setSelected] = useState<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // 手機選取後讓結果出現在可見區，且保留上方的切換選項
  useEffect(() => {
    if (selected === null || !resultRef.current) return;
    if (window.innerWidth < 640) resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selected, mode]);

  const emotion = selected !== null ? emotions[selected] : null;
  const content = emotion ? emotion[mode] : null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex justify-center gap-2 mb-5" role="group" aria-label="選擇模式">
        {([['child', '孩子版'], ['parent', '媽媽版']] as [Mode, string][]).map(([m, label]) => (
          <button
            key={m}
            type="button"
            className="tl-option justify-center !min-h-[44px] px-5"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            <span className="font-bold">{label}</span>
            {mode === m && <span className="text-sm" style={{ color: '#6E8E6A' }}>✓ 使用中</span>}
          </button>
        ))}
      </div>

      <fieldset className="border-0 p-0 m-0 mb-5">
        <legend className="text-center font-bold text-warmgray-800 mb-3 w-full">
          {mode === 'child' ? '孩子現在的感覺是什麼？' : '我現在的感覺是？'}
        </legend>
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {emotions.map((e, i) => (
            <button
              key={e.name}
              type="button"
              className="tl-option flex-col justify-center gap-1 !px-1 py-2.5"
              aria-pressed={selected === i}
              onClick={() => { setSelected(i); track('tool_complete', { tool_id: 'emotion-card' }); }}
            >
              <img src={`/images/ui/moods/${e.icon}.png`} alt="" width={40} height={40} className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
              <span className="text-sm font-bold">{e.name}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {emotion && content && (
        <article
          ref={resultRef}
          key={`${mode}-${emotion.name}`}
          className="rounded-[20px] p-5 sm:p-6"
          style={{ background: '#FAF6F1', border: '1px solid #E8DFD5' }}
          aria-live="polite"
        >
          <header className="flex items-center gap-3 mb-4">
            <img src={`/images/ui/moods/${emotion.icon}.png`} alt="" width={48} height={48} className="w-12 h-12 object-contain" />
            <div>
              <p className="text-sm tl-muted">{mode === 'child' ? '孩子版' : '媽媽版'}</p>
              <h2 className="text-xl font-bold text-warmgray-800">{emotion.name}</h2>
            </div>
          </header>
          <dl className="grid gap-3">
            <div className="rounded-2xl bg-white px-4 py-3" style={{ border: '1px solid #E8DFD5' }}>
              <dt className="text-sm font-bold tl-muted mb-0.5">身體感覺</dt>
              <dd className="text-[15px] leading-relaxed text-warmgray-800">{content.body}</dd>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3" style={{ border: '1px solid #E8DFD5' }}>
              <dt className="text-sm font-bold tl-muted mb-0.5">{mode === 'child' ? '照顧者可以這樣說' : '我可以對自己說'}</dt>
              <dd className="text-[15px] leading-relaxed text-warmgray-800">{content.say}</dd>
            </div>
            <div className="rounded-2xl px-4 py-3" style={{ background: '#F3F7F1' }}>
              <dt className="text-sm font-bold mb-0.5" style={{ color: '#6E8E6A' }}>{mode === 'child' ? '可以一起做的小行動' : '我可以試試'}</dt>
              <dd className="text-[15px] leading-relaxed text-warmgray-800">{content.act}</dd>
            </div>
          </dl>
          <p className="text-sm tl-muted mt-4">每一種情緒都沒有對錯，先看見它，再慢慢決定要怎麼做。</p>
        </article>
      )}
    </div>
  );
}
