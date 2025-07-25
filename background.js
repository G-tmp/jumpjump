let redirectRules = [];

function updateRules() {
  browser.storage.local.get("rules").then((data) => {
    redirectRules = data.rules || [];
    console.log("Rules updated:", redirectRules);
  });
}

// Listen for changes to storage and reload rules
browser.storage.onChanged.addListener(updateRules);

// Initial load
updateRules();

browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    const url = new URL(details.url);

    for (let rule of redirectRules) {
      if (url.hostname === rule.from) {
        const newUrl = details.url.replace(rule.from, rule.to);
        console.log(`Redirecting ${details.url} to ${newUrl}`);

        browser.tabs.update(details.tabId, { url: newUrl });
        return { cancel: true };
      }
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);
