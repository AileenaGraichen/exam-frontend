import { API_URL } from "../../settings.js";
const URL = API_URL + "/user-with-role";
import {
  makeOptions,
  sanitizeStringWithTableRows,
  handleHttpErrors,
} from "../../utils.js";

export async function initManageAccounts() {
  console.log("hello");
  renderAccounts();
  document
    .getElementById("create-account-btn")
    .addEventListener("click", createAccount);
  document
    .getElementById("tbl-body")
    .addEventListener("onclick", showAccountDetails);
}

async function renderAccounts() {
  let accountIds = [];
  try {
    let accounts = await fetch(URL, makeOptions("GET", null, true)).then(
      handleHttpErrors
    );

    console.log(accounts);

    const accountRowsArray = accounts
      .map((account) => {
        accountIds.push(account.userName);
        return ` <tr>                                
        <td>${account.userName} </td>              
        <td>${account.email} </td>                     
        <td>${account.roleNames} </td>
        <td>
        <button id="account-btn_manage_${account.userName}" type="button"  class="btn btn-sm btn-primary">Manage</button> 
        </td>      
      </tr>`;
      })
      .join("");

    document.getElementById("tbl-body").innerHTML =
      sanitizeStringWithTableRows(accountRowsArray);
    accountIds.forEach((id) => {
      document
        .getElementById("account-btn_manage_" + id)
        .addEventListener("click", manageAccounts);
    });
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
    await fetch(URL, makeOptions("POST", createAccountBody, true)).then(
      handleHttpErrors
    );
    addRoleToAccount(username);
  } catch (err) {
    //TODO; Handle errors correctly
    console.error("Could not create new account: " + err);
  }
}

async function addRoleToAccount(username) {
  const role = document.getElementById("add-role").value;

  try {
    await fetch(
      `${URL}/add-role/${username}/${role}`,
      makeOptions("PATCH", null, true)
    ).then(handleHttpErrors);
    renderAccounts();
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not add role to account");
  }
}

async function deleteAccount(evt) {
  try {
    await fetch(
      `${URL}/delete-user/${username}`,
      makeOptions("DELETE", null, true)
    ).then(handleHttpErrors);
  } catch (err) {
    //TODO; Handle errors correctly
    console.error("Could not delete account: " + err);
  }
}

async function manageAccounts(evt) {
  const clicked = evt.target;
  if (!clicked.id.startsWith("account-btn_manage_")) {
    return;
  }

  const parts = clicked.id.split("_");
  const id = parts[2];
  console.log(id);

  try {
    let user = await fetch(`${URL}/${id}`, makeOptions("GET", null, true)).then(
      handleHttpErrors
    );
    const userDiv = `
    <div>
      <span class="close">&times;</span>
      <label for="username_${user.userName}">Username</label>
      <input class="account-input" id="username_${user.userName}" type="text" value="${user.userName}"></input>
      <label for="email_${user.userName}">Email</label>
      <input class="account-input" id="email_${user.userName}" type="text" value="${user.email}"></input>
      <label for="password_${user.userName}">Password</label>
      <input class="account-input" id="password_${user.userName}" type="text"></input>
    </div>`;

    document.querySelector("#account-modal .modal-content").innerHTML = userDiv;
    document.getElementById("account-modal").style.display = "block";
    let span = document.getElementsByClassName("close")[0];
    span.onclick = function () {
      document.getElementById("account-modal").style.display = "none";
    };
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not fetch user from server: " + err);
  }
}

window.onclick = function (event) {
  if (event.target == document.getElementById("account-modal")) {
    document.getElementById("account-modal").style.display = "none";
  }
};
