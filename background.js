let redirectRules = [];


// Initial load
updateRules().then(updateListener);


async function updateRules() {
  const data = await browser.storage.local.get("rules");
  redirectRules = data.rules || [];
  console.log("Rules updated:", redirectRules);
}


function updateListener() {
  // Remove old listener first
  browser.webRequest.onBeforeRequest.removeListener(handleRequest);

  // Convert rules into filters
  const urls = redirectRules.filter(rule => rule.domain != "").map(rule => `*://${rule.domain}/*`);
  console.log("match urls:", urls);

  // Add new listener
  if (urls.length > 0) {
    browser.webRequest.onBeforeRequest.addListener(
      handleRequest,
      { urls },
      ["blocking"]
    );
  }
}


// Listen for changes to storage and reload rules
browser.storage.onChanged.addListener(async () => {
  await updateRules();
  updateListener();
});


function handleRequest(details) {
  const url = new URL(details.url);

  for (let rule of redirectRules) {
    if (url.hostname === rule.domain && url.pathname.includes(rule.path)) {
      const newUrl = details.url.replace(rule.domain + rule.path, rule.substitution) + rule.extra;
      console.log(`${url} => ${newUrl}`);

      browser.tabs.update(details.tabId, { url: newUrl });
      return { cancel: true };
    }
  }
}
