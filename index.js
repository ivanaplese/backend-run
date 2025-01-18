import express from "express";
import db from "../backend-run/src/db.js";
import { raceMethods } from "./controllers/raceController.js";
import { guestMethods } from "./controllers/guestController.js";
import axios from "axios";


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// MONGO DB

// Za utrke
app.get("/races", raceMethods.getAllRaces);
app.get("/races/:id", raceMethods.getRaceById);
app.post("/races", raceMethods.newRace);
app.delete("/races", raceMethods.deleteRace);

// Za goste
app.get("/guests", guestMethods.getAllGuests);
app.get("/guests/:id", guestMethods.getGuestById);
app.post("/guests", guestMethods.newGuest);
app.delete("/guests", guestMethods.deleteGuest);

app.listen(port, () => {
    console.log(`Servis radi na portu ${port}`);
})