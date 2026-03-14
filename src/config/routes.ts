export const routes = {
  home: '/',
  dashboard: '/dashboard',
  presentationById: (presentationId: string) => `/presentation/${presentationId}`,
  signIn: '/sign-in',
  signUp: '/sign-up',
} as const;
