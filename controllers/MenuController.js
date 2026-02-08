import { loginWithGoogle, logout, onUserChanged } from "../libs/auth.js";
import { setUser } from "../models/UserModel.js";
import * as view from "../views/MenuView.js";

view.bindLogin(async () => {
  try {
    await loginWithGoogle();
  } catch (err) {
    console.error("Login failed", err);
  }
});

view.bindLogout(() => {
  logout();
});

onUserChanged(user => {
  setUser(user);

  if (user) {
    view.showLoggedIn(user);
  } else {
    view.showLoggedOut();
  }
});