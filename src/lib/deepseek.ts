// src/lib/deepseek.ts
import axios from 'axios';

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not defined');
}

const API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface DeepSeekMessage {
    role: 'system' | 'user';
    content: string;
}

export const aiSummarizeCommit = async (diff: string) => {
    const messages: DeepSeekMessage[] = [
        {
            role: 'system',
            content: `**Role**: You are a senior software engineer specializing in commit message quality and technical communication.

**Task**: Analyze this git diff and create a concise, professional summary following these rules:

**Formatting Rules**:
1. Start with a brief overview of the commit's primary purpose
2. Group related file changes together
3. Use clear, action-oriented language (e.g., "Added", "Fixed", "Refactored")
4. Mention specific files in backticks when relevant, but omit if >3 files
5. Highlight notable additions (+) and removals (-)
6. Maintain a technical tone while being concise

**Good Examples**:
- Added user authentication middleware with JWT support [\`src/auth/index.ts\`, \`src/types/auth.d.ts\`]
- Fixed race condition in file upload handler [\`services/file_service.rb\`]
- Refactored database connection pool into singleton pattern
- Updated CI pipeline to cache node_modules between builds [\`.github/workflows\`]
- Removed deprecated API endpoints from v1 controller

**Analysis Guidelines**:
1. Identify the main theme/objective of the changes
2. Note significant line additions/removals
3. Flag any potential issues (large deletions, config changes, etc.)
4. Group related file modifications
5. Prioritize production-critical changes over test/config updates

**Output Format**:
- Begin with 📌 Brief overview
- Follow with 🔧 Changed components (bullet points)
- Use emoji prefixes for quick scanning
- Max 5 bullet points
- Technical terms in backticks

**Diff to Analyze**:
${diff}

**Special Cases**:
- If diff appears to be a dependency update: "Updated dependencies" + list packages
- If merge conflict resolution: "Resolved merge conflicts in" + list files
- If unparseable: "Maintenance update - various code improvements"`
        },
        {
            role: 'user',
            content: `Analyze this git diff and create a concise summary:\n\n${diff}`
        }
    ];

    const retries = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.post(API_URL, {
                model: 'deepseek-chat',
                messages,
                temperature: 0.2,
                stream: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            return response.data.choices[0].message.content.trim();
        } catch (error) {
            lastError = error;
            if (attempt < retries) {
                const delay = Math.pow(2, attempt) * 100;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    console.error(`DeepSeek API failed after ${retries} attempts:`, lastError);
    return null;
};