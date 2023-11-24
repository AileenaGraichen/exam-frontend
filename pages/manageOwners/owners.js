import { API_URL } from "../../settings.js";

const URL = API_URL + "/owner";

import {
  makeOptions,
  sanitizeStringWithTableRows,
  handleHttpErrors,
} from "../../utils.js";

export async function initManageOwners() {
  renderOwners();
  document.getElementById("owner-page-content").onclick = ownerDetails;
  //document.getElementById("add-owner").addEventListener("click", addOwner);
}

async function renderOwners() {
  let ownerIds = [];
  try {
    let owners = await fetch(URL, makeOptions("GET", null, true)).then(
      handleHttpErrors
    );

    console.log(owners);

    const ownerDivs = owners.content
      .map((owner) => {
        ownerIds.push(owner.id);
        return `<div class="owner-box">
        <p class="owner-name">${owner.firstName} ${owner.lastName}</p>
        <p class="owner-email">${owner.email}</p>
        <p class="owner-mobile">${owner.mobile}</p>
        <button class="btn" id="owner-details_${owner.id}">Details</button>
      </div>`;
      })
      .join("");

    document.getElementById("owner-page-content").innerHTML = ownerDivs;
  } catch (err) {
    //TODO; Handle errors correctly
    //TODO Remove in production?
    console.error("Could not fetch owners: " + err);
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

//TODO ADD OWNER
//TODO SEARCH BY NAME
//TODO GET BY MOBILE
