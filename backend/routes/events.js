const express = require('express');
const { createEvent, getEvents, getEvent, updateEvent, deleteEvent, joinEvent, leaveEvent, getEventAttendees, removeAttendee } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, createEvent);
router.get('/', getEvents);
router.get('/:id', protect, getEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/:id/join', protect, joinEvent);
router.post('/:id/leave', protect, leaveEvent);
router.get('/:id/attendees', protect, getEventAttendees);
router.delete('/:id/attendees/:attendeeId', protect, removeAttendee);

module.exports = router;
