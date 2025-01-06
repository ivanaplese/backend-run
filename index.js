import express from "express";
import data from "./store.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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
            message: "Gost deleted successfully",
            competitors: competitorIndex,
        });
    } else {
        res.status(404).json({ message: "Competitor not found" });
    }
});

app.listen(port, () => {
    console.log(`Servis radi na portu ${port}`);
});