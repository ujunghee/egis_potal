/**
 * Open API 개발계정 신청 폼
 * 발급 신청 시 공백/미선택 → 필드 에러 + Toast.warning
 */
(function () {
  const form = document.querySelector('[data-oa-apply-form]');
  if (!form) return;

  const PURPOSE_MIN = 20;
  const TOAST_MSG = '필수 입력 항목을 모두 입력해 주세요.';

  const purpose = form.querySelector('#oa-apply-purpose');
  const counter = form.querySelector('[data-oa-apply-purpose-count]');
  const fields = {
    serviceName: form.querySelector('[data-oa-field="serviceName"]'),
    serviceType: form.querySelector('[data-oa-field="serviceType"]'),
    serviceUrl: form.querySelector('[data-oa-field="serviceUrl"]'),
    purpose: form.querySelector('[data-oa-field="purpose"]'),
    agree: form.querySelector('[data-oa-field="agree"]'),
  };

  const syncCounter = () => {
    if (!purpose || !counter) return;
    counter.textContent = `${purpose.value.length}/400`;
  };

  const setError = (wrap, show) => {
    wrap?.classList.toggle('is-error', Boolean(show));
  };

  const clearAllErrors = () => {
    Object.values(fields).forEach((wrap) => setError(wrap, false));
  };

  const validate = () => {
    const name = form.querySelector('#oa-apply-service-name')?.value.trim() || '';
    const type = form.querySelector('#oa-apply-service-type')?.value || '';
    const url = form.querySelector('#oa-apply-service-url')?.value.trim() || '';
    const purposeValue = purpose?.value.trim() || '';
    const agreePolicy = form.querySelector('#oa-apply-agree-policy')?.checked;
    const agreeLicense = form.querySelector('#oa-apply-agree-license')?.checked;

    const errors = {
      serviceName: !name,
      serviceType: !type,
      serviceUrl: !url,
      purpose: purposeValue.length < PURPOSE_MIN,
      agree: !agreePolicy || !agreeLicense,
    };

    setError(fields.serviceName, errors.serviceName);
    setError(fields.serviceType, errors.serviceType);
    setError(fields.serviceUrl, errors.serviceUrl);
    setError(fields.purpose, errors.purpose);
    setError(fields.agree, errors.agree);

    return !Object.values(errors).some(Boolean);
  };

  purpose?.addEventListener('input', () => {
    syncCounter();
    if (fields.purpose?.classList.contains('is-error') && purpose.value.trim().length >= PURPOSE_MIN) {
      setError(fields.purpose, false);
    }
  });

  form.querySelector('#oa-apply-service-name')?.addEventListener('input', (e) => {
    if (e.target.value.trim()) setError(fields.serviceName, false);
  });
  form.querySelector('#oa-apply-service-type')?.addEventListener('change', (e) => {
    if (e.target.value) setError(fields.serviceType, false);
  });
  form.querySelector('#oa-apply-service-url')?.addEventListener('input', (e) => {
    if (e.target.value.trim()) setError(fields.serviceUrl, false);
  });
  form.querySelectorAll('.oa-apply__agree-item').forEach((item) => {
    item.addEventListener('change', () => {
      const policy = form.querySelector('#oa-apply-agree-policy')?.checked;
      const license = form.querySelector('#oa-apply-agree-license')?.checked;
      if (policy && license) setError(fields.agree, false);
    });
  });

  syncCounter();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearAllErrors();

    if (!validate()) {
      window.Toast?.warning?.(TOAST_MSG);
      form.querySelector('.is-error input, .is-error select, .is-error textarea')?.focus();
      return;
    }

    window.Toast?.show?.('개발계정 발급 신청이 접수되었습니다.');
  });
})();
