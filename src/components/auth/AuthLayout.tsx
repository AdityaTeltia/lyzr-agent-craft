import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'
import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-full max-w-md p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src="/lyzr-ai-icon-filled-256.png" 
                  alt="Lyzr AI" 
                  className="w-10 h-10 rounded-lg"
                />
                <span className="ml-3 text-2xl font-bold text-foreground">Lyzr Chatbase</span>
              </div>
              <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your account to continue</p>
            </div>
            
            <div className="space-y-4">
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="w-full bg-foreground text-background py-3 px-4 rounded-lg font-medium hover:bg-foreground/90 transition-smooth">
                  Sign In
                </button>
              </SignInButton>
              
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
                  <button className="text-primary hover:underline font-medium">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
              
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-border"></div>
                <span className="px-4 text-sm text-muted-foreground">OR CONTINUE WITH</span>
                <div className="flex-1 border-t border-border"></div>
              </div>
              
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="w-full bg-card border border-border text-foreground py-3 px-4 rounded-lg font-medium hover:bg-accent transition-smooth flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
              </SignInButton>
            </div>
            
            <p className="text-xs text-center text-muted-foreground mt-8">
              By continuing, you agree to our{' '}
              <a href="#" className="underline hover:text-foreground">Terms of Service</a> and{' '}
              <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </SignedOut>
      
      <SignedIn>
        {children}
      </SignedIn>
    </>
  )
}