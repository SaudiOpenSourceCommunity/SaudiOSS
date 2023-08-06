const fs = require("fs");
const path = require("path");
const octokit = require("@octokit/core");

const client = new octokit.Octokit({ auth: process.env.GITHUB_TOKEN });

// Lets get the developers list
const developersData = require("../devs.json");

// Lets get the template
const template = fs.readFileSync(path.resolve(__dirname, "template.md")).toString();

// Lets prepare the readme content
let readmeContent = `<table dir="rtl"><tr><th>المبرمج</th><th>المشروع</th><th>الوصف</th></tr>`;

// Lets loop through the developers and add them to the readme content
developersData.forEach(developer => {
  readmeContent += `<tr><td rowspan="${developer.projects.length}"><a href="${developer.githubURL}"> ${developer.name} </a></td>`;
  developer.projects.forEach((project) => {
    readmeContent += `<td><a href=${project.URL}>${project.name}</a></td>`;
    readmeContent += `<td>${project.description.trim() == "" ? "&nbsp;" : project.description.trim()}</td>`;
    readmeContent += `</tr>`;
  });
});

// Lets close the table
readmeContent += `</table>`

// Lets append the content to the template
const newTemplate = template.replace("<!-- DEVELOPERS LIST -->", readmeContent);

const updateReadme = async (newTemplate) => {
  try {
    // Get the current readme to save the sha and encoding
    const res = await client.request("GET /repos/SaudiOpenSourceCommunity/SaudiOSS/contents/README.md");
    const { sha, encoding } = res.data;

    // Update the readme
    client.request("PUT /repos/SaudiOpenSourceCommunity/SaudiOSS/contents/README.md", {
      message: "Update readme.md",
      content: Buffer.from(newTemplate, "utf-8").toString(encoding),
      sha
    }
    );
  }
  catch (error) {
    console.error('updating readme', error);
  }
}

const getProjectsDescriptions = async (developers) => {
  await Promise.all(
    developers.map(async developer => {
      developer.projects = await Promise.all(
        developer.projects.map(async project => {
          if (project.details) return project;

          const request_url = project.URL.replace(/https?:\/\/github\.com\//, "https://api.github.com/repos/").trim();

          try {
            const response = await client.request(request_url);
            const data = await response.json();

            project.details = {
              id: data.id,
              language: data.language,
              license: data.license,
              topics: data.topics
            };

            console.log(`✅ Project ${project.name} by ${developer.name} has been extracted`);

            return project;
          }
          catch (error) {
            // In case of an error, return the project as is without details
            console.error('getting project details', error);
            return project;
          }
        })
      );
    })
  );
}

const updateDevs = async (developers) => {
  try {
    const res = await client.request("GET /repos/SaudiOpenSourceCommunity/SaudiOSS/contents/devs.json");
    const { sha, encoding } = res.data;

    client.request("PUT /repos/SaudiOpenSourceCommunity/SaudiOSS/contents/devs.json", {
      message: "Update devs.json",
      content: Buffer.from(JSON.stringify(developers, null, 4), "utf-8").toString(encoding),
      sha
    }
    );
  }
  catch (error) {
    console.error('updating devs.json', error);
  }
};

const main = async () => {
  // Update the readme
  await updateReadme(newTemplate);

  // adding projects details
  const updatedDevs = await getProjectsDescriptions(devs);

  // Update the devs.json file with the new projects details
  await updateDevs(updatedDevs);
}

main();