import express from "express";
import morgan from "morgan";
//Routes
import flightsRoutes from "./routes/flights.routes";

const dotenv = require("dotenv");

// Cargar los datos de acceso a la base de datos desde un archivo .env
dotenv.config();

// Cargar la configuración de la aplicación desde un archivo config.js
const config = require("./config");

const app = express();

//Settings
app.set("port", process.env.PORT || 3000);
app.set("json spaces", 2);

//Middleware
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Routes
app.use("/flights", flightsRoutes);

export default app;
