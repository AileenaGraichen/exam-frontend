import { API_URL } from "../../settings.js";

const URL = API_URL + "/user-with-role";

import {
  makeOptions,
  sanitizeStringWithTableRows,
  handleHttpErrors,
} from "../../utils.js";

export async function initManageAccounts() {
  renderAccounts();
  document.getElementById("manage-account-content").onclick = accountDetails;
  document.getElementById("add-account").addEventListener("click", addAccount);
}

async function renderAccounts() {
  let accountIds = [];
  try {
    let accounts = await fetch(URL, makeOptions("GET", null, true)).then(
      handleHttpErrors
    );

    console.log(accounts);

    const accountDiv = accounts
      .map((account) => {
        accountIds.push(account.userName);
        return ` <div class="user-box">
        <div>
          <strong>Username:</strong> ${account.userName}
        </div>
        <div>
          <strong>Email:</strong> ${account.email}
        </div>
        <div>
          <strong>Role:</strong> ${account.roleNames}
        </div>
        <button id="account-manage_${account.userName}" type="button" class="btn btn-sm btn-primary">Manage</button>
      </div>`;
      })
      .join("");

    document.getElementById("manage-account-content").innerHTML = accountDiv;
    accountIds.forEach((id) => {
      document
        .getElementById("account-btn_manage_" + id)
        .addEventListener("click", showManageAccounts);
    });
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not fetch accounts from server: " + err);
  }
}

function addAccount() {
  const inputForm = `<input type="text" id="create-username" placeholder="Username"/>
  <input type="text" id="create-email" placeholder="Email" />
  <input type="text" id="create-password" placeholder="Password" />
  <input type="text" id="add-role" placeholder="Role" />
  <button id="create-account-btn">Create Account</button>
  <p class="error-message"></p>`;

  document.getElementById("manage-account-content").innerHTML = inputForm;
  document
    .getElementById("create-account-btn")
    .addEventListener("click", createAccount);
}

async function createAccount() {
  const username = document.getElementById("create-username").value;
  const email = document.getElementById("create-email").value;
  const password = document.getElementById("create-password").value;
  const role = document.getElementById("add-role").value;

  if (!username || !email || !password || !role) {
    document.querySelector("#manage-account-content .error-message").innerText =
      "You need to fill out all fields";
    return;
  }

  const createAccountBody = {
    username: username,
    email: email,
    password: password,
  };

  try {
    await fetch(URL, makeOptions("POST", createAccountBody, true)).then(
      handleHttpErrors
    );
    addRoleToAccount(username, role);
  } catch (err) {
    //TODO; Handle errors correctly
    document.querySelector("#manage-account-content .error-message").innerText =
      err;
    //TODO Remove in production
    console.error("Could not create new account: " + err);
  }
}

async function addRoleToAccount(username, role) {
  try {
    await fetch(
      `${URL}/add-role/${username}/${role}`,
      makeOptions("PATCH", null, true)
    ).then(handleHttpErrors);
    renderAccounts();
  } catch (err) {
    //TODO Handle errors correctly
    document.querySelector("#manage-account-content .error-message").innerText =
      err;
    //TODO Remove in production
    console.error("Could not add role to account");
  }
}

/* async function fetchUser(username) {
  try {
    return await fetch(
      `${URL}/${username}`,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not fetch user from server: " + err);
  }
}

async function showManageAccounts(evt) {
  const clicked = evt.target;
  if (!clicked.id.startsWith("account-manage_")) {
    return;
  }

  const parts = clicked.id.split("_");
  const id = parts[2];

  try {
    let user = await fetchUser(id);

    const userDiv = `
    <div id="manage-account-form">
      <p class="account-input" id="username_${user.userName}">${user.userName}</p>
      <label for="email_${user.userName}">Email</label>
      <input class="account-input" id="email_${user.userName}" type="text" value="${user.email}"></input>
      <button id="btn-manage_update_${user.userName}">Update</button>
      <button id="btn-manage_password_${user.userName}">Change Password</button>
      <button id="btn-manage_delete_${user.userName}">Delete</button>
      <p class="error-message"></p>
    </div>`;

    document.getElementById("manage-account-content").innerHTML = userDiv;
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not fetch user from server: " + err);
  }
}

async function manageAccounts(evt) {
  const clicked = evt.target;
  if (!clicked.id.startsWith("btn-manage_")) {
    return;
  }

  const parts = clicked.id.split("_");
  const username = parts[2];
  const btnAction = parts[1];
  try {
    if (btnAction === "delete") {
      await deleteAccount(username);
    } else if (btnAction === "update") {
      await updateAccount(username);
    } else if (btnAction === "password") {
      showPasswordInput(username);
    }
  } catch (err) {
    //TODO; Handle errors correctly
    document.querySelector("#manage-account-content .error-message").innerText =
      err;
    //TODO Handle errors correctly
    console.error("Something went wrong: " + err);
  }
}

function showPasswordInput(username) {
  const passwordInput = `<label for="password_${username}">Password</label>
  <input class="account-input" id="password_${username}" type="text"></input>
  <button id="btn-manage_change-password_${username}">Change Password</button>
  `;
  document.getElementById("manage-account-content").innerHTML = passwordInput;
  document.getElementById("manage-account-content").onclick = changePassword;
}

async function changePassword(evt) {
  const clicked = evt.target;
  if (!clicked.id.startsWith("btn-manage_change-password_")) {
    return;
  }

  const parts = clicked.id.split("_");
  const username = parts[2];
  console.log("password " + username);

  const newPassword = document.getElementById("password_" + username).value;

  const body = {
    password: newPassword,
  };

  try {
    if (
      window.confirm(
        `Are you sure you want to change password for user ${username}?`
      )
    ) {
      await fetch(
        `${URL}/update-password/${username}`,
        makeOptions("PATCH", body, true)
      ).then(handleHttpErrors);
      renderAccounts();
    }
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not update password from server: " + err);
  }
}

async function deleteAccount(username) {
  if (localStorage.getItem("user") == username) {
    document.querySelector("#manage-account-form .error-message").innerText =
      "You cannot delete own account";
    return;
  }
  try {
    if (window.confirm(`Are you sure you want to delete user ${username}?`)) {
      const response = await fetch(
        `${URL}/delete-user/${username}`,
        makeOptions("DELETE", null, true)
      );
      if (response.ok) {
        //Successful deletion
        renderAccounts();
      }
    }
  } catch (err) {
    //TODO; Handle errors correctly
    document.querySelector("#manage-account-content .error-message").innerText =
      err;
    //TODO Handle errors correctly
    console.error("Could not delete user from server: " + err);
  }
}

async function updateAccount(username) {
  const newEmail = document.getElementById("email_" + username).value;

  const body = {
    email: newEmail,
  };

  try {
    await fetch(
      `${URL}/update/${username}`,
      makeOptions("PATCH", body, true)
    ).then(handleHttpErrors);
    renderAccounts();
  } catch (err) {
    //TODO; Handle errors correctly
    document.querySelector("#manage-account-content .error-message").innerText =
      err;
    //TODO Handle errors correctly
    console.error("Could not update user from server: " + err);
  }
} */

async function accountDetails(evt) {
  const clicked = evt.target;
  if (!clicked.id.startsWith("account-manage_")) {
    return;
  }
  const username = clicked.id.replace("account-manage_", "");
  window.router.navigate("account-details?id=" + username);
}
