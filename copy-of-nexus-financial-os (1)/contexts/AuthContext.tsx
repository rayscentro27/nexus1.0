import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

// Define the shape of the profile from the DB
export interface UserProfile {
  id: string;
  role: 'admin' | 'client' | 'partner';
  name?: string;
  email?: string;
  settings?: {
    agencyName?: string;
    primaryColor?: string;
    [key: string]: any;
  };
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  signOut: () => Promise<void>;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  debugLogin: (appUser: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  signOut: async () => {},
  loading: true,
  refreshProfile: async () => {},
  debugLogin: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.warn('Error fetching profile (it may not exist yet):', error.message);
        return null;
      }
      return data as UserProfile;
    } catch (e) {
      console.error('Unexpected error fetching profile:', e);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const prof = await fetchProfile(user.id);
      if (prof) setProfile(prof);
    }
  };

  const debugLogin = async (appUser: any) => {
    // Construct a mock Supabase user object to satisfy types
    const mockSupabaseUser = {
      id: appUser.id,
      email: appUser.email,
      user_metadata: { name: appUser.name },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      role: 'authenticated'
    } as User;

    const mockProfile: UserProfile = {
      id: appUser.id,
      role: appUser.role,
      name: appUser.name,
      email: appUser.email
    };

    setUser(mockSupabaseUser);
    setProfile(mockProfile);
    setSession({ 
      access_token: 'mock_token', 
      refresh_token: 'mock_refresh', 
      expires_in: 3600, 
      token_type: 'bearer', 
      user: mockSupabaseUser 
    });
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // If not configured, skip network call to avoid "Failed to fetch"
      if (!isSupabaseConfigured) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const prof = await fetchProfile(session.user.id);
            setProfile(prof);
          }
        }
      } catch (error) {
        console.warn('Auth initialization warning (likely network error or invalid Supabase keys):', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
           // Fetch profile on login to ensure we have the latest role and settings
           const prof = await fetchProfile(session.user.id);
           setProfile(prof);
        } else {
           setProfile(null);
        }
        
        setLoading(false);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (!isSupabaseConfigured) {
        setUser(null);
        setSession(null);
        setProfile(null);
        return;
    }
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, signOut, loading, refreshProfile, debugLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);