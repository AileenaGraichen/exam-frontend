import { API_URL } from "../../settings.js";
const URL = API_URL + "/user-with-role";
import {
  makeOptions,
  sanitizeStringWithTableRows,
  handleHttpErrors,
} from "../../utils.js";

export async function initManageAccounts() {
  renderAccounts();
  document
    .getElementById("create-account-btn")
    .addEventListener("click", createAccount);
}

async function renderAccounts() {
  try {
    // TODO change back to admin only - true
    let accounts = await fetch(URL, makeOptions("GET", null, false)).then(
      handleHttpErrors
    );

    console.log(accounts);

    const accountDivs = accounts
      .map((account) => {
        return `<div>
            <p>${account.userName}</p>
        </div>`;
      })
      .join("");

    document.getElementById("accounts-outerbox").innerHTML = accountDivs;
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not fetch accounts from server: " + err);
  }
}

async function createAccount() {
  const username = document.getElementById("create-username").value;
  const email = document.getElementById("create-email").value;
  const password = document.getElementById("create-password").value;

  const createAccountBody = {
    username: username,
    email: email,
    password: password,
  };

  try {
    // TODO change back to admin only - true
    await fetch(URL, makeOptions("patch", createAccountBody, false)).then(
      handleHttpErrors
    );
    addRoleToAccount(username);
    renderAccounts();
  } catch (err) {
    //TODO; Handle errors correctly
    console.error("Could not create new account: " + err);
  }
}

async function addRoleToAccount(username) {
  const role = document.getElementById("add-role").value;

  try {
    // TODO change back to admin only - true
    await fetch(
      `${URL}/add-role/${username}/${role}`,
      makeOptions("patch", null, false)
    ).then(handleHttpErrors);
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not add role to account");
  }
}
