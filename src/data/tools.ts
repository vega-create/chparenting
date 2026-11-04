// 喘息工具館 15 項工具的共同資料源：工具館目錄、首頁快速入口、工具頁標題都從這裡取，
// 避免名稱與網址在各處漂移。icon 圖檔由 Canva 生圖後裁切，放在 public/images/ui/。

export type ToolCategoryId = 'rest' | 'smile' | 'life' | 'learn';

export interface Tool {
  id: string;
  name: string;       // 工具館卡片、頁面 h1、分享預填統一用這個名稱
  short: string;      // 一行用途
  href: string;
  icon: string;       // /images/ui/tools/*.png
  category: ToolCategoryId;
}

export const toolCategories: { id: ToolCategoryId; name: string; lead: string; icon: string }[] = [
  { id: 'rest', name: '喘息區', lead: '給心一點空間，讓情緒慢慢沉澱', icon: '/images/ui/tools/sprout.png' },
  { id: 'smile', name: '笑一個', lead: '用笑容補充一點能量', icon: '/images/ui/tools/jokes.png' },
  { id: 'life', name: '生活工具', lead: '讓日常多一點從容', icon: '/images/ui/tools/priority.png' },
  { id: 'learn', name: '學習工具', lead: '陪孩子複習功課的小幫手', icon: '/images/ui/tools/continents-oceans.png' },
];

export const tools: Tool[] = [
  { id: 'breathing', name: '3 分鐘呼吸練習', short: '跟著節奏，慢慢呼吸', href: '/tools/breathing/', icon: '/images/ui/tools/breathing.png', category: 'rest' },
  { id: 'stress-test', name: '媽媽壓力自我檢視', short: '10 題整理最近的感受', href: '/tools/stress-test/', icon: '/images/ui/tools/stress-test.png', category: 'rest' },
  { id: 'affirmation', name: '今日正能量卡片', short: '依心情抽一句鼓勵', href: '/tools/affirmation/', icon: '/images/ui/tools/affirmation.png', category: 'rest' },
  { id: 'white-noise', name: '白噪音播放器', short: '選一段聲音陪自己休息', href: '/tools/white-noise/', icon: '/images/ui/tools/white-noise.png', category: 'rest' },
  { id: 'mood-diary', name: '心情日記', short: '寫下今天的心情並複製保存', href: '/tools/mood-diary/', icon: '/images/ui/tools/mood-diary.png', category: 'rest' },
  { id: 'fortune', name: '媽媽安心籤', short: '抽一句溫暖的提醒', href: '/tools/fortune/', icon: '/images/ui/tools/fortune.png', category: 'rest' },
  { id: 'cheer', name: '媽媽加油卡', short: '為現在的心情收下鼓勵', href: '/tools/cheer/', icon: '/images/ui/tools/cheer.png', category: 'rest' },
  { id: 'jokes', name: '每日媽媽笑話', short: '揭曉答案，輕鬆笑一下', href: '/tools/jokes/', icon: '/images/ui/tools/jokes.png', category: 'smile' },
  { id: 'quotes', name: '崩潰語錄產生器', short: '看看媽媽們的內心 OS', href: '/tools/quotes/', icon: '/images/ui/tools/quotes.png', category: 'smile' },
  { id: 'mom-type', name: '你是哪種媽媽？', short: '5 題趣味情境測驗', href: '/tools/mom-type/', icon: '/images/ui/tools/mom-type.png', category: 'smile' },
  { id: 'time-calc', name: '時間分配計算器', short: '整理一天的時間分配', href: '/tools/time-calc/', icon: '/images/ui/tools/time-calc.png', category: 'life' },
  { id: 'priority', name: '待辦優先排序', short: '由你決定必做與可以晚點的事', href: '/tools/priority/', icon: '/images/ui/tools/priority.png', category: 'life' },
  { id: 'emotion-card', name: '情緒安撫卡', short: '孩子和媽媽都能認識情緒', href: '/tools/emotion-card/', icon: '/images/ui/tools/emotion-card.png', category: 'life' },
  { id: 'growth-chart', name: '兒童生長曲線計算器', short: '輸入身高體重，查 WHO 百分位', href: '/tools/growth-chart/', icon: '/images/ui/tools/growth-chart.png', category: 'life' },
  { id: 'continents-oceans', name: '七大洲五大洋互動地圖', short: '點地圖認識洲與洋，12 題測驗＋可列印', href: '/tools/continents-oceans/', icon: '/images/ui/tools/continents-oceans.png', category: 'learn' },
];

export const getTool = (id: string): Tool => {
  const tool = tools.find((t) => t.id === id);
  if (!tool) throw new Error(`Unknown tool id: ${id}`);
  return tool;
};

// 首頁「喘息工具箱」六個快速入口（順序依改版規劃 4.3）
export const homeToolIds = ['breathing', 'affirmation', 'stress-test', 'white-noise', 'quotes', 'mood-diary'];

// 首頁使用的短名稱（卡片空間小）
export const homeToolLabels: Record<string, string> = {
  breathing: '呼吸練習',
  affirmation: '正能量卡片',
  'stress-test': '壓力自我檢視',
  'white-noise': '白噪音',
  quotes: '崩潰語錄',
  'mood-diary': '心情日記',
};
