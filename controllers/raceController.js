import db from "../src/db.js";
const raceCollection = db.collection("races");
import { ObjectId } from "mongodb";
import multer from "multer";
import { GridFSBucket } from "mongodb";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const bucket = new GridFSBucket(db, { bucketName: "uploads" });

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
export const getRaceImage = async (req, res) => {
    const raceId = req.params.id;
    console.log("Race ID get image");

    try {
        const race = await raceCollection.findOne({ _id: new ObjectId(raceId) });

        if (!race || !race.imageId) {
            console.log(`Race not found or no imageId: ${raceId}`);
            return res.status(404).send("Image not found.");
        }

        const imageId = new ObjectId(race.imageId); // Ensure the imageId is an ObjectId
        const downloadStream = bucket.openDownloadStream(imageId);

        downloadStream.on("error", (err) => {
            console.error("Error retrieving image:", err.message);
            // Only send response once
            if (!res.headersSent) {
                return res.status(404).send("Image not found.");
            }
        });

        downloadStream.on("end", () => {
            console.log("Image stream ended unexpectedly.");
            // Ensure response isn't sent again
            if (!res.headersSent) {
                return res.status(404).send("Image not found.");
            }
        });

        // Pipe the image to the response object
        downloadStream.pipe(res);
    } catch (error) {
        console.error("Error retrieving image:", error.message);
        // Ensure response isn't sent again
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

        if (!race || !race.imageId) {
            return res.status(404).json({ message: "Image not found." });
        }

        const downloadStream = bucket.openDownloadStream(race.imageId);
        res.set("Content-Type", "image/jpeg");
        downloadStream.pipe(res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Dodavanje nove utrke
export const newRace = async (req, res) => {
    const uploadSingle = upload.single("image"); // Ključ "image" mora odgovarati onom na frontendu

    uploadSingle(req, res, async (err) => {
        if (err) {
            console.error("Error during image upload:", err);
            return res.status(400).json({ error: "Error uploading image" });
        }

        const { naziv, vrsta, datum, location, opis } = req.body;

        try {
            let fileId = null;

            // Debug: provjera primljene datoteke
            if (req.file) {
                console.log("File received:", req.file);

                const uploadStream = bucket.openUploadStream(req.file.originalname);
                uploadStream.end(req.file.buffer);
                fileId = uploadStream.id; // Sprema ID slike
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
                imageId: fileId, // Spremamo ID slike (može biti `null`)
            });

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
    try {
        const result = await raceCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    naziv: raceNaziv,
                    vrsta: raceVrsta,
                    location: raceLocation,
                    opis: raceOpis,
                },
            }
        );
        res.status(201).json({ message: "Utrka je uspješno updatana.", result });
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
    getAllRaces,
    getRaceById,
    newRace,
    deleteRace,
    changeRace,
};