Frontend Documentation
======================

Project Structure
-----------------

This frontend project is structured as follows:

    .
    ├── components
    │   └── Navbar.js
    ├── context
    │   └── AuthContext.js
    ├── pages
    │   ├── event
    │   │   ├── [id].js
    │   │   ├── _app.js
    │   │   ├── _document.js
    │   │   ├── create-event.js
    │   │   └── create-events.js
    │   ├── index.js
    │   ├── login.js
    │   ├── profile.js
    │   └── register.js
    ├── services
    │   ├── auth.js
    │   └── events.js
    ├── styles
    │   ├── globals.css
    │   └── Home.module.css
    ├── .env.local
    ├── .eslintrc.json
    ├── .gitignore
    ├── jsconfig.json
    ├── next.config.js
    ├── package.json
    └── README.md
    

Components
----------

### Navbar.js

The `Navbar.js` component is responsible for rendering the navigation bar at the top of the application. It includes links for navigation and conditionally renders user-specific options if the user is logged in.

    import Link from 'next/link';
    import { useContext } from 'react';
    import AuthContext from '../context/AuthContext';
    
    export default function Navbar() {
      const { user, logout } = useContext(AuthContext);
    
      return (
        
          
            
          
          
            Home
            {user ? (
              <>
                Welcome, {user.name}
                Create Event
                Edit Profile
                Logout
              
            ) : (
              <>
                Login
                Register
              
            )}
          
          {`
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
          `}
        
      );
    }
    

Context
-------

### AuthContext.js

The `AuthContext.js` file contains the context and provider for authentication. It handles user registration, login, logout, and fetching the user profile.

    import { createContext, useState, useEffect } from 'react';
    import { useRouter } from 'next/router';
    import { register as registerService, login as loginService, getProfile } from '../services/auth';
    
    const AuthContext = createContext();
    
    export const AuthProvider = ({ children }) => {
        const [user, setUser] = useState(null);
        const router = useRouter();
    
        useEffect(() => {
            const fetchUser = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (token) {
                        const data = await getProfile(token);
                        setUser(data);
                    }
                } catch (error) {
                    console.error('Error fetching user data', error);
                }
            };
    
            fetchUser();
        }, []);
    
        const register = async ({ name, email, password }) => {
            try {
                const { token } = await registerService(name, email, password);
                localStorage.setItem('token', token);
                const data = await getProfile(token);
                setUser(data);
                router.push('/');
            } catch (error) {
                throw new Error('Error registering');
            }
        };
    
        const login = async ({ email, password }) => {
            try {
                const { token } = await loginService(email, password);
                localStorage.setItem('token', token);
                const data = await getProfile(token);
                setUser(data);
                router.push('/');
            } catch (error) {
                throw new Error('Error logging in');
            }
        };
    
        const logout = () => {
            localStorage.removeItem('token');
            setUser(null);
            router.push('/login');
        };
    
        const updateUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const data = await getProfile(token);
                setUser(data);
            }
        };
    
        return (
            
                {children}
            
        );
    };
    
    export default AuthContext;
    

Pages
-----

### Event Detail Page (event/\[id\].js)

