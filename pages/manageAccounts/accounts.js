import { API_URL } from "../../settings.js";
const URL = API_URL + "/api/user-with-role";
import {
  makeOptions,
  sanitizeStringWithTableRows,
  handleHttpErrors,
} from "../../utils.js";

export async function initManageAccounts() {
  renderAccounts();
}

async function renderAccounts() {
  try {
    const accounts = await fetch(URL, makeOptions("GET", null, false)).then(
      handleHttpErrors
    );

    const accountTable = accounts
      .map((account) => {
        return `<div>
            <h1>${account.username}</h1>
            </div>`;
      })
      .join("");

    document.getElementById("accounts-outerbox").innerHTML = accountTable;
  } catch (err) {
    console.error("Could not fetch accounts from server: " + err);
  }
}
