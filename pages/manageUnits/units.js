import { API_URL } from "../../settings.js";
import { handleHttpErrors, makeOptions } from "../../utils.js";

const URL = API_URL + "/unit";
let locationId;
let isInitialized = false;

export function initUnits(match) {
    const page = 0;
    if(match?.params?.locationId){
      locationId = match.params.locationId;
    }
    console.log(locationId);
    
    if (!isInitialized) {
        isInitialized = true;
      
        const paginationElement = document.querySelector(".pagination");
        if (paginationElement) {
            paginationElement.addEventListener("click", handlePaginationClick);
        }
    }
    const addUnitButton = document.getElementById("add-unit-button");
    
      addUnitButton.addEventListener("click", () => {
        displayAddUnitModal();
      });
    
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
            data = await fetch(`${URL}/${locationId}${queryString}`, makeOptions("GET", null, true)).then(handleHttpErrors);
        }

        displayData(data.content);
        displayPagination(data.totalPages, page);
        setupUnitEventHandlers();
        
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
                <td><button class="button" id="unit-details_${unit.id}">Details</button></td>
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

async function displayAddUnitModal() {
  const modal = document.getElementById("add-unit-modal");

  const inputForm = `
    <span class="close">&times;</span>
    <label for="unit-number">Hus/Lejligheds Nummer:</label>
    <input type="text" id="unit-number" name="unit-number" required><br>

    <label for="unit-type">Type:</label>
    <input type="text" id="unit-type" name="unit-type" required><br>

    <label for="unit-status">Status:</label>
    <select id="unit-status" name="status" required>
        <option value="AVAILABLE">Klar</option>
        <option value="IN_PROGRESS">I gang</option>
        <option value="UNAVAILABLE">Ikke klar</option>
    </select>

    <label for="unit-keyCode">Nøgler:</label>
    <input type="text" id="unit-keyCode" name="unit-keyCode" required><br>

    <label for="unit-ownerId">Ejer:</label>
    <input type="number" id="unit-ownerId" name="unit-ownerId" required><br>

    <label for="unit-image">Billede:</label>
    <input type="file" id="unit-image" name="image" accept="image/*"><br>

    <button id="create-unit-btn" class="button">Tilføj</button>
  `;

  modal.querySelector(".modal-content").innerHTML = inputForm;
  modal.style.display = "block";

  const closeBtn = modal.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  const createBtn = modal.querySelector("#create-unit-btn");
  createBtn.addEventListener("click", () => {
    addUnit();
    modal.style.display = "none";
 
    initUnits(); 
  });
}

async function addUnit() {
  const unitNumber = document.getElementById("unit-number").value;
  const unitType = document.getElementById("unit-type").value;
  const unitImage = document.getElementById("unit-image").files[0];
  const unitStatus = document.getElementById("unit-status").value;
  const unitKeyCode = document.getElementById("unit-keyCode").value;
  const unitOwner = document.getElementById("unit-ownerId").value;

  
  const newUnit = new FormData();
  newUnit.append("locationId", locationId);
  newUnit.append("unitNumber", unitNumber);
  newUnit.append("unitStatus", unitStatus);
  newUnit.append("type", unitType);
  newUnit.append("keyCode", unitKeyCode);
  newUnit.append("ownerId", unitOwner);
  if(unitImage){
    newUnit.append("image", unitImage);
  }

  try {
    await fetch(URL, makeOptions("POST", newUnit, true)).then(handleHttpErrors);
  } catch (error) {
    console.error(error);
  }
}

  function isMobile() {
    const regex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
}