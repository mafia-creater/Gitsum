import { GoogleGenerativeAI } from '@google/generative-ai';
import { Document } from '@langchain/core/documents';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not defined');
}
const genAI = new GoogleGenerativeAI(apiKey);

// Initialize the primary generative model for summarization
const summarizationModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

/**
 * Summarize the content of a code document.
 * @param doc A LangChain Document
 * @returns A summary of the code (max ~100 words)
 */
export async function summariseCode(doc: Document) {
  console.log('Summarizing code:', doc.metadata?.source); 
  try {
    const code = doc.pageContent.slice(0, 1000);
    const prompt = `
      You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects.
      You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata?.source} file.
      Here is the code:
      ---
      ${code}
      ---
      Give a summary of the code in no more than 100 words.
    `;
  
    const response = await summarizationModel.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    return '';
  }
}

/**
 * Generate an embedding for the given summary.
 * @param summary The text summary to embed
 * @returns A numeric vector embedding
 */
export async function generateEmbeddingForSummary(summary: string) {
  const embeddingModel = genAI.getGenerativeModel({
    model: 'embedding-001',
  });
  const result = await embeddingModel.embedContent(summary);
  return result.embedding.values;
}

/**
 * (Optional) Summarize a git diff using the generative model.
 * @param diff The git diff string.
 * @returns A text summary of the diff.
 */
export const aiSummarizeCommit = async (diff: string) => {
  const prompt = `
    You are an expert programmer, and you are trying to summarize a git diff.
    Reminders about the git diff format:
    - For every file, there are a few metadata lines, like (for example):
      
      diff --git a/lib/index.js b/lib/index.js
      index aadf691..bfef603 100644
      --- a/lib/index.js
      +++ b/lib/index.js
      
      This means that \`lib/index.js\` was modified in this commit.
      
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
    const response = await summarizationModel.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error('Error generating commit summary:', error);
    return null;
  }
};
