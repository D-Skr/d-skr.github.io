// Get DOM elements
const fileInput = document.getElementById("file-input");
const photo = document.getElementById("photo");
const cropContainer = document.getElementById("crop-container");
const downloadBtn = document.getElementById("download-btn");
const resultCanvas = document.getElementById("result-canvas");
const ctx = resultCanvas.getContext("2d");

const photoSampleBtn = document.getElementById("photo-sample-btn");
const modalSample = document.getElementById("modal-sample");
const closeModalSampleBtn = document.getElementById("close-sample-btn");
const closeModalInfoBtn = document.getElementById("close-info-btn");
const modalInfo = document.getElementById("modal-info");
const infoBtn = document.getElementById("info-btn");

// NEW: Rotate buttons (for desktop)
const rotateLeftBtn = document.getElementById("rotate-left-btn");
const rotateRightBtn = document.getElementById("rotate-right-btn");

// Transformation variables for positioning, scaling, and rotation
let scale = 1;
let posX = 0;
let posY = 0;
let rotation = 0; // in degrees
let isDragging = false;
let startX = 0;
let startY = 0;
let isPinching = false;
let initialPinchDistance = 0;
let initialScale = 1;
let pinchMidpoint = { x: 0, y: 0 };
let initialAngle = 0;
let initialRotation = 0;
let fixedImagePoint = { x: 0, y: 0 };

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
  rotation = 0;
  updateTransform();

  // When the image loads, adjust scale and center it so that it covers the crop frame
  photo.onload = () => {
    // Set transform-origin to top-left for consistent math (both display and crop)
    photo.style.transformOrigin = "0 0";

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
    downloadBtn.disabled = false;
  };
});

// Helper function to keep the image within boundaries
function constrainTransform() {
  const containerWidth = cropContainer.clientWidth;
  const containerHeight = cropContainer.clientHeight;
  const rad = (rotation * Math.PI) / 180;

  // Compute the rotated dimensions
  const imgWidth = photo.naturalWidth * scale;
  const imgHeight = photo.naturalHeight * scale;
  const sinRad = Math.abs(Math.sin(rad));
  const cosRad = Math.abs(Math.cos(rad));
  const rotatedWidth = imgWidth * cosRad + imgHeight * sinRad;
  const rotatedHeight = imgWidth * sinRad + imgHeight * cosRad;

  // Constraints
  const minX = containerWidth - rotatedWidth;
  const minY = containerHeight - rotatedHeight;

  // If image smaller than container, center it
  if (rotatedWidth < containerWidth) {
    posX = (containerWidth - rotatedWidth) / 2;
  } else {
    posX = Math.min(0, Math.max(posX, minX));
  }

  if (rotatedHeight < containerHeight) {
    posY = (containerHeight - rotatedHeight) / 2;
  } else {
    posY = Math.min(0, Math.max(posY, minY));
  }
}

