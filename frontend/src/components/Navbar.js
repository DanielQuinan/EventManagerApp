import Link from 'next/link';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav>
      <div className="logo">
        <img src="/logo.png" alt="Logo" />
      </div>
      <ul>
        <li><Link href="/">Home</Link></li>
        {user ? (
          <>
            <li>Bem-vindo, {user.name}</li>
            <li><Link href="/create-event">Criar Evento</Link></li>
            <li><Link href="/profile">Editar Perfil</Link></li>
            <li><button onClick={logout}>Logoff</button></li>
          </>
        ) : (
          <>
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/register">Registrar</Link></li>
          </>
        )}
      </ul>
      <style jsx>{`
        nav {
          background-color: #333;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #fff;
        }
        .logo img {
          height: 40px;
        }
        ul {
          list-style: none;
          display: flex;
          margin: 0;
          padding: 0;
        }
        li {
          margin-left: 1rem;
        }
        li a, li button {
          color: #fff;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          font: inherit;
        }
      `}</style>
    </nav>
  );
}
