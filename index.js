//import "https://unpkg.com/navigo"; //Will create the global Navigo object used below
import "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js";
import "./navigo_EditedByLars.js";

import {setActiveLink, renderHtml, loadHtml} from "./utils.js"
import {initLogin} from "./pages/login/login.js"
import {initLocations} from "./pages/location/location.js"
import {initManageAccounts} from "./pages/manageAccounts/accounts.js"

window.addEventListener("load", async () => {
  
  const templateLogin = await loadHtml("./pages/login/login.html")
  const templateHome = await loadHtml("./pages/home/home.html")
  const templateLocations = await loadHtml("./pages/location/location.html")
  const templateAccounts = await loadHtml("./pages/manageAccounts/accounts.html")

  const router = new Navigo("/", { hash: true });
  window.router = router;
  router
    .hooks({
      before(done, match) {
        setActiveLink("menu", match.url);
        done();
      },
    })
    .on({
      "/": () => renderHtml(templateHome, "content"),


        "/location": () => {
          renderHtml(templateLocations, "content")
          initLocations()
        },

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
});

