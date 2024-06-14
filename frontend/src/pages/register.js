import { useState } from 'react';
import { useRouter } from 'next/router';
import { register } from '../services/auth';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting to register');
      const data = await register(name, email, password, isAdmin);
      console.log('Registration successful', data);
      localStorage.setItem('token', data.token);
      router.push('/');
    } catch (error) {
      console.error('Erro no registro', error);
    }
  };

  return (
    <div>
      <h1>Registro</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <label>
          <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
          Admin
        </label>
        <button type="submit">Registrar</button>
      </form>
      <Link href="/login">Já tem uma conta? Faça login</Link>
    </div>
  );
}
