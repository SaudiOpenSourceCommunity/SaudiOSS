const fs = require("fs");
const path = require("path");
const octokit = require("@octokit/core");

const client = new octokit.Octokit({auth: process.env.GITHUB_TOKEN});
const devs = require("./devs.json");
const template = fs.readFileSync(path.resolve(__dirname, "template.md")).toString();

let readmeContent = `<table dir="rtl">
    <tr>
        <th>المبرمج</th>
        <th>المشروع</th>
        <th>الوصف</th>
    </tr>
    `;

devs.forEach(dev => {
    readmeContent += `<tr>
    <td rowspan="${dev.projects.length}">
        ${dev.githubURL? '<a href="' + dev.githubURL + '">' + dev.name + '</a>' : dev.name}
    </td>
    <td>
        <a href="${dev.projects[0].URL}">${dev.projects[0].name}</a>
    </td>
    <td>${dev.projects[0].description != "" ? dev.projects[0].description : "&nbsp;" }</td>
</tr>
`;
    if (dev.projects.length > 1){
        for(var x = 1; x < dev.projects.length; x++){
            readmeContent += `<tr>
            <td>
                <a href="${dev.projects[x].URL}">${dev.projects[x].name}</a>
            </td>
            <td>${dev.projects[x].description}</td>
        </tr>
        `;
        }
    }
})

readmeContent += `</table>`;

readmeContent = template.replace('<!-- DEVELOPERS LIST -->', readmeContent)
// fs.writeFileSync(path.resolve(__dirname, "README.md"), readmeContent);

(async () => {
    try{
        const res = await client.request("GET /repos/SaudiOpenSourceCommunity/SaudiOSS/contents/README.md");
        const { sha, encoding } = res.data;
        client.request("PUT /repos/SaudiOpenSourceCommunity/SaudiOSS/contents/README.md", {
            message: "Update readme.md",
            content: Buffer.from(readmeContent, "utf-8").toString(encoding),
            sha
        });
    } catch(e){
        console.log(e);
    }
})()