const Event = require('../models/Event');

exports.getEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id).populate('organizer', 'name');
    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar evento' });
  }
};

exports.createEvent = async (req, res) => {
  const { title, description, date, location, slots } = req.body;

  try {
    const event = new Event({
      title,
      description,
      date,
      location,
      slots,
      organizer: req.user.id
    });

    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar evento' });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('organizer', 'name');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar eventos' });
  }
};

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, date, location, slots } = req.body;

  try {
      const event = await Event.findById(id);

      if (!event) {
          return res.status(404).json({ message: 'Evento não encontrado' });
      }


      if (event.organizer.toString() !== req.user.id && !req.user.isAdmin) {
          return res.status(403).json({ message: 'Usuário não autorizado' });
      }

      event.title = title;
      event.description = description;
      event.date = date;
      event.location = location;
      event.slots = slots;

      const updatedEvent = await event.save();
      res.json(updatedEvent);
  } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar evento' });
  }
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    if (event.organizer.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Usuário não autorizado' });
    }

    await event.deleteOne();
    res.json({ message: 'Evento removido com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao remover evento' });
  }
};



exports.joinEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ message: 'Usuário já inscrito' });
    }

    if (event.slots <= 0) {
      return res.status(400).json({ message: 'Não há vagas disponíveis' });
    }

    event.attendees.push(req.user.id);
    event.slots -= 1;
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao ingressar no evento' });
  }
};

exports.leaveEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    event.attendees = event.attendees.filter(attendee => attendee.toString() !== req.user.id);
    event.slots += 1;
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao sair do evento' });
  }
};

exports.getEventAttendees = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id).populate('attendees', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    res.json(event.attendees);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar participantes' });
  }
};

exports.removeAttendee = async (req, res) => {
  const { id, attendeeId } = req.params;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    event.attendees = event.attendees.filter(attendee => attendee.toString() !== attendeeId);
    event.slots += 1;
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover participante' });
  }
};
