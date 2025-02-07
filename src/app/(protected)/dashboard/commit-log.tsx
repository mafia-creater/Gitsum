'use client'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import useProject from '~/hooks/use-project'
import { cn } from '~/lib/utils'
import { api } from '~/trpc/react'

// Add loading states and empty states
const CommitLog = () => {
  const { projectId, project } = useProject()
  const { data: commits, isLoading } = api.project.getCommits.useQuery({ projectId })

  if (isLoading) return <div>Loading commits...</div>
  if (!commits?.length) return <div>No commits found for this project</div>

  return (
    <ul className='space-y-6'>
      {commits.map((commit, commitIdx) => (
        <li key={commit.id} className='relative flex gap-x-4'>
          {/* Timeline connector */}
          <div className={cn(
            commitIdx === commits.length - 1 ? 'h-0' : 'h-full',
            'absolute left-0 top-0 flex w-6 justify-center'
          )}>
            <div className='w-px bg-gray-200' />
          </div>

          <div className="relative flex gap-x-4">
            <img 
              src={commit.commitAuthorAvatar || '/default-avatar.png'} 
              alt="author avatar" 
              className='mt-4 h-8 w-8 flex-none rounded-full bg-gray-50'
            />
            <div className="flex-auto rounded-lg bg-white p-4 ring-1 ring-inset ring-gray-200">
              <div className='flex justify-between gap-x-4'>
                <Link
                  target='_blank'
                  href={`${project?.githubUrl}/commit/${commit.commitHash}`}
                  className='flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-blue-600'
                >
                  {commit.commitAuthorName}
                  <ExternalLink className='h-4 w-4' />
                </Link>
                <span className='text-sm text-gray-500'>
                  {new Date(commit.commitDate).toLocaleDateString()}
                </span>
              </div>
              
              <p className='mt-2 text-sm font-semibold text-gray-800'>
                {commit.commitMessage}
              </p>
              
              {/* Summary section with fallback */}
              {commit.summary ? (
                <pre className='mt-2 whitespace-pre-wrap text-sm text-gray-600'>
                  {commit.summary}
                </pre>
              ) : (
                <p className='mt-2 text-sm italic text-gray-400'>
                  {commit.summary === 'Failed to generate summary' 
                    ? 'Failed to generate summary'
                    : 'Generating summary...'}
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
export default CommitLog