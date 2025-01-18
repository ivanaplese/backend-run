import express from "express";
import db from "../backend-run/src/db.js";
import { raceMethods } from "./controllers/raceController.js";
import { guestMethods } from "./controllers/guestController.js";
import { radniciMethods } from "./controllers/adminController.js";
import auth from "./src/auth.js";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";


const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

app.use(express.json());

// MONGO DB

// // Za utrke
// app.get("/races", raceMethods.getAllRaces);
// app.get("/races/:id", raceMethods.getRaceById);
// app.post("/races", raceMethods.newRace);
// app.delete("/races", raceMethods.deleteRace);

// // Za goste
// app.get("/guests", guestMethods.getAllGuests);
// app.get("/guests/:id", guestMethods.getGuestById);
// app.post("/guests", guestMethods.newGuest);
// app.delete("/guests", guestMethods.deleteGuest);

// // Za admine
// app.get("/radnici", radniciMethods.getAllRadnici);
// app.get("/radnici/:id", radniciMethods.getRadnikById);
// app.post("/radnici", radniciMethods.newRadnik);
// app.delete("/radnici", radniciMethods.deleteRadnik);



// registracijaaaaaaaaaaaaaaaaaaaaaaa 

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

app.listen(port, () => {
    console.log(`Servis radi na portu ${port}`);
})