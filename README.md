🚗 Night-Owls — Taller Automotriz
📋 Descripción

Sistema backend para la gestión de un taller automotriz, desarrollado como proyecto académico de Proyecto de Software 2.

El sistema permite administrar clientes y vehículos mediante una API REST, aplicando una arquitectura por capas y buenas prácticas de desarrollo.

🛠️ Tecnologías
NestJS
TypeScript
Node.js
Class Validator
Class Transformer
Git y GitHub
Postman
🏗️ Arquitectura

El proyecto utiliza Arquitectura por Capas:

Modelos/Entidades: Representan la estructura de los datos.
Servicios: Contienen la lógica de negocio.
Controladores: Gestionan las peticiones HTTP y los endpoints.
📦 Módulos actuales
👤 Clientes
Crear cliente
Consultar clientes
Consultar cliente por ID
Actualizar cliente
Eliminar cliente
Validación de datos
🚗 Vehículos
Registrar vehículo
Consultar vehículos
Consultar vehículo por ID
Actualizar vehículo
Eliminar vehículo
Validación de datos
🔗 Endpoints principales
POST    /clientes
GET     /clientes
GET     /clientes/:id
PATCH   /clientes/:id
DELETE  /clientes/:id

POST    /vehiculos
GET     /vehiculos
GET     /vehiculos/:id
PATCH   /vehiculos/:id
DELETE  /vehiculos/:id
🚀 Instalación
git clone https://github.com/Night-Owls-ITP/Night-Owls.git
cd Night-Owls/backend
npm install
npm run start:dev

Servidor:

http://localhost:3000
🌿 Control de versiones

El proyecto utiliza Git Flow para el trabajo colaborativo.

Cada integrante trabaja en una rama independiente y posteriormente crea un Pull Request para integrar sus cambios a main.

Ejemplo:

main
├── feature/clientes
├── feature/vehiculos
└── feature/ordenes-trabajo
👥 Equipo
Marlon Viveros
Esteban Ceron
Luis Calderon
📌 Estado

🚧 Proyecto en desarrollo

Próximamente se agregarán órdenes de trabajo, servicios, repuestos, mecánicos, relaciones entre entidades y conexión con base de datos.
