import shuffle from "shuffle-array";

const devsGithubURL =
  "https://raw.githubusercontent.com/SaudiOpenSourceCommunity/SaudiOSS/master/devs.json";

export async function fetchDevs() {
  return await fetch(devsGithubURL).then(async payload => await payload.json());
}
