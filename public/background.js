chrome.runtime.onInstalled.addListener((details) => { 
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: "https://kamilrizatdinov.github.io/reader_line/welcome",
    });
  } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) { 
    // When extension is updated
  } else if ( details.reason === chrome.runtime.OnInstalledReason.CHROME_UPDATE) {
    // When browser is updated
  } else if (details.reason === chrome.runtime.OnInstalledReason.SHARED_MODULE_UPDATE) {
    // When a shared module is updated
  }
});

chrome.runtime.setUninstallURL("https://kamilrizatdinov.github.io/reader_line/goodbye");