/** 문의하기 — 작성 폼 (검증·첨부 토스트) */
(() => {
  window.EgisInquiryTypes?.bind(
    document.getElementById('inquiry-write-category'),
    document.getElementById('inquiry-write-type'),
    { emptyLabel: '문의 유형을 선택해 주세요.', hideEmptyOption: true },
  );

  const form = document.querySelector('[data-inquiry-write-form]');
  const contentField = document.getElementById('inquiry-write-content');
  const counter = document.querySelector('[data-inquiry-content-count]');
  const imageList = document.querySelector('[data-inquiry-image-list]');
  const addButton = document.querySelector('[data-inquiry-image-add]');
  const fileInput = document.querySelector('[data-inquiry-image-input]');
  const countLabel = document.querySelector('[data-inquiry-image-count]');

  if (!form || !imageList || !addButton || !fileInput || !countLabel) return;

  const MAX_IMAGES = 5;
  const MAX_TOTAL_SIZE = 10 * 1024 * 1024;
  const ACCEPT_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp'];
  const MSG = {
    type: '첨부할 수 없는 파일 형식입니다. PNG, JPG, JPEG, GIF, BMP 파일을 첨부해 주세요.',
    size: '첨부파일의 전체 용량이 10MB를 초과했습니다. 일부 파일을 삭제해 주세요.',
    max: '이미지는 최대 5개까지 첨부할 수 있습니다.',
    duplicate: '이미 첨부된 파일입니다.',
    fail: '파일을 첨부하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  };

  const files = [];
  const fields = {
    category: form.querySelector('[data-inquiry-field="category"]'),
    type: form.querySelector('[data-inquiry-field="type"]'),
    subject: form.querySelector('[data-inquiry-field="subject"]'),
    content: form.querySelector('[data-inquiry-field="content"]'),
  };

  const setError = (wrap, show) => {
    wrap?.classList.toggle('is-error', Boolean(show));
  };

  const clearAllErrors = () => {
    Object.values(fields).forEach((wrap) => setError(wrap, false));
  };

  const validate = () => {
    const category = form.querySelector('#inquiry-write-category')?.value || '';
    const type = form.querySelector('#inquiry-write-type')?.value || '';
    const subject = form.querySelector('#inquiry-write-subject')?.value.trim() || '';
    const content = contentField?.value.trim() || '';

    const errors = {
      category: !category,
      type: !type,
      subject: !subject,
      content: !content,
    };

    setError(fields.category, errors.category);
    setError(fields.type, errors.type);
    setError(fields.subject, errors.subject);
    setError(fields.content, errors.content);

    return !Object.values(errors).some(Boolean);
  };

  const updateContentCount = () => {
    if (!contentField || !counter) return;
    counter.textContent = `${contentField.value.length}/2000`;
  };

  const getTotalSize = () => files.reduce((sum, file) => sum + file.size, 0);

  const updateImageCount = () => {
    const count = files.length;
    if (count === 0) {
      countLabel.textContent = '이미지 등록';
      addButton.setAttribute('aria-label', '이미지 등록');
    } else {
      countLabel.textContent = `${count}/${MAX_IMAGES}`;
      addButton.setAttribute('aria-label', `이미지 추가 ${count}/${MAX_IMAGES}`);
    }
    addButton.hidden = count >= MAX_IMAGES;
    addButton.disabled = count >= MAX_IMAGES;
  };

  const isDuplicate = (file) =>
    files.some(
      (item) =>
        item.name === file.name &&
        item.size === file.size &&
        item.lastModified === file.lastModified,
    );

  const removeFile = (index) => {
    const item = imageList.children[index];
    const preview = item?.querySelector('img');
    if (preview?.src.startsWith('blob:')) {
      URL.revokeObjectURL(preview.src);
    }
    files.splice(index, 1);
    item?.remove();
    updateImageCount();
  };

  const renderFile = (file) => {
    const item = document.createElement('li');
    item.className = 'inquiry-write__image-item';

    const previewWrap = document.createElement('div');
    previewWrap.className = 'inquiry-write__image-preview';

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
    deleteButton.className = 'inquiry-write__image-delete body3-r-14 color-white';
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

      if (isDuplicate(file)) {
        window.Toast?.warning?.(MSG.duplicate);
        continue;
      }

      if (getTotalSize() + file.size > MAX_TOTAL_SIZE) {
        window.Toast?.warning?.(MSG.size);
        break;
      }

      files.push(file);
      if (!renderFile(file)) {
        files.pop();
      }
    }

    updateImageCount();
  };

  contentField?.addEventListener('input', () => {
    updateContentCount();
    if (fields.content?.classList.contains('is-error') && contentField.value.trim()) {
      setError(fields.content, false);
    }
  });
  updateContentCount();

  form.querySelector('#inquiry-write-category')?.addEventListener('change', (e) => {
    if (e.target.value) setError(fields.category, false);
    setError(fields.type, false);
  });
  form.querySelector('#inquiry-write-type')?.addEventListener('change', (e) => {
    if (e.target.value) setError(fields.type, false);
  });
  form.querySelector('#inquiry-write-subject')?.addEventListener('input', (e) => {
    if (e.target.value.trim()) setError(fields.subject, false);
  });

  addButton.addEventListener('click', () => {
    if (files.length >= MAX_IMAGES) {
      window.Toast?.warning?.(MSG.max);
      return;
    }
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    if (!fileInput.files?.length) return;
    addFiles([...fileInput.files]);
    fileInput.value = '';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearAllErrors();

    if (!validate()) {
      window.Toast?.warning?.('필수 입력 항목을 모두 입력해 주세요.');
      form.querySelector('.is-error select, .is-error input, .is-error textarea')?.focus();
      return;
    }

    window.Toast?.show?.('문의가 등록되었습니다.');
  });

  updateImageCount();
})();
