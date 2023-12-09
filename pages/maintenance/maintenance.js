import { API_URL } from "../../settings.js";

const MAINTENANCE_URL = API_URL + "/maintenance-task";
const LOCATION_URL = API_URL + "/location";
const UNIT_URL = API_URL + "/unit";
import {
  makeOptions,
  sanitizeStringWithTableRows,
  handleHttpErrors,
  loadingContent,
  handleFetchError,
} from "../../utils.js";

let clickedLocation;
let tasks;

export async function initMaintenance() {
  document.getElementById("maintenance-content").innerHTML = loadingContent;
  renderMaintenancePage();
  document.getElementById("maintenance-content").onclick = maintenanceDetails;

  document.getElementById("btn-add-maintenance").onclick = displayAddTaskModal;
  window.onclick = closeModal;

  //TODO implement search functionality
  /* const searchBtn = document.getElementById("maintenance-search-btn");
  searchBtn.addEventListener("click", () => {
    const searchValue = document.getElementById("maintenance-search").value;
    renderMaintenance(0, searchValue);
  }); */
}

async function renderMaintenancePage(retryCount = 0, searchValue = "") {
  const pageContent = `
<div class="input-group" id="location-dropdown-container">
<div class="input-group-prepend">
  <label class="input-group-text" for="location-dropdown">Feriested</label>
</div class="custom-select">
  <select id="location-dropdown">
    <option>Intet valgt</option>
  </select>
</div>

<div id="maintenance-tasks-container">
</div>`;

  const contentDiv = document.getElementById("maintenance-content");
  contentDiv.innerHTML = pageContent;

  try {
    const locations = await fetch(
      LOCATION_URL,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);

    const locationDropdown = document.getElementById("location-dropdown");

    locations.content.map((location) => {
      const option = document.createElement("option");
      option.value = location.id;
      option.textContent = location.locationName;
      if (location.id == clickedLocation) {
        option.selected = true;
      }
      locationDropdown.appendChild(option);
    });

    if (clickedLocation != null) {
      displayMaintenanceTasks(tasks);
    }

    locationDropdown.addEventListener("change", () => {
      const selectLocation = locationDropdown.value;
      clickedLocation = locationDropdown.value;
      fetchMaintenanceTasks(selectLocation);
    });
    document.getElementById("maintenance-tasks-container").innerText =
      "Vælg et feriested for at se opgaver";
  } catch (error) {
    console.error(error);
    handleFetchError(renderMaintenancePage, retryCount, contentDiv);
  }
}

async function fetchMaintenanceTasks(locationId) {
  try {
    tasks = await fetch(
      MAINTENANCE_URL + "/location/" + locationId,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);

    displayMaintenanceTasks(tasks);
  } catch (error) {
    console.error(error);
  }
}

function displayMaintenanceTasks(tasks) {
  const taskCards = tasks
    .map((task) => {
      let imageElement = task.image
        ? `<img class="card-img-top img-fluid" src="data:${task.mimetype};base64,${task.image}" alt="">`
        : `<img class="card-img-top img-fluid" src="static/images/house.png" alt="">`;
      return `
      <div class="card box">
        ${imageElement}
        <div class="card-body">
          <h5 class="card-title">${task.unitNumber}</h5>
          <h6 class="card-subtitle">${task.title}</h6>
        </div>
        <ul id="task-${task.id}" class="list-group list-group-flush">
          <li class="list-group-item"><strong>Status:</strong> ${
            task.status
          }</li>
          <li class="list-group-item"><strong>Prioritet:</strong> ${
            task.priority
          }</li>
          <li class="list-group-item"><strong>Tildelt:</strong> ${
            task.accountUsername != null ? task.accountUsername : "Ikke Tildelt"
          }</li>
        </ul>
        <div class="card-body">  
          <a href="#" class="btn btn-primary" id="maintenance-details_${
            task.id
          }">Detaljer</a>
        </div>
      </div>`;
    })
    .join("");
  // Display tasks
  document.getElementById("maintenance-tasks-container").innerHTML = taskCards;

  tasks.forEach((task) => {
    const element = document.getElementById(`task-${task.id}`);
    setBorderColor(element, task.priority);
  });
}

async function maintenanceDetails(evt) {
  const clicked = evt.target;
  if (!clicked.id.startsWith("maintenance-details_")) {
    return;
  }

  const id = clicked.id.replace("maintenance-details_", "");
  window.router.navigate(
    "maintenance-details?task=" + id + "&location=" + clickedLocation
  );
}

