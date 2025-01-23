import mongo from "mongodb";
import db from "./db.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const guestsCollection = db.collection("users");
const workerCollection = db.collection("worker");

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
                birthDate: guestData.birthDate,
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
    async updatePasswordAdmin(adminData) {
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        try {
            await workerCollection.updateOne(
                { _id: new ObjectId(adminData._id) },
                {
                    $set: {
                        password: hashedPassword,
                    },
                }
            );
            console.log("Lozinka promjenjena");
        } catch (e) {
            if (e.code === 11000) {
                throw new Error("Korisnik ne postoji");
            } else {
                throw e;
            }
        }
    },
    async updatePasswordGuest(guestData) {
        const hashedPassword = await bcrypt.hash(guestData.password, 10);
        try {
            await guestsCollection.updateOne(
                { _id: new ObjectId(guestData._id) },
                {
                    $set: {
                        password: hashedPassword,
                    },
                }
            );
        } catch (e) {
            if (e.code === 11000) {
                throw new Error("Korisnik ne postoji");
            } else {
                throw e;
            }
        }
    },
    async registerAdmin(adminData) {
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        try {
            await workerCollection.insertOne({
                _id: new ObjectId(),
                username: adminData.username,
                firstName: adminData.firstName,
                lastName: adminData.lastName,
                email: adminData.email,
                birthDate: adminData.birthDate,
                email: adminData.email,
                role: adminData.role,
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
    async authenticateAdmin(email, password) {
        let adminData = await workerCollection.findOne({ email: email });
        console.log("Received data: ", email, password);
        console.log("User data from the database: ", adminData);
        if (
            adminData &&
            adminData.password &&
            (await bcrypt.compare(password, adminData.password))
        ) {
            delete adminData.password;
            let token = jwt.sign(
                { id: adminData._id },
                process.env.JWT_SECRET || "default_secret",
                {
                    algorithm: "HS256",
                    expiresIn: "1 week",
                }
            );
            return {
                token,
                email: adminData.email,
            };
        } else {
            throw new Error("Cannot authenticate");
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
