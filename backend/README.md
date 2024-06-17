  Event Manager App - Backend README body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; } h1, h2, h3 { color: #333; } code { background: #f4f4f4; padding: 2px 4px; border-radius: 4px; } pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; } ul { margin: 0; padding: 0 0 0 20px; }

Event Manager App - Backend
===========================

Este é o backend do projeto de gerenciamento de eventos, desenvolvido usando Node.js, Express e MongoDB.

Índice
------

1.  [Pré-requisitos](#prerequisitos)
2.  [Instalação](#instalacao)
3.  [Configuração](#configuracao)
4.  [Executando o Projeto](#executando-o-projeto)
5.  [Estrutura do Projeto](#estrutura-do-projeto)
6.  [Documentação da API](#documentacao-da-api)
7.  [Licença](#licenca)

Pré-requisitos
--------------

*   Node.js (versão 14 ou superior)
*   NPM ou Yarn
*   MongoDB

Instalação
----------

Siga as instruções abaixo para instalar e configurar o backend localmente.

    git clone https://github.com/DanielQuinan/EventManagerApp.git
    cd EventManagerApp/backend
    npm install
    

Configuração
------------

Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis de ambiente:

    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    PORT=5000
    

Executando o Projeto
--------------------

Para iniciar o servidor backend, execute o seguinte comando:

    npm run dev
    

Estrutura do Projeto
--------------------

A estrutura do projeto é a seguinte:

    backend/
    ├── controllers/
    │   ├── authController.js
    │   └── eventController.js
    ├── middleware/
    │   └── auth.js
    ├── models/
    │   ├── Event.js
    │   └── User.js
    ├── routes/
    │   ├── auth.js
    │   └── events.js
    ├── utils/
    ├── .env
    ├── package-lock.json
    ├── package.json
    ├── README.md
    ├── server.js
    └── swagger.js
    

Documentação da API
-------------------

A documentação da API pode ser acessada em `http://localhost:5000/api-docs` após iniciar o servidor backend.

Licença
-------

Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

Controladores
-------------

Os controladores são responsáveis por lidar com as requisições HTTP e realizar as operações necessárias utilizando os modelos.

### authController.js

Este arquivo contém as funções para registro, login, obtenção de dados do usuário autenticado e atualização de dados do usuário.

    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    
    exports.register = async (req, res) => {
        const { name, email, password, isAdmin } = req.body;
    
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email já cadastrado' });
            }
    
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
    
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                isAdmin
            });
    
            const savedUser = await newUser.save();
    
            const token = jwt.sign({ id: savedUser._id, isAdmin: savedUser.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
            res.json({ token, user: { id: savedUser._id, name: savedUser.name, email: savedUser.email, isAdmin: savedUser.isAdmin } });
        } catch (error) {
            res.status(500).json({ message: 'Erro no servidor' });
        }
    };
    
    exports.getMe = async (req, res) => {
      try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
      } catch (error) {
        res.status(500).json({ message: 'Erro no servidor' });
      }
    };
    
    exports.updateUser = async (req, res) => {
      const { name, password, isAdmin } = req.body;
    
      try {
        const user = await User.findById(req.user.id);
    
        if (name) {
          user.name = name;
        }
    
        if (password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
        }
    
        if (isAdmin !== undefined) {
          user.isAdmin = isAdmin;
        }
    
        const updatedUser = await user.save();
        res.json(updatedUser);
      } catch (error) {
        res.status(500).json({ message: 'Erro no servidor' });
      }
    };
    
    exports.login = async (req, res) => {
      const { email, password } = req.body;
    
      try {
          const user = await User.findOne({ email });
          if (!user) {
              return res.status(400).json({ message: 'Credenciais inválidas' });
          }
    
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
              return res.status(400).json({ message: 'Credenciais inválidas' });
          }
    
          const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
          res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
      } catch (error) {
          res.status(500).json({ message: 'Erro no servidor' });
      }
    };
    

### eventController.js

Este arquivo contém as funções para criar, obter, atualizar e deletar eventos, além de funções para gerenciar os participantes dos eventos.

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
    

Middleware
----------

O middleware é usado para autenticação e autorização de usuários.

### auth.js

    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    
    exports.protect = async (req, res, next) => {
        let token;
    
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
    
        if (!token) {
            return res.status(401).json({ message: 'Não autorizado, token não encontrado' });
        }
    
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Não autorizado, token inválido' });
        }
    };
    

Modelos
-------

Os modelos definem a estrutura dos dados que serão armazenados no MongoDB.

### Event.js

    const mongoose = require('mongoose');
    
    const EventSchema = new mongoose.Schema({
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        required: true
      },
      location: {
        type: String,
        required: true
      },
      slots: {
        type: Number,
        required: true
      },
      organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    });
    
    module.exports = mongoose.model('Event', EventSchema);
    

### User.js

    const mongoose = require('mongoose');
    
    const UserSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true
      },
      isAdmin: {
        type: Boolean,
        default: false
      }
    });
    
    module.exports = mongoose.model('User', UserSchema);
    

