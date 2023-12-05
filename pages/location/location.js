import { handleHttpErrors, makeOptions } from "../../utils.js";
import { API_URL } from "../../settings.js";

const URL = API_URL + "/location";

let locationRawData;

let pageSize = 5;
let sortColumn = "locationName";
let sortDirection = "asc";
let queryString;
let isInitialized = false;
let modal;
export let clickedLocation;

export function initLocations() {
  const page = 0;

  if (!isInitialized) {
    //No reason to setup event handlers if it's already been done
    isInitialized = true;
    document
      .querySelector("#pagination")
      .addEventListener("click", handlePaginationClick);
  }
  modal = document.getElementById("location-modal")
  document.getElementById("add-location-open-btn").addEventListener("click", openAddLocationModal)
  document.getElementById("edit-location-open-btn").addEventListener("click", openEditLocationModal)
  fetchLocations(Number(page));
}

function openAddLocationModal(){
  const addLocationContent = `
  <span class="close">&times;</span>
  <h3>Tilføj Nyt Feriested</h3>
  <label for="new-location-name">Feriested Navn</label>
  <input id="new-location-name" type="text" placeholder="F.eks. Dueodde, Bageriet...">
  <br>
  <label for="new-location-address">Indtast Adresse</label>
  <input id="new-location-address" type="text" placeholder="F.eks. Kystvejen, 3770 Allinge">
  <br>
  <button id="add-location-submit">Opret Feriested</button>
  `
  document.querySelector(".modal-content").innerHTML = addLocationContent
  const closeBtn = document.querySelector(".close");
    closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    })
  document.getElementById("add-location-submit").addEventListener("click", submitAddLocation)
  document.getElementById("location-modal").style.display = "block";
}
function openEditLocationModal(){
  const editLocationContent = `
  <span class="close">&times;</span>
  <h3>Rediger Feriested</h3>
  <select id="select-location-to-edit" >
  <option disabled selected value> -- Vælg Feriested -- </option>
  </select>
  <input id="edit-location-id" type="hidden">
  <label for="edit-location-name">Rediger Navn</label>
  <input id="edit-location-name" disabled>
  <label for="edit-location-address">Rediger Adresse</label>
  <input id="edit-location-address" disabled>
  <br>
  <button id="edit-location-submit" disabled>Gem Ændringer</button>
  <br>
  <button id="delete-location-submit" disabled>Slet Feriested</button>
  `
  document.querySelector(".modal-content").innerHTML = editLocationContent;
  const closeBtn = document.querySelector(".close");
    closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    })
  setupLocationSelectList();
  document.getElementById("edit-location-submit").addEventListener("click", submitEditLocation)
  document.getElementById("delete-location-submit").addEventListener("click", submitDeleteLocation)
  document.getElementById("location-modal").style.display = "block";
}

function setupLocationSelectList(){
    const editSelectTag = document.getElementById("select-location-to-edit")
    editSelectTag.addEventListener("change", findLocationToEdit)
    const optionData = locationRawData.map(location => `
    <option id="${location.id}" value="${location.id}">${location.locationName}</option>
    `).join('')

    editSelectTag.innerHTML += optionData;

}

function findLocationToEdit(){
  const editIdField = document.getElementById("edit-location-id")
  const editNameField = document.getElementById("edit-location-name")
  const editAddressField = document.getElementById("edit-location-address")
  
  //Get option value from editSelectTag and get location date by name chosen.
  let selectedLocation = document.getElementById("select-location-to-edit").value;
  const location = locationRawData.filter(location => location.id == selectedLocation)
  editIdField.value = location[0].id
  editNameField.value = location[0].locationName
  editAddressField.value = location[0].address

  editNameField.disabled = false;
  editAddressField.disabled = false;
  document.getElementById("edit-location-submit").disabled = false;
  document.getElementById("delete-location-submit").disabled = false;
}

async function submitAddLocation(){
  const newName = document.getElementById("new-location-name").value
  const newAddress = document.getElementById("new-location-address").value 

  const body = {
    locationName : newName,
    address : newAddress
  }
  const res = await fetch(URL, makeOptions("POST", body, true)).then(handleHttpErrors)
  modal.style.display = "none";  
  fetchLocations()
}

