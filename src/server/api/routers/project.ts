import { get } from "http";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { pollCommits } from "~/lib/github";

export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure.input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubTokan: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          githubUrl: input.githubUrl,
          userToProjects: {
            create: {
              userId: ctx.user.userId ?? '',
            }
          }
        },
      })
      await pollCommits(project.id)
      return project
    }),
    getProjects: protectedProcedure.query(async ({ ctx }) => {
      return await ctx.db.project.findMany({
        where: {
          userToProjects: {
            some: {
              userId: ctx.user.userId ?? '',
            }
          },
          deletedAt: null,
        }
      })
    }),
    getCommits: protectedProcedure.input(z.object({
      projectId: z.string(),
    })).query(async ({ ctx, input }) => {
      return await ctx.db.commit.findMany({where: {projectId: input.projectId}})
    })
});