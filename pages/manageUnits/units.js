import { API_URL } from "../../settings.js";
import { handleHttpErrors, makeOptions } from "../../utils.js";


const URL = API_URL + "/units";

export function initUnits() {
    const page = 0;

    const urlParams = new URLSearchParams(window.location.search);
    const locationId = urlParams.get("locationId");

    if (locationId) {
        fetchUnitsByLocationId(Number(page), locationId);
    } else {
        fetchUnits(Number(page));
    }

    if (!isInitialized) {
        isInitialized = true;
        document
            .querySelector("#pagination")
            .addEventListener("click", handlePaginationClick);
    }

    fetchUnits(Number(page));
}

async function fetchUnits(page = 0) {
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

        setupUnitEventHandlers();
    } catch (error) {
        console.error(error);
    }
}

async function fetchUnitsByLocationId(page = 0, locationId) {
    let data;
    const size = pageSize;
    try {
        if (isMobile()) {
            console.log("Mobile device detected");

            data = await fetch(
                `${URL}/location/${locationId}?size=100`,
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

        setupUnitEventHandlers();
    } catch (error) {
        console.error(error);
    }

}

function displayData(units) {
    const tableRows = units
        .map((unit) => {
            return `<tr>
        <td>${unit.unitNumber}</td>
        <td>${unit.unitType}</td>
        <td>${unit.unitSize}</td>
        <td>${unit.unitPrice}</td>
        <td>${unit.unitFloor}</td>
        <td>${unit.unitBuilding}</td>
        <td>${unit.unitStatus}</td>
        <td><button class="btn" id="unit-details_${unit.id}">Details</button></td>
      </tr>`;
        })
        .join("");
    document.getElementById("unit-table-rows").innerHTML = tableRows;
}

function displayPagination(totalPages, currentPage) {
    let paginationHtml = "";
    if (currentPage > 0) {
        
        paginationHtml += `<li class="page-item"><a class="page-link" data-page="${
            currentPage - 1
        }" href="#">Previous</a></li>`;
    }

    paginationHtml += `<li class="page-item active"><a class="page-link" data-page="${currentPage}" href="#">${
        currentPage + 1
    }</a></li>`;

    if (currentPage < totalPages - 1) {
        
        paginationHtml += `<li class="page-item"><a class="page-link" data-page="${
            currentPage + 1
        }" href="#">Next</a></li>`;
    }

    document.getElementById("pagination").innerHTML = paginationHtml;
}

function handlePaginationClick(evt) {
    const clicked = evt.target;
    if (!clicked.dataset.page) {
        return;
    }

    const page = clicked.dataset.page;
    fetchUnits(Number(page));
}

function setupUnitEventHandlers() {
    const unitDetails = (evt) => {
        const clicked = evt.target;
        if (!clicked.id.startsWith("unit-details_")) {
            return;
        }

        const id = clicked.id.replace("unit-details_", "");
        window.router.navigate("unit-details?id=" + id);
    };
    document.getElementById("unit-table-rows").onclick = unitDetails;
}

function isMobile() {
    const regex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
}