async function submitEditLocation(){
const editedId = document.getElementById("edit-location-id")
const editedName = document.getElementById("edit-location-name")
const editedAddress = document.getElementById("edit-location-address")

const body = {
  locationName : editedName.value,
  address : editedAddress.value
}
  const res = await fetch(`${URL}/${editedId.value}`,makeOptions("PATCH", body, true)).then(handleHttpErrors)
  modal.style.display = "none"
  fetchLocations()
}

async function submitDeleteLocation(){
  const editedId = document.getElementById("edit-location-id")
  try {
    await fetch(`${URL}/${editedId.value}`, makeOptions("DELETE", null, true)).then(handleHttpErrors)
  } catch (error) {
      alert("Kan ikke slette feriesteder, som har eksisterende boliger")
  }
  modal.style.display = "none"
  fetchLocations()
}


async function fetchLocations(page = 0) {
  let data;
  const size = pageSize;
  try {
    if (isMobile()) {
      console.log("Mobile device detected");

      data = await fetch(
        `${URL}?size=100`,
        makeOptions("GET", null, false)
      ).then(handleHttpErrors);
      displayData(data.content);
      document.getElementById("pagination").style.display = "none";
      locationRawData = data.content;
    } else {
      console.log("Desktop device detected");

      queryString = `?page=${page}&size=${size}&sort=${sortColumn},${sortDirection}`;
      data = await fetch(`${URL}${queryString}`).then(handleHttpErrors);
      displayData(data.content);
      displayPagination(data.totalPages, page);
      document.getElementById("pagination").style.display = "flex";
      const allData = await fetch(`${URL}?size=100`, makeOptions("GET", null, false)).then(handleHttpErrors)
      locationRawData = allData.content;
    }
    
    setupLocationEventHandlers();
  } catch (error) {
    console.error(error);
  }
}

function displayData(locations) {
  const divObjects = locations
    .map(
      (location) =>
        `<div class="location-box" id="location_${location.id}" style="cursor:pointer";>
    <h2 id="location_${location.id}">${location.locationName}</h2>
    </div>`
    )
    .join("");
  document.getElementById("location-flexbox").innerHTML = divObjects;
}

function displayPagination(totalPages, currentPage) {
  let paginationHtml = "";
  if (currentPage > 0) {
    // Previous Page
    paginationHtml += `<li class="page-item"><a class="page-link" data-page="${
      currentPage - 1
    }" href="#">«</a></li>`;
  }
  // Display page numbers
  let startPage = Math.max(0, currentPage - 2);
  let endPage = Math.min(totalPages - 1, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      paginationHtml += `<li class="page-item active"><a class="page-link" href="#">${
        i + 1
      }</a></li>`;
    } else {
      paginationHtml += `<li class="page-item"><a class="page-link" data-page="${i}" href="#">${
        i + 1
      }</a></li>`;
    }
  }
  if (currentPage < totalPages - 1) {
    // Next Page
    paginationHtml += `<li class="page-item"><a class="page-link" data-page="${
      currentPage + 1
    }" href="#">»</a></li>`;
  }
  document.getElementById("pagination").innerHTML = paginationHtml;
}

function handlePaginationClick(evt) {
  evt.preventDefault();
  if (evt.target.tagName === "A" && evt.target.hasAttribute("data-page")) {
    const page = parseInt(evt.target.getAttribute("data-page"));
    fetchLocations(page);
  }
}

function setupLocationEventHandlers() {
  const locationBoxes = document.querySelectorAll(".location-box");
  for (let i = 0; i < locationBoxes.length; i++) {
    locationBoxes[i].addEventListener("click", (evt) => {
      const target = evt.currentTarget;
      if (!target.id.includes("location_")) {
        return;
      }
      const id = target.id.replace("location_", "");
      clickedLocation = id;
      console.log(clickedLocation);
      window.router.navigate(`/unit?locationId=${clickedLocation}`);
    });
  }
}

function isMobile() {
  const regex =
    /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(navigator.userAgent);
}
