const statusEl = typeof document !== 'undefined' ? document.getElementById('status') : null;
const stepViewEl = typeof document !== 'undefined' ? document.getElementById('step-view') : null;
const progressTextEl = typeof document !== 'undefined' ? document.getElementById('progress-text') : null;
const progressBarEl = typeof document !== 'undefined' ? document.getElementById('progress-bar') : null;
const imageEl = typeof document !== 'undefined' ? document.getElementById('step-image') : null;
const imageFallbackEl = typeof document !== 'undefined' ? document.getElementById('image-fallback') : null;
const titleEl = typeof document !== 'undefined' ? document.getElementById('step-title') : null;
const descriptionEl = typeof document !== 'undefined' ? document.getElementById('step-description') : null;
const backButtonEl = typeof document !== 'undefined' ? document.getElementById('back-button') : null;
const nextButtonEl = typeof document !== 'undefined' ? document.getElementById('next-button') : null;

const PROGRESS_STORAGE_KEY = 'kitbot:lastStepIndex';

let steps = [];
let currentIndex = 0;

function readStoredStepIndex(totalSteps) {
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw === null) return null;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) return null;
    return clampStepIndex(parsed, totalSteps);
  } catch {
    return null;
  }
}

function writeStoredStepIndex(index) {
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, String(index));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — ignore.
  }
}

export function clampStepIndex(index, totalSteps) {
  if (!Number.isFinite(index) || totalSteps < 1) return 0;
  return Math.min(Math.max(index, 0), totalSteps - 1);
}

export function getStepFromHash(hash, totalSteps) {
  const match = /^#step-(\d+)$/.exec(hash || '');
  const requestedIndex = match ? Number(match[1]) - 1 : 0;
  return clampStepIndex(requestedIndex, totalSteps);
}

export function getProgressPercent(index, totalSteps) {
  if (totalSteps < 1) return 0;
  return Math.round(((index + 1) / totalSteps) * 100);
}

function showStatus(message, isError = false) {
  if (!statusEl || !stepViewEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
  statusEl.hidden = false;
  stepViewEl.hidden = true;
}

function showImageFallback(message) {
  if (!imageEl || !imageFallbackEl) return;
  imageEl.hidden = true;
  imageEl.removeAttribute('src');
  imageFallbackEl.textContent = message;
  imageFallbackEl.hidden = false;
}

function setStepHash(index) {
  const nextHash = `#step-${index + 1}`;
  if (window.location.hash !== nextHash) {
    window.history.replaceState(null, '', nextHash);
  }
}

function renderStep(index) {
  if (!steps.length || !stepViewEl || !statusEl) return;

  currentIndex = clampStepIndex(index, steps.length);
  const step = steps[currentIndex];

  statusEl.hidden = true;
  stepViewEl.hidden = false;

  const percent = getProgressPercent(currentIndex, steps.length);
  progressTextEl.textContent = `Step ${currentIndex + 1} of ${steps.length}`;
  progressBarEl.style.width = `${percent}%`;
  progressBarEl.setAttribute('aria-valuenow', String(percent));
  progressBarEl.setAttribute(
    'aria-valuetext',
    `Step ${currentIndex + 1} of ${steps.length}`,
  );
  titleEl.textContent = step.title || `Step ${currentIndex + 1}`;
  descriptionEl.textContent = step.description || '';

  imageFallbackEl.hidden = true;
  if (step.image) {
    imageEl.hidden = false;
    imageEl.alt = step.alt || step.title || `Step ${currentIndex + 1} image`;
    imageEl.onerror = () => showImageFallback('Image unavailable for this step.');
    imageEl.src = step.image;
  } else {
    showImageFallback(step.alt || 'Image unavailable for this step.');
  }

  backButtonEl.disabled = currentIndex === 0;
  nextButtonEl.textContent = currentIndex === steps.length - 1 ? 'Finish' : 'Next';
  setStepHash(currentIndex);
  writeStoredStepIndex(currentIndex);
}

function goToStep(index) {
  renderStep(index);
}

async function loadSteps() {
  try {
    const response = await fetch('steps.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('steps.json must contain at least one step.');
    }

    steps = data;
    const hash = window.location.hash;
    const hashIndex = /^#step-\d+$/.test(hash)
      ? getStepFromHash(hash, steps.length)
      : null;
    const storedIndex = hashIndex === null ? readStoredStepIndex(steps.length) : null;
    renderStep(hashIndex ?? storedIndex ?? 0);
  } catch (error) {
    console.error(error);
    showStatus('Instructions unavailable.', true);
  }
}

function bindControls() {
  if (!backButtonEl || !nextButtonEl) return;

  backButtonEl.addEventListener('click', () => goToStep(currentIndex - 1));
  nextButtonEl.addEventListener('click', () => {
    if (currentIndex < steps.length - 1) goToStep(currentIndex + 1);
  });

  window.addEventListener('hashchange', () => {
    if (steps.length) renderStep(getStepFromHash(window.location.hash, steps.length));
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') goToStep(currentIndex - 1);
    if (event.key === 'ArrowRight' && currentIndex < steps.length - 1) goToStep(currentIndex + 1);
  });
}

if (typeof window !== 'undefined') {
  bindControls();
  loadSteps();
}
