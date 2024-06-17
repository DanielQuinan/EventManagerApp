import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/auth';

export default function Profile() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [message, setMessage] = useState('');
    const { user, updateUser } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }
                const data = await getProfile(token);
                setName(data.name);
                setIsAdmin(data.isAdmin);
            } catch (error) {
                console.error('Erro ao buscar dados do usuário', error);
            }
        };

        fetchUser();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await updateProfile(name, password, isAdmin, token);
            updateUser();
            setMessage('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar perfil', error);
        }
    };

    return (
        <div className="container">
            <h1>Editar Perfil</h1>
            {message && <div className="alert">{message}</div>}
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Nome" 
                    required 
                />
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Senha" 
                />
                <label>
                  Administrador
                    <input 
                        type="checkbox" 
                        checked={isAdmin} 
                        onChange={(e) => setIsAdmin(e.target.checked)} 
                    />
                    
                </label>
                <button type="submit">Salvar</button>
            </form>
            <style jsx>{`
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem;
                    background: #fff;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .alert {
                    background-color: #dff0d8;
                    color: #3c763d;
                    padding: 1rem;
                    border-radius: 5px;
                    margin-bottom: 1rem;
                }
                h1 {
                    margin-top: 0;
                }
                form {
                    margin-top: 1rem;
                }
                form input, form textarea {
                    display: block;
                    width: 100%;
                    padding: 0.5rem;
                    margin-bottom: 1rem;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }
                form button {
                    padding: 0.5rem 1rem;
                    background-color: #0070f3;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                form button:hover {
                    background-color: #005bb5;
                }
                label {
                    display: block;
                    margin-bottom: 1rem;
                }
                label input {
                    margin-right: 0.5rem;
                }
            `}</style>
        </div>
    );
}
