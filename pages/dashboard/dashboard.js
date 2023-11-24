import { handleHttpErrors, makeOptions } from "../../utils.js";
import { API_URL } from "../../settings.js";

const userName = localStorage.getItem(userName);
let userRoles = localStoreage.getItem(roles);

export function initDashboard(){
    document.getElementById("welcome-text").innerText = `Velkommen ${userName}`;
    //fetchData(userRoles);
}


async function fetchData(userRoles){
    try {
        fetchTasks()
        fetchCleanPlan()
        fetchPersonel()
    } catch (error) {
        console.error(error);
    }
}