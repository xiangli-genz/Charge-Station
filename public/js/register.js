const registerFullNameInput = document.getElementById("fullName");
const registerPhoneInput = document.getElementById("phone");
const registerEmailInput = document.getElementById("email");
const registerPasswordInput = document.getElementById("password");
const registerSecretInput = document.getElementById("adminRegisterSecret");
const registerSubmitBtn = document.getElementById("registerSubmitBtn");
const registerStatus = document.getElementById("registerStatus");

const registerTokenKey = "tram_sac_admin_token";
const registerProfileKey = "tram_sac_admin_profile";

function setRegisterStatus(message, isError = false) {
  if (!registerStatus) {
    return;
  }

  registerStatus.textContent = message;
  registerStatus.className = isError ? "status-box error" : "status-box";
}

function redirectByRole(user) {
  window.location.href = "/";
}

async function verifyExistingAdminSession() {
  const token = localStorage.getItem(registerTokenKey) || "";

  if (!token) {
    return;
  }

  try {
    const response = await fetch("/api/admin/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      redirectByRole(data.user);
      return;
    }
  } catch {
    // The session is cleared below when the API cannot validate it.
  }

  localStorage.removeItem(registerTokenKey);
  localStorage.removeItem(registerProfileKey);
}

if (registerSubmitBtn) {
  registerSubmitBtn.addEventListener("click", async () => {
    const fullName = registerFullNameInput?.value.trim() || "";
    const phone = registerPhoneInput?.value.trim() || "";
    const email = registerEmailInput?.value.trim() || "";
    const password = registerPasswordInput?.value || "";
    const adminRegisterSecret = registerSecretInput?.value || "";

    if (!fullName || !phone || !email || !password || !adminRegisterSecret) {
      setRegisterStatus("Vui long nhap day du thong tin dang ky.", true);
      return;
    }

    try {
      setRegisterStatus("Dang tao tai khoan admin...");

      const response = await fetch("/api/admin/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          password,
          adminRegisterSecret
        })
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        throw new Error(data.message || "Dang ky that bai");
      }

      localStorage.setItem(registerTokenKey, data.token);
      localStorage.setItem(registerProfileKey, JSON.stringify(data.user || {}));
      setRegisterStatus("Dang ky thanh cong. Dang chuyen vao trang chu quan tri...");
      redirectByRole(data.user);
    } catch (error) {
      setRegisterStatus(
        error.message || "Khong the tao tai khoan admin.",
        true
      );
    }
  });
}

verifyExistingAdminSession();
