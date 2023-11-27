import { handleHttpErrors, makeOptions } from "../../utils.js";
import { API_URL } from "../../settings.js";

const URL = API_URL + "/location";

let pageSize = 5;
let sortColumn = "locationName";
let sortDirection = "asc";
let queryString;
let isInitialized = false;
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

  fetchLocations(Number(page));
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
    } else {
      console.log("Desktop device detected");

      queryString = `?page=${page}&size=${size}&sort=${sortColumn},${sortDirection}`;
      data = await fetch(`${URL}${queryString}`).then(handleHttpErrors);
      displayData(data.content);
      displayPagination(data.totalPages, page);

      // Check if it's a wide screen or desktop
      if (window.innerWidth >= 1024) {
        document.getElementById("pagination").style.display = "flex";
      } else {
        document.getElementById("pagination").style.display = "none";
      }
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
