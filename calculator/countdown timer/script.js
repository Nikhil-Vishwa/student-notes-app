const display = document.getElementById("display");
const hoursInput = document.getElementById("hours");
const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("seconds");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

let remainingSeconds = 0;
let timerId = null;

const pad = (value) => value.toString().padStart(2, "0");

const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const updateDisplay = () => {
  display.textContent = formatTime(remainingSeconds);
};

const readInputs = () => {
  const hours = Math.max(0, Number.parseInt(hoursInput.value || "0", 10));
  const minutes = Math.max(0, Number.parseInt(minutesInput.value || "0", 10));
  const seconds = Math.max(0, Number.parseInt(secondsInput.value || "0", 10));
  return hours * 3600 + minutes * 60 + seconds;
};

const syncInputs = () => {
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  hoursInput.value = hours;
  minutesInput.value = minutes;
  secondsInput.value = seconds;
};

const setControls = (running) => {
  startBtn.disabled = running || remainingSeconds === 0;
  pauseBtn.disabled = !running;
  resetBtn.disabled = remainingSeconds === 0 && !running;
};

const tick = () => {
  if (remainingSeconds <= 0) {
    clearInterval(timerId);
    timerId = null;
    remainingSeconds = 0;
    setControls(false);
    updateDisplay();
    return;
  }
  remainingSeconds -= 1;
  updateDisplay();
  syncInputs();
};

const startTimer = () => {
  if (timerId) {
    return;
  }
  if (remainingSeconds === 0) {
    remainingSeconds = readInputs();
  }
  if (remainingSeconds === 0) {
    return;
  }
  updateDisplay();
  syncInputs();
  timerId = setInterval(tick, 1000);
  setControls(true);
};

const pauseTimer = () => {
  if (!timerId) {
    return;
  }
  clearInterval(timerId);
  timerId = null;
  setControls(false);
};

const resetTimer = () => {
  clearInterval(timerId);
  timerId = null;
  remainingSeconds = 0;
  hoursInput.value = "";
  minutesInput.value = "";
  secondsInput.value = "";
  updateDisplay();
  setControls(false);
};

[hoursInput, minutesInput, secondsInput].forEach((input) => {
  input.addEventListener("input", () => {
    if (timerId) {
      return;
    }
    remainingSeconds = readInputs();
    updateDisplay();
    setControls(false);
  });
});

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateDisplay();
