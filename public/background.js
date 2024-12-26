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

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.type && message.type === 'openPopup') {
    chrome.action.openPopup()
    sendResponse({status: "OK"})
  }
})

chrome.runtime.setUninstallURL("https://kamilrizatdinov.github.io/reader_line/goodbye");


class TabsController {
  tabsWithLoadedSidebar= {}

  targetContentScriptFiles = []
  targetCSSFiles = []

  setTabContentScriptLoaded = (tabId) => {
    if (!tabId) return
    this.tabsWithLoadedSidebar[tabId] = true
  }

  isTabContentScriptLoaded = (tabId) => {
    if (!tabId) return false

    return this.tabsWithLoadedSidebar[tabId]
  }

  setContentScriptFiles = (files) => {
    if (!files) return
    this.targetContentScriptFiles = [...this.targetContentScriptFiles, ...files]
  }

  setCSSFiles = (files) => {
    if (!files) return
    this.targetCSSFiles = [...this.targetCSSFiles, ...files]
  }

  injectContentScriptFilesToTab = async (tabId) => {
    if (!tabId || this.targetContentScriptFiles.length == 0) return Promise.reject()

    return chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        files: [...this.targetContentScriptFiles],
      })
      .then(() => {
        this.setTabContentScriptLoaded(tabId)
      })
  }

  injectsetCSSFilesToTab = async (tabId) => {
    if (!tabId || this.targetCSSFiles.length == 0) return Promise.reject()

    return chrome.scripting
      .insertCSS({
        target: { tabId: tabId },
        files: [...this.targetCSSFiles],
      })
      .then(() => {
        this.setTabContentScriptLoaded(tabId)
      })
  }
}

const tabsController = new TabsController()
const contentScriptFiles = chrome.runtime.getManifest()?.content_scripts?.[0].js
const CSSFiles = chrome.runtime.getManifest()?.content_scripts?.[0].css
tabsController.setContentScriptFiles(contentScriptFiles)
tabsController.setCSSFiles(CSSFiles)


chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId)

  if (tab.url && tab.url.includes('http') && !tab.url.includes('chromewebstore.google.com')) {
    const tabId = activeInfo.tabId

    if (!tabsController.isTabContentScriptLoaded(tabId)) {
      await tabsController.injectContentScriptFilesToTab(tabId)
      await tabsController.injectsetCSSFilesToTab(tabId)
    }
  }
})

