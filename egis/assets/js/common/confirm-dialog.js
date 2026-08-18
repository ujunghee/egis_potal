/**
 * 가운데 확인 팝업 — login-required-modal 스타일 재사용.
 * ConfirmDialog.show({ title, description, cancelText, confirmText, confirmVariant, showIcon, onConfirm })
 * confirmVariant: 'primary'(기본 파란 버튼) | 'danger'(빨간 삭제 버튼)
 * showIcon: 미지정 시 danger일 때만 alert 아이콘 표시
 */
window.ConfirmDialog = (() => {
  let modal = null;
  let onConfirmCb = null;

  const ensure = () => {
    if (modal) return modal;

    modal = document.createElement('dialog');
    modal.className = 'login-required-modal';
    modal.setAttribute('data-confirm-dialog', '');
    modal.setAttribute('aria-labelledby', 'confirm-dialog-title');
    modal.setAttribute('aria-describedby', 'confirm-dialog-desc');
    modal.innerHTML = `
      <div class="flex flex-col gap-24 align-center">
        <div class="flex flex-col gap-12 align-center w-full">
          <i class="alert-icon-36" data-confirm-icon aria-hidden="true" hidden></i>
          <div class="flex flex-col gap-4 align-center w-full text-center">
            <p id="confirm-dialog-title" class="body1-sb-18 color-slate-900" data-confirm-title></p>
            <p id="confirm-dialog-desc" class="body2-r-16 color-slate-700 login-required-modal__desc" data-confirm-desc hidden></p>
          </div>
        </div>
        <div class="flex align-center justify-center gap-8 w-full">
          <button type="button" class="border-slate-button-40 login-required-modal__close" data-confirm-cancel>취소</button>
          <button type="button" class="blue-button-40 login-required-modal__confirm" data-confirm-ok>확인</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('[data-confirm-cancel]')?.addEventListener('click', () => modal.close());
    modal.querySelector('[data-confirm-ok]')?.addEventListener('click', () => {
      const cb = onConfirmCb;
      modal.close();
      cb?.();
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close();
    });
    modal.addEventListener('close', () => {
      onConfirmCb = null;
    });

    return modal;
  };

  const show = ({
    title = '',
    description = '',
    cancelText = '취소',
    confirmText = '확인',
    confirmVariant = 'primary',
    showIcon,
    onConfirm,
  } = {}) => {
    const el = ensure();
    const iconEl = el.querySelector('[data-confirm-icon]');
    const titleEl = el.querySelector('[data-confirm-title]');
    const descEl = el.querySelector('[data-confirm-desc]');
    const cancelBtn = el.querySelector('[data-confirm-cancel]');
    const okBtn = el.querySelector('[data-confirm-ok]');
    const withIcon = typeof showIcon === 'boolean' ? showIcon : confirmVariant === 'danger';

    if (iconEl) {
      iconEl.hidden = !withIcon;
      iconEl.style.display = withIcon ? '' : 'none';
      iconEl.classList.toggle('alert-icon-36', confirmVariant !== 'danger');
      iconEl.classList.toggle('alert-danger-icon-36', confirmVariant === 'danger');
    }
    if (titleEl) titleEl.textContent = title;
    if (descEl) {
      descEl.textContent = description;
      descEl.hidden = !description;
    }
    if (cancelBtn) cancelBtn.textContent = cancelText;
    if (okBtn) {
      okBtn.textContent = confirmText;
      okBtn.classList.toggle('blue-button-40', confirmVariant !== 'danger');
      okBtn.classList.toggle('login-required-modal__confirm--danger', confirmVariant === 'danger');
    }
    onConfirmCb = typeof onConfirm === 'function' ? onConfirm : null;

    if (typeof el.showModal === 'function') el.showModal();
    else el.setAttribute('open', '');
  };

  return { show };
})();