async function displayAddTaskModal() {
  const modal = document.getElementById("maintenance-modal");

  const inputForm = `
    <span class="close">&times;</span>
  
    <label for="task-title">Titel:</label>
    <input type="text" id="task-title" name="title">
    <br>

    <label for="task-description">Beskrivelse:</label>
    <input type="text" id="task-description" name="description">
    <br>

    <label for="task-status">Status:</label>
    <select id="task-status" name="status" required>
        <option value="NOT_STARTED">Not Started</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
    </select>
    <br>

    <label for="task-priority">Prioritet:</label>
    <select id="task-priority" name="priority" required>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
    </select><br>

    <label for="task-image">Billeder:</label>
    <input type="file" id="task-image" name="image" accept="image/*"><br>

    <label for="task-account">Tildel medarbejder</label>
    <input type="text" id="task-account" name="account"><br>

    <label for="task-location">Feriested:</label>
    <select id="task-location" name="location" required>
    <option>Intet valgt</option>
    </select><br>

    <label for="task-unit">Hus/Lejlighed:</label>
    <select id="task-unit" name="unit" required disabled></select><br>

    <button id="create-task-btn">Opret</button>
  `;

  modal.querySelector(".modal-content").innerHTML = inputForm;
  modal.style.display = "block";

  const closeBtn = modal.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Fetch locations and populate the location dropdown
  try {
    const locations = await fetch(
      LOCATION_URL,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);
    const locationDropdown = document.getElementById("task-location");

    locations.content.forEach((location) => {
      const option = document.createElement("option");
      option.value = location.id;
      option.textContent = location.locationName;
      locationDropdown.appendChild(option);
    });

    // Add event listener to location dropdown to dynamically populate the unit dropdown based on the selected location
    locationDropdown.addEventListener("change", async () => {
      const selectedLocationId = locationDropdown.value;
      await populateUnitDropdown(selectedLocationId);
    });
  } catch (error) {
    console.error(error);
    // Handle fetch error if necessary
  }

  const createBtn = document.getElementById("create-task-btn");
  createBtn.addEventListener("click", async () => {
    await createMaintenanceTask();
    modal.style.display = "none";
    renderMaintenancePage();
  });
}

async function populateUnitDropdown(locationId) {
  try {
    const units = await fetch(
      UNIT_URL + "/" + locationId,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);
    const unitDropdown = document.getElementById("task-unit");

    // Clear previous options
    unitDropdown.innerHTML = "";

    units.content.forEach((unit) => {
      const option = document.createElement("option");
      option.value = unit.id;
      option.textContent = unit.unitNumber;
      unitDropdown.appendChild(option);
    });

    unitDropdown.disabled = false;
  } catch (error) {
    console.error(error);
    // Handle fetch error if necessary
  }
}

async function createMaintenanceTask() {
  const taskTitleInput = document.getElementById("task-title").value;
  const taskDescriptionInput =
    document.getElementById("task-description").value;
  const taskStatusSelect = document.getElementById("task-status").value;
  const taskPrioritySelect = document.getElementById("task-priority").value;
  const taskImageInput = document.getElementById("task-image").files[0];
  const taskAccountInput = document.getElementById("task-account").value;
  const taskUnitInput = document.getElementById("task-unit").value;

  const formData = new FormData();
  formData.append("title", taskTitleInput);
  formData.append("description", taskDescriptionInput);
  formData.append("status", taskStatusSelect);
  formData.append("priority", taskPrioritySelect);
  if (taskImageInput) {
    // Check if a file is selected
    formData.append("image", taskImageInput);
  }
  formData.append("accountUsername", taskAccountInput);
  formData.append("unitId", taskUnitInput);

  try {
    const newTask = await fetch(
      MAINTENANCE_URL,
      makeOptions("POST", formData, true)
    ).then(handleHttpErrors);

    if (clickedLocation != null) {
      tasks.push(newTask);
      displayMaintenanceTasks(tasks);
    }
  } catch (error) {
    console.error("Could not create new task: " + error);
  }
}

function closeModal(evt) {
  if (evt.target == document.getElementById("maintenance-modal")) {
    document.getElementById("maintenance-modal").style.display = "none";
  }
}

function setBorderColor(element, priority) {
  switch (priority) {
    case "LOW":
      element.style.border = "5px solid green";
      break;
    case "MEDIUM":
      element.style.border = "5px solid yellow";
      break;
    case "HIGH":
      element.style.border = "5px solid red";
      break;
    default:
      element.style.border = "5px solid black"; // Default color if status is not recognized
  }
}

function isMobile() {
  const regex =
    /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(navigator.userAgent);
}

