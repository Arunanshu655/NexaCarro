import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_ME } from "../graphql/queries/userQueries";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );
  
  const login = (jwt) => {
    
    localStorage.setItem("token", jwt);
    
    // console.log("stored token " + localStorage.getItem("token"))    
    setToken(jwt);
    // console.log("token "+token)
    
  };
  
  const logout = useCallback(() => {
    // console.log("log out")
    localStorage.removeItem("token");
    
    setToken(null);
    
  }, []);

  const { data, loading, error } = useQuery(GET_ME, {
    skip: !token,              // don’t run if no token
    fetchPolicy: "network-only"
  });

useEffect(() => {
  if (error) {
    logout();
  }
}, [error, logout]);

  const user = token ? data?.me ?? null : null;
  const authLoading = Boolean(token) && (loading || (!data && !error));
  
  return (

    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        // fetchMe,
        isAuthenticated: (token ? true : false),
        user,
        loading: authLoading
      }}
    >

      {children}

    </AuthContext.Provider>

  );

};

export const useAuth = () => useContext(AuthContext);