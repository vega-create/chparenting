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
    { text: '育兒崩潰', href: '/category/parenting-crisis/', emoji: '🔥' },
    { text: '媽媽情緒', href: '/category/mom-emotions/', emoji: '💛' },
    { text: '親子關係', href: '/category/parent-child/', emoji: '👩‍👧' },
    { text: '生活實用', href: '/category/practical-life/', emoji: '✨' },
    { text: '關於我', href: '/about/', emoji: '💛' },
  ],

  // Content categories
  categories: [
    { slug: 'parenting-crisis', name: '育兒崩潰', emoji: '🔥', description: '育兒難題的實用解答' },
    { slug: 'mom-emotions', name: '媽媽情緒', emoji: '💛', description: '你的辛苦，我都懂' },
    { slug: 'parent-child', name: '親子關係', emoji: '👩‍👧', description: '更好的教養從理解開始' },
    { slug: 'practical-life', name: '生活實用', emoji: '✨', description: '媽媽必備的實用資訊' },
  ],

  // Social links
  social: {
    line: '',
    instagram: '',
    facebook: '',
  },

  // AdSense 
  adsense: {
    client: 'ca-pub-3493526929407874',
    enabled: true,
  },

  // GA4
  analytics: {
    ga4: 'G-C0SFWXX8Q0',
    fbPixel: '',
  },
};
