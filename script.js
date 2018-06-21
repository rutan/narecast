(() => {
  const button = document.querySelector('.main button');
  function enableButton() {
    button.removeAttribute('disabled');
  }
  function disableButton() {
    button.setAttribute('disabled', 'disabled');
  }

  const form = document.querySelector(".main");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const value = document.querySelector(".input-area").value.trim();
    if (value.length === 0) return;
    disableButton();

    fetch(`/api/converted_list?id=${value}`)
      .then(res => res.json())
      .then(json => {
        if (json.error) {
          switch (json.error.reason) {
            case "unsupported_item":
              alert(
                "ごめんなさい、ニコナレのスライド作成機能で作ったスライドには非対応です＞＜"
              );
              break;
            case "invalid_content":
            default:
              alert(
                "ごめんなさい、コンテンツの取得ができませんでした＞＜\n（たとえば非公開のものは取得できないです）"
              );
              break;
          }
          enableButton();
          return;
        }
        enableButton();

        const text = `"whiteboard": {
  "urls": [
${json.urls.map(u => `    "${u}"`).join(",\n")}
  ]
}`;
        const textarea = document.querySelector(".output-area");
        textarea.value = text;
        textarea.select();
      })
      .catch(e => {
        console.error(e);
        enableButton();
        alert("ごめんなさい＞＜\nエラーが発生してしましました");
      });
  });

  const textarea = document.querySelector(".output-area");
  textarea.addEventListener("focus", () => {
    textarea.select();
  });
})();
