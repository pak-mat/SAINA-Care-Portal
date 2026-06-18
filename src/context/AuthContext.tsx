// File: src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSession, clearSession, getAllRequests } from '../services/localEngine';
import { useDatabaseEvent } from '../hooks/useDatabaseEvent';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loadingApp, setLoadingApp] = useState(true);

  useEffect(() => {
    const sessionUser = getSession();
    if (sessionUser) setUser(sessionUser);
    setLoadingApp(false);
  }, []);

  const handleDbUpdate = React.useCallback(() => {
    if (user) setRequests(getAllRequests());
  }, [user]);

  useEffect(() => {
    handleDbUpdate();
  }, [handleDbUpdate]);

  useDatabaseEvent('db_updated', handleDbUpdate);

  const login = (u) => setUser(u);
  const logout = () => {
    clearSession();
    setUser(null);
  };

  const updateUser = (u) => {
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, requests, loadingApp, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
