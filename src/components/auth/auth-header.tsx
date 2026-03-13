'use client';

import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';

export const AuthHeader = () => {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-end gap-2 px-6 md:px-10">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button type="button" variant="outline">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button type="button">Sign up</Button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
};
