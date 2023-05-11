# Descripción del código

El código es una API desarrollada en Node.js y Express para el check-in automático de pasajeros en una aerolínea.

El código consta de dos archivos principales: `flights.routes.js` y `flights.controller.js`.

`flights.routes.js` define una única ruta que responde a la solicitud de la información de los pasajeros de un vuelo dado. Esta ruta utiliza el controlador `flights.controller.js`.

`flights.controller.js` es el controlador que maneja la lógica empresarial de la API. El controlador exporta una sola función, `getFlights`, que devuelve información sobre los pasajeros de un vuelo dado. La función extrae el ID del vuelo de los parámetros de la solicitud, consulta la base de datos para obtener la información del vuelo y los pasajeros, y luego devuelve esta información en formato JSON.

Además, la función `getFlights` implementa la lógica para asignar asientos a los pasajeros. Primero, se obtienen los asientos ocupados del vuelo y se calculan los asientos disponibles. Luego, la función `assignSeats` asigna asientos a los pasajeros que aún no tienen uno.

El código también utiliza el paquete `dotenv` para cargar variables de entorno de un archivo `.env` y el paquete `promise-mysql` para interactuar con la base de datos MySQL.

# Instrucciones de instalación

Para instalar la API, siga estos pasos:

1. Clonar el repositorio de GitHub:

```
git clone https://github.com/DanielMoranV/andes-airlines-api.git
```

2. Instalar las dependencias de npm:

```
cd andes-airlines-api
npm install
```

3. Crear un archivo `.env` en el directorio raíz del proyecto y establecer las siguientes variables de entorno:

```
DB_HOST=mdb-test.c6vunyturrl6.us-west-1.rds.amazonaws.com
DB_USER=bsale_test
DB_PASSWORD=bsale_test
DB_NAME=airline
PORT=3000
```

4. Ejecutar la API en modo de desarrollo:

```
npm run dev
```

La API ahora debería estar disponible en `http://localhost:3000`. Puede enviar una solicitud GET a `http://localhost:3000/<flight_id>/passengers` para obtener información sobre los pasajeros de un vuelo dado (reemplace `<flight_id>` con el ID del vuelo).
