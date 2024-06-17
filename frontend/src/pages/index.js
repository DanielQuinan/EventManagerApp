import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { getEvents, deleteEvent, joinEvent, leaveEvent } from '../services/events';
import AuthContext from '../context/AuthContext';

export default function Home() {
    const [events, setEvents] = useState([]);
    const { user, updateUser } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getEvents();
                setEvents(data);
            } catch (error) {
                console.error('Erro ao buscar eventos', error);
            }
        };

        fetchEvents();
    }, []);

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await deleteEvent(id, token);
            setEvents(events.filter(event => event._id !== id));
        } catch (error) {
            console.error('Erro ao excluir evento', error);
        }
    };

    const handleJoin = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await joinEvent(id, token);
            updateUser();
            setEvents(events.map(event => event._id === id ? { ...event, attendees: [...event.attendees, user.id], slots: event.slots - 1 } : event));
        } catch (error) {
            console.error('Erro ao ingressar no evento', error);
        }
    };

    const handleLeave = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await leaveEvent(id, token);
            updateUser();
            setEvents(events.map(event => event._id === id ? { ...event, attendees: event.attendees.filter(attendeeId => attendeeId !== user.id), slots: event.slots + 1 } : event));
        } catch (error) {
            console.error('Erro ao sair do evento', error);
        }
    };

    return (
        <div className="container">
            <h1>Eventos</h1>
            {events.length > 0 ? (
                <ul>
                    {events.map((event) => (
                        <li key={event._id}>
                            <div className="card">
                                <h2>{event.title}</h2>
                                <p>{event.description}</p>
                                <p>Data: {new Date(event.date).toLocaleDateString('pt-BR')}</p>
                                <p>Local: {event.location}</p>
                                <p>Vagas: {event.slots}</p>
                                <p>Organizador: {event.organizer.name}</p>
                                {(user && (event.organizer._id === user.id || user.isAdmin)) && (
                                    <button onClick={() => handleDelete(event._id)}>Excluir</button>
                                )}
                                {user && event.attendees.includes(user.id) ? (
                                    <button onClick={() => handleLeave(event._id)}>Desistir</button>
                                ) : (
                                    event.slots > 0 && <button onClick={() => handleJoin(event._id)}>Ingressar</button>
                                )}
                                <button onClick={() => router.push(`/event/${event._id}`)}>Ver Detalhes</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhum evento encontrado</p>
            )}
            <style jsx>{`
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                ul {
                    list-style: none;
                    padding: 0;
                }
                li {
                    margin-bottom: 1rem;
                }
                .card {
                    border: 1px solid #ccc;
                    padding: 1rem;
                    border-radius: 5px;
                }
                h2 {
                    margin-top: 0;
                }
                button {
                    margin-right: 0.5rem;
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    background-color: #0070f3;
                    color: white;
                    transition: background-color 0.3s;
                }
                button:hover {
                    background-color: #005bb5;
                }
            `}</style>
        </div>
    );
}
