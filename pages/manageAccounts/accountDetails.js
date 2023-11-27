import { API_URL } from "../../settings.js";

const URL = API_URL + "/user-with-role";
let account;
import {
  makeOptions,
  sanitizeStringWithTableRows,
  handleHttpErrors,
  handleFetchError,
  loadingContent,
} from "../../utils.js";

export async function initAccountDetails(match) {
  if (match?.params?.id) {
    const id = match.params.id;
    document.getElementById("account-details-content").innerHTML =
      loadingContent;
    fetchAndRenderAccountDetails(id);
  }
  document.getElementById("account-details-content").onclick = manageAccount;
  window.onclick = closeModal;
}

async function fetchAndRenderAccountDetails(username, retryCount = 0) {
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
              <button class="btn" id="account-manage_update_${username}">Update Email</button>
              <button class="btn" id="account-manage_delete_${username}">Delete</button>
              <button class="btn" id="account-manage_password_${username}">Change Password</button>
              <button class="btn" id="account-manage_add-role_${username}">Add Role</button>
              <button class="btn" id="account-manage_remove-role_${username}">Remove Role</button>
          </div>
      </div>`;

    document.getElementById("account-details-content").innerHTML = accountStr;
  } catch (err) {
    //TODO; Handle errors correctly
    //TODO Remove in production?
    console.error("Could not fetch account: " + err);
    const contentDiv = document.getElementById("account-details-content");
    handleFetchError(fetchAndRenderAccountDetails, retryCount, contentDiv);
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
    } else if (btnAction === "password") {
      displayUpdatePasswordModal(username);
    } else if (btnAction === "add-role") {
      displayAddRoleModal(username);
    } else if (btnAction === "remove-role") {
      displayRemoveRoleModal(username);
    }
  } catch (err) {
    //TODO; Handle errors correctly
    //TODO Remove in production?
    console.error("Could not manage owner: " + err);
  }
}

function displayUpdateModal(username) {
  const modal = document.getElementById("account-details-modal");

  // Populate modal with input fields for updating owner information
  const modalInnerHTML = `<span class="close">&times;</span>
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

async function updateAccount(username) {
  const newEmail = document.getElementById(
    "account-input-email_" + username
  ).value;

  const body = {
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

function displayAddRoleModal(username) {
  const modal = document.getElementById("account-details-modal");

  const modalInnerHTML = `<span class="close">&times;</span>
        <label for="account-input-role_${username}">Role:</label>
        <select id="account-input-role_${username}">
          <option value="CLEAN">Cleaning</option>
          <option value="TECH">Tech</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button class="btn" id="add-role-account-btn_${username}">Add Role</button>
        <p class="error-message"></p>
      `;

  modal.querySelector(".modal-content").innerHTML = modalInnerHTML;
  modal.style.display = "block";

  const closeBtn = modal.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  const updateBtn = modal.querySelector(`#add-role-account-btn_${username}`);
  updateBtn.addEventListener("click", async () => {
    if (await addAccountRole(username)) {
      modal.style.display = "none";
      fetchAndRenderAccountDetails(username);
    }
  });
}

async function addAccountRole(username) {
  const newRole = document.getElementById(
    "account-input-role_" + username
  ).value;

  const confirmMessage =
    newRole === "ADMIN"
      ? `You are about to give user ${username} ADMIN rights, are you sure?`
      : `Are you sure you want to give ${newRole} role to user ${username}?`;

  try {
    if (window.confirm(confirmMessage)) {
      await fetch(
        `${URL}/add-role/${username}/${newRole}`,
        makeOptions("PATCH", null, true)
      ).then(handleHttpErrors);
      return true;
    }
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not add role to user: " + err);
  }
}

function displayRemoveRoleModal(username) {
  const modal = document.getElementById("account-details-modal");

  const modalInnerHTML = `<span class="close">&times;</span>
        <label for="account-input-role_${username}">Role:</label>
        <select id="account-input-role_${username}">
          <option value="CLEAN">Cleaning</option>
          <option value="TECH">Tech</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button class="btn" id="remove-role-account-btn_${username}">Remove Role</button>
        <p class="error-message"></p>
      `;

  modal.querySelector(".modal-content").innerHTML = modalInnerHTML;
  modal.style.display = "block";

  const closeBtn = modal.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  const updateBtn = modal.querySelector(`#remove-role-account-btn_${username}`);
  updateBtn.addEventListener("click", async () => {
    if (await removeAccountRole(username)) {
      modal.style.display = "none";
      fetchAndRenderAccountDetails(username);
    }
  });
}

async function removeAccountRole(username) {
  const removeRole = document.getElementById(
    "account-input-role_" + username
  ).value;

  const confirmMessage =
    removeRole === "ADMIN"
      ? `You are about to remove user ADMIN rights from user ${username}, are you sure?`
      : `Are you sure you want to remove ${removeRole} role from user ${username}?`;

  try {
    if (window.confirm(confirmMessage)) {
      await fetch(
        `${URL}/remove-role/${username}/${removeRole}`,
        makeOptions("PATCH", null, true)
      ).then(handleHttpErrors);
      return true;
    }
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not add role to user: " + err);
  }
}

function displayUpdatePasswordModal(username) {
  const modal = document.getElementById("account-details-modal");

  const modalInnerHTML = `<span class="close">&times;</span>
        <label for="account-input-password_${username}">New Password:</label>
        <input type="text" id="account-input-password_${username}" required>
        <label for="account-input-verify-password_${username}">Verify Password:</label>
        <input type="text" id="account-input-verify-password_${username}" required>
        <button class="btn" id="update-password-account-btn_${username}">Update Password</button>
        <p class="error-message"></p>
      `;

  modal.querySelector(".modal-content").innerHTML = modalInnerHTML;
  modal.style.display = "block";

  const closeBtn = modal.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
  // Add event listener for the update button in the modal
  const updateBtn = modal.querySelector(
    `#update-password-account-btn_${username}`
  );
  updateBtn.addEventListener("click", async () => {
    if (await updateAccountPassword(username)) {
      modal.style.display = "none";
      fetchAndRenderAccountDetails(username);
    }
  });
}

async function updateAccountPassword(username) {
  const newPassword = document.getElementById(
    "account-input-password_" + username
  ).value;
  const verifyPassword = document.getElementById(
    "account-input-verify-password_" + username
  ).value;

  if (newPassword != verifyPassword) {
    document.querySelector(".modal-content .error-message").innerText =
      "Passwords does not match";
    return false;
  }

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
      return true;
    }
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not update password from server: " + err);
  }
}

function closeModal(evt) {
  if (evt.target == document.getElementById("account-details-modal")) {
    document.getElementById("account-details-modal").style.display = "none";
  }
}
