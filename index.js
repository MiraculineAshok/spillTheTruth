document.addEventListener('DOMContentLoaded', () => {
  const landingPage = document.getElementById('landing-page');
  const cardContainer = document.getElementById('card-container');
  const questionCard = document.getElementById('question-card');
  const imageEl = document.getElementById('card-image');
  const questionEl = document.getElementById('card-question');
  const nextBtn = document.getElementById('next-btn');
  const reserveBtn = document.getElementById('reserve-btn');
  const startOverBtn = document.getElementById('start-over-btn');
  const gameOver = document.getElementById('game-over');
  const backBtn = document.getElementById('back-btn');
  const cardNumberInput = document.getElementById('card-number-input');
  const serialBadge = document.getElementById('serial-badge');
  const cardTopControls = document.querySelector('.card-top-controls');
  const randomPrompt = document.getElementById('random-prompt');
  const randomCountInput = document.getElementById('random-count-input');
  const randomCountError = document.getElementById('random-count-error');
  const randomStartBtn = document.getElementById('random-start-btn');

  let questions = [];
  let currentIndex = 0;
  let answeredIndices = new Set();
  let reservedIndices = new Set();
  const answeredGlobal = new Set(); // track across categories for Random

  function questionKey(q) {
    return (q.question ?? '').trim();
  }

  // Background presets for text-only cards
  const abstractBackgrounds = [
    'radial-gradient(circle at 20% 20%, #ffd1c4 0%, rgba(255,209,196,0.8) 40%, transparent 70%), radial-gradient(circle at 80% 0%, #cfd8ff 0%, rgba(207,216,255,0.8) 35%, transparent 65%), radial-gradient(circle at 0% 100%, #b2ebf2 0%, rgba(178,235,242,0.8) 40%, transparent 70%), radial-gradient(circle at 100% 100%, #fff59d 0%, rgba(255,245,157,0.85) 40%, transparent 70%), linear-gradient(180deg, #ffffff 0%, #fefefe 100%)',
    'radial-gradient(60% 100% at 10% 10%, #c8e6c9 0%, rgba(200,230,201,0.85) 45%, transparent 70%), radial-gradient(40% 80% at 90% 20%, #e1bee7 0%, rgba(225,190,231,0.85) 40%, transparent 65%), linear-gradient(180deg, #ffffff 0%, #fdfdfd 100%)',
    'radial-gradient(50% 70% at 20% 80%, #b3e5fc 0%, rgba(179,229,252,0.85) 45%, transparent 70%), radial-gradient(60% 60% at 80% 10%, #ffe0b2 0%, rgba(255,224,178,0.85) 45%, transparent 70%), linear-gradient(180deg, #ffffff 0%, #fbfbfb 100%)',
    'radial-gradient(70% 50% at 85% 85%, #f8bbd0 0%, rgba(248,187,208,0.85) 45%, transparent 70%), radial-gradient(50% 70% at 15% 15%, #bbdefb 0%, rgba(187,222,251,0.85) 45%, transparent 70%), linear-gradient(180deg, #ffffff 0%, #f9f9f9 100%)',
    'radial-gradient(50% 50% at 30% 30%, #dcedc8 0%, rgba(220,237,200,0.9) 45%, transparent 70%), radial-gradient(50% 50% at 70% 70%, #d1c4e9 0%, rgba(209,196,233,0.9) 45%, transparent 70%), linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%)',
    'radial-gradient(60% 60% at 75% 25%, #b2dfdb 0%, rgba(178,223,219,0.9) 45%, transparent 70%), radial-gradient(60% 60% at 25% 75%, #ffecb3 0%, rgba(255,236,179,0.9) 45%, transparent 70%), linear-gradient(180deg, #ffffff 0%, #f6f6f6 100%)'
  ];

  // Popover helpers
  function openInfoPopover(message) {
    const overlay = document.getElementById('popover-overlay');
    if (!overlay) return;
    const msg = document.getElementById('popover-message');
    const okBtn = document.getElementById('popover-ok-btn');
    const cancelBtn = document.getElementById('popover-cancel-btn');
    if (msg) msg.textContent = message;
    if (cancelBtn) cancelBtn.style.display = 'none';
    overlay.style.display = '';
    const onOk = () => {
      overlay.style.display = 'none';
      okBtn && okBtn.removeEventListener('click', onOk);
    };
    okBtn && okBtn.addEventListener('click', onOk, { once: true });
    const onOverlay = (e) => { if (e.target === overlay) { overlay.style.display = 'none'; overlay.removeEventListener('click', onOverlay); } };
    overlay.addEventListener('click', onOverlay);
  }

  function openConfirmPopover(message) {
    return new Promise((resolve) => {
      const overlay = document.getElementById('popover-overlay');
      if (!overlay) return resolve(false);
      const msg = document.getElementById('popover-message');
      const okBtn = document.getElementById('popover-ok-btn');
      const cancelBtn = document.getElementById('popover-cancel-btn');
      if (msg) msg.textContent = message;
      if (cancelBtn) cancelBtn.style.display = '';
      overlay.style.display = '';
      const cleanup = () => {
        okBtn && okBtn.removeEventListener('click', onOk);
        cancelBtn && cancelBtn.removeEventListener('click', onCancel);
        overlay.removeEventListener('click', onOverlay);
      };
      const onOk = () => { cleanup(); overlay.style.display = 'none'; resolve(true); };
      const onCancel = () => { cleanup(); overlay.style.display = 'none'; resolve(false); };
      const onOverlay = (e) => { if (e.target === overlay) { cleanup(); overlay.style.display = 'none'; resolve(false); } };
      okBtn && okBtn.addEventListener('click', onOk);
      cancelBtn && cancelBtn.addEventListener('click', onCancel);
      overlay.addEventListener('click', onOverlay);
    });
  }

  function showLanding() {
    landingPage.style.display = 'block';
    cardContainer.style.display = 'none';
    gameOver.style.display = 'none';
    questionCard.style.display = 'none';
    cardTopControls.style.display = 'none';
    // Hide random prompt and clear state
    if (randomPrompt) randomPrompt.style.display = 'none';
    if (randomCountError) randomCountError.style.display = 'none';
    if (randomCountInput) randomCountInput.value = '';
  }

  function showGame() {
    landingPage.style.display = 'none';
    cardContainer.style.display = 'block';
    gameOver.style.display = 'none';
    questionCard.style.display = 'flex';
    cardTopControls.style.display = 'block';
  }

  function applyBackgroundForCurrentCard() {
    if (questionCard.classList.contains('no-image')) {
      const bg = abstractBackgrounds[currentIndex % abstractBackgrounds.length];
      questionCard.style.background = bg;
    } else {
      questionCard.style.background = ''; // default (white) for image decks
    }
  }

  function renderCard(index) {
    const q = questions[index];
    if (!q) return;
    // Toggle no-image mode per question (works for Random deck too)
    if (!q.imageUrl) {
      questionCard.classList.add('no-image');
      imageEl.style.display = 'none';
      imageEl.removeAttribute('src');
    } else {
      questionCard.classList.remove('no-image');
      imageEl.style.display = 'block';
      imageEl.src = q.imageUrl;
    }
    questionEl.textContent = q.question || '';
    serialBadge.textContent = q.serialNumber ? `#${q.serialNumber}` : '';
    applyBackgroundForCurrentCard();
  }

  function getNextUnansweredIndex(startIdx) {
    // First try from startIdx to end
    for (let i = startIdx; i < questions.length; i++) {
      if (!answeredIndices.has(i)) {
        return i;
      }
    }
    // If not found, try from beginning to startIdx
    for (let i = 0; i < startIdx; i++) {
      if (!answeredIndices.has(i)) {
        return i;
      }
    }
    return -1; // All answered
  }

  function showNext() {
    // Mark current as answered
    const q = questions[currentIndex];
    if (q) answeredGlobal.add(questionKey(q));
    answeredIndices.add(currentIndex);
    reservedIndices.delete(currentIndex);
    
    // Find next unanswered question
    const nextIdx = getNextUnansweredIndex(currentIndex + 1);
    if (nextIdx === -1) {
      // Game over - all questions answered
      gameOver.style.display = 'block';
      questionCard.style.display = 'none';
      cardTopControls.style.display = 'none';
      return;
    }
    currentIndex = nextIdx;
    renderCard(currentIndex);
  }

  function reserveCurrent() {
    reservedIndices.add(currentIndex);
    
    // Find next unanswered question
    let nextIdx = getNextUnansweredIndex(currentIndex + 1);
    if (nextIdx === -1 && reservedIndices.size > 0) {
      // If all others are answered, pick from reserved
      nextIdx = Array.from(reservedIndices)[0];
    }
    if (nextIdx === -1) {
      // Game over
      gameOver.style.display = 'block';
      questionCard.style.display = 'none';
      cardTopControls.style.display = 'none';
      return;
    }
    currentIndex = nextIdx;
    renderCard(currentIndex);
  }

  function isGameInProgress() {
    return questions.length > 0 && answeredIndices.size > 0 && answeredIndices.size < questions.length;
  }

  function shuffleInPlace(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // category selection
  document.querySelectorAll('.category-card').forEach(card => {
    if (card.classList.contains('disabled')) return;
    
    const img = card.dataset.image;
    const bg = card.querySelector('.category-card-bg');
    if (bg && img) {
      bg.style.backgroundImage = `url(${img})`;
    }
    
    card.addEventListener('click', async () => {
      const category = card.dataset.category;
      // Random flow: show prompt, then build deck client-side
      if (category === 'random') {
        // Fetch combined deck from server (already excludes memory lane)
        try {
          const res = await fetch('/api/questions_random');
          let loaded = await res.json();
          // Filter out globally answered
          loaded = loaded.filter(q => !answeredGlobal.has(questionKey(q)));
          // Show prompt
          randomPrompt.style.display = 'flex';
          randomCountError.style.display = 'none';
          randomCountInput.value = '';
          randomStartBtn.onclick = () => {
            const count = Number(randomCountInput.value);
            const total = loaded.length;
            if (!Number.isInteger(count) || count < 1 || count > total) {
              randomCountError.textContent = `Please enter a valid number below ${total}.`;
              randomCountError.style.display = 'block';
              return;
            }
            randomCountError.style.display = 'none';
            randomPrompt.style.display = 'none';
            // Shuffle and take first N, then assign new serial numbers (1..N)
            const subset = shuffleInPlace(loaded.slice()).slice(0, count)
              .map((q, idx) => ({ ...q, serialNumber: idx + 1 }));
            questions = subset;
            currentIndex = 0;
            answeredIndices.clear();
            reservedIndices.clear();
            showGame();
            // Per-card background and image toggle will happen in render
            renderCard(currentIndex);
          };
        } catch (e) {
          openInfoPopover('Failed to load questions. Please try again.');
        }
        return;
      }

      let url;
      if (category === 'spill_the_truth') url = '/api/questions/spill_the_truth';
      else url = `/api/questions/${category}`;
      
      try {
        const res = await fetch(url);
        let loaded = await res.json();
        currentIndex = 0;
        answeredIndices.clear();
        reservedIndices.clear();
        showGame();
        if (category === 'fun_facts') {
          questionCard.classList.add('no-image');
        } else {
          questionCard.classList.remove('no-image');
        }
        questions = loaded;
        renderCard(currentIndex);
      } catch (error) {
        console.error('Failed to load questions:', error);
      }
    });
  });

  nextBtn.addEventListener('click', showNext);
  reserveBtn.addEventListener('click', reserveCurrent);
  
  startOverBtn?.addEventListener('click', () => {
    showLanding();
  });
  
  backBtn?.addEventListener('click', async () => {
    if (isGameInProgress()) {
      const ok = await openConfirmPopover('Are you sure you want to go back? Your current game progress will be lost.');
      if (!ok) return;
    }
    showLanding();
  });
  
  cardNumberInput?.addEventListener('change', () => {
    const val = Number(cardNumberInput.value);
    if (!Number.isInteger(val) || val < 1 || val > questions.length) {
      openInfoPopover(`Please choose a number that is below ${questions.length}.`);
      return;
    }
    
    // Find question with matching serial number
    let targetIndex = -1;
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].serialNumber === val) {
        targetIndex = i;
        break;
      }
    }
    if (targetIndex === -1) targetIndex = val - 1; // fallback to index
    
    if (targetIndex >= 0 && targetIndex < questions.length) {
      currentIndex = targetIndex;
  renderCard(currentIndex);
    }
  });

  // default state
  showLanding();
});

