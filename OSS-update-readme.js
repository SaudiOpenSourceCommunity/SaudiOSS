const fs = require("fs");
const path = require("path");
const octokit = require("@octokit/core");

const client = new octokit.Octokit({ auth: process.env.GITHUB_TOKEN });
const devs = require("./devs.json");
const template = fs
  .readFileSync(path.resolve(__dirname, "template.md"))
  .toString();

const readmeContent = `<table dir="rtl">
    <tr>
        <th>المبرمج</th>
        <th>المشروع</th>
        <th>الوصف</th>
    </tr>
    ${devs
      .map(
        dev => `<tr>
    <td rowspan="${dev.projects.length}">
        <a href="${dev.githubURL}"> ${dev.name} </a>
    </td>
    ${dev.projects
      .map(
        project => `<td>
           <a href=${project.URL}>${project.name}</a>
        </td>
        <td>
            ${
              project.description.trim() == ""
                ? "&nbsp;"
                : project.description.trim()
            }
        </td>
    </tr>`
      )
      .join("")}
    `
      )
      .join("")}
</table>`;

const newTemplate = template.replace("<!-- DEVELOPERS LIST -->", readmeContent);

(async () => {
  try {
    const res = await client.request(
      "GET /repos/SaudiOpenSourceCommunity/SaudiOSS/contents/README.md"
    );
    const { sha, encoding } = res.data;
    client.request(
      "PUT /repos/SaudiOpenSourceCommunity/SaudiOSS/contents/README.md",
      {
        message: "Update readme.md",
        content: Buffer.from(newTemplate, "utf-8").toString(encoding),
        sha
      }
    );
  } catch (e) {
    console.log(e);
  }
  // adding projects details
  await Promise.all(
    devs.map(async dev => {
      dev.projects = await Promise.all(
        dev.projects.map(async project => {
          if (project.details) return project;

          const request_url = project.URL.replace(
            /https?:\/\/github\.com\//,
            "https://api.github.com/repos/"
          ).trim();
          try {
            const response = await client.request(request_url);
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

            return project;
          } catch (e) {
            // In case of an error, return the project as is without details
            console.error(e);
            return project;
          }
        })
      );
    })
  );

  try {
    const res = await client.request(
      "GET /repos/SaudiOpenSourceCommunity/SaudiOSS/contents/devs.json"
    );

    const { sha, encoding } = res.data;

    client.request(
      "PUT /repos/SaudiOpenSourceCommunity/SaudiOSS/contents/devs.json",
      {
        message: "Update devs.json",
        content: Buffer.from(JSON.stringify(devs, null, 4), "utf-8").toString(
          encoding
        ),
        sha
      }
    );
  } catch (e) {
    console.log(e);
  }
})();
