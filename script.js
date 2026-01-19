// --- MOTEUR DE DES ---
function rollSingleSet(x, y) {
  const dice = [];
  for (let i = 0; i < x; i++) {
    dice.push(Math.floor(Math.random() * y) + 1);
  }
  const total = dice.reduce((a, b) => a + b, 0);
  return { dice, total };
}

function rollDice({ x, y, z = 0, mode = "normal" }) {
  const rolls = [];

  if (mode === "normal") {
    rolls.push(rollSingleSet(x, y));
  } else {
    rolls.push(rollSingleSet(x, y));
    rolls.push(rollSingleSet(x, y));
  }

  let selectedRoll = 0;

  if (mode === "max") {
    selectedRoll = rolls[0].total >= rolls[1].total ? 0 : 1;
  }

  if (mode === "min") {
    selectedRoll = rolls[0].total <= rolls[1].total ? 0 : 1;
  }

  const baseTotal = rolls[selectedRoll].total;
  const finalTotal = baseTotal + z;

  return {
    mode,
    rolls,
    selectedRoll,
    baseTotal,
    modifier: z,
    finalTotal
  };
}

// --- LIAISON UI ---
document.getElementById("roll-button").addEventListener("click", () => {
  const x = parseInt(document.getElementById("dice-count").value, 10);
  const y = parseInt(document.getElementById("dice-type").value, 10);
  const z = parseInt(document.getElementById("modifier").value, 10);
  const mode = document.getElementById("mode").value;

  const result = rollDice({ x, y, z, mode });
  displayResult(result, x, y);
});

function displayResult(result, x, y) {
  const container = document.getElementById("result");
  container.innerHTML = "";

  result.rolls.forEach((roll, index) => {
    const div = document.createElement("div");
    const selected = index === result.selectedRoll;

    div.innerHTML = `
      <p>
        ${result.mode !== "normal" ? (selected ? "▶ " : "") : ""}
        ${x}d${y} → [${roll.dice.join(", ")}] = <strong>${roll.total}</strong>
      </p>
    `;

    if (selected) div.style.color = "#8fd18f";
    container.appendChild(div);
  });

  const final = document.createElement("p");
  final.innerHTML = `
    <hr>
    <p>Total final : <strong>${result.baseTotal} + ${result.modifier} = ${result.finalTotal}</strong></p>
  `;
  container.appendChild(final);
}
