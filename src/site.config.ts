export const siteConfig = {
  name: '媽媽生活復原力Lab',
  nameEn: 'Mom Life Recovery Lab',
  description: '媽媽不需要完美，只需要一個能喘口氣的空間。舒壓工具、笑話放鬆、心理支持，讓媽媽找回自己。',
  url: 'https://chparenting.com',
  author: '薇佳媽咪',
  lang: 'zh-TW',
  
  // Brand colors
  colors: {
    primary: '#E8A87C',    // Peach orange
    secondary: '#D4956A',  // Deeper peach
    accent: '#8BA888',     // Sage green
    background: '#FDF9F4', // Cream white
  },

  // Navigation
  nav: [
    { text: '首頁', href: '/', emoji: '🏠' },
    { text: '喘息工具', href: '/tools/', emoji: '🫁' },
    { text: '媽媽喘息區', href: '/category/mom-relax/', emoji: '☕' },
    { text: '解壓笑一個', href: '/category/release/', emoji: '😂' },
    { text: '親子舒壓', href: '/category/child-raising/', emoji: '👩‍👧' },
    { text: '生活魔法', href: '/category/life-inspiration/', emoji: '✨' },
    { text: '關於我', href: '/about/', emoji: '💛' },
  ],

  // Content categories
  categories: [
    { slug: 'mom-relax', name: '媽媽喘息區', emoji: '☕', description: '專屬媽媽的放鬆時刻' },
    { slug: 'release', name: '解壓笑一個', emoji: '😂', description: '笑一笑，壓力少一半' },
    { slug: 'child-raising', name: '親子舒壓', emoji: '👩‍👧', description: '和孩子一起放鬆的方法' },
    { slug: 'life-inspiration', name: '生活魔法', emoji: '✨', description: '讓生活更輕鬆的小技巧' },
  ],

  // Social links
  social: {
    line: '',
    instagram: '',
    facebook: '',
  },

  // AdSense (待申請)
  adsense: {
    client: '',
    enabled: false,
  },

  // GA4
  analytics: {
    ga4: '',
    fbPixel: '',
  },
};
