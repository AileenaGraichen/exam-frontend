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
  document
    .getElementById("tbl-body")
    .addEventListener("onclick", showAccountDetails);
  // Get the modal
  document.getElementById("account-modal").addEventListener("click", () => {});
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
        .addEventListener("click", showDetailsModal(id));
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

async function showAccountDetails(evt) {
  const target = evt.target;
  if (!target.id.startsWith("row-btn_")) {
    return;
  }

  const parts = target.id.split("_");
  const id = parts[2];
  const btnAction = parts[1];
  if (btnAction === "manage") {
    showDetailsModal(id);
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

function showDetailsModal(id) {
  document.getElementById("account-modal").style.display = "block";
}

/* // Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}; */
