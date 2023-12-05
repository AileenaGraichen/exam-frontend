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

  document.getElementById("unit-details-content").onclick = manageUnit;
}


async function fetchAndRenderUnitDetails(unitId) {
  try {

      console.log('Fetching unit details...');

      unit = await fetch(`${URL}/oneunit/${unitId}`, makeOptions("GET", null, true)).then(handleHttpErrors);
      console.log('Unit details:', unit); // Log the fetched unit data

      // maybe fuck up
      const owner = await fetchOwnerDetails(unit.ownerId);
      console.log('Owner details:', owner);
      const ownerFullName = `${owner.firstName} ${owner.lastName}`;
      //maybe fuckup end
      const unitDetailsHTML = generateUnitDetailsHTML(unit, ownerFullName);
      document.getElementById("unit-details-content").innerHTML = unitDetailsHTML;

  } catch (err) {
      console.error("Could not fetch unit: " + err);
      
  }
}

async function fetchOwnerDetails(ownerId) {
  try {
    const owner = await fetch(`${API_URL}/owner/${ownerId}`, makeOptions("GET", null, true)).then(handleHttpErrors);
    return owner;
  } catch (error) {
    console.error('Error fetching owner details:', error);
    throw new Error('Error fetching owner details');
  }
}



    function generateUnitDetailsHTML(unit, ownerFullName) {
      const unitDetailsBox1 = document.getElementById("unit-details-box-1")
      const unitDetailsBox2 = document.getElementById("unit-details-box-2")
      const unitDetailsBox3 = document.getElementById("unit-details-box-3")
      const unitDetailsBox4 = document.getElementById("unit-details-box-4")
      const unitDetailsBox5 = document.getElementById("unit-details-box-5")
      const unitDetailsBox6 = document.getElementById("unit-details-box-6")
//keycode
      unitDetailsBox1.innerHTML = `<p class="unit-location">Location: ${unit.location.locationName}</p>
      <p class="unit-number">Unit Number: ${unit.unitNumber}</p>`
      unitDetailsBox2.innerHTML = `<img src="data:${unit.mimetype};base64,${unit.image}" alt="unit image">`;

      unitDetailsBox4.innerHTML = `<p class="unit-address">Info: ${unit.location.address}</p>
      <p class="unit-number">Unit Number: ${unit.unitNumber}</p>
      <p class="unit-keyCode">keyCode: ${unit.keyCode}</p>
      <p class="unit-owner">Owner: ${ownerFullName}</p>`
      unitDetailsBox5.innerHTML = unit.cleaningPlans.map((plan) => `
      <p class="unit-cleaning-plan-name">Cleaner: ${plan.userName}</p>
      <p class="unit-cleaning-plan-date">Date: ${plan.date}</p>`)
      .join("");

      unitDetailsBox6.innerHTML = unit.maintenanceTasks.map((task) => `
      <p class="unit-maintenance-tasks-account">Cleaner: ${task.account.userName}</p>
      <p class="unit-maintenance-tasks-title">Titel: ${task.title}</p>
      <p class="unit-maintenance-tasks-description">Beskrivelse: ${task.description}</p>
      <p class="unit-maintenance-tasks-priority">Prioritæt: ${task.priority}</p>
      <p class="unit-maintenance-tasks-status">Status: ${task.status}</p>`)
      .join("");

      console.log('Unit:', unit); // Log the entire unit object for reference
      console.log('Unit Number:', unit.unitNumber); // Log unitNumber
      console.log('Status:', unit.status); // Log status
      console.log('Type:', unit.type); // Log type
      console.log('Location:', unit.location.locationName); // Log location
      console.log('Address:', unit.location.address); // Log location ID
      
    
      return `
        <div class="unit-info-box">
          <p class="unit-number">Unit Number: ${unit.unitNumber}</p>
          <p class="unit-status">Status: ${unit.status}</p>
          <p class="unit-type">Type: ${unit.type}</p>
          <p class="unit-location">Location: ${unit.location.locationName}</p>
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
  
