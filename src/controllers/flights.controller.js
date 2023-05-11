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
    // Asientos ocupados del vuelo
    function getOccupiedSeats(passengers) {
      const occupiedSeats = passengers
        .filter((passenger) => passenger.seat_id !== null)
        .map((passenger) => ({
          seatId: passenger.seat_id,
          seatTypeId: passenger.seat_type_id,
        }));

      return occupiedSeats;
    }
    async function getAvailableSeats(passengers, airplaneId) {
      // Obtener los asientos ocupados del vuelo
      const occupiedSeats = getOccupiedSeats(passengers);

      // Obtener el total de asientos del avión
      const totalSeats = await connection.query(
        `SELECT * FROM seat WHERE airplane_id = ?`,
        airplaneId
      );

      // Obtener los IDs de los asientos ocupados
      const occupiedSeatIds = occupiedSeats.map(
        (occupiedSeat) => occupiedSeat.seatId
      );
      // Obtener los asientos disponibles
      const availableSeats = totalSeats.filter(
        (seat) => !occupiedSeatIds.includes(seat.seat_id)
      );

      return availableSeats;
    }
    // asientos dispobibles
    const availableSeats = await getAvailableSeats(passengers, id);

    async function assignSeats(passengers, availableSeats) {
      // Disposiciones de asientos

      const seatingArrangement = {
        1: {
          1: {
            row: [1, 2, 3, 4],
            column: ["A", "B", "F", "G"],
          },
          2: {
            row: [9, 10, 11, 12, 13, 14, 15],
            column: ["A", "B", "C", "E", "F", "G"],
          },
          3: {
            row: [
              19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
            ],
            column: ["A", "B", "C", "E", "F", "G"],
          },
        },
        2: {
          1: {
            row: [1, 2, 3, 4, 5],
            column: ["A", "E", "I"],
          },
          2: {
            row: [9, 10, 11, 12, 13, 14],
            column: ["A", "B", "D", "E", "F", "H", "I"],
          },
          3: {
            row: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
            column: ["A", "B", "D", "E", "F", "H", "I"],
          },
        },
      };

      // Agrupar los pasajeros por compra
      const passengersByPurchase = passengers.reduce((acc, passenger) => {
        if (!acc[passenger.purchase_id]) {
          acc[passenger.purchase_id] = [];
        }
        acc[passenger.purchase_id].push(passenger);
        return acc;
      }, {});

      // Asignar asientos por compra
      for (const purchaseId in passengersByPurchase) {
        const purchasePassengers = passengersByPurchase[purchaseId];

        // Ordenar pasajeros dentro de cada compra por edad
        const sortedPassengers = purchasePassengers.sort(
          (a, b) => b.age - a.age
        );
        for (const passenger of sortedPassengers) {
          if (passenger.seat_id == null) {
            // Obtener los asientos disponibles del tipo correspondiente
            const availableSeatsOfType = availableSeats.filter(
              (seat) => seat.seat_type_id === passenger.seat_type_id
            );

            // Verificar si hay asientos disponibles del tipo correspondiente
            if (availableSeatsOfType.length > 0) {
              let chosenSeat = null;

              // Buscar un asiento disponible que cumpla con las restricciones
              for (const seat of availableSeatsOfType) {
                if (
                  seat.seat_type_id === passenger.seat_type_id &&
                  (seat.seat_type_id !== 3 || passenger.seat_type_id === 3) &&
                  (passenger.age >= 18 ||
                    sortedPassengers.some(
                      (p) =>
                        p.age >= 18 &&
                        p.seat_id !== null &&
                        Math.abs(p.age - passenger.age) <= 1 &&
                        p.seat_id.row === seat.seat_row &&
                        seatingArrangement[seat.airplane_id][seat.seat_type_id][
                          "column"
                        ][
                          String.fromCharCode(p.seat_id.row.charCodeAt(0) + 1)
                        ] === seat.seat_column
                    ))
                ) {
                  chosenSeat = seat;
                  break;
                }
              }

              // Asignar el asiento elegido al pasajero
              if (chosenSeat !== null) {
                passenger.seat_id = chosenSeat.seat_id;
                // Eliminar el asiento asignado de los asientos disponibles
                availableSeats = availableSeats.filter(
                  (seat) => seat.seat_id !== chosenSeat.seat_id
                );
              }
            }
          }
        }
      }

      return passengers;
    }
    assignSeats(passengers, availableSeats);

    // const dataPassengers = passengers.map((passenger) => {
    //   if (passenger.seat_id == null) {
    //   }
    // console.log(passenger.seat_id);
    // });
    // console.log(availableSeats);
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
