import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithProvider: (provider: 'google') => Promise<any>;
  signUp: (email: string, password: string, meta: any) => Promise<any>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      handleUserSession(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      handleUserSession(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (supabaseUser: SupabaseUser | null) => {
    if (supabaseUser) {
      const meta = supabaseUser.user_metadata || {};
      const fallbackName = meta.full_name || meta.name || supabaseUser.email?.split('@')[0] || 'User';
      const fallbackRole = meta.role || 'supporter';
      const fallbackAvatar = meta.avatar_url || meta.picture || '';

      // Immediately set user so ProtectedRoute doesn't block the user
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: fallbackName,
        role: fallbackRole,
      });

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role, avatar_url')
          .eq('id', supabaseUser.id)
          .maybeSingle();
          
        if (data && !error) {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: data.full_name || fallbackName,
            role: data.role || fallbackRole,
          });
        } else {
          // If profile does not exist yet (e.g. from Google OAuth), ensure one is created
          const username = (meta.user_name || meta.name || supabaseUser.email?.split('@')[0] || 'user')
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_');

          await supabase
            .from('profiles')
            .upsert({
              id: supabaseUser.id,
              username: `${username}_${supabaseUser.id.slice(0, 4)}`,
              full_name: fallbackName,
              avatar_url: fallbackAvatar,
              role: fallbackRole
            }, { onConflict: 'id' });
        }
      } catch (err) {
        console.error('Error fetching or syncing profile:', err);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signInWithProvider = async (provider: 'google') => {
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const signUp = async (email: string, password: string, meta: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: meta.username || email.split('@')[0],
          full_name: meta.username || email.split('@')[0],
          role: meta.role || 'supporter'
        }
      }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signInWithProvider,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
