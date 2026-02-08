const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const userName = document.getElementById("userName");

export function bindLogin(handler) {
  loginBtn.addEventListener("click", handler);
}

export function bindLogout(handler) {
  logoutBtn.addEventListener("click", handler);
}

export function showLoggedOut() {
  loginBtn.classList.remove("hidden");
  userInfo.classList.add("hidden");
}

export function showLoggedIn(user) {
  loginBtn.classList.add("hidden");
  userInfo.classList.remove("hidden");

  userName.textContent = user.displayName || "Player";
}
