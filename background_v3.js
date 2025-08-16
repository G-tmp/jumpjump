let redirectRules = [];

// Initialize rules on startup
updateRules().then(updateDNRRules);


async function updateRules() {
  const data = await browser.storage.local.get("rules");
  redirectRules = data.rules || [];
  console.log("Rules updated:", redirectRules);
}


async function updateDNRRules() {
  // Escape regex special chars in domain and match
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
  // Convert rules to declarativeNetRequest format
  const rules = redirectRules.map((rule, index) => {

    // Build regex filter
    let regex = `^https?://${esc(rule.from)}`;
    if (rule.match) {
      regex += `(?:${esc(rule.match)})(.*)$`; // capture resource name after match
    } else {
      regex += `/(.*)$`; // capture whole path
    }

    // Build substitution
    let substitution = rule.to.endsWith("/") ? `https://${rule.to}\\1` : `https://${rule.to}/\\1`;
    if (rule.parameter) {
      substitution += rule.parameter;
    }

    return {
      id: index + 1,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { regexSubstitution: substitution }
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
  if (area === "local" && changes.rules) {
    updateRules().then(updateDNRRules)
  }
});
