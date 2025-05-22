
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface IProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: IProfile | null;
  signOut: () => Promise<void>;
  loading: boolean;
  profileLoading: boolean;
  isAdmin: () => boolean;
  isStylist: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loadAttempts, setLoadAttempts] = useState(0);

  useEffect(() => {
    console.log('AuthContext initializing...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log(`Auth state changed: ${event}`, currentSession?.user?.id);
        
        // Synchronize session state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Fetch profile data with setTimeout to avoid potential deadlocks
        if (currentSession?.user) {
          setProfileLoading(true);
          console.log('Fetching profile for user:', currentSession.user.id);
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setProfileLoading(false);
          console.log('No user session, profile cleared');
        }
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setProfileLoading(false);
          console.log('User signed out, profile cleared');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        setProfileLoading(true);
        console.log('Fetching initial profile for user:', currentSession.user.id);
        fetchProfile(currentSession.user.id);
      } else {
        setProfileLoading(false);
        console.log('No initial user session found');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // If profile fetch failed and we haven't exceeded max attempts, try again
  useEffect(() => {
    if (!profileLoading && !profile && user && loadAttempts < 3) {
      const retryDelay = 1000 * (loadAttempts + 1);
      const retryTimer = setTimeout(() => {
        console.log(`Retrying profile fetch (attempt ${loadAttempts + 1})...`);
        setProfileLoading(true);
        fetchProfile(user.id);
      }, retryDelay);
      
      return () => clearTimeout(retryTimer);
    }
  }, [profileLoading, profile, user, loadAttempts]);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Starting profile fetch for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setLoadAttempts(prev => prev + 1);
        setProfileLoading(false);
        return;
      } 
      
      console.log('Profile fetched successfully:', data?.role);
      setProfile(data as IProfile);
      setProfileLoading(false);
      setLoadAttempts(0);
    } catch (error) {
      console.error('Exception in fetchProfile:', error);
      setLoadAttempts(prev => prev + 1);
      setProfileLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Perform sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      toast.success('You have been signed out');
      
      // Clear state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Force page reload for a clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  // Helper methods to check user roles
  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  const isStylist = () => {
    return profile?.role === 'stylist';
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      profile, 
      signOut, 
      loading,
      profileLoading,
      isAdmin,
      isStylist
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
