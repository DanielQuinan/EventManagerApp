import { useState } from 'react';
import { useRouter } from 'next/router';
import { login } from '../services/auth';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting to login');
      const data = await login(email, password);
      console.log('Login successful', data);
      localStorage.setItem('token', data.token);
      router.push('/');
    } catch (error) {
      console.error('Erro no login', error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Entrar</button>
      </form>
      <Link href="/register">Não tem uma conta? Cadastre-se</Link>
    </div>
  );
}
