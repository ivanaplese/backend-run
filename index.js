import express from "express";
import db from "../backend-run/src/db.js";
import { raceMethods } from "./controllers/raceController.js";
import axios from "axios";


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// MONGO DB
app.get("/races", raceMethods.getAllRaces);
app.get("/races/:id", raceMethods.getRaceById);
app.post("/races", raceMethods.newRace);

app.listen(port, () => {
    console.log(`Servis radi na portu ${port}`);
})