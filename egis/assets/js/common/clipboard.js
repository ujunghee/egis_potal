/**
 * 공용 클립보드 복사
 *
 *   await EgisClipboard.copy('복사할 문자열');
 *
 * navigator.clipboard 는 보안 컨텍스트(https, localhost, 127.0.0.1, file)에서만 존재합니다.
 * 사내망 IP처럼 평문 http로 띄운 화면이나 clipboard-write 권한이 없는 iframe에서도
 * 복사가 되도록 textarea + execCommand 방식을 폴백으로 둡니다.
 */
(() => {
  const copyByExecCommand = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    const selection = document.getSelection();
    const savedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    textarea.select();
    textarea.setSelectionRange(0, text.length);

    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }

    textarea.remove();

    /* 사용자가 페이지에서 선택해 둔 영역을 되돌려 놓는다. */
    if (savedRange) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }

    return copied;
  };

  const copy = async (text) => {
    const value = String(text ?? '');
    if (!value) return false;

    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return copyByExecCommand(value);
    }
  };

  window.EgisClipboard = { copy };
})();
