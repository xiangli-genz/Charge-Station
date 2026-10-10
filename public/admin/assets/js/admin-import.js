const tokenKey = "tram_sac_admin_token";
const profileKey = "tram_sac_admin_profile";

const managerTitle = document.getElementById("managerTitle");
const managerSummary = document.getElementById("managerSummary");
const managerSearch = document.getElementById("managerSearch");
const managerSearchBtn = document.getElementById("managerSearchBtn");
const managerRefreshBtn = document.getElementById("managerRefreshBtn");
const managerCreateBtn = document.getElementById("managerCreateBtn");
const managerStatus = document.getElementById("managerStatus");
const managerCount = document.getElementById("managerCount");
const managerList = document.getElementById("managerList");

const sidebarButtons = Array.from(document.querySelectorAll(".sidebar-item"));

const { getPanelFromQuery } = window.adminEntityHelpers;
const entityConfigs = window.adminEntityConfigs;

const state = {
  activePanel: "pricings",
  managerItems: [],
  managerSearchTerm: ""
};

function getToken() {
  return localStorage.getItem(tokenKey) || "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildListLines(lines) {
  return lines
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function openEditor(panel, itemId = "") {
  const url = new URL("/admin/editor", window.location.origin);
  url.searchParams.set("panel", panel);

  if (itemId) {
    url.searchParams.set("id", itemId);
  }

  window.location.href = `${url.pathname}${url.search}`;
}

function setManagerStatus(message, isError = false) {
  if (!managerStatus) {
    return;
  }

  managerStatus.textContent = message;
  managerStatus.className = isError ? "status error" : "status";
}

function updateQueryPanel(panel) {
  const url = new URL(window.location.href);
  url.searchParams.set("panel", panel);
  window.history.replaceState({}, "", url);
}

async function requestJson(url, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("Ban can dang nhap admin truoc.");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Yeu cau that bai");
  }

  return data;
}

function setActiveSidebar(panel) {
  sidebarButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === panel);
  });
}

function renderManagerList() {
  const config = entityConfigs[state.activePanel];
  const searchTerm = state.managerSearchTerm.trim().toLowerCase();
  const filteredItems = searchTerm
    ? state.managerItems.filter((item) => config.searchText(item).includes(searchTerm))
    : state.managerItems;

  if (managerCount) {
    managerCount.textContent = `${filteredItems.length}/${state.managerItems.length} ban ghi`;
  }

  if (!filteredItems.length) {
    managerList.innerHTML = '<div class="empty-state">Khong co du lieu phu hop.</div>';
    return;
  }

  managerList.innerHTML = filteredItems
    .map((item) => {
      const view = config.renderItem(item);

      return `
        <article class="manager-item">
          <div class="manager-copy">
            <strong>${escapeHtml(view.title)}</strong>
            ${buildListLines(view.lines)}
          </div>
          <div class="manager-item-actions">
            <button class="secondary edit-item-btn" type="button" data-id="${escapeHtml(item.id)}">Sua</button>
            <button class="danger delete-item-btn" type="button" data-id="${escapeHtml(item.id)}">Xoa</button>
          </div>
        </article>
      `;
    })
    .join("");

  managerList.querySelectorAll(".edit-item-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.id) {
        openEditor(state.activePanel, button.dataset.id);
      }
    });
  });

  managerList.querySelectorAll(".delete-item-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const itemId = button.dataset.id;

      if (!itemId) {
        return;
      }

      const confirmed = window.confirm("Ban co chac muon xoa ban ghi nay khong?");

      if (!confirmed) {
        return;
      }

      try {
        button.disabled = true;
        const config = entityConfigs[state.activePanel];
        const data = await requestJson(config.deleteEndpoint(itemId), {
          method: "DELETE"
        });
        setManagerStatus(data.message || "Xoa du lieu thanh cong.");
        await loadManagerPanel(state.activePanel, true);
      } catch (error) {
        setManagerStatus(error.message || "Khong the xoa du lieu.", true);
      } finally {
        button.disabled = false;
      }
    });
  });
}

async function loadManagerPanel(panel, preserveSearch = false) {
  const config = entityConfigs[panel];

  state.activePanel = panel;
  setActiveSidebar(panel);
  updateQueryPanel(panel);

  if (!preserveSearch) {
    state.managerSearchTerm = "";
    if (managerSearch) {
      managerSearch.value = "";
    }
  }

  if (managerTitle) {
    managerTitle.textContent = config.title;
  }

  if (managerSummary) {
    managerSummary.textContent = config.summary;
  }

  setManagerStatus("Dang tai danh sach...");
  managerList.innerHTML = '<div class="empty-state">Dang tai du lieu...</div>';

  try {
    const data = await requestJson(config.listEndpoint);
    state.managerItems = Array.isArray(data.items) ? data.items : [];
    setManagerStatus(`Da tai danh sach ${config.title.toLowerCase()}.`);
    renderManagerList();
  } catch (error) {
    state.managerItems = [];
    managerList.innerHTML = '<div class="empty-state">Khong the tai du lieu.</div>';
    setManagerStatus(error.message || "Khong the tai danh sach.", true);
  }
}

function redirectToLogin() {
  window.location.href = "/admin/login";
}

async function verifySession() {
  const token = getToken();

  if (!token) {
    redirectToLogin();
    return false;
  }

  try {
    await requestJson("/api/admin/auth/me");
    return true;
  } catch {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(profileKey);
    redirectToLogin();
    return false;
  }
}

async function hydrateAdminTools() {
  const hasSession = await verifySession();

  if (hasSession) {
    await loadManagerPanel(getPanelFromQuery());
  }
}

function applyManagerSearch() {
  state.managerSearchTerm = managerSearch?.value || "";
  renderManagerList();
}

if (managerSearch) {
  managerSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyManagerSearch();
    }
  });
}

if (managerSearchBtn) {
  managerSearchBtn.addEventListener("click", applyManagerSearch);
}

if (managerRefreshBtn) {
  managerRefreshBtn.addEventListener("click", () => {
    loadManagerPanel(state.activePanel, true);
  });
}

if (managerCreateBtn) {
  managerCreateBtn.addEventListener("click", () => {
    openEditor(state.activePanel);
  });
}

sidebarButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const panel = button.dataset.panel;

    if (panel && entityConfigs[panel]) {
      loadManagerPanel(panel);
    }
  });
});

hydrateAdminTools();
