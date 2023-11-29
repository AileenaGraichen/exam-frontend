import { handleHttpErrors, makeOptions } from "../../utils.js";
import { API_URL } from "../../settings.js";
import { handleFetchError } from "../../utils.js";

let cleanPlanData;
let unitCleanData;
let cleanPlanBox;

export function initCleanplan(){
    fetchCleanplanData()
    cleanPlanBox = document.getElementById("cleaningplan-outerbox");
    document.getElementById("view-switcher").addEventListener("click", updatePlanView)
}

async function fetchCleanplanData(){
    let planData;
    let unitData;
    try {
        planData = await fetch(`${API_URL}/user-with-role`, makeOptions("GET", null, true)).then(handleHttpErrors)
        unitData = await fetch(`${API_URL}/unit`, makeOptions("GET", null, true)).then(handleHttpErrors)
    } catch (error) {
        console.error(error);
        //handleFetchError(fetchCleanplanData, 0, cleanPlanBox)
    }
    setupPlanData(planData);
    setupUnitData(unitData.content);
    updatePlanView();
    setupEventHandlers();
}

function setupPlanData(plans){
    const filteredData = plans.map(user => filterUniqueDates(user));
    cleanPlanData = filteredData.map(user => {
        const cleaningPlanBoxes = user.cleaningPlans.map(plan => {
          return `<div class="cleanplan-box" id="clean_user_${user.userName}_${plan.date}">
                      <h3>${plan.date}</h3>
                      <h4>${user.userName}</h4>
                      <button class="cleanplan-open-button">Se Plan</button>
                  </div>`;
        }).join(''); // Join the generated HTML elements for each date
      
        return cleaningPlanBoxes;
      }).flat(); // Flatten the nested arrays into a single array
      
      // Join the generated HTML elements into a single string
      cleanPlanData = cleanPlanData.join('');
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
            cleaningButton = `<button class="cleanplan-open-button">Se Plan</button>`
        }
        return `<div class="cleanplan-box" id="clean_unit_${unit.id}_${cleaningPlanDate}">
                    <h4>${unit.location.address} ${unit.unitNumber}</h4>
                    <h5>${unit.status}</h5>
                    ${cleaningPlansInfo}
                    ${cleaningButton}
                </div>`;
    }).join('');
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
    
}

function setupEventHandlers(){
    const allButtons = document.querySelectorAll(".cleanplan-open-button");
    allButtons.forEach(button => {
        button.addEventListener("click", (event) => handleCleaningPlanClick(event))
    })  
}

function handleCleaningPlanClick(event){
    const clickedId = getParentDivId(event.target);
    const idSegments = clickedId.split('_');

    if(clickedId.startsWith("clean_user_")){
        const userId = idSegments[2];
        const cleaningDate = idSegments[3];
    }
    if(clickedId.startsWith("clean_unit_")){
        const unitId = idSegments[2];
        const cleaningDate = idSegments[3];
    }
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


function filterUniqueDates(user) {
    const uniqueDates = [];
    user.cleaningPlans = user.cleaningPlans.filter(plan => {
      if (!uniqueDates.includes(plan.date)) {
        uniqueDates.push(plan.date);
        return true;
      }
      return false;
    });
    return user;
  }

