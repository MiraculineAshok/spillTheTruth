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

  let questions = [];
  let currentIndex = 0;
  let reservedIndices = new Set();

  function showLanding() {
    landingPage.style.display = 'block';
    cardContainer.style.display = 'none';
  }

  function showGame() {
    landingPage.style.display = 'none';
    cardContainer.style.display = 'block';
  }

  function renderCard(index) {
    const q = questions[index];
    if (!q) return;
    imageEl.src = q.imageUrl || '';
    questionEl.textContent = q.question || '';
    serialBadge.textContent = q.serialNumber ? `#${q.serialNumber}` : '';
  }

  function showNext() {
    // find next non-reserved
    let next = currentIndex + 1;
    while (next < questions.length && reservedIndices.has(next)) next++;
    if (next >= questions.length) {
      gameOver.style.display = 'block';
      questionCard.style.display = 'none';
      return;
    }
    currentIndex = next;
    renderCard(currentIndex);
  }

  // category selection
  document.querySelectorAll('.category-card').forEach(card => {
    const img = card.dataset.image;
    const bg = document.createElement('div');
    bg.className = 'category-card-bg';
    bg.style.backgroundImage = `url(${img})`;
    card.appendChild(bg);
    card.addEventListener('click', async () => {
      const category = card.dataset.category;
      let url = '/api/questions';
      if (category === 'random') url = '/api/questions_random';
      else if (category && category !== 'spill_the_truth') url = `/api/questions/${category}`;
      const res = await fetch(url);
      questions = await res.json();
      currentIndex = 0;
      reservedIndices.clear();
      gameOver.style.display = 'none';
      questionCard.style.display = 'flex';
      showGame();
      renderCard(currentIndex);
    });
  });

  nextBtn.addEventListener('click', showNext);
  reserveBtn.addEventListener('click', () => {
    reservedIndices.add(currentIndex);
    showNext();
  });
  startOverBtn?.addEventListener('click', () => {
    showLanding();
  });
  backBtn?.addEventListener('click', () => {
    showLanding();
  });
  cardNumberInput?.addEventListener('change', () => {
    const val = Number(cardNumberInput.value);
    if (!Number.isInteger(val) || val < 1 || val > questions.length) return;
    const idx = val - 1;
    currentIndex = idx;
    renderCard(currentIndex);
  });

  // default state
  showLanding();
});


