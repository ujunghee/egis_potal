/** Fragment 삽입 후 기능 스크립트를 지정된 순서대로 실행합니다. */
window.ScriptLoader = {
  async loadSequentially(sources) {
    for (const source of sources) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = source;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`스크립트를 불러오지 못했습니다: ${source}`));
        document.body.appendChild(script);
      });
    }
  },
};
