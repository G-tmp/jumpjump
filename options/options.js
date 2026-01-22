
function buildRuleObject() {
  const domain = document.getElementById("domain").value.trim();
  const path = document.getElementById("path").value.trim();
  const substitution = document.getElementById("substitution").value.trim();
  const extra = document.getElementById("extra").value.trim();

  if (!domain || !substitution) {
    return null;
  }

  return { domain, path, substitution, extra };
}


function loadRules() {
  browser.storage.sync.get("rules").then((data) => {
    const rules = data.rules || [];
    const list = document.getElementById("rules-list");
    list.innerHTML = "";

    rules.forEach((rule, index) => {
      const item = document.createElement("li");
      item.textContent = `${rule.domain}${rule.path} => ${rule.substitution} ${rule.extra}`;

      const modifyBtn = document.createElement("button");
      modifyBtn.textContent = "Modify";
      modifyBtn.onclick = (e) => {
        e.preventDefault();

        // Fill the form for editing
        domain.value = rule.domain;
        path.value = rule.path;
        substitution.value = rule.substitution;
        extra.value = rule.extra;

        // Change submit behavior to save the modified rule
        document.getElementById("rule-form").onsubmit = (e) => {
          // e.preventDefault();

          const newRule = buildRuleObject();
          if (!newRule) 
            return;

          browser.storage.sync.get("rules").then((data) => {
            const rules = data.rules || [];
            rules[index] = newRule;
            browser.storage.sync.set({ rules }).then(() => {
              loadRules();
              clear();
            });
          });
        };
      };

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.onclick = () => {
        rules.splice(index, 1);
        browser.storage.sync.set({ rules }).then(loadRules());
      };
      
      item.appendChild(modifyBtn);
      item.appendChild(delBtn);
      list.appendChild(item);
    });
  });
}


document.getElementById("rule-form").onsubmit = (e) => {
  e.preventDefault();

  const newRule = buildRuleObject();
  if (!newRule) 
    return;

  browser.storage.sync.get("rules").then((data) => {
    const rules = data.rules || [];
    rules.push(newRule);
    browser.storage.sync.set({ rules }).then(() => {
      loadRules();
      clear();
    });
  });
  
};


function clear(){
  domain.value = "";
  path.value = "";
  substitution.value = "";
  extra.value = "";
}


document.getElementById("clearBtn").onclick = (e)=> {
  e.preventDefault();
  clear();
}


loadRules();