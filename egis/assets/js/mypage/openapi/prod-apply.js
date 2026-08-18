/**
 * Open API 운영계정 신청 — 유효성(Figma 1749:3290) · 이미지 첨부 · 제출
 * Figma: 1226:2329 / 1749:3290
 */
(() => {
  const form = document.querySelector('[data-oa-prod-form]');
  if (!form) return;

  const DESC_MIN = 20;
  const TOAST_MSG = '필수 입력 항목을 모두 입력해 주세요.';

  const desc = form.querySelector('[data-oa-prod-desc]');
  const count = form.querySelector('[data-oa-prod-count]');
  const startInput = form.querySelector('[data-oa-prod-start-date]');
  const imageList = form.querySelector('[data-oa-prod-image-list]');
  const addButton = form.querySelector('[data-oa-prod-image-add]');
  const fileInput = form.querySelector('[data-oa-prod-image-input]');
  const countLabel = form.querySelector('[data-oa-prod-image-count]');

  const fields = {
    serviceName: form.querySelector('[data-oa-prod-field="serviceName"]'),
    category: form.querySelector('[data-oa-prod-field="category"]'),
    devType: form.querySelector('[data-oa-prod-field="devType"]'),
    applicant: form.querySelector('[data-oa-prod-field="applicant"]'),
    serviceUrl: form.querySelector('[data-oa-prod-field="serviceUrl"]'),
    startDate: form.querySelector('[data-oa-prod-field="startDate"]'),
    description: form.querySelector('[data-oa-prod-field="description"]'),
  };

  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
  const ACCEPT_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp'];
  const MSG = {
    type: '첨부할 수 없는 파일 형식입니다. PNG, JPG, JPEG, GIF, BMP 파일을 첨부해 주세요.',
    fileSize: '파일당 최대 10MB까지 첨부할 수 있습니다.',
    size: '첨부파일의 전체 용량이 50MB를 초과했습니다. 일부 파일을 삭제해 주세요.',
    max: '이미지는 최대 5개까지 첨부할 수 있습니다.',
    duplicate: '이미 첨부된 파일입니다.',
    fail: '파일을 첨부하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  };

  const files = [];

  if (typeof window.initPicker === 'function' && startInput) {
    window.initPicker(startInput.id, {
      onChange: () => {
        if (startInput.value.trim()) setError(fields.startDate, false);
      },
    });
  }

  const setError = (wrap, show) => {
    wrap?.classList.toggle('is-error', Boolean(show));
  };

  const clearAllErrors = () => {
    Object.values(fields).forEach((wrap) => setError(wrap, false));
  };

  const validate = () => {
    const serviceName = form.querySelector('[data-oa-prod-service-name]')?.value.trim() || '';
    const category = form.querySelector('[data-oa-prod-category]')?.value || '';
    const devType = form.querySelector('[data-oa-prod-dev-type]')?.value || '';
    const applicant = form.querySelector('[data-oa-prod-applicant]')?.value || '';
    const serviceUrl = form.querySelector('[data-oa-prod-service-url]')?.value.trim() || '';
    const startDate = startInput?.value.trim() || '';
    const description = desc?.value.trim() || '';

    const errors = {
      serviceName: !serviceName,
      category: !category,
      devType: !devType,
      applicant: !applicant,
      serviceUrl: !serviceUrl,
      startDate: !startDate,
      description: description.length < DESC_MIN,
    };

    setError(fields.serviceName, errors.serviceName);
    setError(fields.category, errors.category);
    setError(fields.devType, errors.devType);
    setError(fields.applicant, errors.applicant);
    setError(fields.serviceUrl, errors.serviceUrl);
    setError(fields.startDate, errors.startDate);
    setError(fields.description, errors.description);

    return !Object.values(errors).some(Boolean);
  };

  const syncCount = () => {
    if (!desc || !count) return;
    count.textContent = String(desc.value.length);
  };

  desc?.addEventListener('input', () => {
    syncCount();
    if (fields.description?.classList.contains('is-error') && desc.value.trim().length >= DESC_MIN) {
      setError(fields.description, false);
    }
  });
  syncCount();

  form.querySelector('[data-oa-prod-service-name]')?.addEventListener('input', (e) => {
    if (e.target.value.trim()) setError(fields.serviceName, false);
  });
  form.querySelector('[data-oa-prod-category]')?.addEventListener('change', (e) => {
    if (e.target.value) setError(fields.category, false);
  });
  form.querySelector('[data-oa-prod-dev-type]')?.addEventListener('change', (e) => {
    if (e.target.value) setError(fields.devType, false);
  });
  form.querySelector('[data-oa-prod-applicant]')?.addEventListener('change', (e) => {
    if (e.target.value) setError(fields.applicant, false);
  });
  form.querySelector('[data-oa-prod-service-url]')?.addEventListener('input', (e) => {
    if (e.target.value.trim()) setError(fields.serviceUrl, false);
  });
  startInput?.addEventListener('change', () => {
    if (startInput.value.trim()) setError(fields.startDate, false);
  });
  startInput?.addEventListener('input', () => {
    if (startInput.value.trim()) setError(fields.startDate, false);
  });

  const getTotalSize = () => files.reduce((sum, file) => sum + file.size, 0);

  const updateImageCount = () => {
    if (!countLabel || !addButton) return;
    countLabel.textContent = `${files.length}/${MAX_IMAGES}`;
    addButton.hidden = files.length >= MAX_IMAGES;
    addButton.disabled = files.length >= MAX_IMAGES;
  };

  const isDuplicate = (file) =>
    files.some(
      (item) =>
        item.name === file.name &&
        item.size === file.size &&
        item.lastModified === file.lastModified,
    );

  const removeFile = (index) => {
    const item = imageList?.children[index];
    const preview = item?.querySelector('img');
    if (preview?.src.startsWith('blob:')) {
      URL.revokeObjectURL(preview.src);
    }
    files.splice(index, 1);
    item?.remove();
    updateImageCount();
  };

  const renderFile = (file) => {
    if (!imageList) return false;

    const item = document.createElement('li');
    item.className = 'oa-prod__image-item';

    const previewWrap = document.createElement('div');
    previewWrap.className = 'oa-prod__image-preview';

    const image = document.createElement('img');
    try {
      image.src = URL.createObjectURL(file);
    } catch {
      window.Toast?.error?.(MSG.fail);
      return false;
    }
    image.alt = file.name;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'oa-prod__image-delete body3-m-14 color-white';
    deleteButton.textContent = '삭제';
    deleteButton.addEventListener('click', () => {
      const currentIndex = [...imageList.children].indexOf(item);
      if (currentIndex >= 0) removeFile(currentIndex);
    });

    previewWrap.append(image, deleteButton);
    item.append(previewWrap);
    imageList.append(item);
    return true;
  };

  const addFiles = (selectedFiles) => {
    for (const file of selectedFiles) {
      if (files.length >= MAX_IMAGES) {
        window.Toast?.warning?.(MSG.max);
        break;
      }
      if (!ACCEPT_TYPES.includes(file.type)) {
        window.Toast?.warning?.(MSG.type);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        window.Toast?.warning?.(MSG.fileSize);
        continue;
      }
      if (isDuplicate(file)) {
        window.Toast?.warning?.(MSG.duplicate);
        continue;
      }
      if (getTotalSize() + file.size > MAX_TOTAL_SIZE) {
        window.Toast?.warning?.(MSG.size);
        break;
      }

      files.push(file);
      if (!renderFile(file)) files.pop();
    }
    updateImageCount();
  };

  addButton?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => {
    addFiles([...fileInput.files]);
    fileInput.value = '';
  });
  updateImageCount();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearAllErrors();

    if (!validate()) {
      window.Toast?.warning?.(TOAST_MSG);
      form.querySelector('.is-error input, .is-error select, .is-error textarea')?.focus();
      return;
    }

    window.Toast?.warning?.('운영계정 신청이 완료되었습니다.');
    window.setTimeout(() => {
      window.location.href = './prod-detail-review.html';
    }, 1200);
  });
})();
