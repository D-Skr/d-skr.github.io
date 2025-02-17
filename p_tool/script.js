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

// NEW: Rotate buttons (for desktop)
const rotateLeftBtn = document.getElementById("rotate-left-btn");
const rotateRightBtn = document.getElementById("rotate-right-btn");

// Transformation variables for positioning, scaling, and rotation
let scale = 1;
let posX = 0;
let posY = 0;
let rotation = 0; // in degrees

// Variables for mouse dragging
let isDragging = false;
let startX = 0;
let startY = 0;

// Variables for touch gestures
let isPinching = false;
let initialPinchDistance = 0;
let initialScale = 1;
let pinchMidpoint = { x: 0, y: 0 };
let initialAngle = 0;
let initialRotation = 0;

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
    cropBtn.disabled = false;
  };
});

// Update the CSS transform of the image
function updateTransform() {
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
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    // Two fingers: start pinch-zoom & rotation
    isPinching = true;
    initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
    initialScale = scale;
    initialRotation = rotation;
    initialPosX = posX;
    initialPosY = posY;
    pinchMidpoint = getMidpoint(e.touches[0], e.touches[1]);
    initialAngle = getAngle(e.touches[0], e.touches[1]);

    // Get the fixed point in container coordinates
    const rect = cropContainer.getBoundingClientRect();
    const fixedPointX = pinchMidpoint.x - rect.left;
    const fixedPointY = pinchMidpoint.y - rect.top;

    // Convert fixed point into image coordinates based on the initial transformation,
    // taking rotation into account.
    const r = (initialRotation * Math.PI) / 180;
    fixedImagePoint = {
      x:
        (Math.cos(r) * (fixedPointX - initialPosX) +
          Math.sin(r) * (fixedPointY - initialPosY)) /
        initialScale,
      y:
        (-Math.sin(r) * (fixedPointX - initialPosX) +
          Math.cos(r) * (fixedPointY - initialPosY)) /
        initialScale,
    };
  }
});

cropContainer.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (isPinching && e.touches.length === 2) {
    // Handle pinch-zoom and rotation
    const currentDistance = getDistance(e.touches[0], e.touches[1]);
    const zoomFactor = currentDistance / initialPinchDistance;
    scale = initialScale * zoomFactor;

    // Calculate rotation (in degrees)
    const currentAngle = getAngle(e.touches[0], e.touches[1]);
    const angleDiff = currentAngle - initialAngle;
    // const angleDiff =
    //   currentAngle -
    //   Math.atan2(
    //     Math.sin((initialRotation * Math.PI) / 180),
    //     Math.cos((initialRotation * Math.PI) / 180)
    //   ); // Alternatively, use: currentAngle - initialAngle (if initialAngle is recorded)
    rotation = initialRotation + angleDiff * (180 / Math.PI);

    // Recalculate posX and posY to keep the fixed image point under the same pinch midpoint.
    const currentMidpoint = getMidpoint(e.touches[0], e.touches[1]);
    const rect = cropContainer.getBoundingClientRect();
    const fixedPointX = currentMidpoint.x - rect.left;
    const fixedPointY = currentMidpoint.y - rect.top;
    const newRotationRad = (rotation * Math.PI) / 180;
    posX =
      fixedPointX -
      scale *
        (Math.cos(newRotationRad) * fixedImagePoint.x -
          Math.sin(newRotationRad) * fixedImagePoint.y);
    posY =
      fixedPointY -
      scale *
        (Math.sin(newRotationRad) * fixedImagePoint.x +
          Math.cos(newRotationRad) * fixedImagePoint.y);
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

function getAngle(touch1, touch2) {
  return Math.atan2(
    touch2.clientY - touch1.clientY,
    touch2.clientX - touch1.clientX
  );
}

// ---------------------------
// Rotate Buttons (Desktop)
// ---------------------------
if (rotateLeftBtn) {
  rotateLeftBtn.addEventListener("click", () => {
    rotation -= 90;
    updateTransform();
  });
}
if (rotateRightBtn) {
  rotateRightBtn.addEventListener("click", () => {
    rotation += 90;
    updateTransform();
  });
}

// ---------------------------
// Cropping & Download
// ---------------------------
cropBtn.addEventListener("click", () => {
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
