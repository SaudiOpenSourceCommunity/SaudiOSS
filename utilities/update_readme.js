const fs = require("fs");
const path = require("path");
const octokit = require("@octokit/core");

// Constants
const GITHUB_REPO_PATH  = "/repos/SaudiOpenSourceCommunity/SaudiOSS/contents/";
const client = new octokit.Octokit({ auth: process.env.GITHUB_TOKEN });
const developersData = require("../devs.json");
const template = fs.readFileSync(path.resolve(__dirname, "template.md")).toString();

/**
 * Generates a table for developers and projects.
 * @param {Array} developers - List of developers and their projects.
 * @returns {string} - The generated table in string format.
 */
const generateReadmeTable = (developers) => {
    let content = `<table dir="rtl"><tr><th>المبرمج</th><th>المشروع</th><th>الوصف</th></tr>`;
    developers.forEach(developer => {
        content += `<tr><td rowspan="${developer.projects.length}"><a href="${developer.githubURL}"> ${developer.name} </a></td>`;
        developer.projects.forEach(project => {
            content += `<td><a href=${project.URL}>${project.name}</a></td>`;
            content += `<td>${project.description.trim() === "" ? "&nbsp;" : project.description.trim()}</td></tr>`;
        });
    });
    return content + `</table>`;
}

/**
 * Generic function to handle GitHub API requests.
 * @param {string} method - The HTTP method (GET, PUT, etc.).
 * @param {string} endpoint - The API endpoint.
 * @param {Object} data - The data to send in the request.
 * @returns {Promise} - The result of the API request.
 */
const githubAPIRequest = async (method, endpoint, data = {}) => {
  try {
      const response = await client.request(method, GITHUB_REPO_PATH + endpoint, data);
      return response.data;
  } catch (error) {
      console.error(`Error during ${method} request to ${endpoint}:`, error);
      throw error;
  }
}

/**
 * Updates the README.md file with the provided content.
 * @param {string} content - The content to update in the README.md.
 */
const updateReadme = async (content) => {
  try {
    console.log("Updating README.md...");
    const readmeEndpoint = "README.md";
    const currentReadme = await githubAPIRequest("GET", readmeEndpoint);
    await githubAPIRequest("PUT", readmeEndpoint, {
      message: "Update readme.md",
      content: Buffer.from(content, "utf-8").toString(currentReadme.encoding),
      sha: currentReadme.sha
  });
  console.log("README.md updated successfully.");
  }
  catch (error) {
    console.error('updating readme', error);
  }
}

/**
 * Fetches project details from GitHub and adds them to the developer's projects.
 * @param {Array} developers - List of developers and their projects.
 * @returns {Array} - The updated list of developers with project details.
 */
const getProjectsDescriptions = async (developers) => {
  console.log("Fetching project details...");
  return await Promise.all(
      developers.map(async developer => {
          developer.projects = await Promise.all(
              developer.projects.map(async project => {
                  if (project.details) return project;
                  const request_url = project.URL.replace(/https?:\/\/github\.com\//, "https://api.github.com/repos/").trim();
                  try {
                      const data = await githubAPIRequest("GET", request_url);
                      project.details = {
                          id: data.id,
                          language: data.language,
                          license: data.license,
                          topics: data.topics
                      };
                      console.log(`✅ Project ${project.name} by ${developer.name} has been extracted`);
                      return project;
                  } catch (error) {
                      console.error(`Error fetching details for project ${project.name} by ${developer.name}:`, error);
                      return project; // Return the project as is without details in case of an error
                  }
              })
          );
          return developer;
      })
  );
}

/**
 * Updates the devs.json file with the provided list of developers.
 * @param {Array} developers - The updated list of developers.
 */
const updateDevs = async (developers) => {
  try {
    console.log("Updating devs.json...");

    const devsEndpoint = "devs.json";
    const currentDevs = await githubAPIRequest("GET", devsEndpoint);
    await githubAPIRequest("PUT", devsEndpoint, {
      message: "Update devs.json",
      content: Buffer.from(JSON.stringify(developers, null, 4), "utf-8").toString(currentDevs.encoding),
      sha: currentDevs.sha
    });
    console.log("devs.json updated successfully.");


  }
  catch (error) {
    console.error('updating devs.json', error);
  }
};

const main = async () => {
  console.log("Starting script...");

  const readmeContent = generateReadmeTable(developersData);
  const newTemplate = template.replace("<!-- DEVELOPERS LIST -->", readmeContent);

  // Update the readme
  await updateReadme(newTemplate);

  // adding projects details
  const updatedDevs = await getProjectsDescriptions(devs);

  // Update the devs.json file with the new projects details
  await updateDevs(updatedDevs);

  console.log("Script completed.");
}

main();