import { API_URL } from "../../settings.js";
import {
  makeOptions,
  handleHttpErrors,
} from "../../utils.js";

const URL = API_URL + "/unit";
let unit;

export function initUnitDetails(match) {
  if (match?.params?.id) {
    console.log('Unit ID:', match.params.id); // Log the unit ID
    const id = match.params.id;
    document.getElementById("unit-details-content").innerHTML = "";
      fetchAndRenderUnitDetails(id);
  }
/*
  console.log(window.location.search)
  const urlParams = new URLSearchParams(window.location.search);
  const unitId = urlParams.get("unitId");
  console.log('Unit ID:', unitId); // Log the unit ID*/
 
  document.getElementById("unit-details-content").onclick = manageUnit;
}


async function fetchAndRenderUnitDetails(unitId) {
  try {

      console.log('Fetching unit details...');

      unit = await fetch(`${URL}/oneunit/${unitId}`, makeOptions("GET", null, true)).then(handleHttpErrors);
      console.log('Unit details:', unit); // Log the fetched unit data

      const unitDetailsHTML = generateUnitDetailsHTML(unit);
      document.getElementById("unit-details-content").innerHTML = unitDetailsHTML;
  } catch (err) {
      console.error("Could not fetch unit: " + err);
      
  }
}
/*
function generateUnitDetailsHTML(unit) {
  return `
    <div class="unit-info-box">
      <p class="unit-number">Unit Number: ${unit.unitNumber}</p>
      <p class="unit-status">Status: ${unit.status}</p>
      <p class="unit-type">Type: ${unit.type}</p>
      <!-- Add other unit details as needed -->
    </div>`;*/

    function generateUnitDetailsHTML(unit) {
      console.log('Unit:', unit); // Log the entire unit object for reference
      console.log('Unit Number:', unit.unitNumber); // Log unitNumber
      console.log('Status:', unit.status); // Log status
      console.log('Type:', unit.type); // Log type
    
      return `
        <div class="unit-info-box">
          <p class="unit-number">Unit Number: ${unit.unitNumber}</p>
          <p class="unit-status">Status: ${unit.status}</p>
          <p class="unit-type">Type: ${unit.type}</p>
          <!-- Add other unit details as needed -->
        </div>`;
    }

async function manageUnit(evt) {
    const clicked = evt.target;
    const unitId = clicked.dataset.unitId; // Assuming the unit ID is stored in a data attribute
  
    if (clicked.classList.contains("btn-update-unit")) {
      // Handle update functionality
      displayUpdateModal(unitId);
    } else if (clicked.classList.contains("btn-delete-unit")) {
      // Handle delete functionality
      try {
        if (window.confirm("Are you sure you want to delete this unit?")) {
          await deleteUnit(unitId);
          // Optionally, redirect or perform additional actions after deletion
        }
      } catch (err) {
        console.error("Could not delete unit: " + err);
        // Handle errors appropriately (e.g., display an error message)
      }
    }
  }
  
  async function displayUpdateModal(unitId) {
    // Logic to display an update modal with input fields
    // Populate the modal with input fields to update unit information
    // Add event listeners to update unit information
  }
  
  async function deleteUnit(unitId) {
    try {
      const response = await fetch(`${URL}/${unitId}`, makeOptions("DELETE", null, true));
      if (!response.ok) {
        throw new Error("Failed to delete unit");
      }
      // Optionally, perform additional actions after successful deletion
    } catch (err) {
      throw new Error("Could not delete unit: " + err);
    }
  }
  
