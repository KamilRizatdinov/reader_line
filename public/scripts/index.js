// Create or select the readerLine element
const READER_LINE_CLASS = "cmVhZGVyLWxpbmU";
let readerLine = document.querySelector(`.${READER_LINE_CLASS}`);

if (!readerLine) {
  readerLine = document.createElement("div");
  readerLine.setAttribute("class", READER_LINE_CLASS);
  document.querySelector("body").appendChild(readerLine);
}

// Update readerLine style
function updateReaderLine(color = "rgba(0, 0, 0, 0.15)", height = 20, enabled = false, mode = "line") {
  readerLine.style.setProperty('--pseudo-background', color);
  readerLine.style.backgroundColor = color;
  readerLine.style.height = height + "px";
  readerLine.style.display = (!!enabled) ? "block" : "none";
  
  if (mode === "line") {
    readerLine.classList.remove("cmVhZGVyLWxpbmU--focus");
  }

  if (mode === "focus") {
    readerLine.classList.add("cmVhZGVyLWxpbmU--focus");
  }
}

// Event listener for mousemove
document.addEventListener("mousemove", (e) => {
  let height = parseInt(readerLine.style.height);
  readerLine.style.top = e.clientY - (height / 2) + "px";
});

// Function to update values and readerLine style
function updateValuesAndReaderLine() {
  chrome.storage.local.get(['color', 'height', 'enabled', 'mode']).then((result) => {
    const color = result.color;
    const height = result.height;
    const enabled = result.enabled;
    const mode = result.mode;
    updateReaderLine(color, height, enabled, mode);
  });
}

// Listen for changes in storage.local


// Query the initial values from the background script
updateValuesAndReaderLine();
