import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function CreateEvent() {
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
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events`,
        { title, description, date, location, slots },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push('/');
    } catch (error) {
      console.error('Erro ao criar evento', error);
    }
  };

  return (
    <div>
      <h1>Criar Evento</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <input type="text" placeholder="Local" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <input type="number" placeholder="Vagas" value={slots} onChange={(e) => setSlots(e.target.value)} required />
        <button type="submit">Criar Evento</button>
      </form>
    </div>
  );
}
