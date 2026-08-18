/** Open API 공유 상태 */
window.OpenApi = window.OpenApi || {};

OpenApi.items = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  title: '토지피복 시계열 Open API(1980-2010)',
  tags: ['토지피복', '시계열', 'Open API'],
  views: 675,
  date: '2025.10.27',
  provider: '환경부 · 국립환경과학원',
  format: 'JSON, XML',
}));

const loadRecentIds = () => {
  try {
    return JSON.parse(sessionStorage.getItem('egis-openapi-recent-ids') || '[]');
  } catch {
    return [];
  }
};

OpenApi.state = {
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
    .map((id) => OpenApi.items.find((item) => item.id === Number(id)))
    .filter(Boolean),
};

OpenApi.escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
}[char]));
