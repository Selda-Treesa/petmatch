const quotes = [
  "Believe in yourself",
  "Small steps every day",
  "Consistency beats talent",
  "Start now, not later",
  "You are doing great!"
];

document.getElementById("btn").addEventListener("click", () => {
  const random = Math.floor(Math.random() * quotes.length);
  document.getElementById("quote").innerText = quotes[random];
});