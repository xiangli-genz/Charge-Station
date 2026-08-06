const dashboardTokenKey = "tram_sac_admin_token";
const dashboardProfileKey = "tram_sac_admin_profile";

const dashboardStatus = document.getElementById("dashboardStatus");
const adminName = document.getElementById("adminName");
const adminEmail = document.getElementById("adminEmail");
const adminRole = document.getElementById("adminRole");
const adminCreated = document.getElementById("adminCreated");
const dashboardLogoutBtn = document.getElementById("dashboardLogoutBtn");
const pricingLink = document.getElementById("pricingLink");
const stationLink = document.getElementById("stationLink");
const swapLink = document.getElementById("swapLink");
const bookingLink = document.getElementById("bookingLink");
const importLink = document.getElementById("importLink");

function setDashboardStatus(message, isError = false) {
  if (!dashboardStatus) {
    return;
  }

  dashboardStatus.textContent = message;
  dashboardStatus.className = isError ? "status-box error" : "status-box";
}

function getDashboardToken() {
  return localStorage.getItem(dashboardTokenKey) || "";
}

function redirectToLogin() {
  window.location.href = "/login";
}

function openAdminTools(panel) {
  const nextUrl = panel
    ? `/admin-tools?panel=${encodeURIComponent(panel)}`
    : "/admin-tools";

  window.location.href = nextUrl;
}

function openImportTools() {
  window.location.href = "/admin-import-tools";
}

function formatDate(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

async function hydrateDashboard() {
  const token = getDashboardToken();

  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    setDashboardStatus("Dang kiem tra phien dang nhap...");

    const response = await fetch("/api/admin/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.user) {
      throw new Error(data.message || "Phien dang nhap khong hop le");
    }

    localStorage.setItem(dashboardProfileKey, JSON.stringify(data.user));

    if (adminName) {
      adminName.textContent = data.user.fullName || "--";
    }

    if (adminEmail) {
      adminEmail.textContent = data.user.email || "--";
    }

    if (adminRole) {
      adminRole.textContent = data.user.role || "admin";
    }

    if (adminCreated) {
      adminCreated.textContent = formatDate(data.user.createdAt);
    }

    setDashboardStatus(
      "Dang nhap hop le. Ban co the truy cap cong cu import, nhap tay du lieu va booking."
    );
  } catch (error) {
    localStorage.removeItem(dashboardTokenKey);
    localStorage.removeItem(dashboardProfileKey);
    setDashboardStatus(error.message || "Khong the xac thuc admin.", true);
    setTimeout(redirectToLogin, 900);
  }
}

if (dashboardLogoutBtn) {
  dashboardLogoutBtn.addEventListener("click", () => {
    localStorage.removeItem(dashboardTokenKey);
    localStorage.removeItem(dashboardProfileKey);
    redirectToLogin();
  });
}

if (pricingLink) {
  pricingLink.addEventListener("click", () => openAdminTools("pricings"));
}

if (stationLink) {
  stationLink.addEventListener("click", () => openAdminTools("stations"));
}

if (swapLink) {
  swapLink.addEventListener("click", () => openAdminTools("swap-stations"));
}

if (bookingLink) {
  bookingLink.addEventListener("click", () => openAdminTools("bookings"));
}

if (importLink) {
  importLink.addEventListener("click", openImportTools);
}

hydrateDashboard();
