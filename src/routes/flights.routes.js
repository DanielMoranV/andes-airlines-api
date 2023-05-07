import { Router } from "express";
import { methods as flightsController } from "../controllers/flights.controller";

const router = Router();

router.get("/:id/passengers", flightsController.getFlights);

export default router;
