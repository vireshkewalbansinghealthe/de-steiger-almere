import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

// Enhanced auth configuration for better email verification handling
export const authConfig = {
  // Allow users to continue with unverified email for better UX
  // We'll handle verification separately
  requireEmailVerification: false,
  
  // Redirect URLs for different auth scenarios  
  redirectUrls: {
    signIn: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
    signUp: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
    passwordReset: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password`,
  },
  
  // Email templates configuration (to be set in Supabase dashboard)
  emailTemplates: {
    confirmation: {
      subject: 'Bevestig uw account bij De Steiger',
      template: `
        <h2>Welkom bij De Steiger!</h2>
        <p>Bedankt voor uw registratie. Klik op de onderstaande link om uw account te bevestigen:</p>
        <p><a href="{{ .ConfirmationURL }}" style="background: #eab308; color: #1e293b; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Account Bevestigen</a></p>
        <p>Deze link is 24 uur geldig.</p>
        <p>Met vriendelijke groet,<br>Het team van De Steiger</p>
      `
    },
    
    recovery: {
      subject: 'Reset uw wachtwoord - De Steiger',
      template: `
        <h2>Wachtwoord Reset</h2>
        <p>U heeft een wachtwoord reset aangevraagd voor uw De Steiger account.</p>
        <p><a href="{{ .ConfirmationURL }}" style="background: #eab308; color: #1e293b; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Nieuw Wachtwoord Instellen</a></p>
        <p>Deze link is 1 uur geldig.</p>
        <p>Heeft u dit niet aangevraagd? Dan kunt u deze e-mail negeren.</p>
        <p>Met vriendelijke groet,<br>Het team van De Steiger</p>
      `
    }
  }
};

// Helper function to handle auth state changes
export const handleAuthStateChange = (
  event: AuthChangeEvent,
  session: Session | null,
  callbacks: {
    onSignUp?: (user: User) => void;
    onSignIn?: (user: User) => void;
    onEmailConfirmed?: (user: User) => void;
    onSignOut?: () => void;
    onError?: (error: any) => void;
  }
) => {
  try {
    switch (event) {
      case 'SIGNED_UP':
        if (session?.user) {
          console.log('User signed up:', session.user.email);
          callbacks.onSignUp?.(session.user);
        }
        break;
        
      case 'SIGNED_IN':
        if (session?.user) {
          console.log('User signed in:', session.user.email, 'Confirmed:', !!session.user.email_confirmed_at);
          callbacks.onSignIn?.(session.user);
        }
        break;
        
      case 'USER_UPDATED':
        if (session?.user?.email_confirmed_at) {
          console.log('User email confirmed:', session.user.email);
          callbacks.onEmailConfirmed?.(session.user);
        }
        break;
        
      case 'SIGNED_OUT':
        console.log('User signed out');
        callbacks.onSignOut?.();
        break;
        
      case 'PASSWORD_RECOVERY':
        console.log('Password recovery initiated');
        break;
        
      case 'TOKEN_REFRESHED':
        // Silent refresh, usually don't need to handle
        break;
        
      default:
        console.log('Unhandled auth event:', event);
    }
  } catch (error) {
    console.error('Auth state change error:', error);
    callbacks.onError?.(error);
  }
};

// Helper to check if user can proceed without email verification
export const canProceedWithoutVerification = (user: User | null): boolean => {
  // Allow users to proceed if they have an account, even if not verified
  // This provides better UX while we handle verification in the background
  return !!user;
};

// Helper to check if user is fully verified
export const isUserFullyVerified = (user: User | null): boolean => {
  return !!(user && user.email_confirmed_at);
};

// Helper to get verification status message
export const getVerificationStatusMessage = (user: User | null): {
  status: 'verified' | 'pending' | 'none';
  message: string;
  canProceed: boolean;
} => {
  if (!user) {
    return {
      status: 'none',
      message: 'Geen gebruiker ingelogd',
      canProceed: false
    };
  }
  
  if (user.email_confirmed_at) {
    return {
      status: 'verified',
      message: 'E-mail geverifieerd',
      canProceed: true
    };
  }
  
  return {
    status: 'pending',
    message: 'E-mail verificatie in behandeling - u kunt alvast doorgaan',
    canProceed: true // Allow proceeding for better UX
  };
};
