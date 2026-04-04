const sideBarButtons = document.querySelectorAll(".side-bar-button");
const leaderboardContainer = document.getElementById("leaderboard-container");
const CACHE_TTL_MS = 20 * 60 * 1000;
const CACHE_STORAGE_KEY = "leaderboards:cache:v1";
const CACHE_TS_STORAGE_KEY = "leaderboards:cache-ts:v1";

const embeddedCache = readJson("leaderboard-cache", {});
let leaderboardCache = Object.keys(embeddedCache).length > 0
  ? embeddedCache
  : readPersistentCache();
let activeBtn = readJson("selected-test-type", "Scriptures 10");
let isRevalidating = false;

if (Object.keys(embeddedCache).length > 0) {
  writePersistentCache(embeddedCache);
  markCacheTimestamp(Date.now());
}

function readJson(scriptId, fallbackValue) {
  const scriptElement = document.getElementById(scriptId);
  if (!scriptElement || !scriptElement.textContent) {
    return fallbackValue;
  }

  try {
    return JSON.parse(scriptElement.textContent);
  } catch (error) {
    return fallbackValue;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readPersistentCache() {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function writePersistentCache(cacheValue) {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheValue));
  } catch (error) {
    // Ignore storage write failures (private mode/quota limits).
  }
}

