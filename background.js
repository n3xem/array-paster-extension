// 拡張機能がインストールされたときに右クリックメニューを作成
chrome.runtime.onInstalled.addListener(() => {
  // メインメニューを作成
  chrome.contextMenus.create({
    id: "arrayPasterMenu",
    title: "Array Paster",
    contexts: ["editable"],
  });

  // 「次の文字列を貼り付け」メニューを作成
  chrome.contextMenus.create({
    id: "pasteNext",
    parentId: "arrayPasterMenu",
    title: "次の文字列を貼り付け",
    contexts: ["editable"],
  });

  // 「すべての文字列を貼り付け」メニューを作成
  chrome.contextMenus.create({
    id: "pasteAll",
    parentId: "arrayPasterMenu",
    title: "すべての文字列を貼り付け（改行区切り）",
    contexts: ["editable"],
  });
});

// コンテキストメニューのクリックイベントを処理
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "pasteNext") {
    // 次の文字列を貼り付け
    pasteNextString(tab);
  } else if (info.menuItemId === "pasteAll") {
    // すべての文字列を貼り付け
    pasteAllStrings(tab);
  }
});

// 次の文字列を貼り付ける関数
function pasteNextString(tab) {
  chrome.storage.local.get(["strings"], function (result) {
    const strings = result.strings || [];

    if (strings.length > 0) {
      // 最初の文字列を取得
      const stringToPaste = strings[0];

      // 残りの文字列を保存
      const remainingStrings = strings.slice(1);
      chrome.storage.local.set({ strings: remainingStrings }, function () {
        // 文字列を貼り付け
        pasteText(tab, stringToPaste);
      });
    }
  });
}

// すべての文字列を改行区切りで貼り付ける関数
function pasteAllStrings(tab) {
  chrome.storage.local.get(["strings"], function (result) {
    const strings = result.strings || [];

    if (strings.length > 0) {
      // 全ての文字列を改行区切りで結合
      const textToPaste = strings.join("\n");

      // 文字列リストをクリア
      chrome.storage.local.set({ strings: [] }, function () {
        // 文字列を貼り付け
        pasteText(tab, textToPaste);
      });
    }
  });
}

// 指定したテキストをアクティブなタブに貼り付ける関数
function pasteText(tab, text) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (textToPaste) => {
      // フォーカスされている要素にテキストを挿入
      const activeElement = document.activeElement;

      if (
        activeElement &&
        (activeElement.isContentEditable ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "INPUT")
      ) {
        // 現在のカーソル位置を取得
        const startPos = activeElement.selectionStart || 0;
        const endPos = activeElement.selectionEnd || 0;

        if (activeElement.isContentEditable) {
          // contentEditableの場合
          document.execCommand("insertText", false, textToPaste);
        } else {
          // input や textarea の場合
          const currentValue = activeElement.value;
          activeElement.value =
            currentValue.substring(0, startPos) +
            textToPaste +
            currentValue.substring(endPos);

          // カーソル位置を更新
          activeElement.selectionStart = activeElement.selectionEnd =
            startPos + textToPaste.length;

          // 変更イベントを発火させる
          const event = new Event("input", { bubbles: true });
          activeElement.dispatchEvent(event);
        }
      }
    },
    args: [text],
  });
}
