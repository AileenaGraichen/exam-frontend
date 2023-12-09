import { API_URL } from "../../settings.js";

const URL = API_URL + "/user-with-role";
import {
  makeOptions,
  sanitizeStringWithTableRows,
  handleHttpErrors,
  loadingContent,
  handleFetchError,
} from "../../utils.js";

export async function initManageAccounts() {
  document.getElementById("manage-account-content").innerHTML = loadingContent;
  renderAccounts();
  document.getElementById("manage-account-content").onclick = accountDetails;
  window.onclick = closeModal;
}

async function renderAccounts(retryCount = 0) {
  const addButton = `<button id="add-account" class="button">Tilføj Bruger</button>`;
  try {
    let accounts = await fetch(URL, makeOptions("GET", null, true)).then(
      handleHttpErrors
    );

    const accountDiv = accounts
      .map((account) => {
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
        <button id="account-manage_${account.userName}" type="button" class="button">Manage</button>
      </div>`;
      })
      .join("");

    document.getElementById("manage-account-content").innerHTML =
      addButton + accountDiv;
    document.getElementById("add-account").onclick = displayAddAccountModal;
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not fetch accounts from server: " + err);
    const contentDiv = document.getElementById("manage-account-content");
    await handleFetchError(renderAccounts, retryCount, contentDiv);
  }
}

function displayAddAccountModal() {
  const modal = document.getElementById("account-modal");

  const inputForm = `<span class="close">&times;</span><input type="text" id="create-account-username" placeholder="Username"/>
  <input type="text" id="create-account-email" placeholder="Email" />
  <input type="text" id="create-account-password" placeholder="Password" />
  <select id="create-account-role">
          <option value="CLEAN">Cleaning</option>
          <option value="TECH">Tech</option>
          <option value="ADMIN">ADMIN</option>
        </select>
  <button id="create-account-btn" class="button">Create Account</button>
  <p class="error-message"></p>`;

  modal.querySelector(".modal-content").innerHTML = inputForm;
  modal.style.display = "block";

  const closeBtn = modal.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  const createBtn = modal.querySelector("#create-account-btn");
  createBtn.addEventListener("click", async () => {
    await createAccount();
    modal.style.display = "none";
    renderAccounts();
  });
}

async function createAccount() {
  const username = document.getElementById("create-account-username").value;
  const email = document.getElementById("create-account-email").value;
  const password = document.getElementById("create-account-password").value;
  const role = document.getElementById("create-account-role").value;

  if (!username || !email || !password || !role) {
    document.querySelector("#manage-account-content .error-message").innerText =
      "You need to fill out all fields";
    return;
  }

  const body = {
    username: username,
    email: email,
    password: password,
  };

  try {
    await fetch(URL, makeOptions("POST", body, true)).then(handleHttpErrors);
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

async function accountDetails(evt) {
  const clicked = evt.target;
  if (!clicked.id.startsWith("account-manage_")) {
    return;
  }
  const username = clicked.id.replace("account-manage_", "");
  window.router.navigate("account-details?id=" + username);
}

function closeModal(evt) {
  if (evt.target == document.getElementById("account-modal")) {
    document.getElementById("account-modal").style.display = "none";
  }
}
