(function () {
  "use strict";

  var TOTAL_KICKS = 10;
  var TIMER_SECONDS = { 1: 20, 2: 15, 3: 10 };

  var state = {
    op: "add",
    level: 1,
    score: 0,
    streak: 0,
    bestStreak: 0,
    kick: 0,
    current: null,
    timerId: null,
    timeLeft: 0,
    locked: false
  };

  var el = {
    screens: {
      start: document.getElementById("screen-start"),
      game: document.getElementById("screen-game"),
      end: document.getElementById("screen-end")
    },
    opOptions: document.getElementById("op-options"),
    levelOptions: document.getElementById("level-options"),
    btnStart: document.getElementById("btn-start"),
    highscoreText: document.getElementById("highscore-text"),
    score: document.getElementById("score"),
    kickNumber: document.getElementById("kick-number"),
    totalKicks: document.getElementById("total-kicks"),
    streak: document.getElementById("streak"),
    keeper: document.getElementById("keeper"),
    ball: document.getElementById("ball"),
    resultFlash: document.getElementById("result-flash"),
    question: document.getElementById("question"),
    answers: document.getElementById("answers"),
    timerFill: document.getElementById("timer-fill"),
    endTitle: document.getElementById("end-title"),
    finalScore: document.getElementById("final-score"),
    endMessage: document.getElementById("end-message"),
    endHighscore: document.getElementById("end-highscore"),
    btnAgain: document.getElementById("btn-again"),
    btnMenu: document.getElementById("btn-menu")
  };

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[randInt(0, arr.length - 1)];
  }

  function highscoreKey() {
    return "soccer-math-best-" + state.op + "-" + state.level;
  }

  function getHighscore() {
    var v = localStorage.getItem(highscoreKey());
    return v ? parseInt(v, 10) : 0;
  }

  function saveHighscore(score) {
    if (score > getHighscore()) {
      localStorage.setItem(highscoreKey(), String(score));
      return true;
    }
    return false;
  }

  // Rentang angka per level dan operasi.
  function makeQuestion() {
    var op = state.op === "mix" ? pick(["add", "sub", "mul", "div"]) : state.op;
    var a, b, answer, text;

    if (op === "add") {
      var maxAdd = [0, 10, 50, 200][state.level];
      a = randInt(1, maxAdd);
      b = randInt(1, maxAdd);
      answer = a + b;
      text = a + " + " + b;
    } else if (op === "sub") {
      var maxSub = [0, 10, 50, 200][state.level];
      a = randInt(1, maxSub);
      b = randInt(1, maxSub);
      if (b > a) { var t = a; a = b; b = t; } // hasil tidak negatif
      answer = a - b;
      text = a + " − " + b;
    } else if (op === "mul") {
      var maxMul = [0, 5, 10, 15][state.level];
      a = randInt(2, maxMul);
      b = randInt(2, maxMul);
      answer = a * b;
      text = a + " × " + b;
    } else {
      var maxDiv = [0, 5, 10, 15][state.level];
      b = randInt(2, maxDiv);
      answer = randInt(2, maxDiv);
      a = b * answer; // pembagian selalu bulat
      text = a + " ÷ " + b;
    }

    return { text: text + " = ?", answer: answer };
  }

  function makeChoices(answer) {
    var choices = [answer];
    var spread = Math.max(3, Math.round(answer * 0.3));
    var guard = 0;
    while (choices.length < 4 && guard < 200) {
      guard++;
      var candidate = answer + randInt(-spread, spread);
      if (candidate < 0 || choices.indexOf(candidate) !== -1) continue;
      choices.push(candidate);
    }
    // Acak urutan pilihan.
    for (var i = choices.length - 1; i > 0; i--) {
      var j = randInt(0, i);
      var tmp = choices[i];
      choices[i] = choices[j];
      choices[j] = tmp;
    }
    return choices;
  }

  function showScreen(name) {
    Object.keys(el.screens).forEach(function (key) {
      el.screens[key].classList.toggle("active", key === name);
    });
  }

  function updateScoreboard() {
    el.score.textContent = state.score;
    el.kickNumber.textContent = Math.min(state.kick + 1, TOTAL_KICKS);
    el.totalKicks.textContent = TOTAL_KICKS;
    el.streak.textContent = state.streak;
  }

  function resetPitch() {
    el.keeper.className = "keeper";
    el.ball.className = "ball";
    el.resultFlash.className = "result-flash";
    el.resultFlash.textContent = "";
  }

  function animateKick(scored) {
    var side = pick(["left", "right"]);
    if (scored) {
      // Kiper melompat ke sisi yang salah.
      el.keeper.classList.add(side === "left" ? "dive-right" : "dive-left");
      el.ball.classList.add("shoot-goal-" + side);
      el.resultFlash.textContent = "GOL!";
      el.resultFlash.classList.add("show", "goal");
    } else {
      el.keeper.classList.add(side === "left" ? "dive-left" : "dive-right");
      el.ball.classList.add("shoot-saved");
      el.resultFlash.textContent = "DITEPIS!";
      el.resultFlash.classList.add("show", "miss");
    }
  }

  function startTimer() {
    stopTimer();
    var total = TIMER_SECONDS[state.level] * 1000;
    state.timeLeft = total;
    el.timerFill.classList.remove("danger");
    el.timerFill.style.width = "100%";
    var last = Date.now();
    state.timerId = setInterval(function () {
      var now = Date.now();
      state.timeLeft -= now - last;
      last = now;
      var ratio = Math.max(0, state.timeLeft / total);
      el.timerFill.style.width = (ratio * 100) + "%";
      el.timerFill.classList.toggle("danger", ratio < 0.3);
      if (state.timeLeft <= 0) {
        stopTimer();
        handleAnswer(null); // waktu habis = tendangan gagal
      }
    }, 100);
  }

  function stopTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function nextQuestion() {
    if (state.kick >= TOTAL_KICKS) {
      endGame();
      return;
    }
    state.locked = false;
    resetPitch();
    updateScoreboard();

    state.current = makeQuestion();
    el.question.textContent = state.current.text;

    el.answers.innerHTML = "";
    makeChoices(state.current.answer).forEach(function (choice) {
      var btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.textContent = choice;
      btn.addEventListener("click", function () { handleAnswer(choice, btn); });
      el.answers.appendChild(btn);
    });

    startTimer();
  }

  function handleAnswer(choice, btn) {
    if (state.locked) return;
    state.locked = true;
    stopTimer();

    var correct = choice === state.current.answer;
    var buttons = el.answers.querySelectorAll(".answer-btn");
    buttons.forEach(function (b) {
      b.disabled = true;
      if (parseInt(b.textContent, 10) === state.current.answer) {
        b.classList.add("correct");
      }
    });
    if (btn && !correct) btn.classList.add("wrong");

    if (correct) {
      state.score++;
      state.streak++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
    } else {
      state.streak = 0;
    }

    animateKick(correct);
    state.kick++;
    updateScoreboard();

    setTimeout(nextQuestion, 1400);
  }

  function startGame() {
    state.score = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.kick = 0;
    updateScoreboard();
    showScreen("game");
    nextQuestion();
  }

  function endGame() {
    stopTimer();
    var isNewBest = saveHighscore(state.score);

    el.finalScore.textContent = state.score + " / " + TOTAL_KICKS;

    var message;
    if (state.score === TOTAL_KICKS) {
      message = "Sempurna! Kamu juara dunia matematika! 🏆";
    } else if (state.score >= 7) {
      message = "Hebat! Penampilan yang luar biasa! ⭐";
    } else if (state.score >= 4) {
      message = "Lumayan! Terus berlatih ya! 💪";
    } else {
      message = "Jangan menyerah, coba lagi! ⚽";
    }
    if (state.bestStreak >= 3) {
      message += " (Gol beruntun terbaik: " + state.bestStreak + ")";
    }
    el.endMessage.textContent = message;
    el.endTitle.textContent = state.score === TOTAL_KICKS ? "SEMPURNA!" : "Pertandingan Selesai!";
    el.endHighscore.textContent = isNewBest
      ? "🎉 Rekor baru untuk mode ini!"
      : "Rekor terbaikmu di mode ini: " + getHighscore() + " gol";

    showScreen("end");
  }

  function updateStartHighscore() {
    var best = getHighscore();
    el.highscoreText.textContent = best > 0
      ? "Rekor terbaikmu di mode ini: " + best + " gol"
      : "Belum ada rekor untuk mode ini — jadilah yang pertama!";
  }

  function bindOptionGroup(container, attr, onChange) {
    container.addEventListener("click", function (e) {
      var target = e.target.closest(".option");
      if (!target) return;
      container.querySelectorAll(".option").forEach(function (b) {
        b.classList.remove("selected");
      });
      target.classList.add("selected");
      onChange(target.dataset[attr]);
    });
  }

  bindOptionGroup(el.opOptions, "op", function (value) {
    state.op = value;
    updateStartHighscore();
  });

  bindOptionGroup(el.levelOptions, "level", function (value) {
    state.level = parseInt(value, 10);
    updateStartHighscore();
  });

  el.btnStart.addEventListener("click", startGame);
  el.btnAgain.addEventListener("click", startGame);
  el.btnMenu.addEventListener("click", function () {
    updateStartHighscore();
    showScreen("start");
  });

  updateStartHighscore();
})();
