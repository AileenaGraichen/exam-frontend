import { API_URL } from "../../settings.js";

const URL = API_URL + "/user-with-role";
let account;
import {
  makeOptions,
  sanitizeStringWithTableRows,
  handleHttpErrors,
} from "../../utils.js";

export async function initAccountDetails(match) {
  if (match?.params?.id) {
    const id = match.params.id;
    document.getElementById("account-details-content").innerHTML = " ";
    fetchAndRenderAccountDetails(id);
  }
  document.getElementById("account-details-content").onclick = manageAccount;
}

async function fetchAndRenderAccountDetails(username) {
  try {
    account = await fetch(
      `${URL}/${username}`,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);

    const accountStr = `
      <div class="account-info-box">
          <div class="account-details">
              <p class="account-username">${account.userName}</p>
              <p class="account-email">${account.email}</p>
              <p class="account-roles">${account.roleNames}</p>
          </div>    
          <div class="account-details-manage">
              <button class="btn" id="account-manage_update_${username}">Update Info</button>
              <button class="btn" id="account-manage_delete_${username}">Delete</button>
          </div>
      </div>`;

    document.getElementById("account-details-content").innerHTML = accountStr;
  } catch (err) {
    //TODO; Handle errors correctly
    //TODO Remove in production?
    console.error("Could not fetch account: " + err);
  }
}

async function manageAccount(evt) {
  const clicked = evt.target;
  if (!clicked.id.startsWith("account-manage_")) {
    return;
  }

  const parts = clicked.id.split("_");
  const username = parts[2];
  const btnAction = parts[1];

  try {
    if (btnAction === "update") {
      displayUpdateModal(username);
    } else if (btnAction === "delete") {
      await deleteAccount(username);
    }
  } catch (err) {
    //TODO; Handle errors correctly
    //TODO Remove in production?
    console.error("Could not manage owner: " + err);
  }
}

async function updateAccount(username) {
  const newUsername = document.getElementById(
    "account-input-username_" + username
  ).value;
  const newEmail = document.getElementById(
    "account-input-email_" + username
  ).value;

  const body = {
    username: newUsername,
    email: newEmail,
  };

  try {
    await fetch(
      `${URL}/update/${username}`,
      makeOptions("PATCH", body, true)
    ).then(handleHttpErrors);
    fetchAndRenderAccountDetails(username);
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not update user from server: " + err);
  }
}

async function deleteAccount(username) {
  try {
    if (window.confirm(`Are you sure you want to delete user ${username}?`)) {
      const response = await fetch(
        `${URL}/delete-user/${username}`,
        makeOptions("DELETE", null, true)
      );
      if (response.ok) {
        window.router.navigate("accounts");
      }
    }
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not delete user from server: " + err);
  }
}

function displayUpdateModal(username) {
  const modal = document.getElementById("account-details-modal");

  // Populate modal with input fields for updating owner information
  const modalInnerHTML = `<span class="close">&times;</span>
        <label for="account-input-username_${username}" >Username:</label>
        <input type="text" id="account-input-username_${username}" value="${username}" required>
        <label for="account-input-email_${username}">Email:</label>
        <input type="text" id="account-input-email_${username}" value="${account.email}" required>
        <button class="btn" id="update-account-btn_${username}">Update</button>
      `;

  modal.querySelector(".modal-content").innerHTML = modalInnerHTML;
  modal.style.display = "block";

  const closeBtn = modal.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
  // Add event listener for the update button in the modal
  const updateBtn = modal.querySelector(`#update-account-btn_${username}`);
  updateBtn.addEventListener("click", async () => {
    await updateAccount(username);
    modal.style.display = "none";
    fetchAndRenderAccountDetails(username);
  });
}

window.onclick = function (event) {
  if (event.target == document.getElementById("account-details-modal")) {
    document.getElementById("account-details-modal").style.display = "none";
  }
};

//TODO MANAGE ROLES
