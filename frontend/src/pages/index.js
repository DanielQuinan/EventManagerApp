import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getProfile } from '../services/auth';
import Link from 'next/link';

export default function Home() {
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
      } catch (error) {
        console.error('Erro ao buscar dados do usuário', error);
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>Bem-vindo, {user.name}</h1>
      <Link href="/profile">Editar Perfil</Link>
      <button onClick={handleLogout}>Logoff</button>
    </div>
  );
}
