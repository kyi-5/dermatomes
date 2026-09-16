const zones = document.querySelectorAll('area');
const targetText = document.getElementById('targetNerve');
const promptDisplay = document.getElementById('promptDisplay');
const statusContainer = document.getElementById('statusContainer');
const indicatorAnterior = document.getElementById('step-anterior');
const indicatorPosterior = document.getElementById('step-posterior');
const guessPanel = document.getElementById('guessPanel');
const landmarkInput = document.getElementById('landmarkInput');
const submitBtn = document.getElementById('submitBtn');
const feedbackText = document.getElementById('feedbackText');

// Unified sequence matching the precise keys in the landmark registry
const quizQueue = [
  'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 
  'T1', 'T2', 'L1', 'L2', 'L3', 'L4', 'L5', 
  'S1', 'S2', 'S3', 'S4-5'
];

let currentTargetIndex = 0;
let dynamicProgress = { anterior: false, posterior: false };
let isTypingMode = false;

// Complete key dataset matched 1:1 with the HTML map view configuration
const dermatomeData = {
  'C2': { landmark: 'Occipital Protuberance', views: ['anterior', 'posterior'] },
  'C3': { landmark: 'Supraclavicular Fossa', views: ['anterior', 'posterior'] },
  'C4': { landmark: 'Acromioclavicular Joint', views: ['anterior', 'posterior'] },
  'C5': { landmark: 'Lateral Antecubital Fossa', views: ['anterior', 'posterior'] },
  'C6': { landmark: 'Thumb', views: ['anterior', 'posterior'] },
  'C7': { landmark: 'Middle Finger', views: ['anterior', 'posterior'] },
  'C8': { landmark: 'Little Finger', views: ['anterior', 'posterior'] },
  'T1': { landmark: 'Medial Antecubital Fossa', views: ['anterior', 'posterior'] },
  'T2': { landmark: 'Apex of Axilla', views: ['anterior', 'posterior'] },
  'L1': { landmark: 'Upper Anterior Thigh', views: ['anterior', 'posterior'] },
  'L2': { landmark: 'Mid Anterior Thigh', views: ['anterior', 'posterior'] },
  'L3': { landmark: 'Medial Femoral Condyle', views: ['anterior', 'posterior'] },
  'L4': { landmark: 'Medial Malleolus', views: ['anterior', 'posterior'] },
  'L5': { landmark: 'Dorsum 3rd MTP Joint', views: ['anterior', 'posterior'] },
  'S1': { landmark: 'Lateral Heel', views: ['anterior', 'posterior'] },
  'S2': { landmark: 'Popliteal Fossa', views: ['anterior', 'posterior'] },
  'S3': { landmark: 'Ischial Tuberosity', views: ['posterior'] },
  'S4-5': { landmark: 'Perineal Area', views: ['posterior'] }
};

// Initialize first challenge item
updateDisplayIndicators();

// FIXED: Now looping through every area exactly like the working Myotome script
zones.forEach(zone => {
  zone.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (isTypingMode) return;

    const clickedNerve = zone.getAttribute('data-nerve');
    const zoneView = zone.getAttribute('data-view');
    
    const correctNerve = quizQueue[currentTargetIndex];
    const requiredViews = dermatomeData[correctNerve].views;

    if (clickedNerve === correctNerve) {
      if (zoneView === 'anterior' && requiredViews.includes('anterior')) {
        dynamicProgress.anterior = true;
        indicatorAnterior.className = "indicator completed";
      } else if (zoneView === 'posterior' && requiredViews.includes('posterior')) {
        dynamicProgress.posterior = true;
        indicatorPosterior.className = "indicator completed";
      }

      const anteriorPassed = !requiredViews.includes('anterior') || dynamicProgress.anterior;
      const posteriorPassed = !requiredViews.includes('posterior') || dynamicProgress.posterior;

      if (anteriorPassed && posteriorPassed) {
        startTypingChallenge(correctNerve);
      }
    } else {
      alert(`Incorrect mapping. That point belongs to ${clickedNerve}. Find the region for ${correctNerve}!`);
    }
  });
});

function startTypingChallenge(code) {
  isTypingMode = true;
  statusContainer.innerHTML = `
    <h4 style="color:#28a745; margin: 0 0 10px 0;">🎉 Location Confirmed!</h4>
    <p style="margin:0; font-size:0.95rem; color:#495057;">Spatial verification verified for level <strong>${code}</strong>.</p>
  `;
  guessPanel.style.display = 'block';
  landmarkInput.value = '';
  landmarkInput.focus();
  feedbackText.innerText = '';
}

submitBtn.addEventListener('click', checkTypedAnswer);
landmarkInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') checkTypedAnswer();
});

function checkTypedAnswer() {
  const correctNerve = quizQueue[currentTargetIndex];
  const targetLandmark = dermatomeData[correctNerve].landmark;
  const userGuess = landmarkInput.value.trim();

  if (userGuess.toLowerCase() === targetLandmark.toLowerCase()) {
    feedbackText.style.color = '#28a745';
    feedbackText.innerText = '✓ Correct Answer!';
    setTimeout(() => {
      guessPanel.style.display = 'none';
      isTypingMode = false;
      advanceQuiz();
    }, 1500);
  } else {
    feedbackText.style.color = '#dc3545';
    feedbackText.innerText = `✗ Incorrect. Target value: "${targetLandmark}"`;
    setTimeout(() => {
      guessPanel.style.display = 'none';
      isTypingMode = false;
      advanceQuiz();
    }, 3000);
  }
}

function updateDisplayIndicators() {
  const correctNerve = quizQueue[currentTargetIndex];
  if (!correctNerve) return;

  const requiredViews = dermatomeData[correctNerve].views;
  
  indicatorAnterior.className = "indicator pending";
  indicatorPosterior.className = "indicator pending";
  
  indicatorAnterior.style.display = requiredViews.includes('anterior') ? 'inline-block' : 'none';
  indicatorPosterior.style.display = requiredViews.includes('posterior') ? 'inline-block' : 'none';
}

function advanceQuiz() {
  dynamicProgress.anterior = false;
  dynamicProgress.posterior = false;
  currentTargetIndex++;

  if (currentTargetIndex < quizQueue.length) {
    targetText.innerText = quizQueue[currentTargetIndex];
    updateDisplayIndicators();
    statusContainer.innerHTML = 'Select the target region on the active viewports to unlock the text challenge!';
  } else {
    promptDisplay.innerHTML = "<span style='color:#28a745; font-size:1.4rem;'> Review Complete! </span>";
    indicatorAnterior.style.display = 'none';
    indicatorPosterior.style.display = 'none';
    statusContainer.innerHTML = 'All targets cleared.';
  }
}
