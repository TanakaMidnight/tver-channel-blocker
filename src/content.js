window.onload = function () {
  const titles = document.getElementsByTagName("h3");
  if (!localStorage["blockList"]) {
    localStorage["blockList"] = "";
  }
  const blockList = localStorage["blockList"].split(',');
  for (const title of titles) {
    if (blockList.includes(title.innerText)) {
      title.parentNode.parentNode.parentNode.style.display = "none";
    } else {
      const button = document.createElement("button");
      button.innerHTML = "[非表示]";
      button.style.color = "red";
      button.style.zindex = 100;
      button.dataset.channnelTitle = title.innerText

      button.addEventListener("click", addBlockList, true);

      title.parentNode.append(button);
    }
  }
};
function addBlockList(e) {
  this.parentNode.parentNode.parentNode.style.display = "none";
  const blockList = localStorage["blockList"].split(',');
  localStorage["blockList"] = [...blockList,this.dataset.channnelTitle].join(',');
  e.preventDefault();
  return false;
}
