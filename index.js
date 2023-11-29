//import "https://unpkg.com/navigo"; //Will create the global Navigo object used below
import "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js";
import "./navigo_EditedByLars.js";

import { setActiveLink, renderHtml, loadHtml } from "./utils.js";
import { initLogin } from "./pages/login/login.js";
import { initLocations } from "./pages/location/location.js";
import { initManageAccounts } from "./pages/manageAccounts/accounts.js";
import { initAccountDetails } from "./pages/manageAccounts/accountDetails.js";
import { initManageOwners } from "./pages/manageOwners/owners.js";
import { initOwnerDetails } from "./pages/manageOwners/ownerDetails.js";
import { initUnits } from "./pages/manageUnits/units.js";
import {initDashboard} from "./pages/dashboard/dashboard.js";
import { initCleanplan } from "./pages/cleanplan/cleanplan.js";

window.addEventListener("DOMContentLoaded", async () => {
  const templateLogin = await loadHtml("./pages/login/login.html");
  const templateHome = await loadHtml("./pages/home/home.html");
  const templateLocations = await loadHtml("./pages/location/location.html");
  const templateAccounts = await loadHtml(
    "./pages/manageAccounts/accounts.html"
  );
  const templateAccountDetails = await loadHtml(
    "./pages/manageAccounts/accountDetails.html"
  );
  const templateOwners = await loadHtml("./pages/manageOwners/owners.html");
  const templateOwnerDetails = await loadHtml(
    "./pages/manageOwners/ownerDetails.html"
  );
  const templateUnits = await loadHtml("./pages/manageUnits/units.html");
  const templateDashboard = await loadHtml("./pages/dashboard/dashboard.html")
  const templateCleaningPlan = await loadHtml("./pages/cleanplan/cleanplan.html")

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

      "/dashboard": () => {
        renderHtml(templateDashboard, "content")
        initDashboard()
      },
      "/location": () => {
        renderHtml(templateLocations, "content");
        initLocations();
      },

      "/unit": (match) => {
        renderHtml(templateUnits, "content");
        initUnits(match);
      },

      "/accounts": () => {
        renderHtml(templateAccounts, "content");
        initManageAccounts();
      },
      "/account-details": (match) => {
        renderHtml(templateAccountDetails, "content");
        initAccountDetails(match);
      },
      "/owners": () => {
        renderHtml(templateOwners, "content");
        initManageOwners();
      },
      "/owner-details": (match) => {
        renderHtml(templateOwnerDetails, "content");
        initOwnerDetails(match);
      },
      "/cleanplan": () => {
        renderHtml(templateCleaningPlan, "content");
        initCleanplan();
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
