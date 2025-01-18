import mongo from "mongodb";
import db from "./db.js";
import { ObjectId } from "mongodb";
const guestsCollection = db.collection("users");
export default {
    async registerGuest(guestData) {
        await guestsCollection.insertOne({
            _id: new ObjectId(),
            firstName: guestData.firstName,
            lastName: guestData.lastName,
            email: guestData.email,
            password: guestData.password,
        });
    },
};