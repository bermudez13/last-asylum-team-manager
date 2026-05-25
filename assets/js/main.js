const csvFileInput = document.getElementById("csvFileInput");
const clearBtn = document.getElementById("clearBtn");
const rankingTableBody = document.getElementById("rankingTableBody");

const totalPlayersEl = document.getElementById("totalPlayers");
const selectedPlayersEl = document.getElementById("selectedPlayers");
const backupPlayersEl = document.getElementById("backupPlayers");

const army1MightEl = document.getElementById("army1Might");
const army2MightEl = document.getElementById("army2Might");
const army3MightEl = document.getElementById("army3Might");

const army1ListEl = document.getElementById("army1List");
const army2ListEl = document.getElementById("army2List");
const army3ListEl = document.getElementById("army3List");

csvFileInput.addEventListener("change", handleCSVUpload);
clearBtn.addEventListener("click", clearApp);

function handleCSVUpload(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const csvText = e.target.result;
    const players = parseCSV(csvText);
    const rankedPlayers = rankPlayers(players);

    renderSummary(rankedPlayers);
renderArmyLists(rankedPlayers);
renderRankingTable(rankedPlayers);
  };

  reader.readAsText(file);
}

function parseCSV(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const dataLines = lines.slice(1);

  const players = dataLines.map(line => {
    const columns = line.split(",");

    const memberName = columns[0]?.trim();
    const teamMight = Number(columns[1]?.replace(/,/g, "").trim());

    return {
      memberName,
      teamMight
    };
  });

  return removeDuplicates(players)
    .filter(player => player.memberName && !Number.isNaN(player.teamMight));
}

function removeDuplicates(players) {
  const uniquePlayers = new Map();

  players.forEach(player => {
    const key = player.memberName.toLowerCase();

    if (!uniquePlayers.has(key)) {
      uniquePlayers.set(key, player);
      return;
    }

    const existingPlayer = uniquePlayers.get(key);

    if (player.teamMight > existingPlayer.teamMight) {
      uniquePlayers.set(key, player);
    }
  });

  return Array.from(uniquePlayers.values());
}

function rankPlayers(players) {
  return players
    .sort((a, b) => b.teamMight - a.teamMight)
    .map((player, index) => {
      const rank = index + 1;

      return {
        rank,
        memberName: player.memberName,
        teamMight: player.teamMight,
        army: assignArmy(rank)
      };
    });
}

function assignArmy(rank) {
  if (rank > 45) return "Backup";
  if (rank > 30) return "Army 3";

  if (rank % 4 === 1 || rank % 4 === 0) {
    return "Army 1";
  }

  return "Army 2";
}

function renderSummary(players) {
  const totalPlayers = players.length;
  const selectedPlayers = players.filter(player => player.rank <= 45).length;
  const backupPlayers = players.filter(player => player.rank > 45).length;

  const army1Might = getArmyTotalMight(players, "Army 1");
  const army2Might = getArmyTotalMight(players, "Army 2");
  const army3Might = getArmyTotalMight(players, "Army 3");

  totalPlayersEl.textContent = totalPlayers;
  selectedPlayersEl.textContent = selectedPlayers;
  backupPlayersEl.textContent = backupPlayers;

  army1MightEl.textContent = formatNumber(army1Might);
  army2MightEl.textContent = formatNumber(army2Might);
  army3MightEl.textContent = formatNumber(army3Might);
}

function getArmyTotalMight(players, armyName) {
  return players
    .filter(player => player.army === armyName)
    .reduce((total, player) => total + player.teamMight, 0);
}

function renderRankingTable(players) {
  if (players.length === 0) {
    rankingTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty">No valid players found.</td>
      </tr>
    `;
    return;
  }

  rankingTableBody.innerHTML = players.map(player => `
    <tr>
      <td>${player.rank}</td>
      <td>${player.memberName}</td>
      <td>${formatNumber(player.teamMight)}</td>
      <td class="${getArmyClass(player.army)}">${player.army}</td>
    </tr>
  `).join("");
}

function getArmyClass(army) {
  if (army === "Army 1") return "army-1";
  if (army === "Army 2") return "army-2";
  if (army === "Army 3") return "army-3";
  return "backup";
}

function formatNumber(number) {
  return number.toLocaleString("en-US");
}

function renderArmyLists(players) {
  renderSingleArmyList(players, "Army 1", army1ListEl);
  renderSingleArmyList(players, "Army 2", army2ListEl);
  renderSingleArmyList(players, "Army 3", army3ListEl);
}

function renderSingleArmyList(players, armyName, listElement) {
  const armyPlayers = players.filter(player => player.army === armyName);

  if (armyPlayers.length === 0) {
    listElement.innerHTML = `<li class="empty-list">No players yet.</li>`;
    return;
  }

  listElement.innerHTML = armyPlayers
    .map(player => `<li>${player.memberName}</li>`)
    .join("");
}

function clearApp() {
  csvFileInput.value = "";

  totalPlayersEl.textContent = "0";
  selectedPlayersEl.textContent = "0";
  backupPlayersEl.textContent = "0";

  army1MightEl.textContent = "0";
army2MightEl.textContent = "0";
army3MightEl.textContent = "0";

army1ListEl.innerHTML = `<li class="empty-list">Upload a CSV file to begin.</li>`;
army2ListEl.innerHTML = `<li class="empty-list">Upload a CSV file to begin.</li>`;
army3ListEl.innerHTML = `<li class="empty-list">Upload a CSV file to begin.</li>`;

  rankingTableBody.innerHTML = `
    <tr>
      <td colspan="4" class="empty">Upload a CSV file to begin.</td>
    </tr>
  `;
}