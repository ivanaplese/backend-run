import express from "express";
import db from "../backend-run/src/db.js";
import { raceMethods } from "./controllers/raceController.js";
import { guestMethods } from "./controllers/guestController.js";
import { radniciMethods } from "./controllers/adminController.js";
import { favoriteMethods } from "./controllers/favoritesController.js";
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
app.post("/authAdmin", async (req, res) => {
    let adminData = req.body;
    try {
        const result = await auth.authenticateAdmin(
            adminData.email,
            adminData.password
        );
        return res.json(result);
        return res.json({ token: result.token });
    } catch (error) {
        return res.status(403).json({ error: error.message });
    }
});
app.put("/passAdmin", async (req, res) => {
    let adminData = req.body;
    try {
        let result = await auth.updatePasswordAdmin(adminData);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.put("/passGuest", async (req, res) => {
    let guestData = req.body;
    try {
        let result = await auth.updatePasswordGuest(guestData);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
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
app.post("/admins", async (req, res) => {
    let adminData = req.body;
    try {
        let result = await auth.registerAdmin(adminData);
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
app.put("/race", raceMethods.changeRace);
app.get("/race/slika/:id/image", raceMethods.getRaceImage);


/*Gosti*/
app.get("/guest", guestMethods.getAllGuests);
app.get("/guest/:id", guestMethods.getGuestById);
app.get("/guest/email/:email", guestMethods.getGuestByEmail);

app.delete("/guest/:id", guestMethods.deleteGuest);
app.put("/guest", guestMethods.changeEmail);

/*Admin*/
app.get("/admin", radniciMethods.getAllRadnici);
app.get("/admin/:id", radniciMethods.getRadnikById);
app.get("/admin/email/:email", radniciMethods.getRadnikByEmail);
app.delete("/admin/:id", radniciMethods.deleteRadnik);
app.put("/admin", radniciMethods.changeEmail);

/*Favoriti*/
app.get("/favorit", favoriteMethods.getAllFavorites);
app.get("/favorit/:id", favoriteMethods.getFavoritesById);
app.get("/favorit/race/:id", favoriteMethods.getFavoriteByRaceId);
app.get("/favorit/user/:id", favoriteMethods.getFavoriteByUserId);
app.post("/favorit", favoriteMethods.newFavorite);
app.delete("/favorit/:id", favoriteMethods.deleteFavorite);

app.listen(port, () => {
    console.log(`Servis radi na portu ${port}`);
});