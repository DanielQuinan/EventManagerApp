import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { createEvent } from '../services/events';
import AuthContext from '../context/AuthContext';

export default function CreateEvent() {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [slots, setSlots] = useState(0);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await createEvent({ title, description, date, location, slots }, token);
      router.push('/');
    } catch (error) {
      console.error('Erro ao criar evento', error);
    }
  };

  return (
    <div className="container">
      <h1>Criar Evento</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Título" 
          required 
        />
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Descrição" 
          required 
        />
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          placeholder="Local" 
          required 
        />
        <input 
          type="number" 
          value={slots} 
          onChange={(e) => setSlots(e.target.value)} 
          placeholder="Vagas" 
          required 
        />
        <button type="submit">Criar Evento</button>
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
        form {
          display: flex;
          flex-direction: column;
        }
        input, textarea, button {
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}
