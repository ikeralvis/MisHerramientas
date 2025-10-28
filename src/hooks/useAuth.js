import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { loginWithGoogle, loginWithEmail, registerWithEmail, logout } from '../services/authService';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        const result = await loginWithGoogle();
        return result;
    };

    const handleEmailLogin = async (email, password) => {
        const result = await loginWithEmail(email, password);
        return result;
    };

    const handleEmailRegister = async (email, password) => {
        const result = await registerWithEmail(email, password);
        return result;
    };

    const handleLogout = async () => {
        const result = await logout();
        setUser(null);
        return result;
    };

    return {
        user,
        loading,
        handleGoogleLogin,
        handleEmailLogin,
        handleEmailRegister,
        handleLogout
    };
};
