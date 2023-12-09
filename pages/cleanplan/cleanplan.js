import { handleHttpErrors, makeOptions } from "../../utils.js";
import { API_URL } from "../../settings.js";
import { handleFetchError } from "../../utils.js";

let cleanPlanData;
let unitCleanData;
let cleanPlanBox;

let cleanPlanRawData;
let unitRawData;

let allUnits;
let chosenDate;
let chosenUser;

let availableUnitsList = []
let currentCleaningPlan = []
let userList = [];


export function initCleanplan(){
    fetchCleanplanData()
    cleanPlanBox = document.getElementById("cleaningplan-outerbox");
    document.getElementById("view-switcher").addEventListener("click", updatePlanView)
    document.getElementById("add-cleanplan-modal").addEventListener("click", addCleanplanModal)
    fetchUserList()
}

async function fetchCleanplanData(){
    let cleanPlanData;
    let unitData;
    try {
        cleanPlanRawData = await fetch(`${API_URL}/cleaning`, makeOptions("GET", null, true)).then(handleHttpErrors)
        unitData = await fetch(`${API_URL}/unit`, makeOptions("GET", null, true)).then(handleHttpErrors)
        unitRawData = unitData.content;
        setupPlanData(cleanPlanRawData);
        setupUnitData(unitRawData);
        updatePlanView();
        setupEventHandlers();
        setupAvailableUnitsList(unitRawData)
    } catch (error) {
        console.error(error);
        //handleFetchError(fetchCleanplanData, 0, cleanPlanBox)
    }
    
}
function setupPlanData(plans){
    let filteredPlans = filterUniqueByDateAndUser(plans)
    let sortedPlans = sortByDate(filteredPlans)
    console.log(sortedPlans)
    cleanPlanData = sortedPlans.map(plan => 
    `<div class="cleanplan-box" id="clean_user_${plan.userName}_${plan.date}">
        <h3>${plan.date}</h3>
        <h4>${plan.userName}</h4>
        <button class="cleanplan-open-button button">Se Plan</button>
    </div>
    `).join('');
}
function setupUnitData(units) {
    unitCleanData = units.map(unit => {
        let cleaningPlansInfo = "";
        let cleaningPlanDate = "";
        let cleaningButton = "";
        if (unit.cleaningPlans.length === 0) {
            cleaningPlansInfo = "<h5>No cleaning scheduled</h5>";
        } else {
            // Assuming you want to display the first date if available
            cleaningPlansInfo = `<h5>${unit.cleaningPlans[0].date}</h5>`;
            cleaningPlanDate = `${unit.cleaningPlans[0].date}`
            cleaningButton = `<button class="cleanplan-open-button button">Se Plan</button>`
        }
        return `<div class="cleanplan-box" id="clean_unit_${unit.id}_${cleaningPlanDate}">
                    <h4>${unit.location.address} ${unit.unitNumber}</h4>
                    <h5>${unit.status}</h5>
                    ${cleaningPlansInfo}
                    ${cleaningButton}
                </div>`;
    }).join('');
}


//fetch users for later use
async function fetchUserList(){
    try {
        const data = await fetch(`${API_URL}/user-with-role`, makeOptions("GET", null, true)).then(handleHttpErrors);
        userList = data;
    } catch (error) {
        console.error(error)
    }
}


//Liste til venstre der viser available units, skal have alle feriestederne stående. 
//Når der så laves div eller andet element af hver unit der er ledig, skal den tildeles ud fra lokationen den er tildelt til. Og smides som inner divs i det feriested, som kan bruges som drop down menu.

function addCleanplanModal(){
    currentCleaningPlan = []
    setupAvailableUnitsList()
    const modal = document.getElementById("cleaning-plan-modal");
    const addCleanplanPage = `<span class="close">&times;</span>
    <label for="cleanplan-add-date-selector">Choose Date:</label>
    <input type="date" id="cleanplan-add-date-selector">
    <label for="users-dropdown">Ledigt personale på valgt dato:</label>
    <select id="users-dropdown" disabled>
    </select>
    <p class="cleaningplan-modal-errortext" style="color:red;"></p>
    <button id="continue-add-button">Forsæt</button>
    `;

    modal.querySelector(".modal-content").innerHTML = addCleanplanPage;
    document.getElementById("cleanplan-add-date-selector").addEventListener("change", addUsersToDropdown)
    const closeBtn = modal.querySelector(".close");
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    })
    document.getElementById("continue-add-button").addEventListener("click", editCleanPlan)
    modal.style.display = "block";
}


