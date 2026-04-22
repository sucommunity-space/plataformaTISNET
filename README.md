# TISNET

Sistema web para agencia digital con:

- frontend publico responsive
- backend en Flask
- base de datos PostgreSQL
- panel de cliente
- panel de administrador
- panel comercial / ventas
- calculadora de presupuesto web
- generacion de cotizaciones PDF
- integracion con Calendly

Este README sirve para:

1. levantar el proyecto desde cero en otra computadora
2. dejarlo listo para despliegue en Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/omwizz/TISNET)

## 1. Estructura del proyecto

```text
TISNET/
|-- app.py
|-- requirements.txt
|-- requirements-render.txt
|-- .env
|-- .env.example
|-- .python-version
|-- render.yaml
|-- backend/
|   |-- requirements.txt
|   |-- schema.sql
|   `-- src/
|       |-- config/
|       |   |-- database.py
|       |   `-- env.py
|       `-- server.py
`-- frontend/
    |-- index.html
    `-- src/assets/
```

## 2. Requisitos para desarrollo local

Instala esto en Windows:

- Python 3.12 o superior
- PostgreSQL 16 o superior
- pip
- navegador web

Opcional pero recomendado:

- VS Code
- pgAdmin
- Git

## 3. Como compartir el proyecto con otro companero

La forma mas simple es:

1. comprimir la carpeta `TISNET` en `.zip`
2. copiarla a la otra computadora
3. descomprimirla en cualquier ruta de trabajo

Por ejemplo:

```text
C:\proyectos\TISNET
```

Lo importante es que dentro exista el archivo `app.py`.

## 4. Configurar PostgreSQL local

1. instala PostgreSQL
2. recuerda el usuario y la clave del superusuario
3. crea una base de datos vacia llamada `tisnet_db`

Si usas pgAdmin:

1. abre pgAdmin
2. entra a tu servidor local
3. clic derecho en `Databases`
4. elige `Create` -> `Database`
5. escribe `tisnet_db`
6. guarda

## 5. Configurar el archivo .env

Si ya existe un `.env` funcional, puedes reutilizarlo.

Si no existe:

1. copia `.env.example`
2. renombralo a `.env`

Ejemplo base para local:

```env
FLASK_SECRET_KEY=change-this-secret
FLASK_HOST=127.0.0.1
FLASK_PORT=5000
FLASK_DEBUG=false
ENABLE_DEMO_LOGIN=false

OWNER_ADMIN_NAME=Administrador Principal TISNET
OWNER_ADMIN_EMAIL=admin@tisnet.pe
OWNER_ADMIN_PASSWORD=TisnetPanel2026!
OWNER_ADMIN_COMPANY=TISNET
OWNER_ADMIN_WEBSITE=https://tisnet.pe
OWNER_ADMIN_PHONE=+51999999999

OWNER_SALES_NAME=Ejecutivo Comercial TISNET
OWNER_SALES_EMAIL=ventas@tisnet.pe
OWNER_SALES_PASSWORD=VentasTisnet2026!
OWNER_SALES_COMPANY=TISNET
OWNER_SALES_WEBSITE=https://tisnet.pe
OWNER_SALES_PHONE=+51999999999

CALENDLY_PUBLIC_URL=https://calendly.com/tu-cuenta
CALENDLY_CLIENT_REVIEW_URL=https://calendly.com/tu-cuenta
CALENDLY_CLIENT_CLOSE_URL=https://calendly.com/tu-cuenta
CALENDLY_PERSONAL_ACCESS_TOKEN=

DATABASE_URL=
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu-clave
POSTGRES_DATABASE=tisnet_db
POSTGRES_ADMIN_DATABASE=postgres
POSTGRES_SSLMODE=
POSTGRES_CONNECT_TIMEOUT=5

SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_USE_TLS=true
SMTP_FROM_EMAIL=hola@tisnet.pe
SMTP_FROM_NAME=TISNET
```

Notas:

- si defines `DATABASE_URL`, el backend la usara primero
- si `DATABASE_URL` esta vacia, usara `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DATABASE`

## 6. Instalar dependencias

Abre PowerShell dentro de la carpeta del proyecto y ejecuta:

```powershell
pip install -r requirements.txt
```

## 7. Ejecutar el proyecto localmente

Dentro de la carpeta del proyecto:

```powershell
python app.py
```

Luego abre:

```text
http://127.0.0.1:5000
```

## 8. Accesos por defecto

Administrador:

```text
Email: admin@tisnet.pe
Password: TisnetPanel2026!
```

Ventas:

```text
Email: ventas@tisnet.pe
Password: VentasTisnet2026!
```

Nota:

- esas credenciales salen del `.env`
- si cambias `OWNER_ADMIN_*` o `OWNER_SALES_*`, cambian los accesos sembrados

## 9. Errores comunes en local

### Python no se reconoce

Instala Python y marca la opcion `Add Python to PATH`.

### No module named ...

Faltan dependencias:

```powershell
pip install -r requirements.txt
```

### No conecta a PostgreSQL

Revisa que:

- PostgreSQL este encendido
- la base `tisnet_db` exista
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DATABASE` esten correctos
- o que `DATABASE_URL` tenga una cadena valida

### Address already in use

El puerto 5000 ya esta ocupado. Puedes cambiar:

```env
FLASK_PORT=5001
```

Y luego entrar a:

```text
http://127.0.0.1:5001
```

## 10. Despliegue recomendado en Render

Este proyecto ya queda preparado para Render con:

- `render.yaml`
- `requirements-render.txt`
- `.python-version`

### Arquitectura en Render

- `tisnet-web`: Web Service Python
- `tisnet-db`: Render Postgres

### Paso a paso para subirlo

1. sube este proyecto a GitHub
2. crea una cuenta en [Render](https://render.com/)
3. en Render elige `New` -> `Blueprint`
4. conecta el repositorio
5. Render detectara `render.yaml`
6. completa los secretos que Render te pida
7. lanza el deploy

### Variables que debes completar en Render

Debes poner valores reales para:

- `OWNER_ADMIN_PASSWORD`
- `OWNER_SALES_PASSWORD`
- `CALENDLY_PUBLIC_URL`
- `CALENDLY_CLIENT_REVIEW_URL`
- `CALENDLY_CLIENT_CLOSE_URL`
- `CALENDLY_PERSONAL_ACCESS_TOKEN`
- `SMTP_HOST`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`

### Variables que Render conectara automaticamente

Estas salen de la base PostgreSQL creada por el Blueprint:

- `DATABASE_URL`
- `POSTGRES_DATABASE`

## 11. Comandos utiles

Instalar dependencias:

```powershell
pip install -r requirements.txt
```

Ejecutar la app:

```powershell
python app.py
```

Validar sintaxis:

```powershell
python -m py_compile app.py backend\src\server.py backend\src\config\database.py backend\src\config\env.py
```

## 12. Visualizar el README bonito en VS Code

Si abres el proyecto en VS Code:

1. abre `README.md`
2. presiona `Ctrl + Shift + V`

Si quieres vista lateral:

1. abre `README.md`
2. presiona `Ctrl + K`
3. luego presiona `V`

## 13. Resumen rapido para un companero

1. instalar Python y PostgreSQL
2. crear la base `tisnet_db`
3. copiar `.env.example` a `.env`
4. completar credenciales PostgreSQL en `.env`
5. ejecutar `pip install -r requirements.txt`
6. ejecutar `python app.py`
7. abrir `http://127.0.0.1:5000`
