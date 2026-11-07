// 七大洲五大洋的基本資料：名稱、面積、排名、代表國家或特徵、一句好記的描述。
// 面積採英文維基百科「Continent」條目（陸地面積）與「Ocean」條目（五大洋分列的海洋面積）的數字，
// 以萬平方公里取整呈現；不同教科書或資料庫的數字略有出入，但排名一致。

export type RegionKind = 'continent' | 'ocean';

export interface Region {
  id: string;
  kind: RegionKind;
  name: string;        // 中文
  en: string;          // 英文
  areaKm2: number;     // 平方公里（來源見上）
  rank: number;        // 同類別中面積排名（1 = 最大）
  highlights: string[];// 代表國家或特徵，3～4 條
  memo: string;        // 一句好記的描述
}

export const continents: Region[] = [
  {
    id: 'asia', kind: 'continent', name: '亞洲', en: 'Asia', areaKm2: 44_614_000, rank: 1,
    highlights: ['台灣、中國、日本、韓國、印度都在亞洲', '世界最高峰聖母峰（珠穆朗瑪峰）在亞洲', '人口最多的洲，全球約六成的人住在這裡', '和歐洲連在一起，以烏拉山、烏拉河為界'],
    memo: '最大的洲，也是我們住的洲。',
  },
  {
    id: 'africa', kind: 'continent', name: '非洲', en: 'Africa', areaKm2: 30_365_000, rank: 2,
    highlights: ['埃及、肯亞、南非、奈及利亞', '撒哈拉沙漠是世界最大的熱帶沙漠', '尼羅河是世界最長的河流之一', '赤道從中間穿過，大象、長頸鹿、獅子的家'],
    memo: '第二大的洲，赤道從正中間穿過去。',
  },
  {
    id: 'north-america', kind: 'continent', name: '北美洲', en: 'North America', areaKm2: 24_230_000, rank: 3,
    highlights: ['美國、加拿大、墨西哥', '格陵蘭是世界最大的島，也算在北美洲', '有五大湖、落磯山脈、密西西比河', '中美洲與加勒比海的國家通常也歸在北美洲'],
    memo: '第三大的洲，在太平洋的另一邊、赤道的北邊。',
  },
  {
    id: 'south-america', kind: 'continent', name: '南美洲', en: 'South America', areaKm2: 17_814_000, rank: 4,
    highlights: ['巴西、阿根廷、秘魯、智利', '亞馬遜河與亞馬遜雨林，世界最大的熱帶雨林', '安地斯山脈是世界最長的山脈', '以巴拿馬地峽和北美洲相連'],
    memo: '第四大的洲，形狀像一顆倒過來的水滴。',
  },
  {
    id: 'antarctica', kind: 'continent', name: '南極洲', en: 'Antarctica', areaKm2: 14_200_000, rank: 5,
    highlights: ['沒有國家，也沒有長住的居民，只有各國的研究站', '幾乎整個被厚厚的冰層蓋住', '世界最冷、最乾、風最大的洲', '企鵝住在這裡（北極熊住在北極，不在南極）'],
    memo: '第五大的洲，一整片冰，沒有國家。',
  },
  {
    id: 'europe', kind: 'continent', name: '歐洲', en: 'Europe', areaKm2: 10_000_000, rank: 6,
    highlights: ['英國、法國、德國、義大利、西班牙', '和亞洲連在同一塊陸地上，合稱「歐亞大陸」', '面積不大，但國家很多', '阿爾卑斯山、萊茵河、多瑙河'],
    memo: '第六大的洲，小小的，國家卻很多。',
  },
  {
    id: 'oceania', kind: 'continent', name: '大洋洲', en: 'Oceania', areaKm2: 8_510_926, rank: 7,
    highlights: ['澳洲、紐西蘭、巴布亞紐幾內亞', '澳洲本身就是一整塊大陸，也是全世界最大的島', '無尾熊、袋鼠、鴨嘴獸的家', '還包括太平洋上的許多小島國'],
    memo: '最小的洲，大部分是澳洲，加上很多小島。',
  },
];

export const oceans: Region[] = [
  {
    id: 'pacific', kind: 'ocean', name: '太平洋', en: 'Pacific Ocean', areaKm2: 168_723_000, rank: 1,
    highlights: ['台灣的東邊就是太平洋', '世界最大、最深的海洋', '最深處馬里亞納海溝約 11,000 公尺，比聖母峰還高', '在亞洲、大洋洲和美洲之間'],
    memo: '最大的洋，比全部陸地加起來還大。',
  },
  {
    id: 'atlantic', kind: 'ocean', name: '大西洋', en: 'Atlantic Ocean', areaKm2: 85_133_000, rank: 2,
    highlights: ['在美洲與歐洲、非洲之間', '形狀像一個大大的 S', '太平洋置中的地圖上，大西洋會被切成左右兩半', '哥倫布就是橫渡大西洋到美洲'],
    memo: '第二大的洋，在地圖的左右兩邊各露出一半。',
  },
  {
    id: 'indian', kind: 'ocean', name: '印度洋', en: 'Indian Ocean', areaKm2: 70_560_000, rank: 3,
    highlights: ['在非洲、亞洲、大洋洲之間', '北邊是印度，所以叫印度洋', '大部分在南半球', '海水最溫暖的大洋'],
    memo: '第三大的洋，印度就在它的北邊。',
  },
  {
    id: 'southern', kind: 'ocean', name: '南極海', en: 'Southern Ocean', areaKm2: 21_960_000, rank: 4,
    highlights: ['一整圈環繞著南極洲', '也叫南冰洋、南大洋', '2000 年國際水道測量組織才正式列為第五個大洋', '以前的課本只有四大洋，就是少了它'],
    memo: '第四大的洋，繞著南極洲一圈。',
  },
  {
    id: 'arctic', kind: 'ocean', name: '北極海', en: 'Arctic Ocean', areaKm2: 15_558_000, rank: 5,
    highlights: ['也叫北冰洋，在地球最北端，北極點就在海裡', '世界最小、最淺的大洋', '大部分海面整年結冰', '北極熊住在這裡'],
    memo: '最小的洋，在最北邊，大多結著冰。',
  },
];

export const regions: Region[] = [...continents, ...oceans];

export const getRegion = (id: string): Region => {
  const r = regions.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown region id: ${id}`);
  return r;
};

/** 面積以「萬平方公里」呈現，例如 4,461 萬平方公里 */
export const formatArea = (km2: number) => `${Math.round(km2 / 10_000).toLocaleString('zh-TW')} 萬平方公里`;

/** 記憶口訣（自編，方便記排名，不是官方說法） */
export const mnemonics = [
  {
    title: '七大洲面積排名：亞非北南美，南極歐大洋',
    detail: '亞洲、非洲、北美洲、南美洲、南極洲、歐洲、大洋洲，從大排到小。念成「亞非北南美、南極歐大洋」，兩句各五個字，拍著節奏念幾次就記住了。',
  },
  {
    title: '五大洋面積排名：太大印南北',
    detail: '太平洋、大西洋、印度洋、南極海、北極海。可以記成「太大了，印南北」：太平洋太大了，再來是大西洋，然後印度洋，最後南極海、北極海。',
  },
  {
    title: '最大最小一句話：最大亞洲太平洋，最小大洋北極海',
    detail: '考試最常問的就是最大與最小。最大的洲是亞洲、最大的洋是太平洋；最小的洲是大洋洲、最小的洋是北極海。',
  },
];
