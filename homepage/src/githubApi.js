import shuffle from "shuffle-array";

const devsGithubURL =
  "https://raw.githubusercontent.com/SaudiOpenSourceCommunity/SaudiOSS/master/devs.json";
const projectsGithubURL =
  "https://raw.githubusercontent.com/SaudiOpenSourceCommunity/SaudiOSS/master/projects.json";

export async function fetchDevs() {
  return shuffle(
    await fetch(devsGithubURL).then(async payload => await payload.json())
  );
}

export async function fetchProjects() {
  return shuffle(
    await fetch(projectsGithubURL).then(async payload => await payload.json())
  );
}
