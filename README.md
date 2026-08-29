# 🚗 Night-Owls — Taller Automotriz

## 📋 Descripción

Sistema backend para la gestión de un taller automotriz, desarrollado como proyecto académico de **Proyecto de Software 2**.

El sistema permite administrar clientes y vehículos mediante una **API REST**, aplicando una arquitectura por capas y buenas prácticas de desarrollo.

---

## 🛠️ Tecnologías

- NestJS
- TypeScript
- Node.js
- Class Validator
- Class Transformer
- Git y GitHub
- Postman

---

## 🏗️ Arquitectura

El proyecto utiliza una **Arquitectura por Capas**:

- **Modelos / Entidades:** Representan la estructura de los datos.
- **Servicios:** Contienen la lógica de negocio.
- **Controladores:** Gestionan las peticiones HTTP y los endpoints.

---

## 📦 Módulos

### 👤 Clientes

- Crear clientes
- Consultar clientes
- Consultar cliente por ID
- Actualizar clientes
- Eliminar clientes
- Validación de datos

### 🚗 Vehículos

- Registrar vehículos
- Consultar vehículos
- Consultar vehículo por ID
- Actualizar vehículos
- Eliminar vehículos
- Validación de datos

---

## 🔗 Endpoints principales

### Clientes

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/clientes` | Crear cliente |
| GET | `/clientes` | Listar clientes |
| GET | `/clientes/:id` | Consultar cliente |
| PATCH | `/clientes/:id` | Actualizar cliente |
| DELETE | `/clientes/:id` | Eliminar cliente |

### Vehículos

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/vehiculos` | Crear vehículo |
| GET | `/vehiculos` | Listar vehículos |
| GET | `/vehiculos/:id` | Consultar vehículo |
| PATCH | `/vehiculos/:id` | Actualizar vehículo |
| DELETE | `/vehiculos/:id` | Eliminar vehículo |

---

## 🚀 Instalación

Clonar el repositorio:

```bash
git clone https://github.com/Night-Owls-ITP/Night-Owls.git
