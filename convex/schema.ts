import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const schema = defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    defaultWorkspaceId: v.optional(v.id('workspaces')),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_clerk_id', ['clerkId']),
  workspaces: defineTable({
    name: v.string(),
    slug: v.string(),
    createdByUserId: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_creator', ['createdByUserId']),
  workspaceMembers: defineTable({
    workspaceId: v.id('workspaces'),
    userId: v.id('users'),
    role: v.union(v.literal('owner'), v.literal('member')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_workspace', ['workspaceId'])
    .index('by_user', ['userId'])
    .index('by_workspace_user', ['workspaceId', 'userId']),
  presentations: defineTable({
    workspaceId: v.id('workspaces'),
    createdByUserId: v.id('users'),
    title: v.string(),
    markdownContent: v.string(),
    isPublicShareEnabled: v.boolean(),
    shareToken: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_workspace', ['workspaceId'])
    .index('by_workspace_updated_at', ['workspaceId', 'updatedAt'])
    .index('by_share_token', ['shareToken']),
});

export default schema;
