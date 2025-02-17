// Get DOM elements
const fileInput = document.getElementById("file-input");
const photo = document.getElementById("photo");
const cropContainer = document.getElementById("crop-container");
const cropBtn = document.getElementById("crop-btn");
const downloadBtn = document.getElementById("download-btn");
const resultCanvas = document.getElementById("result-canvas");
const ctx = resultCanvas.getContext("2d");

const photoSampleBtn = document.getElementById("photo-sample-btn");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("close-modal-btn");

// Transformation variables for positioning and scaling
let scale = 1;
let posX = 0;
let posY = 0;

// Variables for mouse dragging
let isDragging = false;
let startX = 0;
let startY = 0;

// Variables for touch gestures
let isPinching = false;
let initialPinchDistance = 0;
let initialScale = 1;
let pinchMidpoint = { x: 0, y: 0 };

let originalFileName = "";

// Handle file upload
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  originalFileName = file.name;
  const url = URL.createObjectURL(file);
  photo.src = url;
  photo.style.display = "block";
  photo.classList.remove("loaded");

  // Reset transformation values
  scale = 1;
  posX = 0;
  posY = 0;
  updateTransform();

  // When the image loads, adjust scale and center it so that it covers the crop frame
  photo.onload = () => {
    const containerWidth = cropContainer.clientWidth;
    const containerHeight = cropContainer.clientHeight;
    const imgWidth = photo.naturalWidth;
    const imgHeight = photo.naturalHeight;
    // Scale so that the image covers the container
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

// Update the CSS transform of the image
function updateTransform() {
  photo.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

// ---------------------------
// Mouse Events (Desktop)
// ---------------------------
cropContainer.addEventListener("mousedown", (e) => {
  e.preventDefault();
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  photo.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  startX = e.clientX;
  startY = e.clientY;
  posX += dx;
  posY += dy;
  updateTransform();
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  photo.style.cursor = "grab";
});

// Mouse wheel for zooming (desktop)
cropContainer.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = e.deltaY;
  const zoomFactor = delta < 0 ? 1.1 : 0.9;

  // Get mouse position relative to the container
  const rect = cropContainer.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  // Compute the image coordinates for the mouse position
  const x = (offsetX - posX) / scale;
  const y = (offsetY - posY) / scale;

  // Update scale and adjust the position so the point under the mouse remains fixed
  scale *= zoomFactor;
  posX = offsetX - x * scale;
  posY = offsetY - y * scale;
  updateTransform();
});

// ---------------------------
// Touch Events (Mobile)
// ---------------------------
cropContainer.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (e.touches.length === 1) {
    // Single touch: start dragging
    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    // Two fingers: start pinch-zoom
    isPinching = true;
    initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
    initialScale = scale;
    pinchMidpoint = getMidpoint(e.touches[0], e.touches[1]);
  }
});

cropContainer.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (isPinching && e.touches.length === 2) {
    // Handle pinch-zoom
    const currentDistance = getDistance(e.touches[0], e.touches[1]);
    const zoomFactor = currentDistance / initialPinchDistance;
    scale = initialScale * zoomFactor;

    // Adjust position so that the midpoint remains fixed
    const rect = cropContainer.getBoundingClientRect();
    const offsetX = pinchMidpoint.x - rect.left;
    const offsetY = pinchMidpoint.y - rect.top;
    const x = (offsetX - posX) / initialScale;
    const y = (offsetY - posY) / initialScale;
    posX = offsetX - x * scale;
    posY = offsetY - y * scale;
    updateTransform();
  } else if (!isPinching && e.touches.length === 1 && isDragging) {
    // Single finger dragging
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    startX = touch.clientX;
    startY = touch.clientY;
    posX += dx;
    posY += dy;
    updateTransform();
  }
});

cropContainer.addEventListener("touchend", (e) => {
  // If fewer than two touches remain, end pinch-zoom
  if (e.touches.length < 2) {
    isPinching = false;
  }
  if (e.touches.length === 0) {
    isDragging = false;
  }
});

// Helper functions for touch events
function getDistance(touch1, touch2) {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.hypot(dx, dy);
}

function getMidpoint(touch1, touch2) {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
}

// ---------------------------
// Cropping & Download
// ---------------------------
cropBtn.addEventListener("click", () => {
  if (!photo.src) return;

  // Clear the canvas
  ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);

  // Note: The crop container’s displayed size (containerWidth x containerHeight)
  // may be smaller than 600x600 on mobile, but we always want a final 600×600 image.
  const containerWidth = cropContainer.clientWidth;
  const containerHeight = cropContainer.clientHeight;

  // The top-left of the container corresponds to (-posX/scale, -posY/scale) in the image.
  const sx = -posX / scale;
  const sy = -posY / scale;
  const sWidth = containerWidth / scale;
  const sHeight = containerHeight / scale;

  // Draw the cropped portion from the image onto the canvas, scaling to 600×600.
  ctx.drawImage(photo, sx, sy, sWidth, sHeight, 0, 0, 600, 600);

  // Enable the Download button
  downloadBtn.disabled = false;
  alert("Image cropped! Click 'Download' to save your cropped image.");
});

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "cropped_" + originalFileName;
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
