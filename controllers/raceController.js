import db from "../backend-run/src/db.js";
const raceCollection = db.collection("races");

// Ispisivanje svih utrka
export const getAllRaces = async (req, res) => {
    try {
        const race = await raceCollection.find().toArray();
        console.log("Dohvaćene utrke:", race); // Dodano za debug
        res.json(race);
    } catch (error) {
        console.error("Greška pri dohvaćanju utrka:", error.message);
        res.status(500).json({ error: error.message });
    }
};

//Traženje samo jedne utrke
export const getRaceById = async (req, res) => {
    const raceId = req.params.id;
    try {
        const race = await raceCollection.findOne({ id: raceId });
        if (!race) {
            return res
                .status(404)
                .json({ message: "Odabrana utrka nije pronađena." });
        }
        res.json(race);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Dodavanje nove utrke
export const newRace = async (req, res) => {
    const { id, naziv, vrsta } = req.body;
    try {
        const result = await raceCollection.insertOne({
            id,
            naziv,
            vrsta,
        });
        res
            .status(201)
            .json({ message: "Utrka je uspješno dodana.", id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const raceMethods = {
    getAllRaces,
    getRaceById,
    newRace,
};