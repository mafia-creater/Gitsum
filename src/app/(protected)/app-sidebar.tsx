'use client'

import { url } from "inspector"
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "~/components/ui/sidebar"
import useProject from "~/hooks/use-project"
import { cn } from "~/lib/utils"
const items = [{
    title: 'Dashboard',
    url: '/dashboard',
    icons: LayoutDashboard,
},
{
    title: 'Q&A',
    url: '/qa',
    icons: Bot,
},
{
    title: 'Meetings',
    url: '/meetings',
    icons: Presentation,
},
{
    title: 'Billing',
    url: '/billing',
    icons: CreditCard,
}
]



export function AppSidebar(){
    
    const pathname = usePathname()
    const { open } = useSidebar()
    const { projects, projectId, setProjectId } = useProject()
    return(
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                {/* <div className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="Logo" width={32} height={32} />
                    {open && (
                            <h1 className="text-xl font-bold text-primary/80">
                                GitSum
                            </h1>
                    )}
                </div> */}
                Logo
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map(item => {
                                return(
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url} className={cn(
                                                pathname === item.url ? 'bg-primary text-white' : '',
                                                'list-none'
                                            )}> 
                                            <item.icons />
                                            <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>
                        Your projects
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                {projects?.map(project => {
                                    return(
                                        <SidebarMenuItem key={project.name}>
                                            <SidebarMenuButton asChild>
                                                <div onClick={() => setProjectId(project.id)}>
                                                    <div className={cn(
                                                        'rounded-sm border size-6 flex items-center jusitfy-center text-sm bg-white text-primary',
                                                        {
                                                            'bg-primary text-white': project.id === project.id
                                                        }
                                                    )}>
                                                        {project.name[0]}
                                                    </div>
                                                    <span>{project.name}</span>
                                                </div>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenuItem>
                            <div className="h-2"></div>
                            {open && (
                                <SidebarMenuItem>
                                    <Link href="/create">
                                        <Button size='sm' variant={'outline'} className='w-fit'>
                                            <Plus/>
                                            Create new project
                                        </Button>
                                    </Link>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}