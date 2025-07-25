function loadRules() {
  browser.storage.local.get("rules").then((data) => {
    const rules = data.rules || [];
    const list = document.getElementById("rules-list");
    list.innerHTML = "";

    rules.forEach((rule, index) => {
      const item = document.createElement("li");
      item.textContent = `${rule.from} => ${rule.to}`;
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.onclick = () => {
        rules.splice(index, 1);
        browser.storage.local.set({ rules });
        loadRules();
      };
      item.appendChild(delBtn);
      list.appendChild(item);
    });
  });
}

document.getElementById("addBtn").addEventListener("click", (e) => {
  e.preventDefault();
  const from = document.getElementById("from").value.trim();
  const to = document.getElementById("to").value.trim();

  if (from && to) {
    browser.storage.local.get("rules").then((data) => {
      const rules = data.rules || [];
      rules.push({ from, to });
      browser.storage.local.set({ rules });
      loadRules();
    });
  }

  document.getElementById("from").value = "";
  document.getElementById("to").value = "";
});

loadRules();