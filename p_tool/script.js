// Get DOM elements
const photoSampleBtn = document.getElementById("photo-sample-btn");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("close-modal-btn");

const fileInput = document.getElementById("file-input");
const photo = document.getElementById("photo");
const cropContainer = document.getElementById("crop-container");
const cropBtn = document.getElementById("crop-btn");
const downloadBtn = document.getElementById("download-btn");
const resultCanvas = document.getElementById("result-canvas");
const ctx = resultCanvas.getContext("2d");

let scale = 1;
let posX = 0;
let posY = 0;
let originalFileName = "";

// Touch handling variables
let isDragging = false;
let startX = 0;
let startY = 0;
let lastPosX = 0;
let lastPosY = 0;
let lastScale = 1;

function updateTransform() {
  photo.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  originalFileName = file.name;
  const url = URL.createObjectURL(file);
  photo.src = url;
  photo.classList.remove("loaded");

  // Reset transformation
  scale = 1;
  posX = 0;
  posY = 0;
  updateTransform();

  photo.onload = () => {
    const containerWidth = cropContainer.clientWidth;
    const containerHeight = cropContainer.clientHeight;
    const imgWidth = photo.naturalWidth;
    const imgHeight = photo.naturalHeight;

    // Scale to cover
    const scaleX = containerWidth / imgWidth;
    const scaleY = containerHeight / imgHeight;
    scale = Math.max(scaleX, scaleY);

    // Center the image
    posX = (containerWidth - imgWidth * scale) / 2;
    posY = (containerHeight - imgHeight * scale) / 2;

    updateTransform();
    photo.classList.add("loaded");
    cropBtn.disabled = false;
  };
});

// Touch event handlers
cropContainer.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    lastPosX = posX;
    lastPosY = posY;
  } else if (e.touches.length === 2) {
    // Start pinch zoom
    isDragging = false;
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    startX = (touch1.clientX + touch2.clientX) / 2;
    startY = (touch1.clientY + touch2.clientY) / 2;
    lastScale = scale;
  }
});

cropContainer.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (isDragging && e.touches.length === 1) {
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    posX = lastPosX + dx;
    posY = lastPosY + dy;
    updateTransform();
  } else if (e.touches.length === 2) {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    const initialDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    scale = lastScale * (currentDistance / initialDistance);
    updateTransform();
  }
});

cropContainer.addEventListener("touchend", () => {
  isDragging = false;
  lastPosX = posX;
  lastPosY = posY;
  lastScale = scale;
});

// Mouse event handlers
cropContainer.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  lastPosX = posX;
  lastPosY = posY;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  posX = lastPosX + dx;
  posY = lastPosY + dy;
  updateTransform();
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  lastPosX = posX;
  lastPosY = posY;
});

// Mouse wheel zoom
cropContainer.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = e.deltaY;
  const zoomFactor = delta > 0 ? 0.9 : 1.1;
  scale *= zoomFactor;
  updateTransform();
});

cropBtn.addEventListener("click", () => {
  if (!photo.src) return;

  ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);

  const containerWidth = cropContainer.clientWidth;
  const containerHeight = cropContainer.clientHeight;

  const sx = -posX / scale;
  const sy = -posY / scale;
  const sWidth = containerWidth / scale;
  const sHeight = containerHeight / scale;

  ctx.drawImage(photo, sx, sy, sWidth, sHeight, 0, 0, 600, 600);
  downloadBtn.disabled = false;
});

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `cropped_${originalFileName || "image.jpg"}`;
  link.href = resultCanvas.toDataURL();
  link.click();
});

// ---------------------------
// Modal Popup for Photo Sample
// ---------------------------
photoSampleBtn.addEventListener("click", () => {
  modal.classList.add("active");
});

closeModalBtn.addEventListener("click", () => {
  modal.classList.remove("active");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("active");
  }
});
