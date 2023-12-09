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

let task;
let locationId;

export async function initMaintenanceDetails(match) {
  if (match?.params?.task && match?.params?.location) {
    const id = match.params.task;
    console.log(id);
    locationId = match.params.location;
    document.getElementById("maintenance-details-content").innerHTML =
      loadingContent;
    renderMaintenanceDetailsPage(0, id);
  }

  window.onclick = closeModal;
}

async function renderMaintenanceDetailsPage(retryCount, taskId) {
  try {
    task = await fetch(
      MAINTENANCE_URL + "/" + taskId,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);
    const location = await fetch(
      LOCATION_URL + "/" + locationId,
      makeOptions("GET", null, true)
    ).then(handleHttpErrors);
    generateMaintenanceDetailsHTML(task, location);
  } catch (error) {
    console.error("Could not fetch task: " + error);
    const contentDiv = document.getElementById("maintenance-details-content");
    handleFetchError(renderMaintenanceDetailsPage, retryCount, contentDiv);
  }
}

function generateMaintenanceDetailsHTML(task, location) {
  const contentDiv = document.getElementById("maintenance-details-content");
  const taskDetailsBox1 = createElementWithIdAndClassAndContent(
    "div",
    "task-details-box-1",
    "box",
    `<p>${location.locationName}</p>
  <img src="static/images/house.png" alt="">
  <p>Nummer: ${task.unitNumber}</p>`
  );
  setBorderColor(taskDetailsBox1, task.priority);

  const taskDetailsBox2 = createElementWithIdAndClassAndContent(
    "div",
    "task-details-box-2",
    "box",
    `
        <h6>Titel</h6>
        <p>${task.title}</p>
        <h6>Beskrivelse</h6>
        <p>${task.description}</p>`
  );
  const taskDetailsBox3 = createElementWithIdAndClassAndContent(
    "div",
    "task-details-box-3",
    "box",
    `
    <h6>Status</h6>
    <p>${task.status}</p>
    <h6>Prioritet</h6>
    <p>${task.priority}</p>
    <h6>Tildelt</h6>
    <p>${task.accountUsername ? task.accountUsername : "Ikke tildelt"}</p>
`
  );

  let imageElement;
  if (task.image) {
    imageElement = `<img src="data:${task.mimetype};base64,${task.image}" alt="">`;
  } else {
    imageElement = `<p>Intet billede vedlagt</p>`;
  }
  const taskDetailsBox4 = createElementWithIdAndClassAndContent(
    "div",
    "task-details-box-4",
    "box",
    `<div>
        <h6>Billeder</h6>
        ${imageElement}
    </div>`
  );

  contentDiv.innerHTML = "";
  appendChildren(
    contentDiv,
    taskDetailsBox1,
    taskDetailsBox2,
    taskDetailsBox3,
    taskDetailsBox4
  );
}

function createElementWithIdAndClassAndContent(
  elementType,
  id,
  classN,
  content
) {
  const element = document.createElement(elementType);
  element.id = id;
  element.className = classN;
  element.innerHTML = content;
  return element;
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

function removeElement(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

function appendChildren(parent, ...children) {
  children.forEach((child) => {
    parent.appendChild(child);
  });
}

function closeModal(evt) {
  if (evt.target == document.getElementById("maintenance-modal")) {
    document.getElementById("maintenance-modal").style.display = "none";
  }
}
