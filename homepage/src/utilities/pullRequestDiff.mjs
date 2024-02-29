import { Octokit } from "@octokit/rest";
import * as env from 'dotenv';
import devs from "../../../devs.json" assert { type: 'json' };

env.config();

const getPRContents = async () => {
    const octokit = new Octokit({ auth: process.env.MY_GITHUB_TOKEN });
    const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
    const pull_number = parseInt(process.env.PULL_REQUEST_NUMBER, 10);

    if (!owner || !repo || isNaN(pull_number)) {
        console.error('Missing or invalid environment variables!');
        process.exit(1);
    }
    try {
        //get the diff of the pull request
        const pullrequest = await octokit.pulls.get({
            owner,
            repo,
            pull_number,
        });

        const { data: files } = await octokit.pulls.listFiles({
            owner,
            repo,
            pull_number,
        });
        //check if devs.json is modified with addtion
        const devsFile = files.find(file => file.filename === 'devs.json');

        const newProjects = devsFile?.patch.split('\n')
            // remove all spaces
            .map(line => line.replace(/\s/g, ''))
            .reduce((acc, line) => {
                if (line.startsWith('+')) {
                    acc.push({
                        type: "addition",
                        contents: line.slice(1)
                    });
                }
                if (line.startsWith('-')) {
                    acc.push({
                        type: "deletion",
                        contents: line.slice(1)
                    });
                }
                return acc;
            }, [])
            .filter((line, index, arr) =>
                line.type === "addition" &&
                !arr.find(l => l.type === "deletion" && l.contents === line.contents))
            .map(line => line.contents)
            .map(line => line.split('":"'))
            // remove all quotes and commas
            .map(line => line.map(item => item.replace(/"|,|{|}/g, '')))
            // for now we care about the URL only
            .filter(line => line[0] === 'URL')
            .map(line => line[1]);

        const newDevs = devs.filter(dev => dev.projects.some(project => newProjects?.includes(project.URL)));
        return {
            dev: newDevs,
            pullRequest: pullrequest.data.url,
            numberOFProjects: newProjects?.length || 0,
        }

    }
    catch (error) {
        console.error('Error getting pull request files: ', error);
    }
}



export default getPRContents;