function readCacheTimestamp() {
  try {
    const raw = localStorage.getItem(CACHE_TS_STORAGE_KEY);
    if (!raw) {
      return 0;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch (error) {
    return 0;
  }
}

function markCacheTimestamp(timestampMs) {
  try {
    localStorage.setItem(CACHE_TS_STORAGE_KEY, String(timestampMs));
  } catch (error) {
    // Ignore storage write failures (private mode/quota limits).
  }
}

function hasCacheContent(cacheValue) {
  return !!cacheValue && typeof cacheValue === "object" && Object.keys(cacheValue).length > 0;
}

function shouldRevalidate() {
  if (!hasCacheContent(leaderboardCache)) {
    return true;
  }

  const lastUpdatedMs = readCacheTimestamp();
  if (!lastUpdatedMs) {
    return true;
  }

  return (Date.now() - lastUpdatedMs) >= CACHE_TTL_MS;
}

function revalidateAllLeaderboards() {
  if (isRevalidating || !shouldRevalidate()) {
    return;
  }

  isRevalidating = true;

  fetch("/leaderboards?type=" + encodeURIComponent(activeBtn), {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to revalidate leaderboards");
      }
      return response.json();
    })
    .then(payload => {
      if (!payload || !payload.leaderboards || typeof payload.leaderboards !== "object") {
        return;
      }

      leaderboardCache = payload.leaderboards;
      writePersistentCache(leaderboardCache);
      markCacheTimestamp(Date.now());

      const activeSlice = leaderboardCache[activeBtn];
      if (activeSlice && Array.isArray(activeSlice.top_10)) {
        renderLeaderboardSlice(activeSlice);
      }
    })
    .catch(() => {
      // Keep stale data on screen if refresh fails.
    })
    .finally(() => {
      isRevalidating = false;
    });
}

function renderRows(top10, playerPositionInfo) {
  if (!Array.isArray(top10) || top10.length === 0) {
    return '<tr><td colspan="5" style="text-align: center;">Be the first to set a record</td></tr>';
  }

  const firstRankIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="fill: #595E76; background: none;" class="rank-icon"><path d="M345 151.2C354.2 143.9 360 132.6 360 120C360 97.9 342.1 80 320 80C297.9 80 280 97.9 280 120C280 132.6 285.9 143.9 295 151.2L226.6 258.8C216.6 274.5 195.3 278.4 180.4 267.2L120.9 222.7C125.4 216.3 128 208.4 128 200C128 177.9 110.1 160 88 160C65.9 160 48 177.9 48 200C48 221.8 65.5 239.6 87.2 240L119.8 457.5C124.5 488.8 151.4 512 183.1 512L456.9 512C488.6 512 515.5 488.8 520.2 457.5L552.8 240C574.5 239.6 592 221.8 592 200C592 177.9 574.1 160 552 160C529.9 160 512 177.9 512 200C512 208.4 514.6 216.3 519.1 222.7L459.7 267.3C444.8 278.5 423.5 274.6 413.5 258.9L345 151.2z" /></svg>';

  const topRows = top10.map((data, index) => {
    const isPlayerInTopTen = Array.isArray(playerPositionInfo)
      && playerPositionInfo[0] <= 10
      && data[0] === playerPositionInfo[1];
    const positionCell = index === 0 ? firstRankIcon : escapeHtml(index + 1);
    const countryCode = data[2] ? String(data[2]).toLowerCase() : "xx";

    return '<tr class="table-rows' + (isPlayerInTopTen ? ' player-highlight' : '') + '">'
      + '<td><span style="background: none;">' + positionCell + '</span></td>'
      + '<td><span class="player-name" style="background: none;">' + escapeHtml(data[1]) + '</span></td>'
      + '<td class="leaderboard-flag-column"><div style="background: none;" class="leaderboard-flag-area">'
      + '<span class="fi fi-xx fi-' + escapeHtml(countryCode) + ' leaderboard-profile-flag" data-country="' + escapeHtml(data[5]) + '" aria-label="' + escapeHtml(data[5]) + '" tabindex="0"></span>'
      + '<span class="country-tip-text">' + escapeHtml(data[5]) + '</span>'
      + '</div></td>'
      + '<td><span style="background: none;">' + escapeHtml(data[3]) + '</span></td>'
      + '<td><span style="background: none;">' + escapeHtml(data[4]) + '</span></td>'
      + '</tr>';
  }).join("");

  if (Array.isArray(playerPositionInfo) && playerPositionInfo[0] > 10) {
    const playerCountryCode = playerPositionInfo[3] ? String(playerPositionInfo[3]).toLowerCase() : "xx";
    return topRows
      + '<tr class="table-rows player-highlight">'
      + '<td><span style="background: none;">' + escapeHtml(playerPositionInfo[0]) + '</span></td>'
      + '<td><span class="player-name" style="background: none;">' + escapeHtml(playerPositionInfo[2]) + '</span></td>'
      + '<td class="leaderboard-flag-column"><div class="leaderboard-flag-area" style="background: none;">'
      + '<span class="fi fi-xx fi-' + escapeHtml(playerCountryCode) + ' leaderboard-profile-flag" data-country="' + escapeHtml(playerPositionInfo[6]) + '" aria-label="' + escapeHtml(playerPositionInfo[6]) + '" tabindex="0"></span>'
      + '<span class="country-tip-text">' + escapeHtml(playerPositionInfo[6]) + '</span>'
      + '</div></td>'
      + '<td><span style="background: none;">' + escapeHtml(playerPositionInfo[4]) + '</span></td>'
      + '<td><span style="background: none;">' + escapeHtml(playerPositionInfo[5]) + '</span></td>'
      + '</tr>';
  }

  return topRows;
}

function renderLeaderboardSlice(slice) {
  const top10 = slice && slice.top_10 ? slice.top_10 : [];
  const playerPositionInfo = slice ? slice.player_position_info : null;
  const tableHtml = '<table id="main-leaderboard-table">'
    + '<thead><tr><th>Position</th><th>Name</th><th>Country</th><th>Score</th><th>Software used</th></tr></thead>'
    + '<tbody class="table-body" id="table-body">'
    + renderRows(top10, playerPositionInfo)
    + '</tbody>'
    + '</table>';

  leaderboardContainer.innerHTML = tableHtml;
}

function setActiveButton(button) {
  sideBarButtons.forEach(btn => btn.classList.remove("leaderboard-active"));
  button.classList.add("leaderboard-active");
}

function fallbackToBackend(type) {
  return fetch("/leaderboards?partial=true&type=" + encodeURIComponent(type), {
    method: "GET"
  })
    .then(response => response.text())
    .then(html => {
      leaderboardContainer.innerHTML = html;
    });
}

function loadLeaderboard(type) {
  const cachedSlice = leaderboardCache ? leaderboardCache[type] : null;
  if (cachedSlice && Array.isArray(cachedSlice.top_10)) {
    renderLeaderboardSlice(cachedSlice);
    revalidateAllLeaderboards();
    return;
  }

  fallbackToBackend(type)
    .catch(() => {
      // Keep the current view if fallback fails.
    });
}

sideBarButtons.forEach(button => {
  button.addEventListener("click", function () {
    setActiveButton(this);
    activeBtn = this.textContent.trim();
    loadLeaderboard(activeBtn);
  });
});

loadLeaderboard(activeBtn);