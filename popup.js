document.addEventListener("DOMContentLoaded", function () {
  const inputStrings = document.getElementById("inputStrings");
  const addBtn = document.getElementById("addBtn");
  const clearBtn = document.getElementById("clearBtn");
  const stringsContainer = document.getElementById("stringsContainer");

  // 保存された文字列を読み込む
  loadStrings();

  // 文字列追加ボタンのイベントリスナー
  addBtn.addEventListener("click", function () {
    const textValue = inputStrings.value.trim();
    if (textValue) {
      // 改行で分割して配列に変換
      const newStrings = textValue
        .split("\n")
        .filter((str) => str.trim() !== "");

      // 既存の文字列配列を取得
      chrome.storage.local.get(["strings"], function (result) {
        let strings = result.strings || [];

        // 新しい文字列を追加
        strings = strings.concat(newStrings);

        // 保存
        chrome.storage.local.set({ strings: strings }, function () {
          // 入力フィールドをクリア
          inputStrings.value = "";

          // 表示を更新
          loadStrings();
        });
      });
    }
  });

  // クリアボタンのイベントリスナー
  clearBtn.addEventListener("click", function () {
    // 保存されている文字列をクリア
    chrome.storage.local.set({ strings: [] }, function () {
      // 表示を更新
      loadStrings();
    });
  });

  // 文字列リストを読み込んで表示する関数
  function loadStrings() {
    chrome.storage.local.get(["strings"], function (result) {
      const strings = result.strings || [];

      // コンテナをクリア
      stringsContainer.innerHTML = "";

      if (strings.length === 0) {
        stringsContainer.innerHTML = "<p>登録された文字列はありません</p>";
      } else {
        // 各文字列をリストアイテムとして追加
        strings.forEach(function (str, index) {
          const item = document.createElement("div");
          item.className = "string-item";

          const text = document.createElement("div");
          text.className = "string-text";
          text.textContent = str;
          item.appendChild(text);

          const removeBtn = document.createElement("button");
          removeBtn.className = "remove-btn";
          removeBtn.textContent = "削除";
          removeBtn.addEventListener("click", function () {
            removeString(index);
          });
          item.appendChild(removeBtn);

          stringsContainer.appendChild(item);
        });
      }
    });
  }

  // 特定のインデックスの文字列を削除する関数
  function removeString(index) {
    chrome.storage.local.get(["strings"], function (result) {
      let strings = result.strings || [];

      // インデックスの文字列を削除
      strings.splice(index, 1);

      // 保存
      chrome.storage.local.set({ strings: strings }, function () {
        // 表示を更新
        loadStrings();
      });
    });
  }
});
