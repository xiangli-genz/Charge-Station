const tokenKey = "tram_sac_admin_token";
const profileKey = "tram_sac_admin_profile";

const manualDataset = document.getElementById("manualDataset");
const manualHint = document.getElementById("manualHint");
const manualFieldGrid = document.getElementById("manualFieldGrid");
const manualSubmitBtn = document.getElementById("manualSubmitBtn");
const manualResetBtn = document.getElementById("manualResetBtn");
const manualStatus = document.getElementById("manualStatus");
const manualFormTitle = document.getElementById("manualFormTitle");
const manualFormLead = document.getElementById("manualFormLead");
const manualModeBadge = document.getElementById("manualModeBadge");
const editorPageTitle = document.getElementById("editorPageTitle");
const editorPageLead = document.getElementById("editorPageLead");

const { getPanelFromQuery } = window.adminEntityHelpers;
const entityConfigs = window.adminEntityConfigs;

const state = {
  panel: getPanelFromQuery(),
  itemId: new URLSearchParams(window.location.search).get("id") || "",
  mode: "create"
};

function getToken() {
  return localStorage.getItem(tokenKey) || "";
}

function redirectToLogin() {
  window.location.href = "/admin/login";
}

function backToList() {
  window.location.href = `/admin-tools?panel=${encodeURIComponent(state.panel)}`;
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

function setManualStatus(message, isError = false) {
  if (!manualStatus) {
    return;
  }

  manualStatus.textContent = message;
  manualStatus.className = isError ? "status error" : "status";
}

function createFieldElement(field) {
  const wrapper = document.createElement("div");
  wrapper.className = field.type === "textarea" ? "manual-field wide-field" : "manual-field";

  const label = document.createElement("label");
  label.setAttribute("for", `manual-${field.key}`);
  label.textContent = field.label;
  wrapper.appendChild(label);

  let input;

  if (field.type === "select") {
    input = document.createElement("select");
    field.options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      input.appendChild(optionElement);
    });
  } else if (field.type === "textarea") {
    input = document.createElement("textarea");
    input.rows = 4;
  } else {
    input = document.createElement("input");
    input.type = field.type;
  }

  input.id = `manual-${field.key}`;
  input.dataset.fieldKey = field.key;
  input.placeholder = field.placeholder || "";

  if (field.required) {
    input.required = true;
  }

  if (field.min) {
    input.min = field.min;
  }

  if (field.step) {
    input.step = field.step;
  }

  wrapper.appendChild(input);
  return wrapper;
}

function setDefaultBookingTimes() {
  const now = new Date();
  const start = new Date(now.getTime() + 60 * 60 * 1000);
  const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const startInput = document.getElementById("manual-startTime");
  const endInput = document.getElementById("manual-endTime");

  if (startInput && !startInput.value) {
    startInput.value = window.adminEntityHelpers.toDatetimeLocalValue(start);
  }

  if (endInput && !endInput.value) {
    endInput.value = window.adminEntityHelpers.toDatetimeLocalValue(end);
  }
}

function renderForm(panel) {
  const config = entityConfigs[panel];

  manualFieldGrid.innerHTML = "";
  config.fields.forEach((field) => {
    manualFieldGrid.appendChild(createFieldElement(field));
  });

  manualDataset.value = panel;
  manualHint.value = config.hint;
  manualFormTitle.textContent = config.formTitle;
  manualFormLead.textContent = config.formLead;
  editorPageTitle.textContent = config.formTitle;
  editorPageLead.textContent = config.formLead;
  manualModeBadge.textContent = state.mode === "edit" ? "Dang sua" : "Tao moi";
  manualSubmitBtn.textContent = state.mode === "edit" ? "Cap nhat du lieu" : "Tao du lieu";

  if (panel === "bookings" && state.mode === "create") {
    setDefaultBookingTimes();
  }
}

function collectValues() {
  const values = {};

  manualFieldGrid.querySelectorAll("[data-field-key]").forEach((input) => {
    values[input.dataset.fieldKey] = input.value.trim();
  });

  return values;
}

function populateForm(panel, item) {
  const values = entityConfigs[panel].toFormValues(item);

  Object.entries(values).forEach(([key, value]) => {
    const input = document.getElementById(`manual-${key}`);

    if (input) {
      input.value = value;
    }
  });
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

async function hydrateEditor() {
  const hasSession = await verifySession();

  if (!hasSession) {
    return;
  }

  renderForm(state.panel);

  if (!state.itemId) {
    setManualStatus("Dang o che do tao moi.");
    return;
  }

  state.mode = "edit";
  renderForm(state.panel);

  try {
    setManualStatus("Dang tai du lieu can sua...");
    const config = entityConfigs[state.panel];
    const data = await requestJson(config.getEndpoint(state.itemId));
    populateForm(state.panel, data.item);
    setManualStatus(`Dang sua ${config.title.toLowerCase()} co id ${state.itemId}.`);
  } catch (error) {
    setManualStatus(error.message || "Khong the tai du lieu can sua.", true);
  }
}

async function submitForm() {
  try {
    const config = entityConfigs[state.panel];
    const values = collectValues();
    const payload = config.buildPayload(values, state.mode);
    const endpoint =
      state.mode === "edit"
        ? config.updateEndpoint(state.itemId)
        : config.createEndpoint;
    const method = state.mode === "edit" ? "PATCH" : "POST";

    setManualStatus(
      state.mode === "edit" ? "Dang cap nhat du lieu..." : "Dang tao du lieu..."
    );

    const data = await requestJson(endpoint, {
      method,
      body: JSON.stringify(payload)
    });

    setManualStatus(data.message || "Xu ly du lieu thanh cong.");
    setTimeout(backToList, 700);
  } catch (error) {
    setManualStatus(error.message || "Khong the gui form.", true);
  }
}

if (manualDataset) {
  manualDataset.addEventListener("change", () => {
    state.panel = manualDataset.value;
    state.itemId = "";
    state.mode = "create";
    renderForm(state.panel);
    setManualStatus("Da chuyen sang loai du lieu moi.");
  });
}

if (manualSubmitBtn) {
  manualSubmitBtn.addEventListener("click", submitForm);
}

if (manualResetBtn) {
  manualResetBtn.addEventListener("click", () => {
    if (state.itemId) {
      hydrateEditor();
      return;
    }

    renderForm(state.panel);
    setManualStatus("Da lam moi form.");
  });
}

hydrateEditor();
