const adminTokenKey = "tram_sac_admin_token";
const adminProfileKey = "tram_sac_admin_profile";

const els = {
  status: document.getElementById("userTreeStatus"),
  logoutBtn: document.getElementById("userTreeLogoutBtn"),
  refreshBtn: document.getElementById("userTreeRefreshBtn"),
  createBtn: document.getElementById("userTreeCreateBtn"),
  cancelBtn: document.getElementById("userTreeCancelBtn"),
  submitBtn: document.getElementById("userTreeSubmitBtn"),
  searchInput: document.getElementById("userTreeSearch"),
  list: document.getElementById("userTreeList"),
  treeRoot: document.getElementById("userTreeRoot"),
  tree: document.getElementById("userTreeTree"),
  form: document.getElementById("userTreeForm"),
  formTitle: document.getElementById("userTreeFormTitle"),
  formLead: document.getElementById("userTreeFormLead"),
  editingId: document.getElementById("userTreeEditingId"),
  fullName: document.getElementById("childFullName"),
  phone: document.getElementById("childPhone"),
  email: document.getElementById("childEmail"),
  password: document.getElementById("childPassword"),
  walletBalance: document.getElementById("childWalletBalance"),
  parentPreview: document.getElementById("userTreeParentPreview"),
  selectedLabel: document.getElementById("userTreeSelectedLabel"),
  selectedMeta: document.getElementById("userTreeSelectedMeta"),
  count: document.getElementById("userTreeCount"),
  rootName: document.getElementById("rootAdminName"),
  rootEmail: document.getElementById("rootAdminEmail"),
  rootRole: document.getElementById("rootAdminRole"),
  rootTotal: document.getElementById("rootAdminTotal"),
};

const state = {
  profile: null,
  items: [],
  selectedParentId: "",
  selectedUserId: "",
  mode: "create",
  search: "",
};

function setStatus(message, isError = false) {
  if (!els.status) {
    return;
  }

  els.status.textContent = message;
  els.status.className = isError ? "status-box error" : "status-box";
}

function getToken() {
  return localStorage.getItem(adminTokenKey) || "";
}

function redirectToLogin() {
  window.location.href = "/login";
}

