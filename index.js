import "https://unpkg.com/navigo"  //Will create the global Navigo object used below
import "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js"

import {setActiveLink, renderHtml, loadHtml} from "./utils.js"


//Add Init methods here
import {initLogin} from "./pages/login/login.js";


window.addEventListener("load", async () => {

  //Load html templates here, for navigo
  const templateBooks = await loadHtml("./pages/login/login.html")


  const router = new Navigo("/",{hash:true});
  window.router = router
  router
      .hooks({
        before(done, match) {
          setActiveLink("menu", match.url)
          done()
        }
      })
      .on({
        //For very simple "templates", you can just insert your HTML directly like below
        "/": () => 
        renderHtml(templateHome, "content"),

        "/books": (match) => {
          renderHtml(templateBooks, "content")
          initLogin()
        },

        "/books-no-pagination": (match) => {
          renderHtml(templateBooksNoPagination, "content")
          initBooksNoPagination()
        },
        
        "/grid": (match) => {
          renderHtml(templateGrid, "content");
        }
      })
      .notFound(() => document.getElementById("content").innerHTML ="<h2>404 - Page not found</h2>")
      .resolve()
});


window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
      + ' Column: ' + column + ' StackTrace: ' + errorObj);
}