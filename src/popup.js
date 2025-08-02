// popup.html用スクリプト
const input = document.getElementById('titleInput');
const addBtn = document.getElementById('addBtn');
const blockList = document.getElementById('blockList');

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
