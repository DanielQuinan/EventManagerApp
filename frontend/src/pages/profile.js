import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getProfile, updateProfile } from '../services/auth';

export default function Profile() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
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
        setUser(data);
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
      alert('Dados atualizados com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar dados', error);
    }
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>Perfil do Usuário</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="password" placeholder="Senha (deixe vazio para não mudar)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <label>
          <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
          Admin
        </label>
        <button type="submit">Atualizar</button>
      </form>
    </div>
  );
}
