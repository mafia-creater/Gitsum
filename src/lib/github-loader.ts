import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import { summariseCode, generateEmbeddingForSummary } from './gemini'
import { db } from '~/server/db'
import { Document } from '@langchain/core/documents'

/**
 * Load documents from a GitHub repository.
 */
export const loadGithubRepo = async (githubUrl: string, githubToken?: string): Promise<Document[]> => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || '',
    branch: 'main',
    ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
    recursive: true,
    unknown: 'warn',
    maxConcurrency: 5,
  })
  return await loader.load()
}

/**
 * For each document, generate a summary and embedding.
 */
export const generateEmbeddingsForDocs = async (docs: Document[]) => {
  return await Promise.all(docs.map(async (doc) => {
    // Generate a summary from the document
    const summary = await summariseCode(doc) // Pass a single document
    // Generate an embedding from the summary
    const embedding = await generateEmbeddingForSummary(summary)

    return {
      summary,
      embedding,
      sourceCode: JSON.stringify(doc), // Ensuring serializability
      fileName: doc.metadata?.source || 'unknown',
    }
  }))
}

/**
 * Load a GitHub repository, generate embeddings for its documents,
 * and store the embeddings in the database.
 */
export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
  const docs = await loadGithubRepo(githubUrl, githubToken)
  const allEmbeddings = await generateEmbeddingsForDocs(docs)

  await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
    console.log(`Processing ${index + 1} of ${allEmbeddings.length}`)

    if (!embedding) return

    try {
      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          filename: embedding.fileName,
          projectId,
        }
      })

      await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbedding.id}
      `
    } catch (error) {
      console.error('Error saving embedding to DB:', error)
    }
  }))
}
