'use client'
import { Dialog } from '@radix-ui/react-dialog'
import Image from 'next/image'
import React from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Textarea } from '~/components/ui/textarea'
import useProject from '~/hooks/use-project'
import { askQuestion } from './action'
import { readStreamableValue } from 'ai/rsc'
import { set } from 'date-fns'

const AskQuestionCard = () => {
    const {project} = useProject()
    const [question, setQuestion] = React.useState('')
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [filesReferences, setFilesReferences] = React.useState<{filename: string, sourceCode: string, summary: string}[]>([])
    const [answer, setAnswer] = React.useState('')

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!project?.id) return
        setLoading(true)
        setOpen(true)

        const { output, filesReferences } = await askQuestion(question, project.id)
        setFilesReferences(filesReferences)
        console.log("Received Output:", output);

        for await (const delta of readStreamableValue(output)){
            if(delta){
                setAnswer(ans => ans + delta)
            }
        }
        setLoading(false)
    }

  return (
    <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent >
                <DialogHeader>
                    <DialogTitle>
                        <Image src='/logo.png' alt='logo' width={80} height={80} />
                    </DialogTitle>
                </DialogHeader>
                <DialogHeader>
                    <DialogTitle>
                    </DialogTitle>
                    {answer}
                    <h1>Files Reference</h1>
                    {filesReferences.map(file =>{
                        return (
                            <span>{file.filename}</span>
                        )
                    })}
                </DialogHeader>
            </DialogContent>
        </Dialog>
        <Card className='relative col-span-3'>
            <CardHeader>
                <CardTitle>
                    Ask a Question
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea placeholder='Ask a question about the project' value={question} onChange={e => setQuestion(e.target.value)}></Textarea>
                    <div className='h-4'>
                        <Button  type='submit' onClick={onSubmit}>
                            Ask Gitsum
                        </Button>
                    </div>
            </CardContent>
        </Card>
    </>
  )
}

export default AskQuestionCard