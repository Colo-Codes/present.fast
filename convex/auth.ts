type AuthContext = {
  auth: {
    getUserIdentity: () => Promise<{ subject: string; email?: string; name?: string } | null>;
  };
};

export type AuthenticatedIdentity = {
  clerkId: string;
  email?: string;
  fullName?: string;
};

export const requireAuth = async (ctx: AuthContext): Promise<AuthenticatedIdentity> => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error('Unauthorized');
  }

  return {
    clerkId: identity.subject,
    email: identity.email,
    fullName: identity.name,
  };
};
