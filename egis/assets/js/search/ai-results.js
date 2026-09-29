/** AI 검색 결과 — URL 질의·목업 답변·근거 데이터셋 (jQuery) */
jQuery(function ($) {
  const DEFAULT_QUERY = '태양광 발전량 분석에 필요한 데이터는?';

  const MOCK_ANSWER = {
    lead: '제주 태양광 발전량은 최근 5년간 꾸준히 늘었고, 이를 확인하려면 연도별 발전 실적 시계열 데이터가 필요합니다.',
    body: [
      '설비 용량 증가와 발전량 변화를 함께 보려면 연도별 발전 실적과 재생에너지 설비 현황 데이터를 결합하세요.',
      '발전 효율 변화까지 보려면 앞서 활용한 일사량 관측자료를 함께 참고할 수 있습니다.',
    ],
    provider: '한국전력거래소',
    criteria: '관련성·최신성·활용 가능성',
    scope: '포털에 등록된 공개 데이터',
    followups: [
      '최근 5년간 제주 태양광 발전량 추이를 보여줘',
      '태양광 발전량에 영향을 미치는 기상 요인은 무엇이야?',
      '제주 지역별 태양광 발전량을 비교하려면 어떤 데이터가 필요해?',
      '설비 용량 대비 발전 효율을 분석하려면 어떤 데이터를 함께 봐야 해?',
      '추천한 데이터셋으로 어떤 분석을 할 수 있어?',
    ],
    conditions: [
      { label: '분석 목적', value: '태양광 발전량 분석' },
      { label: '대상지역', value: '제주특별자치도' },
      { label: '핵심주제', value: '태양광 발전량' },
      { label: '분석 기간', value: '기간 미지정' },
    ],
  };

  const DATASET_ITEMS = [
    {
      id: 'ai-ds-1',
      tags: ['토지피복', '시계열 변화', '토지피복 변화량'],
      title: '토지피복 시계열 변화량(1980-2010)',
      date: '2025.10.27',
      provider: '환경부 · 국립환경과학원',
      format: 'SHP, CSV',
      views: 675,
    },
    {
      id: 'ai-ds-2',
      tags: ['토지피복', '시계열 변화', '토지피복 변화량'],
      title: '토지피복 시계열 변화량(1980-2010)',
      date: '2025.10.27',
      provider: '환경부 · 국립환경과학원',
      format: 'SHP, CSV',
      views: 675,
    },
    {
      id: 'ai-ds-3',
      tags: ['토지피복', '시계열 변화', '토지피복 변화량'],
      title: '토지피복 시계열 변화량(1980-2010)',
      date: '2025.10.27',
      provider: '환경부 · 국립환경과학원',
      format: 'SHP, CSV',
      views: 675,
    },
    {
      id: 'ai-ds-4',
      tags: ['토지피복', '시계열 변화', '토지피복 변화량'],
      title: '토지피복 시계열 변화량(1980-2010)',
      date: '2025.10.27',
      provider: '환경부 · 국립환경과학원',
      format: 'SHP, CSV',
      views: 675,
    },
    {
      id: 'ai-ds-5',
      tags: ['토지피복', '시계열 변화', '토지피복 변화량'],
      title: '토지피복 시계열 변화량(1980-2010)',
      date: '2025.10.27',
      provider: '환경부 · 국립환경과학원',
      format: 'SHP, CSV',
      views: 675,
    },
  ];

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q')?.trim() || DEFAULT_QUERY;

  const $bubble = $('[data-ai-query-bubble]');
  const $lead = $('[data-ai-answer-lead]');
  const $body = $('[data-ai-answer-body]');
  const $provider = $('[data-ai-meta-provider]');
  const $criteria = $('[data-ai-meta-criteria]');
  const $scope = $('[data-ai-meta-scope]');
  const $followupList = $('[data-ai-followup-list]');
  const $conditionsList = $('[data-ai-conditions]');
  const $countEl = $('[data-ai-dataset-count]');
  const $composerInput = $('#search-ai-composer-input');
  const $composerForm = $('[data-ai-composer-form]');

  const escape = (value) =>
    String(value).replace(/[&<>"']/g, (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[char],
    );

  if ($bubble.length) $bubble.text(query);
  if ($lead.length) $lead.text(MOCK_ANSWER.lead);
  if ($body.length) {
    $body.html(MOCK_ANSWER.body.map((line) => `<p>${escape(line)}</p>`).join(''));
  }
  if ($provider.length) $provider.text(MOCK_ANSWER.provider);
  if ($criteria.length) $criteria.text(MOCK_ANSWER.criteria);
  if ($scope.length) $scope.text(MOCK_ANSWER.scope);

  if ($followupList.length) {
    $followupList.html(
      MOCK_ANSWER.followups
        .map(
          (text, index) => `
      <li>
        <button type="button" class="search-ai__followup-btn body2-r-16${index === 3 ? ' is-full' : ''}">${escape(text)}</button>
      </li>`,
        )
        .join(''),
    );

    $followupList.on('click', (event) => {
      const $btn = $(event.target).closest('.search-ai__followup-btn');
      if (!$btn.length || !$composerInput.length) return;
      $composerInput.val($btn.text().trim());
      $composerInput.trigger('focus');
    });
  }

  if ($conditionsList.length) {
    $conditionsList.html(
      MOCK_ANSWER.conditions
        .map(
          (item) => `
      <li class="search-ai__condition body3-r-14 color-slate-700">
        <span>${escape(item.label)}</span>
        <span class="body3-m-14 color-slate-900">${escape(item.value)}</span>
      </li>`,
        )
        .join(''),
    );
  }

  if ($countEl.length) $countEl.text(String(DATASET_ITEMS.length));

  if (window.SearchListing) {
    SearchListing.init('[data-ai-dataset-list]', DATASET_ITEMS, { quickMenu: true });
  }

  if ($composerForm.length) {
    $composerForm.on('submit', (event) => {
      const next = $composerInput.val()?.trim();
      if (!next) {
        event.preventDefault();
        $composerInput.trigger('focus');
      }
    });
  }

  document.title = `AI 검색 결과 | ${query.slice(0, 20)}${query.length > 20 ? '…' : ''}`;
});
