
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

  // Affichage des dés, mise en forme uniquement pour le dé critique du jet sélectionné
  const diceDisplay = roll.dice.map(d => {
    if (selected && (d === 1 || d === result.y)) return `<strong class="crit">${d}</strong>`;
    return d;
  }).join(", ");

  const div = document.createElement("div");
  div.innerHTML = `
    <p>
      ${result.mode !== "normal" ? (selected ? "▶ " : "") : ""}
      ${result.x}d${result.y} → [${diceDisplay}] = ${roll.total}
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

/* BOUTONS SWITCH MODULES */
const diceModule = document.getElementById("dice-module");
const tablesModule = document.getElementById("tables-module");

const switchToDice = document.getElementById("switch-to-dice");
const switchToTables = document.getElementById("switch-to-tables");

switchToDice.addEventListener("click", () => {
  diceModule.style.display = "block";
  tablesModule.style.display = "none";
});

switchToTables.addEventListener("click", () => {
  diceModule.style.display = "none";
  tablesModule.style.display = "block";
});

/* TABLE ALEATOIRE */
let tables = {}; // objet contenant toutes les tables importées
let tableHistory = [];

// Exemple pour tester
tables["Monstre"] = [
  "Gobelin",
  "Orc",
  "Troll",
  "Dragon"
];

document.getElementById("import-tables").addEventListener("click", () => {
  // Ici tu ajouteras plus tard le fetch depuis GitHub
  const select = document.getElementById("table-select");
  select.innerHTML = "";
  for (let tableName in tables) {
    const opt = document.createElement("option");
    opt.value = tableName;
    opt.textContent = tableName;
    select.appendChild(opt);
  }
});

document.getElementById("roll-table").addEventListener("click", () => {
  const select = document.getElementById("table-select");
  const tableName = select.value;
  if (!tableName) return alert("Veuillez sélectionner une table.");

  const table = tables[tableName];
  const index = Math.floor(Math.random() * table.length);
  const resultText = table[index];

  // Affichage résultat
  const container = document.getElementById("table-result");
  container.innerHTML = `<p>${tableName} [${index + 1}] → ${resultText}</p>`;

  // Historique
  tableHistory.unshift({ tableName, index: index + 1, resultText });
  if (tableHistory.length > 10) tableHistory.pop();
  displayTableHistory();
});

const toggleTableHistory = document.getElementById("toggle-table-history");
toggleTableHistory.addEventListener("click", () => {
  const div = document.getElementById("table-history");
  if (div.style.display === "none" || div.style.display === "") {
    div.style.display = "block";
    toggleTableHistory.textContent = "▲";
  } else {
    div.style.display = "none";
    toggleTableHistory.textContent = "▼";
  }
    document.getElementById("roll-table-custom").addEventListener("click", () => {
  const select = document.getElementById("table-select");
  const tableName = select.value;
  if (!tableName) return alert("Veuillez sélectionner une table.");

  const table = tables[tableName];
  const x = parseInt(document.getElementById("custom-dice-count").value, 10);
  const y = parseInt(document.getElementById("custom-dice-type").value, 10);

  // Lancer XdY
  let rollTotal = 0;
  for (let i = 0; i < x; i++) {
    rollTotal += Math.floor(Math.random() * y) + 1;
  }

  // Déterminer l'index dans la table
  const index = rollTotal > table.length ? table.length - 1 : rollTotal - 1;
  const resultText = table[index];

  // Affichage résultat
  const container = document.getElementById("table-result");
  container.innerHTML = `<p>${tableName} [${rollTotal}] → ${resultText}</p>`;

  // Historique
  tableHistory.unshift({ tableName, index: rollTotal, resultText });
  if (tableHistory.length > 10) tableHistory.pop();
  displayTableHistory();
});

});

function displayTableHistory() {
  const div = document.getElementById("table-history");
  div.innerHTML = "";
  if (tableHistory.length === 0) {
    div.innerHTML = '<p class="placeholder">Aucun jet pour l’instant</p>';
    return;
  }
  tableHistory.forEach(entry => {
    const p = document.createElement("p");
    p.textContent = `${entry.tableName} [${entry.index}] → ${entry.resultText}`;
    div.appendChild(p);
  });
}

/* Chargement JSON depuis GITHUB */
let tablesData = [];

async function loadTablesFromGitHub(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erreur de chargement");

    const data = await response.json();
    tablesData = data.tables;

    populateTablesDropdown();
  } catch (error) {
    alert("Impossible de charger les tables JSON.");
    console.error(error);
  }
}

function populateTablesDropdown() {
  const select = document.getElementById("table-select");
  select.innerHTML = '<option value="">— Choisir une table —</option>';

  tablesData.forEach((table, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = table.name;
    select.appendChild(option);
  });
}
function rollOnTable() {
  const select = document.getElementById("table-select");
  const index = select.value;

  if (index === "") return;

  const table = tablesData[index];
  const roll = Math.floor(Math.random() * table.entries.length);
  const result = table.entries[roll];

  displayTableResult(table.name, roll + 1, result);
}
function displayTableResult(tableName, roll, result) {
  const div = document.getElementById("table-result");
  div.innerHTML = `
    <p><strong>${tableName}</strong> [${roll}]</p>
    <p>${result}</p>
  `;
}
window.addEventListener("load", () => {
  loadTablesFromGitHub(
    "https://raw.githubusercontent.com/Solidpix/outil-mj/refs/heads/main/tables/Dragonbane_Tables.json"
  );
});
