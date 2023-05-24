const fs = require("fs");
const path = require("path");
const octokit = require("@octokit/core");

const sleep = ms => new Promise(r => setTimeout(r, ms));
const client = new octokit.Octokit({ auth: process.env.GITHUB_TOKEN });
const devs = require("./devs.json");
const projects = require("./projects.json");

(async () => {
  for (var dev of devs) {
    for (var project of dev.projects) {
      if (project.details) {
        console.log(
          `🔴 Project ${project.name} by ${dev.name} already extracted, skipped`
        );
        continue;
      }

      console.log(
        `⚠️ Project ${project.name} by ${dev.name} is getting extracted`
      );

      const request_url = project.URL.replace(
        /https?:\/\/github\.com\//,
        "https://api.github.com/repos/"
      ).trim();
      const response = await fetch(request_url);
      const data = await response.json();

      project.details = {
        id: data.id,
        language: data.language,
        license: data.license,
        topics: data.topics
      };

      console.log(
        `✅ Project ${project.name} by ${dev.name} has been extracted`
      );

      // Github api is rate limited for unauthenticated users for 60 requests/hour
      // So sleep after each request for a minute
      await sleep(1000 * 60);
    }
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
