import { handleHttpErrors, makeOptions } from "../../utils.js";
import { API_URL } from "../../settings.js";

let userName;
let userRoles;

export function initDashboard(){
    userName = localStorage.getItem("user");
    userRoles = localStorage.getItem("roles");
    document.getElementById("welcome-text").innerText = `Velkommen ${userName}`;
    setupLinks();
    setupData(userRoles);
}


function setupLinks(){
    document.getElementById("task-box").addEventListener("click", () => {
        window.router.navigate("/maintenance")
    })
    document.getElementById("cleaning-box").addEventListener("click", () => {
        window.router.navigate("/cleanplan")
    })
    document.getElementById("overview-box").addEventListener("click", () => {
        window.router.navigate("/location")
    })
    document.getElementById("personel-box").addEventListener("click", () => {
        window.router.navigate("/accounts")
    })
    document.getElementById("owner-box").addEventListener("click", () => {
        window.router.navigate("/owners")
    })
    
}
async function setupData(userRoles){
    try {
        fetchTasks()
        fetchLocations()
        fetchCleanPlan()
        fetchPersonel()
        fetchOwners()
    } catch (error) {
        console.error(error);
    }
}


async function fetchTasks(){
    let doneCounter = 0
    let inProgressCounter = 0
    let noStartCounter = 0
    
    try {
        const data = await fetch(`${API_URL}/maintenance-task?size=1000`, makeOptions("GET", null, true)).then(handleHttpErrors)
        data.content.map(task => {
            if(task.status == "DONE"){
                doneCounter++
            } else if(task.status == "IN_PROGRESS"){
                inProgressCounter++
            }else if(task.status == "NOT_STARTED"){
                noStartCounter++
            }
        })
    } catch (error) {
        
    }

    let yValues = [doneCounter, inProgressCounter, noStartCounter]
    let xValues = ["Færdige", "I gang", "Ikke startet"]
    const barColors = ["green","blue", "red"];
    
    //Ud fra yValues, udregn % der er done. 
    calculateDoneTasks(yValues);
    createChart(xValues, yValues, barColors);
    
}
async function fetchLocations(){
    let data = await fetch(`${API_URL}/location?size=10`, makeOptions("GET", null, false)).then(handleHttpErrors);
    displayData(data.content);
}
function displayData(locations){
    const locationObjects = locations.map(location => 
    `<div class="dashboard-data-list">
    <h4>${location.locationName}</h4>
    </div>`
    ).join('');
    document.getElementById("overview-data-box").innerHTML = locationObjects;
}

async function fetchCleanPlan(){
    const data = await fetch(`${API_URL}/cleaning/pageable?size=5`, makeOptions("GET", null, true)).then(handleHttpErrors)
    const cleanObjects = data.content.map(plan => `
    <div class="dashboard-data-list">${plan.date} - ${plan.userName}</div>
    `).join('')
    document.getElementById("cleaning-data-box").innerHTML = cleanObjects;

}
async function fetchPersonel(){
    const data = await fetch(`${API_URL}/user-with-role`, makeOptions("GET", null, true)).then(handleHttpErrors)
    const filteredUsers = data.filter(user =>
        user.roleNames.includes('CLEAN') || user.roleNames.includes('TECH')
      ).slice(0, 5);
    
    const personelObjects = filteredUsers.map(user => `
    <div class="dashboard-data-list">${user.userName} - ${user.email} - ${user.roleNames[0]}</div>
    `).join('')

    document.getElementById("personel-data-box").innerHTML = personelObjects;

}

async function fetchOwners(){
    const data = await fetch(`${API_URL}/owner?size=5`, makeOptions("GET", null, true)).then(handleHttpErrors)
    const ownerObjects = data.content.map(owner => `
    <div class="dashboard-data-list">${owner.lastName}, ${owner.firstName} - ${owner.mobile}</div>
    `).join('')
    document.getElementById("owner-data-box").innerHTML = ownerObjects;
}

function calculateDoneTasks(yValues){
    const finishedTasks = yValues[0];
    const totalTasks = yValues.reduce((accumulator, value) => accumulator + value, 0);
    const taskDonePercentage = Math.floor(finishedTasks/totalTasks*100);

    document.getElementById("donut-inner-text").innerHTML = `${taskDonePercentage}%`
}
    
function createChart(xValues, yValues, barColors){
    const chart = new Chart("myChart", {
        type: "doughnut",
        data: {
          labels: xValues,
          fontColor: "black",
          datasets: [{
            backgroundColor: barColors,
            data: yValues
          }]
        },
        options: {
            plugins: {
                title: {
                    display:false,
                    text: "Færdige opgaver",
                    font: {
                        size: 18
                    }
                }, 
            },
            onClick: function(event, chart) {
                // Disable the click event by doing nothing
            }
            
        }
      });
}