function formatDate(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("vi-VN").format(Number.isFinite(number) ? number : 0);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getNodeById(id) {
  if (!id) {
    return null;
  }

  if (state.profile && state.profile.id === id) {
    return state.profile;
  }

  return state.items.find((item) => item.id === id) || null;
}

function getDirectChildren(parentId) {
  return state.items
    .filter((item) => item.createdById === parentId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function getNodeLabel(node) {
  if (!node) {
    return "--";
  }

  return `${node.fullName || "--"} (${node.role || "customer"})`;
}

function buildPathLabel(node) {
  if (!node) {
    return state.profile ? state.profile.fullName : "--";
  }

  const trail = [node.fullName || "--"];
  let current = node;
  const visited = new Set([current.id]);

  while (current.createdById) {
    const parent = getNodeById(current.createdById);

    if (!parent || visited.has(parent.id)) {
      break;
    }

    trail.unshift(parent.fullName || "--");
    visited.add(parent.id);
    current = parent;
  }

  if (state.profile && trail[0] !== state.profile.fullName) {
    trail.unshift(state.profile.fullName || "--");
  }

  return trail.join(" / ");
}

function renderRootPanel() {
  if (!state.profile) {
    return;
  }

  if (els.rootName) {
    els.rootName.textContent = state.profile.fullName || "--";
  }

  if (els.rootEmail) {
    els.rootEmail.textContent = state.profile.email || "--";
  }

  if (els.rootRole) {
    els.rootRole.textContent = state.profile.role || "--";
  }

  if (els.rootTotal) {
    els.rootTotal.textContent = String(state.items.length);
  }
}

function renderSelectedPanel() {
  if (!state.profile) {
    return;
  }

  const selectedParent = state.selectedParentId ? getNodeById(state.selectedParentId) : state.profile;
  const children = getDirectChildren(selectedParent ? selectedParent.id : state.profile.id);

  if (els.selectedLabel) {
    els.selectedLabel.textContent = `Nhanh hien tai: ${getNodeLabel(selectedParent || state.profile)}`;
  }

  if (els.selectedMeta) {
    els.selectedMeta.textContent = selectedParent
      ? `Duong dan: ${buildPathLabel(selectedParent)}`
      : "Dang xem nhanh goc";
  }

  if (els.parentPreview) {
    els.parentPreview.value = getNodeLabel(selectedParent || state.profile);
  }

  if (els.count) {
    els.count.textContent = `${children.length} tai khoan con truc tiep`;
  }
}

function renderTreeBranch(parentId) {
  const children = getDirectChildren(parentId);

  if (!children.length) {
    return "";
  }

  return children
    .map((child) => {
      const childNodes = renderTreeBranch(child.id);
      const isActive = state.selectedParentId === child.id ? " active" : "";
      const childCount = getDirectChildren(child.id).length;

      return `
        <div class="tree-node-wrap">
          <button type="button" class="tree-node${isActive}" data-tree-node="${child.id}">
            <span class="tree-node-main">
              <strong>${escapeHtml(child.fullName)}</strong>
              <small>${escapeHtml(child.email)}</small>
            </span>
            <span class="tree-node-meta">
              <span class="tree-role">${escapeHtml(child.role)}</span>
              <span>${childCount} con</span>
            </span>
          </button>
          ${childNodes ? `<div class="tree-node-children">${childNodes}</div>` : ""}
        </div>
      `;
    })
    .join("");
}

function renderTree() {
  if (!state.profile) {
    return;
  }

  const selectedRoot = state.profile;
  const rootChildren = getDirectChildren(selectedRoot.id).length;

  if (els.treeRoot) {
    const isActive = state.selectedParentId === selectedRoot.id ? " active" : "";
    els.treeRoot.innerHTML = `
      <button type="button" class="tree-root-card${isActive}" data-tree-node="${selectedRoot.id}">
        <span class="tree-root-mark">ROOT</span>
        <span class="tree-root-copy">
          <strong>${escapeHtml(selectedRoot.fullName)}</strong>
          <small>${escapeHtml(selectedRoot.email)} | ${escapeHtml(selectedRoot.role)}</small>
        </span>
        <span class="tree-root-count">${rootChildren} con</span>
      </button>
    `;
  }

  if (els.tree) {
    const branchHtml = renderTreeBranch(selectedRoot.id);
    els.tree.innerHTML = branchHtml || '<p class="helper tree-empty">Chua co tai khoan con nao.</p>';
  }
}

function renderList() {
  if (!state.profile) {
    return;
  }

  const parentId = state.selectedParentId || state.profile.id;
  const children = getDirectChildren(parentId);
  const query = state.search.trim().toLowerCase();
  const filteredChildren = query
    ? children.filter((item) => {
        const haystack = [
          item.fullName,
          item.email,
          item.phone,
          item.role,
          String(item.walletBalance ?? 0),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
    : children;

  if (els.list) {
    if (!filteredChildren.length) {
      els.list.innerHTML = '<p class="helper tree-empty">Khong co tai khoan phu hop voi bo loc hien tai.</p>';
    } else {
      els.list.innerHTML = filteredChildren
        .map((item) => {
          const isEditing = state.selectedUserId === item.id;
          const rowClass = isEditing ? " user-tree-row active" : " user-tree-row";

          return `
            <article class="${rowClass}" data-user-id="${item.id}">
              <div class="user-tree-row-main">
                <div class="user-tree-row-head">
                  <strong>${escapeHtml(item.fullName)}</strong>
                  <div class="user-tree-badges">
                    <span class="user-tree-badge">${escapeHtml(item.role)}</span>
                    <span class="user-tree-badge soft">${formatMoney(item.walletBalance)} VNĐ</span>
                  </div>
                </div>
                <p>${escapeHtml(item.email)} | ${escapeHtml(item.phone)}</p>
                <small>Tao luc ${escapeHtml(formatDate(item.createdAt))}</small>
              </div>
              <div class="user-tree-row-actions">
                <button type="button" class="btn ghost" data-action="open" data-user-id="${item.id}">Xem nhanh</button>
                <button type="button" class="btn ghost" data-action="edit" data-user-id="${item.id}">Sua</button>
                <button type="button" class="btn primary" data-action="delete" data-user-id="${item.id}">Xoa</button>
              </div>
            </article>
          `;
        })
        .join("");
    }
  }
}

function renderAll() {
  renderRootPanel();
  renderSelectedPanel();
  renderTree();
  renderList();
}

function setCreateMode() {
  state.mode = "create";
  state.selectedUserId = "";

  if (els.formTitle) {
    els.formTitle.textContent = "Tao tai khoan con";
  }

  if (els.formLead) {
    const parent = state.selectedParentId ? getNodeById(state.selectedParentId) : state.profile;
    els.formLead.textContent = parent
      ? `Tai khoan moi se duoc gan vao nhanh cua ${parent.fullName || "--"}.`
      : "Tai khoan moi se duoc gan vao nhanh dang chon.";
  }

  if (els.submitBtn) {
    els.submitBtn.textContent = "Luu tai khoan";
  }

  if (els.password) {
    els.password.required = true;
    els.password.value = "";
    els.password.placeholder = "Nhap mat khau cho tai khoan con";
  }

  if (els.editingId) {
    els.editingId.value = "";
  }

  if (els.fullName) {
    els.fullName.value = "";
  }

  if (els.phone) {
    els.phone.value = "";
  }

  if (els.email) {
    els.email.value = "";
  }

  if (els.walletBalance) {
    els.walletBalance.value = "0";
  }

  renderSelectedPanel();
  renderList();
}

function setEditMode(item) {
  state.mode = "edit";
  state.selectedUserId = item.id;

  if (els.formTitle) {
    els.formTitle.textContent = `Sua tai khoan: ${item.fullName}`;
  }

  if (els.formLead) {
    els.formLead.textContent = "Mat khau co the bo trong neu ban khong muon thay doi.";
  }

  if (els.submitBtn) {
    els.submitBtn.textContent = "Cap nhat";
  }

  if (els.editingId) {
    els.editingId.value = item.id;
  }

  if (els.fullName) {
    els.fullName.value = item.fullName || "";
  }

  if (els.phone) {
    els.phone.value = item.phone || "";
  }

  if (els.email) {
    els.email.value = item.email || "";
  }

  if (els.walletBalance) {
    els.walletBalance.value = String(item.walletBalance ?? 0);
  }

  if (els.password) {
    els.password.required = false;
    els.password.value = "";
    els.password.placeholder = "Bo trong neu khong doi mat khau";
  }

  renderList();
}

async function loadPageData() {
  const token = getToken();

  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    setStatus("Dang tai thong tin tai khoan...");

    const [meResponse, treeResponse] = await Promise.all([
      fetch("/api/admin/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch("/api/admin/users/tree", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    const meData = await meResponse.json();
    const treeData = await treeResponse.json();

    if (!meResponse.ok || !meData.user) {
      throw new Error(meData.message || "Phien dang nhap khong hop le");
    }

    if (!treeResponse.ok) {
      throw new Error(treeData.message || "Khong the tai cay nguoi dung");
    }

    state.profile = meData.user;
    state.items = Array.isArray(treeData.items) ? treeData.items : [];

    localStorage.setItem(adminProfileKey, JSON.stringify(meData.user));

    if (!state.selectedParentId || !getNodeById(state.selectedParentId)) {
      state.selectedParentId = state.profile.id;
    }

    setCreateMode();
    renderAll();
    setStatus("Da tai xong cay nguoi dung. Ban co the thao tac ngay.");
  } catch (error) {
    localStorage.removeItem(adminTokenKey);
    localStorage.removeItem(adminProfileKey);
    setStatus(error.message || "Khong the tai du lieu cay nguoi dung.", true);
    setTimeout(redirectToLogin, 900);
  }
}

function openParentNode(parentId) {
  state.selectedParentId = parentId || (state.profile ? state.profile.id : "");
  setCreateMode();
  renderAll();
}

function handleTreeClick(event) {
  const target = event.target.closest("[data-tree-node]");

  if (!target) {
    return;
  }

  openParentNode(target.dataset.treeNode);
}

function handleListClick(event) {
  const button = event.target.closest("[data-action][data-user-id]");

  if (!button) {
    return;
  }

  const user = getNodeById(button.dataset.userId);

  if (!user) {
    return;
  }

  const action = button.dataset.action;

  if (action === "open") {
    openParentNode(user.id);
    return;
  }

  if (action === "edit") {
    setEditMode(user);
    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm(`Xoa tai khoan ${user.fullName}?`);

    if (!confirmed) {
      return;
    }

    fetch(`/api/admin/users/${user.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Khong the xoa tai khoan");
        }

        if (state.selectedUserId === user.id) {
          setCreateMode();
        }

        if (state.selectedParentId === user.id) {
          state.selectedParentId = state.profile ? state.profile.id : "";
        }

        setStatus(data.message || "Xoa tai khoan con thanh cong.");
        await loadPageData();
      })
      .catch((error) => {
        setStatus(error.message || "Khong the xoa tai khoan.", true);
      });
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  if (!state.profile) {
    return;
  }

  const fullName = els.fullName?.value.trim() || "";
  const phone = els.phone?.value.trim() || "";
  const email = els.email?.value.trim().toLowerCase() || "";
  const password = els.password?.value || "";
  const walletBalance = Number(els.walletBalance?.value || 0);

  if (!fullName || !phone || !email) {
    setStatus("Vui long nhap day du thong tin.", true);
    return;
  }

  if (!isValidEmail(email)) {
    setStatus("Email khong hop le.", true);
    return;
  }

  if (state.mode === "create" && !password) {
    setStatus("Vui long nhap mat khau cho tai khoan con.", true);
    return;
  }

  if (password && password.length < 6) {
    setStatus("Mat khau phai co it nhat 6 ky tu.", true);
    return;
  }

  const payload = {
    fullName,
    phone,
    email,
    walletBalance: Number.isFinite(walletBalance) && walletBalance >= 0 ? walletBalance : 0,
    password: password || undefined,
  };

  const isEditing = state.mode === "edit" && state.selectedUserId;
  const url = isEditing ? `/api/admin/users/${state.selectedUserId}` : "/api/admin/users";
  const method = isEditing ? "PATCH" : "POST";

  if (!isEditing) {
    payload.parentId = state.selectedParentId || state.profile.id;
  }

  try {
    setStatus(isEditing ? "Dang cap nhat tai khoan..." : "Dang tao tai khoan con...");

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Khong the luu tai khoan");
    }

    setStatus(data.message || "Da luu tai khoan thanh cong.");
    setCreateMode();
    await loadPageData();
  } catch (error) {
    setStatus(error.message || "Khong the luu tai khoan.", true);
  }
}

if (els.logoutBtn) {
  els.logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(adminTokenKey);
    localStorage.removeItem(adminProfileKey);
    redirectToLogin();
  });
}

if (els.refreshBtn) {
  els.refreshBtn.addEventListener("click", loadPageData);
}

if (els.createBtn) {
  els.createBtn.addEventListener("click", () => {
    setCreateMode();
  });
}

if (els.cancelBtn) {
  els.cancelBtn.addEventListener("click", () => {
    setCreateMode();
  });
}

if (els.searchInput) {
  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value || "";
    renderList();
  });
}

if (els.treeRoot) {
  els.treeRoot.addEventListener("click", handleTreeClick);
}

if (els.tree) {
  els.tree.addEventListener("click", handleTreeClick);
}

if (els.list) {
  els.list.addEventListener("click", handleListClick);
}

if (els.form) {
  els.form.addEventListener("submit", handleSubmit);
}

loadPageData();
