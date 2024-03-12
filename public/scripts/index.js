// Create or select the readerLine element
let readerLine = document.querySelector(".reader-line");

if (!readerLine) {
  readerLine = document.createElement("div");
  readerLine.setAttribute("class", "reader-line");
  document.querySelector("body").appendChild(readerLine);
}

// Update readerLine style
function updateReaderLine(color = "rgba(0, 0, 0, 0.15)", height = 20, enabled = false, mode = "line") {
  console.log("updateReaderLine", color, height, enabled, mode);
  readerLine.style.setProperty('--pseudo-background', color);
  readerLine.style.backgroundColor = color;
  readerLine.style.height = height + "px";
  readerLine.style.display = (!!enabled) ? "block" : "none";
  
  if (mode === "line") {
    readerLine.classList.remove("reader-line--focus");
  }

  if (mode === "focus") {
    readerLine.classList.add("reader-line--focus");
  }
}

// Event listener for mousemove
document.addEventListener("mousemove", (e) => {
  let height = parseInt(readerLine.style.height);
  readerLine.style.top = e.clientY - (height / 2) + "px";
});

// Function to update values and readerLine style
function updateValuesAndReaderLine() {
  chrome.storage.local.get(['color', 'height', 'enabled', 'mode'], (result) => {
    const color = result.color;
    const height = result.height;
    const enabled = result.enabled;
    const mode = result.mode;
    updateReaderLine(color, height, enabled, mode);
  });
}

// Listen for changes in storage.local
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    updateValuesAndReaderLine();
  }
});

// Query the initial values from the background script
updateValuesAndReaderLine();
