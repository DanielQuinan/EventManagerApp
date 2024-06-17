import axios from 'axios';

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
