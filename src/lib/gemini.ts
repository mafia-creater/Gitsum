import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
}
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
});

export const aiSummarizeCommit = async (diff: string) => {
    const prompt = `
        You are an expert programmer, and you are trying to summarize a git diff.
        Reminders about the git diff format:
        - For every file, there are a few metadata lines, like (for example):
        
          diff --git a/lib/index.js b/lib/index.js
          index aadf691..bfef603 100644
          --- a/lib/index.js
          +++ b/lib/index.js
          
          This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.

        - Then there is a specifier of the lines that were modified.
        - A line starting with \`+\` means it was added.
        - Raised the amount of returned recordings from \`10\` to \`100\` [\`packages/server/recordings_api.ts\`, \`packages/server/constants.ts\`]
        - Fixed a typo in the GitHub Action name [\`.github/workflows/gpt-commit-summarizer.yml\`]
        - Moved the Octokit initialization to a separate file [\`src/octokit.ts\`, \`src/index.ts\`]
        - Added an OpenAI API for completions [\`packages/utils/apis/openai.ts\`]
        - Lowered numeric tolerance for test files

        Most commits will have fewer comments than this example list.
        The last comment does not include file names because there were more than two relevant files in the hypothetical commit.

        **Now, please summarize the following diff file:**\n\n${diff}
    `;

    try {
        const response = await model.generateContent(prompt);
        return response.response.text(); // Extract text from the response
    } catch (error) {
        console.error('Error generating commit summary:', error);
        return null;
    }
};


