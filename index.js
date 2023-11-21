<<<<<<< HEAD
import "https://unpkg.com/navigo"; //Will create the global Navigo object used below
import "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js";
//import "./navigo_EditedByLars.js";
import { setActiveLink, renderHtml, loadHtml } from "./utils.js";
=======

//import "https://unpkg.com/navigo"  //Will create the global Navigo object used below
import "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js"
import "./navigo_EditedByLars.js";
import {setActiveLink, renderHtml, loadHtml} from "./utils.js"
>>>>>>> 2e86199eef9394a6e3f5126d82696418d429b0b2
//Add Init methods here
import {initLogin} from "./pages/login/login.js";
import { initManageAccounts } from "./pages/manageAccounts/accounts.js";


window.addEventListener("load", async () => {
  //Load html templates here, for navigo
<<<<<<< HEAD

  const templateLogin = await loadHtml("./pages/login/login.html");
  const templateAccounts = await loadHtml(
    "./pages/manageAccounts/accounts.html"
  );
  const templateHome = await loadHtml("./pages/home/home.html");
=======
  
  const templateLogin = await loadHtml("./pages/login/login.html")
  const templateHome = await loadHtml("./pages/home/home.html")
  const templateAccounts = await loadHtml("./pages/manageAccounts/accounts.html");
>>>>>>> 2e86199eef9394a6e3f5126d82696418d429b0b2

  const router = new Navigo("/", { hash: true });
  window.router = router;
  router
<<<<<<< HEAD
    .hooks({
      before(done, match) {
        setActiveLink("menu", match.url);
        done();
      },
    })
    .on({
      "/": () => renderHtml(templateHome, "content"),

      "/accounts": () => {
        renderHtml(templateAccounts, "content");
        initManageAccounts();
      },

      "/login": () => {
        renderHtml(templateLogin, "content");
        initLogin();
      },
    })
    .notFound(
      () =>
        (document.getElementById("content").innerHTML =
          "<h2>404 - Page not found</h2>")
    )
    .resolve();
=======
      .hooks({
        before(done, match) {
          setActiveLink("menu", match.url)
          done()
        }
      })
      .on({
        "/": () => 
        renderHtml(templateHome, "content"),

        "/manage/accounts": (match) => {
        renderHtml(templateAccounts, "content");
        initManageAccounts();
        },

        "/login": () => {
          renderHtml(templateLogin, "content");
          initLogin();
        }
      })
      .notFound(() => document.getElementById("content").innerHTML ="<h2>404 - Page not found</h2>")
      .resolve()
>>>>>>> 2e86199eef9394a6e3f5126d82696418d429b0b2
});

window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  alert(
    "Error: " +
      errorMsg +
      " Script: " +
      url +
      " Line: " +
      lineNumber +
      " Column: " +
      column +
      " StackTrace: " +
      errorObj
  );
};
