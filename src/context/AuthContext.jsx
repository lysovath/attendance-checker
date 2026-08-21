// src/context/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { setupAxiosInterceptors, mockApi } from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { getToken, isLoaded: isClerkLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isClerkLoaded) {
      setupAxiosInterceptors(getToken);
    }
  }, [isClerkLoaded, getToken]);

  useEffect(() => {
    const loadRole = async () => {
      if (isSignedIn) {
        try {
          const res = await mockApi.fetchCurrentUser();
          setUserData(res.data);
        } catch (err) {
          console.error('Failed to fetch user role:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    };
    if (isClerkLoaded) loadRole();
  }, [isSignedIn, isClerkLoaded]);

  return (
    <AuthContext.Provider value={{ user, userData, loading, role: userData?.role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAppAuth = () => useContext(AuthContext);