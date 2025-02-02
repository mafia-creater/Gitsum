import { get } from 'http';
import { Octokit } from 'octokit';
import { any } from 'zod';
import axios from 'axios';
import { db } from '~/server/db';
import { aiSummarizeCommit } from './gemini';

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
})

const githubUrl = 'https://github.com/mafia-creater/UberClone';

type Response ={
    commitHash: string,
    commitMessage: string,
    commitAuthorName: string,
    commitAuthorAvatar: string,
    commitDate: string,
}


export const getCommitHashes = async (githubUrl: string): Promise<Response[]> =>{
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const {data} = await octokit.rest.repos.listCommits({
        owner,
        repo,
    });
    const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime());

    return sortedCommits.slice(0,10).map((commit: any) => ({
        commitHash: commit.sha,
        commitMessage: commit.commit.message ?? '',
        commitAuthorName: commit.commit?.author?.name ?? '',
        commitAuthorAvatar: commit?.author?.avatar_url ?? '',
        commitDate: commit.commit?.author?.date ?? '',
    }))
}

export const pollCommits = async (projectId: string) => {
    const {project, githubUrl} = await fetchProjectGithubUrl(projectId);
    const commitHashers = await getCommitHashes(githubUrl);
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashers);
    const summaryResponses = await Promise.all(unprocessedCommits.map((commit) => summarizeCommit(githubUrl, commit.commitHash)));
    const summaries = summaryResponses.map((response: any) => {
        if (response.status === 'fulfilled') {
            return response.value as string;
        }
        return null;
    });

    const commits = await db.commit.createMany({
        data: summaries.map((summary, index) => {
            const commit = unprocessedCommits[index];
            if (!commit) {
                throw new Error('Commit is undefined');
            }
            console.log(`processing commit ${index}`)
            return {
                projectId: projectId,
                commitHash: commit.commitHash,
                commitMessage: commit.commitMessage,
                commitAuthorName: commit.commitAuthorName,
                commitAuthorAvatar: commit.commitAuthorAvatar,
                commitDate: commit.commitDate,
                summary: summary ?? ''
            }
        })
    })
    
    return commits
}

async function summarizeCommit (githubUrl: string, commitHash: string){
    //get the diff, then pass the diff to ai
    const {data} = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
        headers: {
            Accept: 'application/vnd.github.v3.diff',
        }
    });
    return await aiSummarizeCommit(data);
}

async function fetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: { id: projectId },
        select: { githubUrl: true },
    });

    if (!project?.githubUrl) {
        throw new Error('Project not found');
    }

    return {project, githubUrl: project.githubUrl};
}


async function filterUnprocessedCommits(projectId: string, commitHashers: Response[]) {
    const processedCommits = await db.commit.findMany({
        where: { projectId }
    });
    const unprocessedCommits = commitHashers.filter((commit) => !processedCommits.some((processedCommit) => processedCommit.commitHash === commit.commitHash));
    return unprocessedCommits;
}

