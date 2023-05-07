import { getConnection } from "../database/database";

// Función que convierte una cadena de snake_case a camelCase
function convertSnakeToCamel(str) {
  return str.replace(/([-_]\w)/g, (g) => g[1].toUpperCase());
}

// Función para obtener información de vuelo y sus pasajeros
const getFlights = async (req, res) => {
  // Se extrae el id de los parámetros de la solicitud
  const { id } = req.params;

  try {
    // Se obtiene la conexión a la base de datos
    const connection = await getConnection();

    // Se obtiene la información del vuelo con el id dado
    const [flight] = await connection.query(
      "SELECT * FROM flight WHERE flight_id = ? ",
      id
    );

    // Si no se encuentra ningún vuelo, se envía un mensaje de error
    if (!flight) {
      return res
        .status(404)
        .json({ message: `Flight with id ${id} not found` });
    }

    // Se obtiene la información de los pasajeros del vuelo
    const passengers = await connection.query(
      `SELECT p.passenger_id, p.dni, p.name, p.age, p.country,
      bp.boarding_pass_id, bp.purchase_id, bp.seat_type_id, bp.seat_id
      FROM passenger p
      JOIN boarding_pass bp ON bp.passenger_id = p.passenger_id
      WHERE bp.flight_id = ?`,
      id
    );

    // Se convierte las claves del objeto de cada pasajero de snake_case a camelCase
    const camelCasePassengers = passengers.map((passenger) => {
      const camelCasePassenger = {};
      for (const [key, value] of Object.entries(passenger)) {
        camelCasePassenger[convertSnakeToCamel(key)] = value;
      }
      return camelCasePassenger;
    });

    // Se crea un objeto con la información del vuelo y sus pasajeros
    const flightInfo = {
      flightId: flight.flight_id,
      takeoffDateTime: flight.takeoff_date_time,
      takeoffAirport: flight.takeoff_airport,
      landingDateTime: flight.landing_date_time,
      landingAirport: flight.landing_airport,
      airplaneId: flight.airplane_id,
      passengers: camelCasePassengers,
    };

    // Se envía la información del vuelo y sus pasajeros como respuesta
    res.status(200).json(flightInfo);
  } catch (error) {
    // En caso de error, se envía un mensaje de error genérico
    console.error(error);
    res
      .status(500)
      .json({ message: "Unable to retrieve flight information at this time" });
  }
};

// Se exporta la función getFlights como parte de un objeto para poder ser utilizada en otros módulos
export const methods = {
  getFlights,
};
