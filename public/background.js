chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: "https://kamilrizatdinov.github.io/reader_line/welcome",
    });
  }

  if (
    details.reason === chrome.runtime.OnInstalledReason.INSTALL ||
    details.reason === chrome.runtime.OnInstalledReason.UPDATE
  ) {
    injectIntoOpenTabs();
  }
});

chrome.runtime.setUninstallURL("https://kamilrizatdinov.github.io/reader_line/goodbye");

// Tabs opened before install or update do not have the content script yet
// (or have an outdated copy). Inject it once into every frame; the script
// itself ignores repeated runs.
async function injectIntoOpenTabs() {
  const contentScript = chrome.runtime.getManifest().content_scripts?.[0];
  if (!contentScript) return;

  const tabs = await chrome.tabs.query({ url: contentScript.matches });
  await Promise.all(
    tabs.map((tab) =>
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id, allFrames: true },
          files: contentScript.js,
        })
        .catch(() => {
          // Restricted pages (Chrome Web Store), discarded tabs, etc.
        })
    )
  );
}
