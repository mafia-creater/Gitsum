'use client'
import { useUser } from '@clerk/nextjs'
import { ExternalLink, Github, Underline } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import useProject from '~/hooks/use-project'
import CommitLog from './commit-log'
import AskQuestionCard from './ask-question-card'

const DashboardPage = () => {
    const { project } = useProject()
  return (
    <div>
      
      <div className='flex items-center justify-between flex-wrap gap-y-4'>

        {/*  github link  */}
        <div className='w-fit rounded-md bg-primary px-4 py-3 '>
          <div className="flex item-center">

            <Github className='size-5 text-white' />
            <div className='ml-2'>
              <p className='text-sm font-medium text-white'>
                This project is linked to {' '}
                <Link href={project?.githubUrl ?? ""} className="inline-flex items-center text-white/80 hover:underline" >
                  {project?.githubUrl}
                  <ExternalLink className='ml-1 size-4' />
                </Link>
              </p>
          </div>
          </div>
        </div>

        <div className="h4"></div>

        <div className="flex item-center gap-4">
          Team Members
          invite Button
          Archive Button
        </div>
      </div>

      <div className="m4-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <AskQuestionCard />
          Meeting card
        </div>
      </div>

      <div className="mt-8">
        <CommitLog />
      </div>

    </div>
  )
}

export default DashboardPage