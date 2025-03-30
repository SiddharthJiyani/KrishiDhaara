import { useEffect, useState } from "react";
import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); 

    const verifyAuth = async() => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            const response = await axios.get(
                // "http://localhost:3000/auth/checkToken"
                `${BACKEND_URL}/auth/checkToken`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
                ,{withCredentials:true})
            // console.log(response)
            if(response.data.success===true) setIsAuthenticated(true);
            else setIsAuthenticated(false);
        } catch (error) {
            console.log('Auth verification error:', error);
            setIsAuthenticated(false);
        }
    } 

    useEffect(() => {
        
        verifyAuth();
        // const user = localStorage.getItem('user')
        // user.id?setIsAuthenticated(true):setIsAuthenticated(false);
    }, []);

    return isAuthenticated;
};

export default useAuth;