const importTokenKey = "tram_sac_admin_token";
const importProfileKey = "tram_sac_admin_profile";

const datasetSelect = document.getElementById("dataset");
const formatSelect = document.getElementById("format");
const modeSelect = document.getElementById("mode");
const fileInput = document.getElementById("fileInput");
const contentInput = document.getElementById("content");
const importBtn = document.getElementById("importBtn");
const clearBtn = document.getElementById("clearBtn");
const importStatus = document.getElementById("importStatus");
const resultJson = document.getElementById("resultJson");
const createdCount = document.getElementById("createdCount");
const updatedCount = document.getElementById("updatedCount");
const skippedCount = document.getElementById("skippedCount");
const errorCount = document.getElementById("errorCount");

const importEndpointMap = {
  stations: "/api/admin/stations/import",
  pricings: "/api/admin/pricings/import",
  "charging-points": "/api/admin/charging-points/import"
};

function getImportToken() {
  return localStorage.getItem(importTokenKey) || "";
}

function setImportStatus(message, isError = false) {
  if (!importStatus) {
    return;
  }

  importStatus.textContent = message;
  importStatus.className = isError ? "status error" : "status";
}

function updateCounters(data = {}) {
  if (createdCount) {
    createdCount.textContent = String(data.created ?? 0);
  }

  if (updatedCount) {
    updatedCount.textContent = String(data.updated ?? 0);
  }

  if (skippedCount) {
    skippedCount.textContent = String(data.skipped ?? 0);
  }

  if (errorCount) {
    const errors = Array.isArray(data.errors) ? data.errors : [];
    errorCount.textContent = String(data.errorCount ?? errors.length);
  }
}

function clearImportPreview() {
  if (contentInput) {
    contentInput.value = "";
  }

  if (fileInput) {
    fileInput.value = "";
  }

  updateCounters({});

  if (resultJson) {
    resultJson.textContent = "{}";
  }

  setImportStatus("Da xoa noi dung xem truoc.");
}

async function handleImport() {
  const token = getImportToken();

  if (!token) {
    setImportStatus("Ban can dang nhap admin truoc khi import.", true);
    return;
  }

  const endpoint = importEndpointMap[datasetSelect?.value];
  const content = contentInput?.value.trim();

  if (!endpoint || !content) {
    setImportStatus("Vui long chon loai du lieu va file can import.", true);
    return;
  }

  try {
    setImportStatus("Dang import du lieu...");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        format: formatSelect?.value || "csv",
        mode: modeSelect?.value || "upsert",
        content
      })
    });

    const data = await response.json();

    if (resultJson) {
      resultJson.textContent = JSON.stringify(data, null, 2);
    }

    updateCounters(data);

    if (!response.ok) {
      throw new Error(data.message || "Import that bai");
    }

    setImportStatus(data.message || "Import thanh cong.");
  } catch (error) {
    setImportStatus(error.message || "Khong the import du lieu.", true);
  }
}

if (fileInput) {
  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    contentInput.value = await file.text();

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".json")) {
      formatSelect.value = "json";
    } else if (fileName.endsWith(".csv")) {
      formatSelect.value = "csv";
    }

    setImportStatus(`Da doc file ${file.name}. Hay xem truoc truoc khi import.`);
  });
}

if (clearBtn) {
  clearBtn.addEventListener("click", clearImportPreview);
}

if (importBtn) {
  importBtn.addEventListener("click", handleImport);
}

async function verifySession() {
  const token = getImportToken();

  if (!token) {
    window.location.href = "/admin/login";
    return false;
  }

  try {
    const response = await fetch("/api/admin/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Phien dang nhap khong hop le");
    }

    return true;
  } catch {
    localStorage.removeItem(importTokenKey);
    localStorage.removeItem(importProfileKey);
    window.location.href = "/admin/login";
    return false;
  }
}

verifySession();
