export const routes = {
  home: '/',
  dashboard: '/dashboard',
  presentationById: (presentationId: string) => `/presentation/${presentationId}`,
  presentationDisplayById: (presentationId: string) => `/presentation/${presentationId}?mode=display`,
  signIn: '/sign-in',
  signUp: '/sign-up',
} as const;
