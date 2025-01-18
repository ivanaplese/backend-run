import mongo from "mongodb";
import db from "./db.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

const guestsCollection = db.collection("users");


export default {
    async registerGuest(guestData) {
        const hashedPassword = await bcrypt.hash(guestData.password, 10);
        await guestsCollection.insertOne({
            _id: new ObjectId(),
            firstName: guestData.firstName,
            lastName: guestData.lastName,
            email: guestData.email,
            password: hashedPassword,
        });
    },
};