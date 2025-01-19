import mongo from "mongodb";
import db from "./db.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const guestsCollection = db.collection("users");

guestsCollection.createIndex({ email: 50 }, { unique: true });


export default {
    async registerGuest(guestData) {
        const hashedPassword = await bcrypt.hash(guestData.password, 10);
        try {
            await guestsCollection.insertOne({
                _id: new ObjectId(),
                firstName: guestData.firstName,
                lastName: guestData.lastName,
                email: guestData.email,
                password: hashedPassword,
            });
        } catch (e) {
            if (e.code === 11000) {
                throw new Error("Email already exists");
            } else {
                throw e;
            }
        }
    },
    async authenticateGuest(email, password) {
        let guestData = await guestsCollection.findOne({ email: email });
        console.log("Received data: ", email, password);
        console.log("User data from the database: ", guestData);
        if (
            guestData &&
            guestData.password &&
            (await bcrypt.compare(password, guestData.password))
        ) {
            delete guestData.password;
            let token = jwt.sign(
                { id: guestData._id },
                process.env.JWT_SECRET || "default_secret",
                {
                    algorithm: "HS256",
                    expiresIn: "1 week",
                }
            );
            return {
                token,
                email: guestData.email,
            };
        } else {
            throw new Error("Cannot authenticate");
        }
    },
    verify(req, res, next) {
        try {
            let authorization = req.headers.authorization.split(" ");
            let type = authorization[0];
            let token = authorization[1];
            if (type !== "Bearer") {
                return res.status(401).send();
            } else {
                req.jwt = jwt.verify(token, process.env.JWT_SECRET);
                return next();
            }
        } catch (e) {
            return res.status(403).send();
        }
    },
    //novo
    async changePassword(email, oldPassword, newPassword) {
        let guestData = await guestsCollection.findOne({ email: email });
        if (!guestData) {
            throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, guestData.password);
        if (!isPasswordValid) {
            throw new Error("Incorrect old password");
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await guestsCollection.updateOne(
            { email: email },
            { $set: { password: hashedNewPassword } }
        );

        return { message: "Password successfully updated" };
    }

};
