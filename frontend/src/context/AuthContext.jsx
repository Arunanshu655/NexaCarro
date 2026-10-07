import { createContext, useContext, useState, useEffect } from "react";
import { useLazyQuery, useQuery } from "@apollo/client/react";
import {GET_ME} from "../graphql/queries/userQueries"
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );
  
  const [user, setUser] = useState(null);

  
  
  const login = (jwt) => {
    
    localStorage.setItem("token", jwt);
    
    // console.log("stored token " + localStorage.getItem("token"))    
    setToken(jwt);
    // console.log("token "+token)
    
  };
  
  const logout = () => {
    // console.log("log out")
    localStorage.removeItem("token");
    
    setToken(null);
    setUser(null);
    
  };

  const { data, loading, error } = useQuery(GET_ME, {
    skip: !token,              // don’t run if no token
    fetchPolicy: "network-only"
  });

useEffect(() => {
  if (data?.me) {
    setUser(data.me);
  }
  if (error) {
    logout();
  }
}, [data, error]);
  
  return (

    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        // fetchMe,
        isAuthenticated: (token ? true : false),
        user,
        setUser
      }}
    >

      {children}

    </AuthContext.Provider>

  );

};

export const useAuth = () => useContext(AuthContext);