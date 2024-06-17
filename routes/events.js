const express = require('express');
const {
  createEvent, getEvents, getEvent, updateEvent, deleteEvent, joinEvent, leaveEvent, getEventAttendees, removeAttendee,
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Criar um novo evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *               slots:
 *                 type: number
 *     responses:
 *       201:
 *         description: Evento criado com sucesso
 *       500:
 *         description: Erro no servidor
 */
router.post('/', protect, createEvent);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Obter todos os eventos
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Lista de eventos
 *       500:
 *         description: Erro ao buscar eventos
 */
router.get('/', getEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Obter um evento pelo ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Dados do evento
 *       404:
 *         description: Evento não encontrado
 *       500:
 *         description: Erro ao buscar evento
 */
router.get('/:id', getEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Atualizar um evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *               slots:
 *                 type: number
 *     responses:
 *       200:
 *         description: Evento atualizado com sucesso
 *       404:
 *         description: Evento não encontrado
 *       500:
 *         description: Erro ao atualizar evento
 */
router.put('/:id', protect, updateEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Deletar um evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Evento removido com sucesso
 *       404:
 *         description: Evento não encontrado
 *       500:
 *         description: Erro ao remover evento
 */
router.delete('/:id', protect, deleteEvent);

/**
 * @swagger
 * /api/events/{id}/join:
 *   post:
 *     summary: Ingressar em um evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Ingressado no evento com sucesso
 *       404:
 *         description: Evento não encontrado
 *       500:
 *         description: Erro ao ingressar no evento
 */
router.post('/:id/join', protect, joinEvent);

/**
 * @swagger
 * /api/events/{id}/leave:
 *   post:
 *     summary: Sair de um evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Saiu do evento com sucesso
 *       404:
 *         description: Evento não encontrado
 *       500:
 *         description: Erro ao sair do evento
 */
router.post('/:id/leave', protect, leaveEvent);

/**
 * @swagger
 * /api/events/{id}/attendees:
 *   get:
 *     summary: Obter lista de participantes de um evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Lista de participantes
 *       404:
 *         description: Evento não encontrado
 *       500:
 *         description: Erro ao buscar participantes
 */
router.get('/:id/attendees', protect, getEventAttendees);

/**
 * @swagger
 * /api/events/{id}/attendees/{attendeeId}:
 *   delete:
 *     summary: Remover participante de um evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do evento
 *       - in: path
 *         name: attendeeId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do participante
 *     responses:
 *       200:
 *         description: Participante removido com sucesso
 *       404:
 *         description: Evento ou participante não encontrado
 *       500:
 *         description: Erro ao remover participante
 */
router.delete('/:id/attendees/:attendeeId', protect, removeAttendee);

module.exports = router;
