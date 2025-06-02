Event Manager App
=================
Exibição no Youtube: https://youtu.be/41CYe8PtKcc
Este é um projeto de gerenciamento de eventos desenvolvido usando Node.js, Express, MongoDB, React e Next.js. O aplicativo permite que usuários se registrem, façam login, criem eventos, participem de eventos e gerenciem seus perfis. Projeto para avaliação acadêmica.

Índice
------

1.  [Pré-requisitos](#prerequisitos)
2.  [Instalação](#instalacao)
3.  [Configuração](#configuracao)
4.  [Executando o Projeto](#executando-o-projeto)
5.  [Documentação da API](#documentacao-da-api)
6.  [Estrutura do Projeto](#estrutura-do-projeto)

Pré-requisitos
--------------

*   Node.js (versão 14 ou superior)
*   NPM ou Yarn
*   MongoDB

Instalação
----------

Siga as instruções abaixo para instalar e configurar o projeto localmente.

### Backend

    git clone https://github.com/DanielQuinan/EventManagerApp.git
    cd EventManagerApp/backend
    npm install
    

### Frontend

    cd EventManagerApp/frontend
    npm install
    

Configuração
------------

### Backend

Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis de ambiente:

    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    PORT=5000
    

### Frontend

Crie um arquivo `.env.local` na pasta `frontend` com a seguinte variável de ambiente:

    NEXT_PUBLIC_API_URL=http://localhost:5000
    

Executando o Projeto
--------------------

### Backend

Para iniciar o servidor backend, execute o seguinte comando:

    cd backend
    npm run dev
    

### Frontend

Para iniciar o servidor frontend, execute o seguinte comando:

    cd frontend
    npm run dev
   

Documentação da API
-------------------

A documentação da API pode ser acessada em `http://localhost:5000/api-docs` após iniciar o servidor backend.

Estrutura do Projeto
--------------------

A estrutura do projeto é a seguinte:

    EventManagerApp/
    ├── backend/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   ├── swagger.js
    │   ├── server.js
    │   ├── .env
    │   └── package.json
    ├── frontend/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   ├── styles/
    │   ├── .env.local
    │   └── package.json
    └── README.html
    

Autor
-------

Este projeto foi desenvolvido por Daniel Quinan. Você pode encontrar mais informações no repositório do GitHub: [EventManagerApp](https://github.com/DanielQuinan/EventManagerApp)

Licença
-------

Este projeto está licenciado sob a Licença MIT.
