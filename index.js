import express from "express";
import { connectToMongoDB } from "./src/db.js";
import data from "./store.js";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Povezivanje s MongoDB
await connectToMongoDB();

app.get("/admin", (req, res) => {
    res.json(data.admin);
});

app.get("/admin/:id", (req, res) => {
    res.json(data.admin.data.find((x) => x.id == req.params.id));
});

app.post("/admin", (req, res) => {
    const newAdmin = req.body;
    data.admin.data.push(newAdmin);
    res
        .status(201)
        .json({ message: "Novi admin je uspješno kreiran", admin: newAdmin });
});

app.delete("/admin/:id", (req, res) => {
    const id = req.params.id;
    const adminIndex = data.admin.data.findIndex((x) => x.id == id);
    if (adminIndex !== -1) {
        const deletedAdmin = data.admin.data.splice(adminIndex, 1)[0];
        res.json({ message: "Admin deleted successfully", admin: deletedAdmin });
    } else {
        res.status(404).json({ message: "Admin not found" });
    }
});

app.get("/competitor", (req, res) => {
    res.json(data.competitors);
});
app.get("/competitor/:id", (req, res) => {
    res.json(data.competitors.data.find((x) => x.id == req.params.id));
});
app.post("/competitor", (req, res) => {
    const newCompetitor = req.body;
    data.competitors.data.push(newCompetitor);
    res.status(201).json({
        message: "Novi natjecatelj je uspiješno kreiran",
        competitors: newCompetitor,
    });
});
app.delete("/competitor/:id", (req, res) => {
    const id = req.params.id;
    const competitorIndex = data.competitors.data.findIndex((x) => x.id == id);
    if (competitorIndex !== -1) {
        const deletedCompetitor = data.competitors.data.splice(
            competitorIndex,
            1
        )[0];
        res.json({
            message: "Competitor deleted successfully",
            competitors: competitorIndex,
        });
    } else {
        res.status(404).json({ message: "Competitor not found" });
    }
});

app.get("/races", (req, res) => {
    res.json(data.races);
});
app.get("/races/:id", (req, res) => {
    const id = req.params.id;
    const result = data.races.find((x) => x.id == id);
    res.json(result);
});
app.post("/races", (req, res) => {
    const newRaces = req.body;
    data.races.push(newRaces);
    res.status(201).json({
        message: "Nova utrka je uspiješno kreirana",
        races: newRaces,
    });
});
app.delete("/races/:id", (req, res) => {
    const id = req.params.id;
    const racesIndex = data.races.findIndex((x) => x.id == id);
    if (racesIndex !== -1) {
        const deletedRaces = data.races.splice(racesIndex, 1)[0];
        res.json({
            message: "Race deleted successfully",
            races: racesIndex,
        });
    } else {
        res.status(404).json({ message: "Race not found" });
    }
});
app.patch("/races/:id", (req, res) => {
    const id = req.params.id;
    const updateData = req.body;
    const racesIndex = data.races.findIndex((x) => x.id == id);
    if (racesIndex !== -1) {
        data.races[racesIndex] = {
            ...data.races[racesIndex],
            ...updateData,
        };
        res.json({
            message: "Race updated successfully",
            races: data.races[racesIndex],
        });
    } else {
        res.status(404).json({ message: "Race not found" });
    }
});


app.listen(port, () => {
    console.log(`Servis radi na portu ${port}`);
});



