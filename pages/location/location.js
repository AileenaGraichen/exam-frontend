import { handleHttpErrors, makeOptions } from "../../utils.js";
import { API_URL } from "../../settings.js";

const URL = API_URL+"/api/location"

let pageSize = 20;
let sortColumn = 'locationName';
let sortDirection = 'asc';
let queryString
let isInitialized = false;

export function initLocations(){
    const page =  0

    // if (!isInitialized) {  //No reason to setup event handlers if it's already been done
    //     isInitialized = true;
    //     document.querySelector('#pagination').addEventListener('click', handlePaginationClick)
    //     document.getElementById("header-row").addEventListener("click", handleSortClick)
    // }

    fetchLocations(Number(page));
}

async function fetchLocations(page = 0){
    let data;
    const size = pageSize;
    try {
        if (isMobile()) {
            console.log("Mobile device detected");
    
            data = await fetch(`${URL}?size=100`, makeOptions("GET", null, false)).then(handleHttpErrors);
            displayData(data.content);  
            return;
    
          } else {
            console.log("Desktop device detected");
    
            queryString = `?page=${page}&size=${size}&sort=${sortColumn},${sortDirection}`
            data = await fetch(`${URL}${queryString}`).then(handleHttpErrors);
            displayData(data.content);
            displayPagination(data.totalPages, page);
            return;
    
          }
    } catch (error) {
        console.error(error);
    }
    
    // const width = window.innerWidth
    // if(width < 430){
    //     const data = await fetch(URL, makeOptions("GET", null, false)).then(handleHttpErrors);
    // }
}

function displayData(locations){
    const divObjects = locations.map(location => `<div><h2>${location.locationName}</h2><h4>${location.address}</h4></div>`).join('');
    document.getElementById("location-flexbox").innerHTML = divObjects;
}

function isMobile() {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
  }
  
  