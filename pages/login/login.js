import { API_URL } from '../../settings.js'
import { handleHttpErrors } from '../../utils.js'


export function initLogin() {
  document.getElementById("login-btn").addEventListener("click", login)
}

async function login() {
    document.getElementById("login-fail").innerText = ""
    const userNameInput = document.getElementById("username")
    const passwordInput = document.getElementById("password")
    const loginRequest = {
      username: userNameInput.value,
      password: passwordInput.value
    }
    const options = {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(loginRequest)
    }
    try {
      const res = await fetch(API_URL + "/auth/login", options).then(r => handleHttpErrors(r))
      storeLoginDetails(res)
      window.router.navigate("/dashboard")
    } catch (err) {
      document.getElementById("login-fail").innerText = err.message
    }
  }
  
  /**
   * Store username, roles and token in localStorage, and update UI-status
   * @param res - Response object with details provided by server for a succesful login
   */
  function storeLoginDetails(res) {
    localStorage.setItem("token", res.token)
    localStorage.setItem("user", res.username)
    localStorage.setItem("roles", res.roles)
    //Update UI
    toggleLoginStatus(true)
  }
  
  export function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("roles")
    toggleLoginStatus(false)
    window.router.navigate("/login")
  }
  
  export function toggleLoginStatus(loggedIn) {
    // Hide or show all menu-links depending on login status
    // document.getElementById("login-container").style.display = loggedIn ? "none" : "block"
    
    //Looks for log out button. Keep commented out until implementation of such button
    //document.getElementById("logout-btn").style.display = loggedIn ? "block" : "none"
    
    const adminListItems = document.querySelectorAll('.admin-only');
    const cleanRoutes = document.querySelectorAll('.clean-only'); // Use querySelectorAll to get all elements
    const techRoutes = document.querySelectorAll('.tech-only'); // Use querySelectorAll to get all elements
    let isAdmin = false;
    let isClean = false;
    let isTech = false;
    
    if (localStorage.getItem('roles')) {
       isAdmin = localStorage.getItem('roles').includes('ADMIN');
       isClean = localStorage.getItem('roles').includes('CLEAN');
       isTech = localStorage.getItem('roles').includes('TECH');
    }
    
    for (let i = 0; i < adminListItems.length; i++) {
        adminListItems[i].style.display = isAdmin ? "block" : "none";
    }
    
    for (let i = 0; i < cleanRoutes.length; i++) {
        cleanRoutes[i].style.display = isClean ? "block" : "none";
    }
    
    for (let i = 0; i < techRoutes.length; i++) {
        techRoutes[i].style.display = isTech ? "block" : "none";
    }
}