Rotas
-----

As rotas definem os endpoints da API e mapeiam as requisições para os controladores correspondentes.

### auth.js

    const express = require('express');
    const { register, login, getMe, updateUser } = require('../controllers/authController');
    const { protect } = require('../middleware/auth');
    const router = express.Router();
    
    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     summary: Registrar um novo usuário
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Usuário registrado com sucesso
     *       400:
     *         description: Email já cadastrado
     *       500:
     *         description: Erro no servidor
     */
    router.post('/register', register);
    
    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Fazer login
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login bem-sucedido
     *       400:
     *         description: Credenciais inválidas
     *       500:
     *         description: Erro no servidor
     */
    router.post('/login', login);
    
    /**
     * @swagger
     * /api/auth/me:
     *   get:
     *     summary: Obter dados do usuário autenticado
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Dados do usuário
     *       401:
     *         description: Não autorizado
     *       500:
     *         description: Erro no servidor
     */
    router.get('/me', protect, getMe);
    
    /**
     * @swagger
     * /api/auth/update:
     *   put:
     *     summary: Atualizar dados do usuário
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Usuário atualizado com sucesso
     *       500:
     *         description: Erro no servidor
     */
    router.put('/update', protect, updateUser);
    
    module.exports = router;
    

### events.js

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
    

Swagger
-------

O Swagger é usado para documentar a API. A documentação pode ser acessada em `http://localhost:5000/api-docs`.

### swagger.js

    const swaggerJSDoc = require('swagger-jsdoc');
    const swaggerUi = require('swagger-ui-express');
    
    // Metadata info about our API
    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'API de Gerenciamento de Eventos',
          version: '1.0.0',
          description: 'Esta é a documentação da API de Gerenciamento de Eventos',
        },
        servers: [
          {
            url: 'http://localhost:5000',
          },
        ],
      },
      apis: ['./routes/*.js'], // Caminho para os arquivos de rota
    };
    
    // Docs em JSON format
    const swaggerSpec = swaggerJSDoc(options);
    
    const swaggerDocs = (app) => {
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    };
    
    module.exports = swaggerDocs;
    

Servidor
--------

O servidor é a entrada principal do backend. Ele configura e inicia o servidor Express, conecta ao MongoDB e carrega as rotas e a documentação do Swagger.

### server.js

    const express = require('express');
    const mongoose = require('mongoose');
    const dotenv = require('dotenv');
    const cors = require('cors');
    const swaggerDocs = require('./swagger'); // Importar o Swagger
    
    dotenv.config();
    
    const app = express();
    const PORT = process.env.PORT || 5000;
    
    app.use(cors());
    app.use(express.json());
    
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log('MongoDB conectado'))
      .catch((err) => console.error(err));
    
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/events', require('./routes/events'));
    
    swaggerDocs(app);
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
    

Dependências
------------

O arquivo `package.json` lista todas as dependências e scripts necessários para o projeto.

### package.json

    {
      "name": "backend",
      "version": "1.0.0",
      "description": "",
      "main": "server.js",
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "start": "node server.js",
        "dev": "nodemon server.js"
      },
      "keywords": [],
      "author": "",
      "license": "ISC",
      "dependencies": {
        "bcryptjs": "^2.4.3",
        "cors": "^2.8.5",
        "dotenv": "^16.4.5",
        "express": "^4.19.2",
        "jsonwebtoken": "^9.0.2",
        "mongoose": "^8.4.1",
        "swagger-jsdoc": "^6.2.8",
        "swagger-ui-express": "^5.0.1"
      },
      "devDependencies": {
        "nodemon": "^3.1.3"
      }
    }
    

Exemplo de Arquivo .env
-----------------------

O arquivo `.env` armazena as variáveis de ambiente necessárias para o projeto.

### .env.example

    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    PORT=5000