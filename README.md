# Proyecto final - Backend

## Descripción

Este es un proyecto de ecommerce desarrollado en Node.js que incluye funcionalidades como autenticación de usuarios, gestión de productos, carrito de compras, y más.

## Tecnologías Utilizadas

Express.js: Framework web para Node.js
MongoDB: Base de datos NoSQL
Mongoose: ODM para MongoDB
JWT: Tokens de autenticación JSON
Multer: Middleware para manejar archivos en formularios
Passport: Middleware de autenticación para Node.js
Socket.io: Biblioteca para comunicación en tiempo real
Swagger: Herramienta para documentar APIs
Winston: Biblioteca para registro de registros

## Instalación

Para ejecutar esta aplicación en un entorno de desarrollo, siga estos pasos:

1. Asegúrese de tener [Node.js](https://nodejs.org/) instalado en su sistema.
2. Clone el repositorio de este proyecto.
3. En la raíz del proyecto, ejecute el siguiente comando para instalar las dependencias:

   ```bash
   npm install
   ```

3. El proyecto utiliza variables de entorno para la configuración. Asegúrate de crear un archivo .env en la raíz del proyecto y configurar las siguientes variables:


   ```bash
   PORT = 8080
   MONGO_URL = tu_url_de_base_de_datos_mongo
   JWT_SECRET= tu_clave_secreta_para_jwt
   ADMIN_EMAIL = admin_email
   ADMIN_PASSWORD = admin_password
   CLIENT_ID = tu_client_id
   CLIENT_SECRET = tu_client_secret
   CALLBACK_URL = tu_callback_url
   EMAIL = tu_email_nodemailer
   PASS = tu_password_nodemailer
   ```
   
4. Luego, inicie el servidor de desarrollo con el siguiente comando:

   ```bash
   npm start
   ```

4. Para ejecutar pruebas, utiliza:

   ```bash
   npm test
   ```

5. La aplicación estará disponible en [http://localhost:8080](http://localhost:8080) en su navegador.
