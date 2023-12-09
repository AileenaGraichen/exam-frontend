import { API_URL } from "../../settings.js";

const URL = API_URL + "/owner";

import {
  makeOptions,
  handleHttpErrors,
  handleFetchError,
  loadingContent,
} from "../../utils.js";

export async function initManageOwners() {
  document.getElementById("owner-page-content").innerHTML = loadingContent;
  renderOwners();
  document.getElementById("owner-page-content").onclick = ownerDetails;
  window.onclick = closeModal;

  const searchBtn = document.getElementById("search-btn");
  searchBtn.addEventListener("click", () => {
    const searchValue = document.getElementById("owner-search").value;
    renderOwners(0, searchValue);
  });
}

async function renderOwners(retryCount = 0, searchValue = "") {
  const addButton = `<button id="add-owner" class="button">Tilføj Ejer</button>`;
  if (searchValue) {
    searchValue = "/search/" + searchValue;
  }
  try {
    let owners = await fetch(
      URL + searchValue,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);
    const ownerDivs = Array.isArray(owners.content)
      ? owners.content.map(generateOwnerHTML).join("")
      : owners.map(generateOwnerHTML).join("");

    document.getElementById("owner-page-content").innerHTML =
      addButton + ownerDivs;
    document.getElementById("add-owner").onclick = displayAddOwnerModal;
  } catch (err) {
    //TODO; Handle errors correctly
    console.error("Could not fetch owners: " + err);
    const contentDiv = document.getElementById("owner-page-content");
    handleFetchError(renderOwners, retryCount, contentDiv);
  }
}

async function ownerDetails(evt) {
  const clicked = evt.target;
  if (!clicked.id.startsWith("owner-details_")) {
    return;
  }

  const id = clicked.id.replace("owner-details_", "");
  window.router.navigate("owner-details?id=" + id);
}

function displayAddOwnerModal() {
  const modal = document.getElementById("owner-modal");

  const inputForm = `<span class="close">&times;</span>
  <input type="text" id="create-owner-firstname" placeholder="Fornavn"/>
  <input type="text" id="create-owner-lastname" placeholder="Efternavn" />
  <input type="text" id="create-owner-email" placeholder="Email" />
  <input type="text" id="create-owner-mobile" placeholder="Mobil" />
  <button id="create-owner-btn">Bekræft</button>
  <p class="error-message"></p>`;

  modal.querySelector(".modal-content").innerHTML = inputForm;
  modal.style.display = "block";

  const closeBtn = modal.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  const createBtn = modal.querySelector("#create-owner-btn");
  createBtn.addEventListener("click", async () => {
    await createOwner();
    modal.style.display = "none";
    renderOwners();
  });
}

async function createOwner() {
  const firstname = document.getElementById("create-owner-firstname").value;
  const lastname = document.getElementById("create-owner-lastname").value;
  const email = document.getElementById("create-owner-email").value;
  const mobile = document.getElementById("create-owner-mobile").value;

  if (!firstname || !lastname) {
    document.querySelector(".error-message").innerText =
      "Udfyld venligst Fornavn og Efternavn";
    return;
  }

  const body = {
    firstName: firstname,
    lastName: lastname,
    email: email,
    mobile: mobile,
  };

  try {
    await fetch(URL, makeOptions("POST", body, true)).then(handleHttpErrors);
  } catch (err) {
    //TODO; Handle errors correctly
    document.querySelector(".error-message").innerText = err;
    //TODO Remove in production
    console.error("Could not create new owner: " + err);
  }
}

function closeModal(evt) {
  if (evt.target == document.getElementById("owner-modal")) {
    document.getElementById("owner-modal").style.display = "none";
  }
}

const generateOwnerHTML = (owner) => `
    <div class="owner-box">
      <h3 class="owner-name">${owner.firstName} ${owner.lastName}</h3>
      <p class="owner-email">${owner.email}</p>
      <p class="owner-mobile">${owner.mobile}</p>
      <button id="owner-details_${owner.id}" class="button">Detajler</button>
    </div>
  `;
