# TISNET

Sistema web para agencia digital con:

- frontend publico responsive
- backend en Flask
- base de datos MySQL
- panel de cliente
- panel de administrador
- panel comercial / ventas
- calculadora de presupuesto web
- generacion de cotizaciones PDF
- integracion con Calendly

Este README sirve para dos cosas:

1. levantar el proyecto localmente en otra computadora
2. dejarlo listo para subirlo a Render en produccion

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
|   `-- src/server.py
|-- deploy/
|   `-- mysql/
|       |-- Dockerfile
|       `-- config/user.cnf
`-- frontend/
    |-- index.html
    `-- src/assets/
```

## 2. Requisitos para desarrollo local

Instala lo siguiente en Windows:

- XAMPP con MySQL
- Python 3.12 o superior
- pip
- navegador web

Opcional pero recomendado:

- VS Code
- Git

## 3. Como compartir el proyecto con otro companero

La forma mas simple es:

1. comprimir la carpeta `TISNET` en `.zip`
2. copiarla a la otra computadora
3. colocarla dentro de `C:\xampp\htdocs\`

Por ejemplo:

```text
C:\xampp\htdocs\TISNET
```

Tambien puede estar en:

```text
C:\xampp\htdocs\proyecto\TISNET
```

Lo importante es que la carpeta tenga dentro el archivo `app.py`.

## 4. Configurar el archivo .env

Si ya existe un `.env` funcional, se puede usar directamente.

Si no existe:

1. copiar `.env.example`
2. renombrarlo a `.env`

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

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=tisnet_db

SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_USE_TLS=true
SMTP_FROM_EMAIL=hola@tisnet.pe
SMTP_FROM_NAME=TISNET
```

## 5. Encender MySQL en XAMPP

1. abrir `XAMPP Control Panel`
2. en la fila `MySQL`, hacer clic en `Start`
3. confirmar que quede en verde

No es obligatorio encender Apache.

## 6. Instalar dependencias

Abre PowerShell en la carpeta del proyecto y ejecuta:

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

### No conecta a MySQL

Revisa que:

- XAMPP tenga `MySQL` encendido
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD` esten correctos

### Address already in use

El puerto 5000 ya esta ocupado. Puedes cerrar la otra instancia o cambiar:

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
- `deploy/mysql/Dockerfile`
- `deploy/mysql/config/user.cnf`
- `.python-version`

### Arquitectura en Render

- `tisnet-web`: Web Service con runtime `python`
- `tisnet-mysql`: Private Service con runtime `docker` usando MySQL 8

### Paso a paso para subirlo

1. Sube este proyecto a un repositorio de GitHub.
2. Crea una cuenta en [Render](https://render.com/).
3. En Render, elige `New` -> `Blueprint`.
4. Conecta el repositorio de GitHub donde esta TISNET.
5. Render detectara el archivo `render.yaml`.
6. Completa las variables secretas que Render te pedira.
7. Lanza el deploy.

### Variables que debes completar en Render

Estas deben ponerse con valores reales:

- `FLASK_SECRET_KEY`
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

### Lo que Render configurara automaticamente

No necesitas escribir manualmente estas si usas el `render.yaml`:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

Porque se conectan automaticamente al servicio privado `tisnet-mysql`.

### Dominio personalizado

Cuando el deploy termine:

1. entra al servicio `tisnet-web`
2. abre `Settings`
3. ve a `Custom Domains`
4. agrega tu dominio

## 11. Notas importantes de produccion

- este proyecto usa `gunicorn` para servir Flask en produccion
- `gunicorn` se instala solo en Render con `requirements-render.txt`
- MySQL en Render se monta con disco persistente
- el backend crea tablas automaticamente al arrancar
- para correos reales, configura SMTP real antes del deploy
- no subas tokens privados a GitHub

## 12. Archivos clave

- Backend principal: [server.py](C:\xampp\htdocs\proyecto\TISNET\backend\src\server.py)
- Entrada Flask: [app.py](C:\xampp\htdocs\proyecto\TISNET\app.py)
- Variables de ejemplo: [.env.example](C:\xampp\htdocs\proyecto\TISNET\.env.example)
- Blueprint de Render: [render.yaml](C:\xampp\htdocs\proyecto\TISNET\render.yaml)

## 13. Comandos utiles

Instalar dependencias:

```powershell
pip install -r requirements.txt
```

Ejecutar local:

```powershell
python app.py
```

## 14. Resumen rapido para un companero

1. copiar la carpeta `TISNET`
2. ponerla en `C:\xampp\htdocs\`
3. encender MySQL en XAMPP
4. abrir PowerShell en la carpeta
5. ejecutar `pip install -r requirements.txt`
6. ejecutar `python app.py`
7. abrir `http://127.0.0.1:5000`

Con eso ya puede entrar y trabajar el proyecto.
