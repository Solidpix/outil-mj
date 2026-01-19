function rollSingleSet(x, y) {
  const dice = [];
  for (let i = 0; i < x; i++) {
    dice.push(Math.floor(Math.random() * y) + 1);
  }
  const total = dice.reduce((a, b) => a + b, 0);
  return { dice, total };
}

function applyOperator(value, operator, z) {
  if (operator === "+" && z !== null) return value + z;
  if (operator === "-" && z !== null) return value - z;
  if (operator === "*" && z !== null) return value * z;
  return value;
}

function rollDice({ x, y, operator = null, z = null, mode = "normal" }) {
  const rolls = [];

  if (mode === "normal") {
    rolls.push(rollSingleSet(x, y));
  } else {
    rolls.push(rollSingleSet(x, y));
    rolls.push(rollSingleSet(x, y));
  }

  let selectedRoll = 0;

  if (mode === "advantage") {
    selectedRoll = rolls[0].total >= rolls[1].total ? 0 : 1;
  }

  if (mode === "disadvantage") {
    selectedRoll = rolls[0].total <= rolls[1].total ? 0 : 1;
  }

  const baseTotal = rolls[selectedRoll].total;
  const finalTotal = applyOperator(baseTotal, operator, z);

  return {
    mode,
    rolls,
    selectedRoll,
    baseTotal,
    finalTotal
  };
}

document.getElementById("roll-button").addEventListener("click", () => {
  const x = parseInt(document.getElementById("dice-count").value, 10);
  const y = parseInt(document.getElementById("dice-type").value, 10);
  const operator = document.getElementById("operator").value || null;
  const zValue = document.getElementById("modifier").value;
  const z = operator ? parseInt(zValue, 10) : null;
  const mode = document.getElementById("mode").value;

  const result = rollDice({ x, y, operator, z, mode });
  displayResult(result, x, y, operator, z);
});

function displayResult(result, x, y, operator, z) {
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

  const modText = operator && z !== null ? ` ${operator} ${z}` : "";

  const final = document.createElement("p");
  final.innerHTML = `
    <hr>
    <p>Total final : <strong>${result.baseTotal}${modText} = ${result.finalTotal}</strong></p>
  `;
  container.appendChild(final);
}
