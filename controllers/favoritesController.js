import db from "../src/db.js";
const favoriteCollection = db.collection("favorites");
import { ObjectId } from "mongodb";
export const getAllFavorites = async (req, res) => {
    try {
        const favorite = await favoriteCollection.find().toArray();
        console.log("Dohvaćeni parovi favorita", favorite); // Dodano za debug
        res.json(favorite);
    } catch (error) {
        console.error("Greška pri dohvaćanju utrka:", error.message);
        res.status(500).json({ error: error.message });
    }
};
export const getFavoritesById = async (req, res) => {
    const favoriteId = req.params.id;
    console.log(favoriteId);
    try {
        const favorite = await favoriteCollection.findOne({
            _id: new ObjectId(favoriteId),
        });
        if (!favorite) {
            return res.status(404).json({ message: "odabran favorit nije pronađen" });
        }
        res.json(favorite);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getFavoriteByRaceId = async (req, res) => {
    const favRaceId = req.params.id;
    try {
        const favorite = await favoriteCollection.findOne({
            raceId: favRaceId,
        });
        if (!favorite) {
            return res.status(404).json({ message: "odabran favorit nije pronađen" });
        }
        res.json(favorite);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getFavoriteByUserId = async (req, res) => {
    const favUserId = req.params.id;
    try {
        const favorite = await favoriteCollection.findOne({
            userId: favUserId,
        });
        if (!favorite) {
            return res.status(404).json({ message: "odabran favorit nije pronađen" });
        }
        res.json(favorite);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const newFavorite = async (req, res) => {
    const { raceId, userId } = req.body;
    try {
        const result = await favoriteCollection.insertOne({ raceId, userId });
        res
            .status(201)
            .json({ message: "Favorit je uspješno dodan.", id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const deleteFavorite = async (req, res) => {
    const favoriteId = req.params.id;
    try {
        const result = await guestsCollection.deleteOne({
            id: guestId,
        });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Favorit not found." });
        }
        res.json({ message: "Favorit je uspješno obrisan!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const favoriteMethods = {
    getAllFavorites,
    getFavoriteByRaceId,
    getFavoriteByUserId,
    getFavoritesById,
    newFavorite,
    deleteFavorite,
};