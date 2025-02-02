import db from "../src/db.js";
const raceCollection = db.collection("races");
import { ObjectId } from "mongodb";
import multer from "multer";
import { GridFSBucket } from "mongodb";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const bucket = new GridFSBucket(db, { bucketName: "uploads" });

export const getAllRaces = async (req, res) => {
    try {
        const race = await raceCollection.find().toArray();
        console.log("Dohvaćene utrke:", race);
        res.json(race);
    } catch (error) {
        console.error("Greška pri dohvaćanju utrka:", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const getRacesByCreatorId = async (req, res) => {
    const creatorId = req.params.creatorId;
    try {
        console.log("Trazenje po creator id", creatorId);
        const races = await raceCollection.find({ creatorId }).toArray();
        if (races.length === 0) {
            return res
                .status(404)
                .json({ message: "No races found for this creator." });
        }
        res.json(races);
    } catch (error) {

        res.status(500).json({ error: error.message });
    }
};

export const getRaceImage = async (req, res) => {
    const raceId = req.params.id;
    console.log("Race ID get image");
    try {
        const race = await raceCollection.findOne({ _id: new ObjectId(raceId) });
        if (!race || !race.imageId) {
            console.log(`Race not found or no imageId: ${raceId}`);
            return res.status(404).send("Image not found.");
        }
        const imageId = new ObjectId(race.imageId);
        const downloadStream = bucket.openDownloadStream(imageId);
        downloadStream.on("error", (err) => {
            console.error("Error retrieving image:", err.message);
            if (!res.headersSent) {
                return res.status(404).send("Image not found.");
            }
        });
        downloadStream.on("end", () => {
            console.log("Image stream ended unexpectedly.");
            if (!res.headersSent) {
                return res.status(404).send("Image not found.");
            }
        });


        downloadStream.pipe(res);
    } catch (error) {
        console.error("Error retrieving image:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ error: error.message });
        }
    }
};

//Traženje samo jedne utrke

export const getRaceById = async (req, res) => {
    const raceId = req.params.id;
    try {
        const race = await raceCollection.findOne({ _id: new ObjectId(raceId) });
        if (!race) {
            return res.status(404).json({ message: "Race not found." });
        }
        const raceData = {
            _id: race._id,
            naziv: race.naziv,
            vrsta: race.vrsta,
            datum: race.datum,
            lokacija: race.location,
            opis: race.opis,
            creatorId: race.creatorId,
            imageId: race.imageId || null,
        };
        res.json(raceData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Dodavanje nove utrke
export const newRace = async (req, res) => {
    const uploadSingle = upload.single("image");
    uploadSingle(req, res, async (err) => {
        if (err) {
            console.error("Error during image upload:", err);
            return res.status(400).json({ error: "Error uploading image" });
        }
        const { naziv, vrsta, datum, location, opis, creatorId } = req.body;
        try {
            let fileId = null;
            if (req.file) {
                console.log("File received:", req.file);
                const uploadStream = bucket.openUploadStream(req.file.originalname);
                uploadStream.end(req.file.buffer);
                fileId = uploadStream.id;
                console.log("File uploaded to GridFS with ID:", fileId);
            } else {
                console.log("No file received");
            }
            const result = await raceCollection.insertOne({
                naziv,
                vrsta,
                datum,
                location,
                opis,
                creatorId,
                imageId: fileId ? new ObjectId(fileId) : null,
            })
            res.status(201).json({
                message: "Utrka je uspješno dodana.",
                id: result.insertedId,
            });
        } catch (error) {
            console.error("Error adding race:", error);
            res.status(500).json({ error: error.message });
        }
    });
};

export const changeRace = async (req, res) => {
    const id = req.body._id;
    const raceNaziv = req.body.naziv;
    const raceVrsta = req.body.vrsta;
    const raceLocation = req.body.lokacija;
    const raceOpis = req.body.opis;
    const raceDatum = req.body.datum;
    try {
        const result = await raceCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    naziv: raceNaziv,
                    vrsta: raceVrsta,
                    location: raceLocation,
                    opis: raceOpis,
                    datum: raceDatum,
                },
            }
        );
        res.status(201).json({ message: "Utrka je uspješno updateana.", result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Brisanje samo jedne utrke
export const deleteRace = async (req, res) => {
    const raceId = req.params.id;
    try {
        const result = await raceCollection.deleteOne({
            _id: new ObjectId(raceId),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Race not found." });
        }

        res.json({ message: "Utrka je uspješno obrisana!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const raceMethods = {
    getRaceImage,
    getRacesByCreatorId,
    getAllRaces,
    getRaceById,
    newRace,
    deleteRace,
    changeRace,
};
