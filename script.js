// --- MOTEUR DE DES ---
function rollSingleSet(x, y) {
  const dice = [];
  for (let i = 0; i < x; i++) {
    dice.push(Math.floor(Math.random() * y) + 1);
  }
  const total = dice.reduce((a, b) => a + b, 0);
  return { dice, total };
}

function applyOperator(value, operator, z) {
  if (operator === "+") return value + z;
  if (operator === "-") return value - z;
  if (operator === "*") return value * z;
  return value;
}

function rollDice({ x, y, z = 0, mode = "normal", operator = "+" }) {
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
  const finalTotal = applyOperator(baseTotal, operator, z);

  return {
    mode,
    rolls,
    selectedRoll,
    baseTotal,
    modifier: z,
    finalTotal,
    x,
    y,
    operator
  };
}

// --- HISTORIQUE ---
const history = [];

function addToHistory(result) {
  const entry = {
    x: result.x,
    y: result.y,
    operator: result.operator,
    modifier: result.modifier, // ou result.z selon ton retour
    mode: result.mode,
    finalTotal: result.finalTotal
  };
  history.unshift(entry);
  if (history.length > 10) history.pop();
}

// --- LIAISON UI ---
document.getElementById("roll-button").addEventListener("click", () => {
  const x = parseInt(document.getElementById("dice-count").value, 10);
  const y = parseInt(document.getElementById("dice-type").value, 10);
  const z = parseInt(document.getElementById("modifier").value, 10);
  const operator = document.getElementById("operator").value;
  const mode = document.getElementById("mode").value;

  const result = rollDice({ x, y, z, mode, operator });
  displayResult(result);
  addToHistory(result);
  displayHistory();
});

function displayResult(result) {
  const container = document.getElementById("result");
  container.innerHTML = "";

  result.rolls.forEach((roll, index) => {
    const selected = index === result.selectedRoll;
const crit = selected && roll.dice.some(d => d === 1 || d === result.y) ? " (CRIT !)" : "";


    const div = document.createElement("div");
    div.innerHTML = `
      <p>
        ${result.mode !== "normal" ? (selected ? "▶ " : "") : ""}
        ${result.x}d${result.y} → [${roll.dice.join(", ")}] = <strong${crit ? ' class="crit"' : ''}>${roll.total}${crit}</strong>
      </p>
    `;
    container.appendChild(div);
  });

  const final = document.createElement("p");
  final.innerHTML = `
    <hr>
    <p>Total final : <strong>${result.baseTotal} ${result.operator} ${result.modifier} = ${result.finalTotal}</strong></p>
  `;
  container.appendChild(final);
}

// --- HISTORIQUE UI ---
const toggleBtn = document.getElementById("toggle-history");
toggleBtn.addEventListener("click", () => {
  const historyDiv = document.getElementById("history");
  if (historyDiv.style.display === "none") {
    historyDiv.style.display = "block";
    toggleBtn.textContent = "▲";
  } else {
    historyDiv.style.display = "none";
    toggleBtn.textContent = "▼";
  }
});

function displayHistory() {
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "";
  if (history.length === 0) {
    historyDiv.innerHTML = '<p class="placeholder">Aucun jet pour l’instant</p>';
    return;
  }
  history.forEach(entry => {
    const p = document.createElement("p");
    p.textContent = `${entry.x}d${entry.y}${entry.operator}${entry.modifier} (${entry.mode}) => ${entry.finalTotal}`;
    historyDiv.appendChild(p);
  });
}
