let questions = [];
let currentQuestion = 0;
let score = 0;
let correct = 0;
let wrong = 0;
let timer;
let timeLeft = 20;
let soundOn = true;
let highScore = localStorage.getItem("highScore") || 0;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const summary = document.getElementById("summary");
const totalQ = document.getElementById("totalQ");
const correctQ = document.getElementById("correctQ");
const wrongQ = document.getElementById("wrongQ");
const soundBtn = document.getElementById("soundToggle");

highScoreEl.style.display = "none"; 
highScoreEl.textContent = `High Score: ${highScore}`;

soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
};

function fetchCategories() {
  fetch("https://opentdb.com/api_category.php")
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById("categories");
      container.innerHTML = "";

      data.trivia_categories
        .sort((a, b) => a.name.length - b.name.length)
        .slice(0, 15)
        .forEach((category, index) => {
          const div = document.createElement("div");
          div.className = "category";
          div.style.animationDelay = `${index * 0.2}s`;  
          div.textContent = category.name;
          div.addEventListener("click", () => startQuiz(category.id));
          container.appendChild(div);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchCategories();
});

function startQuiz(categoryId) {
  document.getElementById("categoryContainer").style.display = "none";
  document.getElementById("quizSection").style.display = "block";
  timerEl.style.display = "inline-block";
  scoreEl.style.display = "inline-block";
  highScoreEl.style.display = "inline-block";
  fetchQuestions(categoryId);
}

async function fetchQuestions(categoryId) {
  const res = await fetch(`https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple`);
  const data = await res.json();
  questions = data.results.map(q => ({
    question: decodeHTML(q.question),
    options: shuffle([...q.incorrect_answers.map(decodeHTML), decodeHTML(q.correct_answer)]),
    answer: decodeHTML(q.correct_answer)
  }));
  loadQuestion();
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 20;
  timerEl.textContent = `⏱️ ${timeLeft}s`;
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `⏱️ ${timeLeft}s`;

    

    if (timeLeft <= 0) {
      clearInterval(timer);
      wrong++;
      showCorrectAnswer();
      
      document.querySelector(".nav-buttons button:nth-child(2)").disabled = false;

    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function loadQuestion() {
  if (currentQuestion >= questions.length) return showSummary();

  const q = questions[currentQuestion];
  questionEl.textContent = `Q${currentQuestion + 1}: ${q.question}`;
  optionsEl.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("div");
    btn.className = "option";
    btn.textContent = opt;
    btn.onclick = () => selectOption(btn, q.answer);
    optionsEl.appendChild(btn);
  });

  document.querySelector(".nav-buttons button:nth-child(2)").disabled = true;
  resetTimer()
  startTimer();
}

function selectOption(optionEl, correctAnswer) {
  stopTimer();
  const selected = optionEl.textContent;
  
  optionEl.style.animationDelay = `0.2s`;

  // **Play the sound first and use a slight delay for class addition**
  if (selected === correctAnswer) {
    if (soundOn) document.getElementById("correctSound").play();
    
    // Slight delay to sync sound and class addition
    setTimeout(() => {
      optionEl.classList.add("correct");

      // Trigger confetti effect when the answer is correct
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.4 },
        colors: ['#bb0000', '#ffffff']
      });
    }, 500);

    score += 10;
    correct++;
  } else {
    if (soundOn) document.getElementById("wrongSound").play();
    
    setTimeout(() => {
      optionEl.classList.add("wrong");
      showCorrectAnswer();
    }, 400);

    wrong++;
  }

  scoreEl.textContent = `Score: ${score}`;
  [...optionsEl.children].forEach((opt, index) => {
    opt.style.animation = `optionSlideIn 0.5s ease forwards`;
    opt.style.animationDelay = `${index * 0.2}s`;
    opt.onclick = null;
  });

  document.querySelector(".nav-buttons button:nth-child(2)").disabled = false;
}


function previousQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  }
}

function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    loadQuestion();
  } else {
    showSummary();
  }
}

function showCorrectAnswer() {
  [...optionsEl.children].forEach(opt => {
    if (opt.textContent === questions[currentQuestion].answer) {
      opt.classList.add("correct");
    }
    opt.onclick = null;
  });
}

function showSummary() {
  document.getElementById("quizSection").style.display = "none";
  summary.style.display = "block";

  totalQ.textContent = questions.length;
  correctQ.textContent = correct;
  wrongQ.textContent = wrong;

  confetti({
    particleCount: 200,
    spread: 70,
    origin: { y: 0.6 }
  });

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    highScoreEl.textContent = `High Score: ${highScore}`;
    console.log("New High Score Set : ", highScore)
  }  
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  correct = 0;
  wrong = 0;
  questions = [];

  summary.style.display = "none";
  document.getElementById("quizSection").style.display = "none";
  document.getElementById("categoryContainer").style.display = "block";

  scoreEl.textContent = "Score: 0";
  timerEl.textContent = `⏱️ 15s`;

  highScore = localStorage.getItem("highScore") || 0;
  highScoreEl.textContent = `High Score: ${highScore}`;

  fetchCategories();
}
