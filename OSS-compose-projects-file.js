const fs = require("fs");
const path = require("path");
const octokit = require("@octokit/core");

const sleep = ms => new Promise(r => setTimeout(r, ms));
const client = new octokit.Octokit({ auth: process.env.GITHUB_TOKEN });
const devs = require("./devs.json");
const projects = require("./projects.json");

(async () => {
  const devs_projects = devs.reduce((projects, dev) => {
    dev.projects.forEach(project => {
      (project.dev_name_ar = dev.name),
        (project.dev_github_url = dev.githubURL),
        projects.push(project);
    });
    return projects;
  }, []);

  for (var project of devs_projects) {
    // check if previously extracted
    const prevProject = projects.find(
      prevProject =>
        prevProject.dev_name_ar == project.dev_name_ar &&
        prevProject.name.toLowerCase() == project.name.toLowerCase()
    );
    if (prevProject) {
      console.log(
        `🔴 Project ${project.name} by ${project.dev_name_ar} already extracted, skipped`
      );
      continue;
    }

    console.log(
      `⚠️ Project ${project.name} by ${project.dev_name_ar} is getting extracted`
    );

    const request_url = project.URL.replace(
      /https?:\/\/github\.com\//,
      "https://api.github.com/repos/"
    ).trim();
    const response = await fetch(request_url);
    const data = await response.json();

    projects.push({
      dev_name_ar: project.dev_name_ar,
      dev_github_url: project.dev_github_url,
      id: data.json,
      name: project.name,
      description: project.description,
      language: data.language,
      license: data.license,
      topics: data.topics,
      URL: project.URL
    });

    console.log(
      `✅ Project ${project.name} by ${project.dev_name_ar} has been extracted`
    );

    // Github api is rate limited for unauthenticated users for 60 requests/hour
    // So sleep after each request for a minute
    await sleep(1000 * 60);
  }

  try {
    const res = await client.request(
      "GET /repos/SaudiOpenSourceCommunity/SaudiOSS/contents/projects.json"
    );

    const { sha, encoding } = res.data;

    client.request(
      "PUT /repos/SaudiOpenSourceCommunity/SaudiOSS/contents/projects.json",
      {
        message: "Update projects.json",
        content: Buffer.from(
          JSON.stringify(projects, null, 4),
          "utf-8"
        ).toString(encoding),
        sha
      }
    );
  } catch (e) {
    console.log(e);
  }
})();
