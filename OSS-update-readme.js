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
        (dev) => `<tr>
    <td rowspan="${dev.projects.length}">
        <a href="${dev.githubURL}"> ${dev.name} </a>
    </td>
    ${dev.projects
      .map(
        (project) => `<td>
           <a href=${project.URL}>${project.name}</a>
        </td>
        <td>
            ${project.description}
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
        sha,
      }
    );
  } catch (e) {
    console.log(e);
  }
})();
