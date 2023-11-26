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
    let yValues = [80, 5, 10]
    let xValues = ["Færdige", "I gang", "Ikke startet"]
    const barColors = ["green","blue", "red"];
    //fetch task data and put into "yValues" array before creating chart. Above is just temp data.
    //Sørg for at dataen er returneret, inden der laves et chart. Så pas på med async kald der fortsætter inden data er modtaget. 
    //Hent alle tasks, check status, og tæl op på 3 variabler for hver type status. Lig efter loopet værdierne ind i yValues. 

    new Chart("myChart", {
        type: "doughnut",
        data: {
          labels: xValues,
          datasets: [{
            backgroundColor: barColors,
            data: yValues
          }]
        },
        options: {
          title: {
            display: false,
            text: "Opgave status"
          }
        }
      });
}
async function fetchLocations(){
    let data = await fetch(`${API_URL}/location?size=5`, makeOptions("GET", null, false)).then(handleHttpErrors);
    displayData(data.content);
}
function displayData(locations){
    const locationObjects = locations.map(location => 
    `<div class="location-box" >
    <h2>${location.locationName}</h2>
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
