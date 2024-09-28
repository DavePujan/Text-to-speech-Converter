const textArea = document.getElementById("text");
const voiceSelect = document.getElementById("voiceSelect");
const playBtn = document.getElementById("playBtn");
const regenerateBtn = document.getElementById("regenerateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const loader = document.getElementById("loader");
let voices = [];
let selectedVoice;
let speechSynthesisUtterance;

// Fetch and populate voices
function populateVoiceList() {
  voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";
  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  // Auto-select English (India)
  const englishIndiaVoice = voices.find((voice) => voice.lang === "en-IN");
  if (englishIndiaVoice) {
    voiceSelect.value = englishIndiaVoice.name;
  }
}

speechSynthesis.onvoiceschanged = populateVoiceList;

// Play text as speech
playBtn.addEventListener("click", () => {
  const text = textArea.value;
  if (text.trim() === "") {
    alert("Please enter some text");
    return;
  }

  loader.style.display = "inline-block"; // Show loader
  speechSynthesis.cancel(); // Cancel previous speech
  speechSynthesisUtterance = new SpeechSynthesisUtterance(text);
  selectedVoice = voices.find((voice) => voice.name === voiceSelect.value);
  speechSynthesisUtterance.voice = selectedVoice;

  speechSynthesisUtterance.onend = () => {
    loader.style.display = "none"; // Hide loader
    regenerateBtn.classList.remove("hidden"); // Show the regenerate button
  };

  speechSynthesis.speak(speechSynthesisUtterance);
});

// Regenerate speech
regenerateBtn.addEventListener("click", () => {
  playBtn.click();
});

// Download the speech as an audio file
downloadBtn.addEventListener("click", () => {
  const text = textArea.value;
  if (text.trim() === "") {
    alert("Please enter some text");
    return;
  }

  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = selectedVoice;

  // Use Web Audio API to record and download as WAV
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const destination = audioContext.createMediaStreamDestination();
  const mediaRecorder = new MediaRecorder(destination.stream);

  mediaRecorder.ondataavailable = (event) => {
    const audioURL = URL.createObjectURL(event.data);
    const a = document.createElement("a");
    a.href = audioURL;
    a.download = "speech.wav"; // WAV format, change extension as needed
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  mediaRecorder.start();
  synth.speak(utterance);
  utterance.onend = () => {
    mediaRecorder.stop();
  };
});
