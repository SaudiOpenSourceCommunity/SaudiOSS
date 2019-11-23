import shuffle from "shuffle-array";

const githubURL =
  "https://raw.githubusercontent.com/SaudiOpenSourceCommunity/SaudiOSS/master/README.md";

function parseHTML(html) {
  var t = document.createElement("template");
  t.innerHTML = html;
  return t.content.cloneNode(true);
}

//This looks ugly 🙁 but could not figure out better way to do it.
function tableToJSON(table) {
  const developers = [];
  const TableNode = Array.from(
    parseHTML(table).querySelector("tbody").children
  ).splice(1);
  for (let i = 0; i < TableNode.length; i++) {
    let row = TableNode[i].cells;
    const developer = {};
    developer.NumberOfProjects = row[0].attributes[0].value;
    developer.name = row[0].innerText.trim();
    developer.githubURL = row[0].children[0]
      ? row[0].children[0].href.trim()
      : undefined;
    developer.projects = [];
    developer.projects.push({
      name: row[1].innerText.trim(),
      URL: row[1].children[0].href.trim(),
      description: row[2].innerText.trim()
    });
    for (let j = 1; j < developer.NumberOfProjects; j++) {
      row = TableNode[++i].cells;
      developer.projects.push({
        name: row[0].innerText.trim(),
        URL: row[0].children[0].href.trim(),
        description: row[1].innerText.trim()
      });
    }
    developers.push(developer);
  }
  return shuffle(developers);
}

export default async function fetchProjects() {
  let openSourceProjects = [];
  openSourceProjects = await fetch(githubURL).then(payload => payload.text());
  return tableToJSON(openSourceProjects);
}
