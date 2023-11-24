import { API_URL } from "../../settings.js";

const URL = API_URL + "/owner";
let owner;
import {
  makeOptions,
  sanitizeStringWithTableRows,
  handleHttpErrors,
} from "../../utils.js";

export async function initOwnerDetails(match) {
  if (match?.params?.id) {
    const id = match.params.id;
    document.getElementById("owner-details-content").innerHTML = " ";
    fetchAndRenderOwnerDetails(id);
  }
  document.getElementById("owner-details-content").onclick = manageOwner;
}

async function fetchAndRenderOwnerDetails(ownerId) {
  try {
    owner = await fetch(
      `${URL}/${ownerId}`,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);

    const ownerStr = `
    <div class="owner-info-box">
        <div class="owner-details">
            <p class="owner-name">${owner.firstName} ${owner.lastName}</p>
            <p class="owner-email">${owner.email}</p>
            <p class="owner-mobile">${owner.mobile}</p>
        </div>    
        <div class="owner-details-manage">
            <button class="btn" id="owner-manage_update_${owner.id}">Update Info</button>
            <button class="btn" id="owner-manage_delete_${owner.id}">Delete</button>
        </div>
    </div>`;

    const unitDivs = owner.unitList
      .map((unit) => {
        return `
        <div class="owner-unit-box">
        <p class="owner-unit-location_${unit.location.id}">Location: ${unit.location.locationName}</p>
        <p class="owner-unit-number">Number: ${unit.unitNumber}</p>
        <p class="owner-unit-status">${unit.status}</p>
        <p class="owner-unit-type">Type: ${unit.type}</p>
        </div>
        <button class="btn" id="owner-unit_${unit.id}">Go To Unit</button>
        `;
      })
      .join("");
    document.getElementById("owner-details-content").innerHTML =
      ownerStr + unitDivs;
  } catch (err) {
    //TODO; Handle errors correctly
    //TODO Remove in production?
    console.error("Could not fetch owner: " + err);
  }
}

async function manageOwner(evt) {
  const clicked = evt.target;
  if (!clicked.id.startsWith("owner-manage_")) {
    return;
  }

  const parts = clicked.id.split("_");
  const ownerId = parts[2];
  const btnAction = parts[1];

  try {
    if (btnAction === "update") {
      displayUpdateModal(ownerId);
    } else if (btnAction === "delete") {
      await deleteOwner(ownerId);
    }
  } catch (err) {
    //TODO; Handle errors correctly
    //TODO Remove in production?
    console.error("Could not manage owner: " + err);
  }
}

async function updateOwner(id) {
  const newFirstName = document.getElementById(
    "owner-input-firstname_" + id
  ).value;
  const newLastName = document.getElementById(
    "owner-input-lastname_" + id
  ).value;
  const newEmail = document.getElementById("owner-input-email_" + id).value;
  const newMobile = document.getElementById("owner-input-mobile_" + id).value;

  const body = {
    firstName: newFirstName,
    lastName: newLastName,
    email: newEmail,
    mobile: newMobile,
  };

  try {
    await fetch(`${URL}/${id}`, makeOptions("PATCH", body, true)).then(
      handleHttpErrors
    );
    fetchAndRenderOwnerDetails(id);
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not update owner from server: " + err);
  }
}

async function deleteOwner(id) {
  try {
    if (window.confirm(`Are you sure you want to delete owner?`)) {
      const response = await fetch(
        `${URL}/${id}`,
        makeOptions("DELETE", null, true)
      );
      if (response.ok) {
        window.router.navigate("owners");
      }
    }
  } catch (err) {
    //TODO Handle errors correctly
    console.error("Could not delete owner from server: " + err);
  }
}

async function unitDetails(evt) {
  const clicked = evt.target;
  if (!clicked.id.startsWith("owner-unit_")) {
    return;
  }
  const unitId = clicked.id.replace("owner-unit_", "");
  window.router.navigate("unit-details?id=" + unitId);
}

function displayUpdateModal(ownerId) {
  const modal = document.getElementById("owner-details-modal");

  // Populate modal with input fields for updating owner information
  const modalInnerHTML = `<span class="close">&times;</span>
      <label for="owner-input-firstname_${ownerId}" >First Name:</label>
      <input type="text" id="owner-input-firstname_${ownerId}" value="${owner.firstName}" required>
      <label for="owner-input-lastname_${ownerId}">Last Name:</label>
      <input type="text" id="owner-input-lastname_${ownerId}" value="${owner.lastName}" required>
      <label for="owner-input-email_${ownerId}">Email:</label>
      <input type="email" id="owner-input-email_${ownerId}" value="${owner.email}" required>
      <label for="owner-input-mobile_${ownerId}">Mobile:</label>
      <input type="tel" id="owner-input-mobile_${ownerId}" value="${owner.mobile}" required>
      <button class="btn" id="update-owner-btn_${ownerId}">Update</button>
    `;

  modal.querySelector(".modal-content").innerHTML = modalInnerHTML;
  modal.style.display = "block";

  const closeBtn = modal.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
  // Add event listener for the update button in the modal
  const updateBtn = modal.querySelector(`#update-owner-btn_${ownerId}`);
  updateBtn.addEventListener("click", async () => {
    await updateOwner(ownerId);
    modal.style.display = "none";
    fetchAndRenderOwnerDetails(ownerId);
  });
}

window.onclick = function (event) {
  if (event.target == document.getElementById("owner-details-modal")) {
    document.getElementById("owner-details-modal").style.display = "none";
  }
};
