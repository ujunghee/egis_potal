/** 주제별지도 공유 상태 */
window.Topical = window.Topical || {};

Topical.items = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  title: '토지피복 시계열 변화량(1980-2010)',
  tags: ['토지피복', '시계열 변화', '토지피복 변화량'],
  views: 675,
  date: '2025.10.27',
  provider: '환경부 · 국립환경과학원',
  format: 'SHP, CSV',
}));

const loadRecentIds = () => {
  try {
    return JSON.parse(sessionStorage.getItem('egis-topical-recent-ids') || '[]');
  } catch {
    return [];
  }
};

Topical.state = {
  conditions: [
    { operator: 'AND', keyword: '도로' },
    { operator: 'OR', keyword: '도로' },
    { operator: 'NOT', keyword: '도로' },
  ],
  view: 'card',
  favView: 'card',
  pinned: new Set(),
  favorites: new Set(),
  recent: loadRecentIds()
    .map((id) => Topical.items.find((item) => item.id === Number(id)))
    .filter(Boolean),
};

Topical.escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
}[char]));
