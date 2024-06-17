import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { register as registerService, login as loginService, getProfile } from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const data = await getProfile(token);
                    setUser(data);
                }
            } catch (error) {
                console.error('Erro ao buscar dados do usuário', error);
            }
        };

        fetchUser();
    }, []);

    const register = async ({ name, email, password }) => {
        try {
            const { token } = await registerService(name, email, password);
            localStorage.setItem('token', token);
            const data = await getProfile(token);
            setUser(data);
            router.push('/');
        } catch (error) {
            throw new Error('Erro ao registrar');
        }
    };

    const login = async ({ email, password }) => {
        try {
            const { token } = await loginService(email, password);
            localStorage.setItem('token', token);
            const data = await getProfile(token);
            setUser(data);
            router.push('/');
        } catch (error) {
            throw new Error('Erro ao fazer login');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    const updateUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            const data = await getProfile(token);
            setUser(data);
        }
    };

    return (
        <AuthContext.Provider value={{ user, register, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
