// TVerの特定番組を非表示にするcontent script

// TVerの特定番組を非表示にするcontent script
(function() {


  // クラス名にseriesTitleが含まれる要素のみ対象
  function getSeriesTitleElements() {
    return Array.from(document.querySelectorAll('[class]')).filter(el => {
      return Array.from(el.classList).some(cls => cls.includes('seriesTitle'));
    });
  }

  // 番組タイトル横に「非表示」ボタンを追加
  function addHideButtons(blockedTitles) {
    const items = getSeriesTitleElements();
    items.forEach(item => {
      if (item.dataset.tcbButtonAdded) return;
      const text = item.textContent.trim();
      if (!text || text.length < 2) return;

      // 既にブロック済みなら親要素ごと非表示
      if (blockedTitles.some(title => item.textContent.includes(title))) {
        let target = item;
        // 3階層まで親を遡ってカード要素を探す（必要に応じて調整）
        for (let i = 0; i < 3; i++) {
          if (target.parentElement) target = target.parentElement;
        }
        target.style.display = 'none';
        return;
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" style="vertical-align:middle;"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" fill="none" stroke="#888" stroke-width="2"/><line x1="4" y1="4" x2="20" y2="20" stroke="#d00" stroke-width="2"/></svg>';
      btn.style.background = 'none';
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.style.marginRight = '8px';
      btn.style.padding = '0';
      btn.style.zIndex = '10000';
      btn.onmouseover = () => { btn.firstChild.querySelector('path').setAttribute('stroke', '#d00'); };
      btn.onmouseout = () => { btn.firstChild.querySelector('path').setAttribute('stroke', '#888'); };
      const handleBlock = e => {
        console.log('Blocking:', text);
        e.preventDefault();
        e.stopPropagation();
        const title = item.textContent.trim();
        chrome.storage.local.get({ blockedTitles: [] }, ({ blockedTitles }) => {
          if (!blockedTitles.includes(title)) {
            blockedTitles.push(title);
            chrome.storage.local.set({ blockedTitles });
          }
        });
        // 親要素ごと非表示
        let target = item;
        for (let i = 0; i < 3; i++) {
          if (target.parentElement) target = target.parentElement;
        }
        target.style.display = 'none';
      };
      btn.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); });
      btn.addEventListener('mouseup', e => { e.preventDefault(); e.stopPropagation(); });
      btn.addEventListener('click', handleBlock);
      // 親がaタグの場合はaタグのクリックも止める
      let p = item;
      while (p && p !== document.body) {
        if (p.tagName === 'A') {
          p.addEventListener('click', e => { if (e.target === btn) { e.preventDefault(); e.stopPropagation(); } }, true);
        }
        p = p.parentElement;
      }
      // 親要素のoverflow:hiddenを解除（必要なら）
      if (item.parentElement && getComputedStyle(item.parentElement).overflow === 'hidden') {
        item.parentElement.style.overflow = 'visible';
      }
      item.insertBefore(btn, item.firstChild);
      item.dataset.tcbButtonAdded = '1';
    });
  }

  function update() {
    try {
      chrome.storage && chrome.storage.local.get({ blockedTitles: [] }, ({ blockedTitles }) => {
        addHideButtons(blockedTitles);
      });
    } catch (e) {
      // Extension context invalidated などのエラー時は何もしない
      //console.warn('tver-channel-blocker: context invalidated', e);
    }
  }

  update();
  const observer = new MutationObserver(update);
  observer.observe(document.body, { childList: true, subtree: true });
})();
