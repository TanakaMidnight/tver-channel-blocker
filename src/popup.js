// popup.html用スクリプト

const input = document.getElementById('titleInput');
const addBtn = document.getElementById('addBtn');
const blockList = document.getElementById('blockList');

// エクスポート・インポート用UI追加
let exportBtn = document.getElementById('exportBtn');
let importAddBtn = document.getElementById('importAddBtn');
let importReplaceBtn = document.getElementById('importReplaceBtn');
let importInput = document.getElementById('importInput');
if (!exportBtn) {
  exportBtn = document.createElement('button');
  exportBtn.id = 'exportBtn';
  exportBtn.textContent = 'エクスポート';
  addBtn.parentNode.appendChild(exportBtn);
}
if (!importAddBtn) {
  importAddBtn = document.createElement('button');
  importAddBtn.id = 'importAddBtn';
  importAddBtn.textContent = '追加インポート';
  addBtn.parentNode.appendChild(importAddBtn);
}
if (!importReplaceBtn) {
  importReplaceBtn = document.createElement('button');
  importReplaceBtn.id = 'importReplaceBtn';
  importReplaceBtn.textContent = '全置換インポート';
  addBtn.parentNode.appendChild(importReplaceBtn);
}
if (!importInput) {
  importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = '.json,application/json';
  importInput.style.display = 'none';
  addBtn.parentNode.appendChild(importInput);
}
// エクスポート処理
exportBtn.onclick = () => {
  chrome.storage.local.get({ blockedTitles: [] }, ({ blockedTitles }) => {
    const blob = new Blob([JSON.stringify(blockedTitles, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tver-blocked-titles.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  });
};

// 追加インポート
importAddBtn.onclick = () => {
  importInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const arr = JSON.parse(evt.target.result);
        if (Array.isArray(arr)) {
          chrome.storage.local.get({ blockedTitles: [] }, ({ blockedTitles }) => {
            const merged = Array.from(new Set([...blockedTitles, ...arr]));
            chrome.storage.local.set({ blockedTitles: merged }, () => renderList(merged));
          });
        } else {
          alert('不正なファイル形式です');
        }
      } catch {
        alert('インポート失敗: JSONパースエラー');
      }
    };
    reader.readAsText(file);
    importInput.value = '';
  };
  importInput.click();
};
// 全置換インポート
importReplaceBtn.onclick = () => {
  importInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const arr = JSON.parse(evt.target.result);
        if (Array.isArray(arr)) {
          chrome.storage.local.set({ blockedTitles: arr }, () => renderList(arr));
        } else {
          alert('不正なファイル形式です');
        }
      } catch {
        alert('インポート失敗: JSONパースエラー');
      }
    };
    reader.readAsText(file);
    importInput.value = '';
  };
  importInput.click();
};

function renderList(titles) {
  blockList.innerHTML = '';
  titles.forEach((title, idx) => {
    const li = document.createElement('li');
    li.textContent = title;
    const delBtn = document.createElement('button');
    delBtn.textContent = '削除';
    delBtn.onclick = () => {
      titles.splice(idx, 1);
      chrome.storage.local.set({ blockedTitles: titles }, () => renderList(titles));
    };
    li.appendChild(delBtn);
    blockList.appendChild(li);
  });
}

chrome.storage.local.get({ blockedTitles: [] }, ({ blockedTitles }) => {
  renderList(blockedTitles);
});

addBtn.onclick = () => {
  const title = input.value.trim();
  if (!title) return;
  chrome.storage.local.get({ blockedTitles: [] }, ({ blockedTitles }) => {
    if (!blockedTitles.includes(title)) {
      blockedTitles.push(title);
      chrome.storage.local.set({ blockedTitles }, () => renderList(blockedTitles));
    }
    input.value = '';
  });
};
