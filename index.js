import express from "express";
import db from "../backend-run/src/db.js";
import { raceMethods } from "./controllers/raceController.js";
import { guestMethods } from "./controllers/guestController.js";
import { radniciMethods } from "./controllers/adminController.js";
//import data from "./store.js";
import auth from "./src/auth.js";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";


const app = express();
const port = process.env.PORT || 3001;
app.use(cors());

app.use(express.json());

dotenv.config();
app.get("/tajna", [auth.verify], (req, res) => {
    res.json({ message: "Ovo je tajna " + req.jwt.email });
});
app.get("/tajna", (res, req) => {
    res.json({ message: "Tajna" + req.jwt.email });
});

app.post("/auth", async (req, res) => {
    let guestData = req.body;

    try {
        const result = await auth.authenticateGuest(
            guestData.email,
            guestData.password
        );
        return res.json(result);
        return res.json({ token: result.token });
    } catch (error) {
        return res.status(403).json({ error: error.message });
    }
});
app.post("/guests", async (req, res) => {
    let guestData = req.body;
    try {
        let result = await auth.registerGuest(guestData);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/*Utrke*/
app.get("/race", raceMethods.getAllRaces);
app.get("/race/:id", raceMethods.getRaceById);
app.post("/race", raceMethods.newRace);
app.delete("/race/:id", raceMethods.deleteRace);
/*Gosti*/
app.get("/guest", guestMethods.getAllGuests);
app.get("/guest/:id", guestMethods.getGuestById);
app.post("/guest", guestMethods.newGuest);
app.delete("/guest/:id", guestMethods.deleteGuest);
/*Admin*/
app.get("/admin", radniciMethods.getAllRadnici);
app.get("/admin/:id", radniciMethods.getRadnikById);
app.post("/admin", raceMethods.newRace);
app.delete("/admin/:id", radniciMethods.deleteRadnik);


app.listen(port, () => {
    console.log(`Servis radi na portu ${port}`);
});