export let API_URL = ""
if (window.location.hostname === 'localhost' || window.location.hostname === "127.0.0.1") {
  API_URL = "http://localhost:8080/api"
} else{
  //Add URL to your hosted API, once you have it deployed.
  API_URL = "http://partneroe.azurewebsites.net/api"
}