function editCleanPlan(){
    const modal = document.getElementById("cleaning-plan-modal");
    if(modal.style.display == "block"){
        chosenDate = document.getElementById("cleanplan-add-date-selector").value;
        chosenUser = document.getElementById("users-dropdown").value;
    }
    modal.style.display = "block"

    
    const editCleanplanWindows = `<span class="close">&times;</span>
    <span>Dato: ${chosenDate} - Rengøringsperson: ${chosenUser}</span>
    <br>
    <div id="cleanplan-modal-flexbox">
        <div class="cleanplan-column"  id="cleanplan-left-column">
        <p>Mulige boliger</p>
            <select id="available-units-list" size="20" multiple>
        
            </select>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <button id="move-data-right-button"> > </button>
            <button id="move-data-left-button"> < </button>
        </div>
        <div class="cleanplan-column" id="cleanplan-right-column">
        <p>Valgt Rengøringsplan</p>
        <select id="current-cleanplan-list" size="20" multiple></select>

        </div>
    </div>
    <button id="submit-cleanplan-changes">Gem</button>
    `
    modal.querySelector(".modal-content").innerHTML = editCleanplanWindows;
    const closeBtn = modal.querySelector(".close");
    closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    })
    document.getElementById("submit-cleanplan-changes").addEventListener("click", submitCleaningPlanChanges)
    displayAvailableAndCurrentListOptions()
    document.getElementById("move-data-right-button").addEventListener("click", (evt) => {getSelectedOptions("available-units-list", evt)})
    document.getElementById("move-data-left-button").addEventListener("click", (evt) => {getSelectedOptions("current-cleanplan-list", evt)})
    
}
async function submitCleaningPlanChanges(){
    try {
        //Use the 2 lists, with the date, and chosen user, to create cleaningplanrequests
        const postList = currentCleaningPlan.map(unit => ({
            unitId: unit.id,
            userName: chosenUser,
            date: formattedDate
        }));
        
        const deleteList = availableUnitsList.map(unit => ({
            unitId: unit.id,
            userName: chosenUser,
            date: forma
        }));
        console.log(postList)
        console.log(deleteList)
        document.getElementById("cleaning-plan-modal").style.display = "none";
        await fetch(`${API_URL}/cleaning`, makeOptions("POST", postList , true))
        await fetch(`${API_URL}/cleaning`, makeOptions("DELETE", deleteList , true))
    } catch (error) {
        console.error(error)
    }
    fetchCleanplanData()
}

function getSelectedOptions(columnId, evt) {
    const clickedButton = evt.target.id;
    const select = document.getElementById(columnId);
    //Contains list of unit ids chosen to move between lists
    const selectedOptions = [...select.options]
      .filter(option => option.selected)
      .map(option => option.value);

    updateAvailableAndCurrentList(selectedOptions, clickedButton)
    displayAvailableAndCurrentListOptions()
    
  }


function updateAvailableAndCurrentList(options, clickedButton) {
    for (let i = 0; i < options.length; i++) {
        const optionId = options[i];
       
        // Find the index of the unit in availableunits based on its ID
        const availableIndex = availableUnitsList.findIndex(unit => unit.id == optionId);
        
        // Find the index of the unit in currentCleanplan based on its ID
        const currentPlanIndex = currentCleaningPlan.findIndex(unit => unit.id == optionId);
        
        // If 'move-data-right-button' clicked and unit exists in availableunits
        if (clickedButton === "move-data-right-button" && availableIndex !== -1) {
            const unitToMove = availableUnitsList.splice(availableIndex, 1)[0]; // Remove from availableunits
            currentCleaningPlan.push(unitToMove); // Add to currentCleanplan
        }
        // If 'move-data-left-button' clicked and unit exists in currentCleanplan
        else if (clickedButton === "move-data-left-button" && currentPlanIndex !== -1) {
            const unitToMove = currentCleaningPlan.splice(currentPlanIndex, 1)[0]; // Remove from currentCleanplan
            availableUnitsList.push(unitToMove); // Add to availableunits
        }
    }
}

function displayAvailableAndCurrentListOptions(){
    const leftColumn = document.getElementById("available-units-list");
    const rightColumn = document.getElementById("current-cleanplan-list");
    const groupedUnits = sortUnitsByLocation(availableUnitsList)
    const groupedCleanplans = sortUnitsByLocation(currentCleaningPlan)
    leftColumn.innerHTML = groupedUnits.map(unit => 
        `
        <option value="${unit.id}" >${unit.location.address}, ${unit.unitNumber}</option>
        `)
        rightColumn.innerHTML = groupedCleanplans.map(unit => 
        `
        <option value="${unit.id}" >${unit.location.address}, ${unit.unitNumber}</option>
        `
        )
}

