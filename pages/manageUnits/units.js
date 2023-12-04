import { API_URL } from "../../settings.js";
import { handleHttpErrors, makeOptions } from "../../utils.js";

const URL = API_URL + "/unit";

let isInitialized = false;

export function initUnits() {
    const page = 0;
    const urlParams = new URLSearchParams(window.location.search);
    const locationId = urlParams.get("locationId");

    if (!isInitialized) {
        isInitialized = true;
        // Ensure the element exists before adding the event listener
        const paginationElement = document.querySelector(".pagination");
        if (paginationElement) {
            paginationElement.addEventListener("click", handlePaginationClick);
        }
    }

    if (locationId) {
        fetchUnitsByLocationId(Number(page), locationId);
    } else {
        fetchUnits(Number(page));
    }
}

async function fetchUnits(page = 0) {
    let data;
    const size = 5; 
    try {
        if (isMobile()) {
            data = await fetch(
                `${URL}?size=100`,
                makeOptions("GET", null, true)
            ).then(handleHttpErrors);
        } else {
            const queryString = `?page=${page}&size=${size}`;
            data = await fetch(`${URL}${queryString}`,
            makeOptions("GET", null, true)
            ).then(handleHttpErrors);
        }

        displayData(data.content);
        displayPagination(data.totalPages, page);
        setupUnitEventHandlers();

        // Check if it's a wide screen or desktop
        if (window.innerWidth >= 1024) {
            document.querySelector(".pagination").style.display = "flex";
        } else {
            document.querySelector(".pagination").style.display = "none";
        }
    } catch (error) {
        console.error(error);
    }
}

async function fetchUnitsByLocationId(page = 0, locationId) {
    let data;
    const size = 5;
    try {
        if (isMobile()) {
            data = await fetch(
                `${URL}/${locationId}?size=100`,
                makeOptions("GET", null, true)
            ).then(handleHttpErrors);
        } else {
            const queryString = `?page=${page}&size=${size}`;
            data = await fetch(`${URL}${queryString}`).then(handleHttpErrors);
        }

        displayData(data.content);
        displayPagination(data.totalPages, page);
        setupUnitEventHandlers();
        
        // Check if it's a wide screen or desktop
        if (window.innerWidth >= 1024) {
            document.querySelector(".pagination").style.display = "flex";
        } else {
            document.querySelector(".pagination").style.display = "none";
        }
        
    } catch (error) {
        console.error(error);
    }
}

function displayData(units) {  
    const tableRows = units
        .map((unit) => {
            return `<tr>
                <td>${unit.unitNumber}</td>
                <td>${unit.type}</td>
                <!-- Display other unit information as needed -->
                <td><button class="btn" id="unit-details_${unit.id}">Details</button></td>
            </tr>`;
        })
        .join("");
    document.getElementById("unit-table-rows").innerHTML = tableRows;
}

function displayPagination(totalPages, currentPage) {
    let paginationElement = document.getElementById("pagination");
    console.log("Pagination Element:", paginationElement); 

    let paginationHtml = "";
    if (currentPage > 0) {
      // Previous Page
      paginationHtml += `<li class="page-item"><a class="page-link" data-page="${
        currentPage - 1
      }" href="#">«</a></li>`;
    }

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
    document.querySelector(".pagination").innerHTML = paginationHtml;
  }

  function handlePaginationClick(evt) {
    evt.preventDefault();
    if (evt.target.tagName === "A" && evt.target.hasAttribute("data-page")) {
      const page = parseInt(evt.target.getAttribute("data-page"));
      fetchUnits(page);
    }
  }

function setupUnitEventHandlers() {
    const unitDetails = (evt) => {
        const clicked = evt.target;
        if (clicked.id.startsWith("unit-details_")) {
            const id = clicked.id.replace("unit-details_", "");
            window.router.navigate(`unit-details?id=${id}`);
        }
    };
    document.getElementById("unit-table-rows").onclick = unitDetails;
}



function isMobile() {
    const regex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
}