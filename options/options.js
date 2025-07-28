
function buildRuleObject() {
  const from = document.getElementById("from").value.trim();
  const match = document.getElementById("match").value.trim();
  const to = document.getElementById("to").value.trim();
  const parameter = document.getElementById("parameter").value.trim();

  if (!from || !to) {
    return null;
  }

  return { from, match, to, parameter };
}


function loadRules() {
  browser.storage.local.get("rules").then((data) => {
    const rules = data.rules || [];
    const list = document.getElementById("rules-list");
    list.innerHTML = "";

    rules.forEach((rule, index) => {
      const item = document.createElement("li");
      item.textContent = `${rule.from}${rule.match} => ${rule.to} ${rule.parameter}`;

      const modifyBtn = document.createElement("button");
      modifyBtn.textContent = "Modify";
      modifyBtn.onclick = (e) => {
        e.preventDefault();

        // Fill the form for editing
        from.value = rule.from;
        match.value = rule.match;
        to.value = rule.to;
        parameter.value = rule.parameter;

        // Change submit behavior to save the modified rule
        document.getElementById("rule-form").onsubmit = (e) => {
          // e.preventDefault();

          const newRule = buildRuleObject();
          if (!newRule) 
            return;

          browser.storage.local.get("rules").then((data) => {
            const rules = data.rules || [];
            rules[index] = newRule;
            browser.storage.local.set({ rules }).then(() => {
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
        browser.storage.local.set({ rules }).then(loadRules());
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

  browser.storage.local.get("rules").then((data) => {
    const rules = data.rules || [];
    rules.push(newRule);
    browser.storage.local.set({ rules }).then(() => {
      loadRules();
      clear();
    });
  });
  
};


function clear(){
  from.value = "";
  match.value = "";
  to.value = "";
  parameter.value = "";
}


document.getElementById("clearBtn").onclick = (e)=> {
  e.preventDefault();
  clear();
}


loadRules();