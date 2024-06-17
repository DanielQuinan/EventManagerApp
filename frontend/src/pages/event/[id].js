import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { getEvent, updateEvent, deleteEvent, joinEvent, leaveEvent, getEventAttendees, removeAttendee } from '../../services/events';
import AuthContext from '../../context/AuthContext';

export default function EventPage() {
    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const { user, updateUser } = useContext(AuthContext);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const token = localStorage.getItem('token');
                const data = await getEvent(id, token);
                setEvent(data);
                const attendeesData = await getEventAttendees(id, token);
                setAttendees(attendeesData);
            } catch (error) {
                console.error('Erro ao buscar evento', error);
            }
        };

        if (id) {
            fetchEvent();
        }
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await updateEvent(id, event, token);
            router.push('/');
        } catch (error) {
            console.error('Erro ao atualizar evento', error);
        }
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await deleteEvent(id, token);
            router.push('/');
        } catch (error) {
            console.error('Erro ao excluir evento', error);
        }
    };

    const handleJoin = async () => {
        try {
            const token = localStorage.getItem('token');
            await joinEvent(id, token);
            setEvent({ ...event, attendees: [...event.attendees, user.id], slots: event.slots - 1 });
            setAttendees([...attendees, { _id: user.id, name: user.name, email: user.email }]);
            updateUser();
        } catch (error) {
            console.error('Erro ao ingressar no evento', error);
        }
    };

    const handleLeave = async () => {
        try {
            const token = localStorage.getItem('token');
            await leaveEvent(id, token);
            setEvent({ ...event, attendees: event.attendees.filter(attendeeId => attendeeId !== user.id), slots: event.slots + 1 });
            setAttendees(attendees.filter(attendee => attendee._id !== user.id));
            updateUser();
        } catch (error) {
            console.error('Erro ao sair do evento', error);
        }
    };

    const handleRemoveAttendee = async (attendeeId) => {
        try {
            const token = localStorage.getItem('token');
            await removeAttendee(id, attendeeId, token);
            setAttendees(attendees.filter(attendee => attendee._id !== attendeeId));
        } catch (error) {
            console.error('Erro ao remover participante', error);
        }
    };

    return (
        <div className="container">
            {event ? (
                <>
                    <h1>{event.title}</h1>
                    <p>{event.description}</p>
                    <p>Data: {new Date(event.date).toLocaleDateString('pt-BR')}</p>
                    <p>Local: {event.location}</p>
                    <p>Vagas: {event.slots}</p>
                    <p>Organizador: {event.organizer.name}</p>
                    {(user && (event.organizer._id === user.id || user.isAdmin)) && (
                        <>
                            <button onClick={handleDelete}>Excluir</button>
                            <form onSubmit={handleUpdate}>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Título"
                                    value={event.title}
                                    onChange={(e) => setEvent({ ...event, title: e.target.value })}
                                    required
                                />
                                <textarea
                                    name="description"
                                    placeholder="Descrição"
                                    value={event.description}
                                    onChange={(e) => setEvent({ ...event, description: e.target.value })}
                                    required
                                />
                                <input
                                    type="date"
                                    name="date"
                                    value={new Date(event.date).toISOString().substr(0, 10)}
                                    onChange={(e) => setEvent({ ...event, date: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Local"
                                    value={event.location}
                                    onChange={(e) => setEvent({ ...event, location: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    name="slots"
                                    placeholder="Vagas"
                                    value={event.slots}
                                    onChange={(e) => setEvent({ ...event, slots: e.target.value })}
                                    required
                                />
                                <button type="submit">Atualizar Evento</button>
                            </form>
                        </>
                    )}
                    {user && !event.attendees.includes(user.id) && event.slots > 0 && (
                        <button onClick={handleJoin}>Ingressar</button>
                    )}
                    {user && event.attendees.includes(user.id) && (
                        <button onClick={handleLeave}>Desistir</button>
                    )}
                    <h2>Participantes</h2>
                    <ul>
                        {attendees.map(attendee => (
                            <li key={attendee._id}>
                                {attendee.name} ({attendee.email})
                                {(user && (event.organizer._id === user.id || user.isAdmin)) && (
                                    <button onClick={() => handleRemoveAttendee(attendee._id)}>Remover</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <p>Carregando...</p>
            )}
            <style jsx>{`
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem;
                    background: #fff;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                h1, h2 {
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
                button {
                    padding: 0.5rem 1rem;
                    background-color: #0070f3;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                    margin-right: 0.5rem;
                }
                button:hover {
                    background-color: #005bb5;
                }
                ul {
                    list-style: none;
                    padding: 0;
                }
                li {
                    margin-bottom: 1rem;
                }
            `}</style>
        </div>
    );
}
