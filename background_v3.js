let redirectRules = [];

// Initialize rules on startup
updateRules().then(updateDNRRules);


async function updateRules() {
  const data = await browser.storage.sync.get("rules");
  redirectRules = data.rules || [];
  console.log("Rules updated:", redirectRules);
}


async function updateDNRRules() {
  // Escape regex special chars
  const escape = s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

  // Convert rules to declarativeNetRequest format
  const rules = redirectRules.map((rule, index) => {

    // Build matcher: ^https?://<domain><path>(.*)$
    const regex = `^https?:\/\/${escape(rule.domain)}${escape(rule.path)}(.*)$`;

    // Build substitution
    const new_url = `https://${rule.substitution}\\1${rule.extra}`;

    return {
      id: index + 1,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { regexSubstitution: new_url }
      },
      condition: {
        regexFilter: regex,
        resourceTypes: ["main_frame", "sub_frame"] // Adjust resource types as needed
      }
    };
  });

  // Remove old rules and add new ones
  const existing = await browser.declarativeNetRequest.getDynamicRules();
  const existingIds = existing.map(r => r.id);

  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingIds,
    addRules: rules
  });
  console.log("Updated DNR rules:", rules);
}


// Listen for storage changes to update rules dynamically
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.rules) {
    updateRules().then(updateDNRRules)
  }
});