// Update the CSS transform of the image
function updateTransform() {
  // constrainTransform();
  photo.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`;
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
    isPinching = false;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    // Two fingers: start pinch-zoom & rotation
    isDragging = false; // Ensure dragging is disabled during pinch
    isPinching = true;
    initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
    initialScale = scale;
    initialRotation = rotation;
    pinchMidpoint = getMidpoint(e.touches[0], e.touches[1]);

    // Get the fixed point in container coordinates
    const rect = cropContainer.getBoundingClientRect();
    const fixedPointX = pinchMidpoint.x - rect.left;
    const fixedPointY = pinchMidpoint.y - rect.top;

    // Convert fixed point into image coordinates based on the initial transformation,
    // taking rotation into account.
    const r = (initialRotation * Math.PI) / 180;
    fixedImagePoint = {
      x:
        (Math.cos(r) * (fixedPointX - posX) +
          Math.sin(r) * (fixedPointY - posY)) /
        initialScale,
      y:
        (-Math.sin(r) * (fixedPointX - posX) +
          Math.cos(r) * (fixedPointY - posY)) /
        initialScale,
    };
    // Store initial angle for rotation calculation
    initialAngle = getAngle(e.touches[0], e.touches[1]);
  }
});

cropContainer.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (isPinching && e.touches.length === 2) {
    // Handle pinch zoom & rotation
    const newDistance = getDistance(e.touches[0], e.touches[1]);
    const newAngle = getAngle(e.touches[0], e.touches[1]);

    scale = Math.max(
      0.2,
      Math.min(initialScale * (newDistance / initialPinchDistance), 5)
    );

    rotation = initialRotation + (newAngle - initialAngle) * (180 / Math.PI);

    // Recalculate position to maintain zoom center
    const newMidpoint = getMidpoint(e.touches[0], e.touches[1]);
    const rect = cropContainer.getBoundingClientRect();
    const fixedX = newMidpoint.x - rect.left;
    const fixedY = newMidpoint.y - rect.top;
    const r = (rotation * Math.PI) / 180;

    posX =
      fixedX -
      scale *
        (Math.cos(r) * fixedImagePoint.x - Math.sin(r) * fixedImagePoint.y);
    posY =
      fixedY -
      scale *
        (Math.sin(r) * fixedImagePoint.x + Math.cos(r) * fixedImagePoint.y);

    requestAnimationFrame(updateTransform);
  } else if (!isPinching && e.touches.length === 1 && isDragging) {
    // Dragging with one finger
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    posX += dx;
    posY += dy;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    requestAnimationFrame(updateTransform);
  }
});

cropContainer.addEventListener("touchend", (e) => {
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
  return Math.sqrt(dx * dx + dy * dy);
}

function getMidpoint(touch1, touch2) {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
}

function getAngle(touch1, touch2) {
  return Math.atan2(
    touch2.clientY - touch1.clientY,
    touch2.clientX - touch1.clientX
  );
}

// ---------------------------
// Rotate Buttons (Desktop)
// ---------------------------
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    const rect = cropContainer.getBoundingClientRect();
    const containerCenter = {
      x: rect.width / 2,
      y: rect.height / 2,
    };

    // Convert container center to image coordinates before rotation
    const radBefore = (rotation * Math.PI) / 180;
    const sinBefore = Math.sin(radBefore);
    const cosBefore = Math.cos(radBefore);

    const centerImageX =
      (cosBefore * (containerCenter.x - posX) +
        sinBefore * (containerCenter.y - posY)) /
      scale;
    const centerImageY =
      (-sinBefore * (containerCenter.x - posX) +
        cosBefore * (containerCenter.y - posY)) /
      scale;

    // Adjust rotation angle
    rotation += e.key === "ArrowLeft" ? -2 : 2;

    // Convert image coordinates back to container coordinates after rotation
    const radAfter = (rotation * Math.PI) / 180;
    const sinAfter = Math.sin(radAfter);
    const cosAfter = Math.cos(radAfter);

    posX =
      containerCenter.x -
      scale * (cosAfter * centerImageX - sinAfter * centerImageY);
    posY =
      containerCenter.y -
      scale * (sinAfter * centerImageX + cosAfter * centerImageY);

    updateTransform();
  }
});

// ---------------------------
// Cropping & Download
// ---------------------------
downloadBtn.addEventListener("click", () => {
  if (!photo.src) return;

  // Clear the canvas
  ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);

  // Get the crop container's displayed dimensions
  const containerWidth = cropContainer.clientWidth;
  const containerHeight = cropContainer.clientHeight;

  ctx.save();
  // Scale the context so that the container's dimensions map to a 600×600 canvas
  ctx.scale(600 / containerWidth, 600 / containerHeight);

  // --- Apply the same transformation as used in CSS ---
  // Our transformation (with transform-origin set to top-left) is:
  //   translate(posX, posY) then scale(scale) then rotate(rotation)
  // The equivalent transformation matrix is computed as follows:
  const rad = (rotation * Math.PI) / 180;
  const a = scale * Math.cos(rad);
  const b = scale * Math.sin(rad);
  const c = -scale * Math.sin(rad);
  const d = scale * Math.cos(rad);
  const e = posX;
  const f = posY;
  ctx.transform(a, b, c, d, e, f);

  // Draw the original image at (0, 0)
  ctx.drawImage(photo, 0, 0);
  ctx.restore();

  // Automatically trigger the download after cropping
  const link = document.createElement("a");
  link.download = "cropped_" + originalFileName;
  link.href = resultCanvas.toDataURL();
  link.click();
});

// ---------------------------
// Modal Popup for Photo Sample
// ---------------------------

function setupModal(openButton, modal, closeBtn) {
  // Open the modal when the openButton is clicked
  openButton.addEventListener("click", () => {
    modal.classList.add("active");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  // Close the modal if the click is on the backdrop (the modal itself)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
}

setupModal(infoBtn, modalInfo, closeModalInfoBtn);
setupModal(photoSampleBtn, modalSample, closeModalSampleBtn);

// ---------------------------
// Toggle Dropdown - not needed anymore
// ---------------------------
document
  .getElementById("dropdown-header")
  .addEventListener("click", function () {
    const desc = document.getElementById("description");
    this.classList.toggle("active"); // Toggle arrow direction
    if (desc.style.display === "none" || desc.style.display === "") {
      desc.style.display = "block";
    } else {
      desc.style.display = "none";
    }
  });
