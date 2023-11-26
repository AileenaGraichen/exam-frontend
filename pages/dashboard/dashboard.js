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
        window.router.navigate("/taskList")
    })
    document.getElementById("cleaning-box").addEventListener("click", () => {
        window.router.navigate("/cleanplan")
    })
    document.getElementById("overview-box").addEventListener("click", () => {
        window.router.navigate("/location")
    })
    document.getElementById("personel-box").addEventListener("click", () => {
        window.router.navigate("/personel")
    })
    
}
async function setupData(userRoles){
    try {
        fetchTasks()
        fetchLocations()
        //fetchCleanPlan()
        //fetchPersonel()
    } catch (error) {
        console.error(error);
    }
}


function fetchTasks(){
    const activeChart = Chart.getChart("myChart")
    if(activeChart){
        activeChart.destroy();
    }
    
    let yValues = [60, 12, 20]
    let xValues = ["Færdige", "I gang", "Ikke startet"]
    const barColors = ["green","blue", "red"];
    //fetch task data and put into "yValues" array before creating chart. Above is just temp data.
    //Sørg for at dataen er returneret, inden der laves et chart. Så pas på med async kald der fortsætter inden data er modtaget. 
    //Hent alle tasks, check status, og tæl op på 3 variabler for hver type status. Lig efter loopet værdierne ind i yValues. 

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
    //fetch call
    //setupData and put into div
    //document.getElementById("cleaning-data-box").innerHTML = cleanObjects;

}
async function fetchPersonel(){
    //fetch call
    //setupData and put into div
    //document.getElementById("personel-data-box").innerHTML = personelObjects;

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