/* async function renderMaintenance(retryCount = 0, searchValue = "") {
  searchValue = searchValue ? "/search/" + searchValue : "";
  document.getElementById("maintenance-content").innerHTML =
    sanitizeStringWithTableRows(table);
  try {
    let tasks = await fetch(
      URL + searchValue,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);

    const maintenanceDivs = Array.isArray(tasks.content)
      ? tasks.content.map(generateHTML).join("")
      : tasks.map(generateHTML).join("");

    document.getElementById("tbody-maintenance").innerHTML =
      sanitizeStringWithTableRows(maintenanceDivs);
    document.getElementById("add-maintenance-task").onclick =
      displayAddTaskModal;
    //TODO add button event
  } catch (error) {
    console.error("Could not fetch maintenance tasks: " + error);
    const contentDiv = document.getElementById("maintenance-content");
    handleFetchError(renderMaintenance, retryCount, contentDiv);
  }
}

async function maintenanceDetails(evt) {
  const clicked = evt.target;
  if (!clicked.id.startsWith("maintenance-details_")) {
    return;
  }

  const id = clicked.id.replace("maintenance-details_", "");
  window.router.navigate("maintenance-details?id=" + id);
}

function displayAddTaskModal() {
  const modal = document.getElementById("maintenance-modal");

  const inputForm = `<span class="close">&times;</span>
  
  <label for="task-title">Title:</label>
  <input type="text" id="task-title" name="title" required><br>

  <label for="task-description">Description:</label>
  <input type="text" id="task-description" name="description"><br>

  <label for="task-status">Status:</label>
  <select id="task-status" name="status" required>
      <option value="NOT_STARTED">Not Started</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="DONE">Done</option>
  </select><br>

  <label for="task-priority">Priority:</label>
  <select id="task-priority" name="priority" required>
      <option value="LOW">Low</option>
      <option value="MEDIUM">Medium</option>
      <option value="HIGH">High</option>
  </select><br>

  <label for="task-image">Image:</label>
  <input type="file" id="task-image" name="image" accept="image/*"><br>

  <label for="task-account">Account</label>
  <input type="text" id="task-account" name="account"><br>

  <label for="task-unit">Unit</label>
  <input type="number" id="task-unit" name="unit" required><br>

  <button id="create-task-btn">Submit</button>
`;

  modal.querySelector(".modal-content").innerHTML = inputForm;
  modal.style.display = "block";

  const closeBtn = modal.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  const createBtn = document.getElementById("create-task-btn");
  createBtn.addEventListener("click", async () => {
    await createMaintenanceTask();
    modal.style.display = "none";
    renderMaintenance();
  });
}

async function createMaintenanceTask() {
  const taskTitleInput = document.getElementById("task-title").value;
  const taskDescriptionInput =
    document.getElementById("task-description").value;
  const taskStatusSelect = document.getElementById("task-status").value;
  const taskPrioritySelect = document.getElementById("task-priority").value;
  const taskImageInput = document.getElementById("task-image").files[0];
  const taskAccountInput = document.getElementById("task-account").value;
  const taskUnitInput = document.getElementById("task-unit").value;

  const formData = new FormData();
  formData.append("title", taskTitleInput);
  formData.append("description", taskDescriptionInput);
  formData.append("status", taskStatusSelect);
  formData.append("priority", taskPrioritySelect);
  if (taskImageInput) {
    // Check if a file is selected
    formData.append("image", taskImageInput);
  }
  formData.append("accountUsername", taskAccountInput);
  formData.append("unitId", taskUnitInput);

  console.log(formData.getAll);

  try {
    await fetch(URL, makeOptions("POST", formData, true)).then(
      handleHttpErrors
    );
  } catch (error) {
    console.error("Could not create new task: " + error);
  }
}

function closeModal(evt) {
  if (evt.target == document.getElementById("maintenance-modal")) {
    document.getElementById("maintenance-modal").style.display = "none";
  }
}

const generateHTML = (task) => {
  let imageTag = "";
  if (task.image) {
    imageTag = `<img src="data:${task.mimetype};base64,${task.image}" alt="">`;
  }

  return `
  
      <tr>
        <td>${task.unitId}</td>
        <td>${task.title}</td>
        <td>${task.description}</td>
        <td>${task.status}</td>
        <td>${task.priority}</td>
        <td>${task.accountUsername}</td>
        <td>${task.created}</td>
        <td><button id="maintenance-details_${task.id}">Detaljer</button></td>
      </tr>
    `;
};

const table = `<table class="table">
<thead>
  <tr>
    <th>Hus/Lejlighed</th>
    <th>Title</th>
    <th>Beskrivelse</th>
    <th>Status</th>
    <th>Prioritet</th>
    <th>Tildelt</th>
    <th>Oprettet</th>
    <th>Info</th>
  </tr>
</thead>
<tbody id="tbody-maintenance"></tbody>
</table>`;
 */