function addUsersToDropdown(){
    const dropDownMenu = document.getElementById('users-dropdown')
    const chosenDate = document.getElementById("cleanplan-add-date-selector").value
    const dropDownUserList = removeUsersByDate(userList, chosenDate)
    const dropDownData = dropDownUserList.map(user => {
        let username = user.userName;
        let capitalName = username.charAt(0).toUpperCase() + username.slice(1);
        return `<option value="${user.userName}">${capitalName}</option>`
    })
    dropDownMenu.innerHTML = dropDownData;
    dropDownMenu.disabled = false;
}




function updatePlanView(){
    let isChecked = document.getElementById("view-switcher").checked; //Kan checke switchen når der trykkes.
    let title = document.getElementById("cleaningplan-box-title");
    if(isChecked){
        cleanPlanBox.innerHTML = unitCleanData;
        title.innerText = "Boliger/Units"
    }else{
        cleanPlanBox.innerHTML = cleanPlanData;
        title.innerText = "Rengøringsplaner"
    }
    setupEventHandlers()
}

function setupEventHandlers(){
    const allButtons = document.querySelectorAll(".cleanplan-open-button");
    allButtons.forEach(button => {
        button.addEventListener("click", (event) => handleCleaningPlanClick(event))
    })  
}

function setupAvailableUnitsList(data){
    if(data){
        allUnits = data;
    }
    availableUnitsList = []
    allUnits.map((unit) => {
        if(unit.status != "AVAILABLE"){
            return availableUnitsList.push(unit);
        }
        return null;
    })
}

function handleCleaningPlanClick(event){
    const clickedId = getParentDivId(event.target);
    const idSegments = clickedId.split('_');

    if(clickedId.startsWith("clean_user_")){
        const userId = idSegments[2];
        const cleaningDate = idSegments[3];
        chosenUser = userId;
        chosenDate = cleaningDate;
        fetchCleaningPlansByUserAndDate(userId, cleaningDate)
    }
    if(clickedId.startsWith("clean_unit_")){
        const unitId = idSegments[2];
        const cleaningDate = idSegments[3];
    }
}

async function fetchCleaningPlansByUserAndDate(userId, cleaningDate){
    try {
        //const data = await fetch(`${API_URL}/cleaning/${userId}/${cleaningDate}`,makeOptions("GET", null, true)).then(handleHttpErrors)
        const filteredCleaningPlans = cleanPlanRawData.filter(plan => {
            return plan.userName === userId && plan.date === cleaningDate;
        });
        const unitIdsFromCleaningPlans = filteredCleaningPlans.map(plan => plan.unitId)
        currentCleaningPlan = allUnits.filter(unit => unitIdsFromCleaningPlans.includes(unit.id));
        availableUnitsList = availableUnitsList.filter(unit => !unitIdsFromCleaningPlans.includes(unit.id));
    } catch (error) {
        console.error(error);
    }
    editCleanPlan()
}

  function removeUsersByDate(users, userInputDate) {
    // Convert user input date to 'dd-mm-yyyy' format
    const inputDate = new Date(userInputDate);
    const formattedInputDate = `${inputDate.getDate().toString().padStart(2, '0')}-${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getFullYear()}`;

    // Filter users based on matching date in cleaning plans
    return users.filter(user => {
        // Check if the user has any cleaning plans for the specified date
        const hasPlanOnDate = user.cleaningPlans.some(plan => {
            // Assuming the plan date format is 'dd-mm-yyyy'
            return plan.date === formattedInputDate;
        });

        // Return false for users who have a plan on the specified date
        return !hasPlanOnDate;
    });
}
function getParentDivId(element) {
    let parent = element;
    while (parent) {
        if (parent.classList.contains('cleanplan-box')) {
            return parent.id;
        }
        parent = parent.parentNode;
    }
    return null; // Return null if the element with the specified class is not found
}

function sortByDate(cleanPlans) {
    return cleanPlans.sort((a, b) => {
        const datePartsA = a.date.split('-').reverse().join('-');
        const datePartsB = b.date.split('-').reverse().join('-');
        return new Date(datePartsA) - new Date(datePartsB);
    });
}

function filterUniqueByDateAndUser(cleanPlans) {
    const uniqueCombinations = new Map();

    return cleanPlans.filter(plan => {
        const { date, userName } = plan;
        const key = date + userName;

        if (!uniqueCombinations.has(key)) {
            uniqueCombinations.set(key, true);
            return true;
        }

        return false;
    });
}

function sortUnitsByLocation(units) {
    return units.sort((a, b) => {
        const locationA = a.location.id;
        const locationB = b.location.id;
        
        if (locationA < locationB) {
            return -1;
        }
        if (locationA > locationB) {
            return 1;
        }
        return 0;
    });
}