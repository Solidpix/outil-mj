// --- CAMPAGNES DISPONIBLES ---
const campaigns = {
  "Dragonbane": {
    url: "https://raw.githubusercontent.com/Solidpix/outil-mj/main/tables/Dragonbane.json"
  },
  "Alien RPG": {
    url: "https://raw.githubusercontent.com/Solidpix/outil-mj/main/tables/Alien.json"
  },
  "Dragonbane - Duo": {
    url: "https://raw.githubusercontent.com/Solidpix/outil-mj/main/tables/Dragonbane_Duo.json"
  }
};

// --- CHARGEMENT DU MENU CAMPAGNE --- //
const campaignSelect = document.getElementById("campaign-select");

function populateCampaigns() {
  campaignSelect.innerHTML = '<option value="">— Choisir une campagne —</option>';

  Object.keys(campaigns).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    campaignSelect.appendChild(option);
  });
}

populateCampaigns();


// --- CHARGEMENT DU JSON QUAND ON CHARGE UNE CAMPAGNE --- //
let tablesData = {};

campaignSelect.addEventListener("change", async () => {
  const campaignName = campaignSelect.value;
  if (!campaignName) return;

  const url = campaigns[campaignName].url;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erreur de chargement");

    const json = await response.json();
    tablesData = json.tables; // objet { nomTable: [entries] }
    populateTableSelect();


  } catch (err) {
    alert("Impossible de charger la campagne.");
    console.error(err);
  }
});


// --- REMPLISSAGE DU MENU DES TABLES --- //
const tableSelect = document.getElementById("table-select");

function populateTableSelect() {
  tableSelect.innerHTML = '<option value="">— Choisir une table —</option>';

  Object.keys(tablesData).forEach(tableName => {
    const option = document.createElement("option");
    option.value = tableName;      // 🔑 clé = nom de table
    option.textContent = tableName;
    tableSelect.appendChild(option);
  });
}


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
let tableHistory = [];

document.getElementById("roll-table").addEventListener("click", () => {
  if (tableSelect.value === "") {
    alert("Veuillez sélectionner une table.");
    return;
  }

  const tableName = tableSelect.value;
  const entries = tablesData[tableName];

  if (!Array.isArray(entries) || entries.length === 0) {
    alert("Table vide ou invalide.");
    return;
  }

  const roll = Math.floor(Math.random() * entries.length);
  const resultText = entries[roll];

  document.getElementById("table-result").innerHTML =
    `<p>${tableName} [${roll + 1}] → ${resultText}</p>`;

  tableHistory.unshift({
    tableName,
    index: roll + 1,
    resultText
  });

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

});

document.getElementById("roll-table-custom").addEventListener("click", () => {
  if (tableSelect.value === "") {
    alert("Veuillez sélectionner une table.");
    return;
  }

  const tableName = tableSelect.value;
  const entries = tablesData[tableName];

  if (!Array.isArray(entries) || entries.length === 0) {
    alert("Table vide ou invalide.");
    return;
  }

  const x = parseInt(document.getElementById("custom-dice-count").value, 10);
  const y = parseInt(document.getElementById("custom-dice-type").value, 10);

  let rollTotal = 0;
  for (let i = 0; i < x; i++) {
    rollTotal += Math.floor(Math.random() * y) + 1;
  }

  const entryIndex = Math.min(rollTotal - 1, entries.length - 1);
  const resultText = entries[entryIndex];

  document.getElementById("table-result").innerHTML =
    `<p>${tableName} [${rollTotal}] → ${resultText}</p>`;

  tableHistory.unshift({
    tableName,
    index: rollTotal,
    resultText
  });

  if (tableHistory.length > 10) tableHistory.pop();
  displayTableHistory();
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
