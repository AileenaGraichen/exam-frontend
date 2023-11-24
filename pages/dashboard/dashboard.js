import { handleHttpErrors, makeOptions } from "../../utils.js";
import { API_URL } from "../../settings.js";

let userName;
let userRoles;

export function initDashboard(){
    userName = localStorage.getItem("user");
    userRoles = localStorage.getItem("roles");
    document.getElementById("welcome-text").innerText = `Velkommen ${userName}`;
    setupLinks();
    fetchData(userRoles);
}


function setupLinks(){
    document.getElementById("cleaning-box").addEventListener("click", () => {
        window.router.navigate("/cleanplan")
    })
    document.getElementById("overview-box").addEventListener("click", () => {
        window.router.navigate("/location")
    })
}
async function fetchData(userRoles){
    try {
        //fetchTasks()
        //fetchCleanPlan()
        //fetchPersonel()
    } catch (error) {
        console.error(error);
    }
}