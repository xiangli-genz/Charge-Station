const loginEmailInput = document.getElementById("email");
const loginPasswordInput = document.getElementById("password");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const loginStatus = document.getElementById("loginStatus");

const adminTokenKey = "tram_sac_admin_token";
const adminProfileKey = "tram_sac_admin_profile";

function setLoginStatus(message, isError = false) {
  if (!loginStatus) {
    return;
  }

  loginStatus.textContent = message;
  loginStatus.className = isError ? "status-box error" : "status-box";
}

function redirectByRole(user) {
  window.location.href = "/dashboard";
}

function clearAdminSession() {
  localStorage.removeItem(adminTokenKey);
  localStorage.removeItem(adminProfileKey);
}

async function verifyExistingAdminSession() {
  const token = localStorage.getItem(adminTokenKey) || "";

  if (!token) {
    return;
  }

  try {
    const response = await fetch("/api/admin/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      clearAdminSession();
      return;
    }

    const data = await response.json();
    redirectByRole(data.user);
  } catch {
    clearAdminSession();
  }
}

if (loginSubmitBtn) {
  loginSubmitBtn.addEventListener("click", async () => {
    const email = loginEmailInput?.value.trim() || "";
    const password = loginPasswordInput?.value || "";

    if (!email || !password) {
      setLoginStatus("Vui long nhap email va mat khau admin.", true);
      return;
    }

    try {
      setLoginStatus("Dang dang nhap...");

      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        throw new Error(data.message || "Dang nhap that bai");
      }

      localStorage.setItem(adminTokenKey, data.token);
      localStorage.setItem(adminProfileKey, JSON.stringify(data.user || {}));
      setLoginStatus("Dang nhap thanh cong. Dang chuyen trang...");
      redirectByRole(data.user);
    } catch (error) {
      setLoginStatus(error.message || "Khong the dang nhap admin.", true);
    }
  });
}

verifyExistingAdminSession();
