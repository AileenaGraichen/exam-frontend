/**
 * Appends the provided template to the node with the id contentId
 * @param {*} template The HTML to render
 * @param {string} contentId
 */
export function renderHtml(template, contentId) {
  const content = document.getElementById(contentId);
  if (!content) {
    throw Error("No Element found for provided content id");
  }
  content.innerHTML = "";
  content.append(template);
}

/**
 * Loads an external file with an div with the class "template", adds it to the body of your page, and returns
 * the div
 * @param {string} page - Path to the file containing the template ('/templates/template.html')
 * @return {Promise<*>} On succesfull resolvement, the HtmlTemplate found in the file
 */
export async function loadHtml(page) {
  const resHtml = await fetch(page).then((r) => {
    if (!r.ok) {
      throw new Error(`Failed to load the page: '${page}' `);
    }
    return r.text();
  });
  const parser = new DOMParser();
  const content = parser.parseFromString(resHtml, "text/html");
  const div = content.querySelector(".template");
  if (!div) {
    throw new Error(
      `No outer div with class 'template' found in file '${page}'`
    );
  }
  return div;
}

/**
 * Only meant for when Navigo is set to use Hash based routing (Always this semester)
 * If users try to enter your site with only "/", it will change this to "/#/" as required
 * for Hash based routing
 * Call it before you start using the router (add the specific routes)
 */
export function adjustForMissingHash() {
  let path = window.location.hash;
  if (path == "") {
    //Do this only for hash
    path = "#/";
    window.history.pushState({}, path, window.location.href + path);
  }
}

/**
 * Sets active element on a div (or similar) containing a-tags (with data-navigo attributes ) used as a "menu"
 * Meant to be called in a before-hook with Navigo
 * @param topnav - Id for the element that contains the "navigation structure"
 * @param activeUrl - The URL which are the "active" one
 */
export function setActiveLink(topnav, activeUrl) {
  const links = document.getElementById(topnav).querySelectorAll("a");
  links.forEach((child) => {
    child.classList.remove("active");
    //remove leading '/' if any
    if (child.getAttribute("href").replace(/\//, "") === activeUrl) {
      child.classList.add("active");
    }
  });
}

/**
 * Small utility function to use in the first "then()" when fetching data from a REST API that supply error-responses as JSON
 *
 * Use like this--> const responseData = await fetch(URL,{..}).then(handleHttpErrors)
 */
export async function handleHttpErrors(res) {
  if (!res.ok) {
    const errorResponse = await res.json();
    const msg = errorResponse.message
      ? errorResponse.message
      : "No error details provided";
    throw new Error(msg);
  }
  return res.json();
}

/**
 * HINT --> USE DOMPurify.santitize(..) to sanitize a full string of tags to be inserted
 * via innerHTLM
 * Tablerows are required to be inside a table tag, so use this small utility function to
 * santitize a string with TableRows only (made from data with map)
 * DOMPurify is available here, because it's imported in index.html, and as so available in all
 * your JavaScript files
 */
export function sanitizeStringWithTableRows(tableRows) {
  let secureRows = DOMPurify.sanitize("<table>" + tableRows + "</table>")
  secureRows = secureRows.replace("<table>", "").replace("</table>", "")
  return secureRows
}

export function makeOptions(method, body, addToken) {
  const opts = {
    method: method,
    headers: {
      "Content-type": "application/json",s
      "Accept": "application/json"
    }
  }
  if (body) {
    opts.body = JSON.stringify(body);
  }
   if (addToken && localStorage.getItem("token")) {
    opts.headers.Authorization = "Bearer " + localStorage.getItem("token")
  }
  return opts;
}