This page is responsible for displaying the details of a specific event. Users can view event details, join or leave the event, and if they are the organizer or an admin, they can update or delete the event.

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
                    console.error('Error fetching event', error);
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
                console.error('Error updating event', error);
            }
        };
    
        const handleDelete = async () => {
            try {
                const token = localStorage.getItem('token');
                await deleteEvent(id, token);
                router.push('/');
            } catch (error) {
                console.error('Error deleting event', error);
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
                console.error('Error joining event', error);
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
                console.error('Error leaving event', error);
            }
        };
    
        const handleRemoveAttendee = async (attendeeId) => {
            try {
                const token = localStorage.getItem('token');
                await removeAttendee(id, attendeeId, token);
                setAttendees(attendees.filter(attendee => attendee._id !== attendeeId));
            } catch (error) {
                console.error('Error removing attendee', error);
            }
        };
    
        return (
            
                {event ? (
                    <>
                        {event.title}
                        {event.description}
                        Date: {new Date(event.date).toLocaleDateString('en-GB')}
                        Location: {event.location}
                        Slots: {event.slots}
                        Organizer: {event.organizer.name}
                        {(user && (event.organizer._id === user.id || user.isAdmin)) && (
                            <>
                                Delete
                                
                                     setEvent({ ...event, title: e.target.value })}
                                        required
                                    />
                                     setEvent({ ...event, description: e.target.value })}
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
                                        placeholder="Location"
                                        value={event.location}
                                        onChange={(e) => setEvent({ ...event, location: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="number"
                                        name="slots"
                                        placeholder="Slots"
                                        value={event.slots}
                                        onChange={(e) => setEvent({ ...event, slots: e.target.value })}
                                        required
                                    />
                                    <button type="submit">Update Event</button>
                                </form>
                            </>
                        )}
                        {user && !event.attendees.includes(user.id) && event.slots > 0 && (
                            <button onClick={handleJoin}>Join</button>
                        )}
                        {user && event.attendees.includes(user.id) && (
                            <button onClick={handleLeave}>Leave</button>
                        )}
                        <h2>Attendees</h2>
                        <ul>
                            {attendees.map(attendee => (
                                <li key={attendee._id}>
                                    {attendee.name} ({attendee.email})
                                    {(user && (event.organizer._id === user.id || user.isAdmin)) && (
                                        <button onClick={() => handleRemoveAttendee(attendee._id)}>Remove</button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>Loading...</p>
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
    </code></pre>
    
            <h3>_app.js</h3>
            <p>The <code>_app.js</code> file is the custom App component in Next.js. It wraps the entire application with the <code>AuthProvider</code> and includes the <code>Navbar</code> component at the top of every page.</p>
            <pre><code>import '../styles/globals.css';
    import { AuthProvider } from '../context/AuthContext';
    import Navbar from '../components/Navbar';
    
    function MyApp({ Component, pageProps }) {
      return (
        <AuthProvider>
          <Navbar />
          <Component {...pageProps} />
        </AuthProvider>
      );
    }
    
    export default MyApp;
    </code></pre>
    
            <h3>_document.js</h3>
            <p>The <code>_document.js</code> file is used to customize the HTML document structure in Next.js. This file includes the basic HTML structure including the <code>Html</code>, <code>Head</code>, <code>Main</code>, and <code>NextScript</code> components.</p>
            <pre><code>import { Html, Head, Main, NextScript } from "next/document";
    
    export default function Document() {
      return (
        <Html lang="en">
          <Head />
          <body>
            <Main />
            <NextScript />
          </body>
        </Html>
      );
    }
    </code></pre>
    
            <h3>create-event.js</h3>
            <p>This page is used to create a new event. It includes a form for the event details such as title, description, date, location, and number of slots. The form data is submitted to the backend to create a new event.</p>
            <pre><code>import { useState, useContext } from 'react';
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
          console.error('Error creating event', error);
        }
      };
    
      return (
        <div className="container">
          <h1>Create Event</h1>
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Title" 
              required 
            />
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Description" 
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
              placeholder="Location" 
              required 
            />
            <input 
              type="number" 
              value={slots} 
              onChange={(e) => setSlots(e.target.value)} 
              placeholder="Slots" 
              required 
            />
            <button type="submit">Create Event</button>
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
    </code></pre>
    
            <h3>create-events.js</h3>
            <p>This is another page for creating an event, similar to <code>create-event.js</code>. It uses Axios for making HTTP requests to the backend.</p>
            <pre><code>import { useState } from 'react';
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
          console.error('Error creating event', error);
        }
      };
    
      return (
        <div>
          <h1>Create Event</h1>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
            <input type="number" placeholder="Slots" value={slots} onChange={(e) => setSlots(e.target.value)} required />
            <button type="submit">Create Event</button>
          </form>
        </div>
      );
    }
    </code></pre>
    
            <h3>Home Page (index.js)</h3>
            <p>This is the home page of the application. It displays a list of all events and allows users to join or leave events. If the user is the organizer or an admin, they can also delete events.</p>
            <pre><code>import { useState, useEffect, useContext } from 'react';
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
                    console.error('Error fetching events', error);
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
                console.error('Error deleting event', error);
            }
        };
    
        const handleJoin = async (id) => {
            try {
                const token = localStorage.getItem('token');
                await joinEvent(id, token);
                updateUser();
                setEvents(events.map(event => event._id === id ? { ...event, attendees: [...event.attendees, user.id], slots: event.slots - 1 } : event));
            } catch (error) {
                console.error('Error joining event', error);
            }
        };
    
        const handleLeave = async (id) => {
            try {
                const token = localStorage.getItem('token');
                await leaveEvent(id, token);
                updateUser();
                setEvents(events.map(event => event._id === id ? { ...event, attendees: event.attendees.filter(attendeeId => attendeeId !== user.id), slots: event.slots + 1 } : event));
            } catch (error) {
                console.error('Error leaving event', error);
            }
        };
    
        return (
            <div className="container">
                <h1>Events</h1>
                {events.length > 0 ? (
                    <ul>
                        {events.map((event) => (
                            <li key={event._id}>
                                <div className="card">
                                    <h2>{event.title}</h2>
                                    <p>{event.description}</p>
                                    <p>Date: {new Date(event.date).toLocaleDateString('en-GB')}</p>
                                    <p>Location: {event.location}</p>
                                    <p>Slots: {event.slots}</p>
                                    <p>Organizer: {event.organizer.name}</p>
                                    {(user && (event.organizer._id === user.id || user.isAdmin)) && (
                                        <button onClick={() => handleDelete(event._id)}>Delete</button>
                                    )}
                                    {user && event.attendees.includes(user.id) ? (
                                        <button onClick={() => handleLeave(event._id)}>Leave</button>
                                    ) : (
                                        event.slots > 0 && <button onClick={() => handleJoin(event._id)}>Join</button>
                                    )}
                                    <button onClick={() => router.push(`/event/${event._id}`)}>View Details</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No events found</p>
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
    </code></pre>
    
            <h3>Login Page (login.js)</h3>
            <p>The login page allows users to log into the application. It includes a form for the email and password, and on successful login, the user is redirected to the homepage.</p>
            <pre><code>import { useState, useContext } from 'react';
    import { useRouter } from 'next/router';
    import AuthContext from '../context/AuthContext';
    
    export default function Login() {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const router = useRouter();
        const { login } = useContext(AuthContext);
    
        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                await login({ email, password });
                router.push('/');
            } catch (error) {
                console.error('Error logging in', error);
            }
        };
    
        return (
            <div className="container">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <button type="submit">Login</button>
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
                    input, button {
                        margin-bottom: 1rem;
                    }
                `}</style>
            </div>
        );
    }
    </code></pre>
    
            <h3>Profile Page (profile.js)</h3>
            <p>The profile page allows users to view and update their profile information. It includes a form for updating the user's name, password, and admin status.</p>
            <pre><code>import { useState, useEffect, useContext } from 'react';
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
                    console.error('Error fetching user data', error);
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
                setMessage('Profile updated successfully!');
            } catch (error) {
                console.error('Error updating profile', error);
            }
        };
    
        return (
            <div className="container">
                <h1>Edit Profile</h1>
                {message && <div className="alert">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Name" 
                        required 
                    />
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Password" 
                    />
                    <label>
                        Admin
                        <input 
                            type="checkbox" 
                            checked={isAdmin} 
                            onChange={(e) => setIsAdmin(e.target.checked)} 
                        />
                    </label>
                    <button type="submit">Save</button>
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
    </code></pre>
    
            <h3>Register Page (register.js)</h3>
            <p>The register page allows new users to create an account. It includes a form for the user's name, email, and password.</p>
            <pre><code>import { useState, useContext } from 'react';
    import { useRouter } from 'next/router';
    import AuthContext from '../context/AuthContext';
    
    export default function Register() {
        const [name, setName] = useState('');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const router = useRouter();
        const { register } = useContext(AuthContext);
    
        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                await register({ name, email, password });
                router.push('/');
            } catch (error) {
                console.error('Error registering', error);
            }
        };
    
        return (
            <div className="container">
                <h1>Register</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        required
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <button type="submit">Register</button>
                </form>
            </div>
        );
    }
    </code></pre>
    
            <h2>Services</h2>
            <h3>auth.js</h3>
            <p>The <code>auth.js</code> file in the services folder contains functions for making HTTP requests related to authentication, such as registering, logging in, and fetching the user's profile.</p>
            <pre><code>import axios from 'axios';
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api/auth/';
    
    export const register = async (name, email, password) => {
        const response = await axios.post(`${API_URL}register`, {
            name,
            email,
            password,
        });
        return response.data;
    };
    
    export const login = async (email, password) => {
        const response = await axios.post(`${API_URL}login`, {
            email,
            password,
        });
        return response.data;
    };
    
    export const getProfile = async (token) => {
        const response = await axios.get(`${API_URL}me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    };
    
    export const updateProfile = async (name, password, isAdmin, token) => {
        const response = await axios.put(`${API_URL}update`, {
            name,
            password,
            isAdmin
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    };
    </code></pre>
    
            <h3>events.js</h3>
            <p>The <code>events.js</code> file in the services folder contains functions for making HTTP requests related to events, such as creating, fetching, updating, deleting, joining, and leaving events.</p>
            <pre><code>import axios from 'axios';
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api/events/';
    
    export const createEvent = async (event, token) => {
        const response = await axios.post(API_URL, event, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    };
    
    export const getEvents = async () => {
        const response = await axios.get(API_URL);
        return response.data;
    };
    
    export const getEvent = async (id, token) => {
        const response = await axios.get(`${API_URL}${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    };
    
    export const updateEvent = async (id, event, token) => {
        const response = await axios.put(`${API_URL}${id}`, event, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    };
    
    export const deleteEvent = async (id, token) => {
        const response = await axios.delete(`${API_URL}${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    };
    
    export const joinEvent = async (id, token) => {
        const response = await axios.post(`${API_URL}${id}/join`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    };
    
    export const leaveEvent = async (id, token) => {
        const response = await axios.post(`${API_URL}${id}/leave`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    };
    
    export const getEventAttendees = async (id, token) => {
        const response = await axios.get(`${API_URL}${id}/attendees`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    };
    
    export const removeAttendee = async (id, attendeeId, token) => {
        const response = await axios.delete(`${API_URL}${id}/attendees/${attendeeId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    };
    </code></pre>
    
            <h2>Styles</h2>
            <h3>globals.css</h3>
            <p>The <code>globals.css</code> file contains global styles for the application, including font settings, background color, and basic styling for the navigation bar and form elements.</p>
            <pre><code>body {
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      background-color: #f7f7f7;
    }
    
    nav {
      background-color: #333;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
    }
    
    nav .logo {
      font-size: 1.5rem;
    }
    
    nav ul {
      list-style: none;
      display: flex;
      margin: 0;
      padding: 0;
    }
    
    nav ul li {
      margin-left: 1rem;
    }
    
    nav ul li a,
    nav ul li button {
      color: #fff;
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      font: inherit;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: #fff;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
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
      background-color: #fff;
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
    
    form input,
    form textarea {
      width: 100%;
      padding: 0.5rem;
      margin-bottom: 1rem;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    
    form button {
      width: 100%;
      padding: 0.75rem;
      background-color: #0070f3;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    
    form button:hover {
      background-color: #005bb5;
    }
    </code></pre>
    
            <h2>Environment Variables</h2>
            <h3>.env.local</h3>
            <p>The <code>.env.local</code> file contains environment variables for the application. The API URL is specified here to be used in service files for making HTTP requests.</p>
            <pre><code>NEXT_PUBLIC_API_URL='http://localhost:5000'
    </code></pre>
    
            <h2>Configuration Files</h2>
            <h3>package.json</h3>
            <p>The <code>package.json</code> file contains the metadata for the project, including dependencies and scripts for running the application.</p>
            <pre><code>{
      "name": "frontend",
      "version": "1.0.0",
      "private": true,
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
      },
      "dependencies": {
        "axios": "^0.21.1",
        "next": "10.0.3",
        "react": "17.0.1",
        "react-dom": "17.0.1"
      },
      "devDependencies": {
        "eslint": "7.14.0",
        "eslint-config-next": "10.0.3"
      }
    }
    </code></pre>
    
            <h2>README.md</h2>
            <p>The <code>README.md</code> file contains instructions for setting up and running the frontend project. Here is the content:</p>
            <pre><code>This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
    
    ## Getting Started
    
    First, run the development server:
    
    \```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    \```
    
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
    
    You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.
    
    [API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.
    
    The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.
    
    This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.
    
    ## Learn More
    
    To learn more about Next.js, take a look at the following resources:
    
    - [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
    - [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
    
    You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
    
    ## Deploy on Vercel
    
    The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
    
    Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
    </code></pre>
        </div>
    </body>
    </html>
    </x-turndown>
