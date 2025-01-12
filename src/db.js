import { MongoClient } from "mongodb";

const connectionString =
    "mongodb+srv://test:test@clustertest.ndyns6h.mongodb.net/?retryWrites=true&w=majority";

let db;

const connectToMongoDB = async () => {
    try {
        console.log("Trying to establish connection to MongoDB...");
        const client = new MongoClient(connectionString);
        const conn = await client.connect();
        db = conn.db("run");
        console.log("Successfully connected to MongoDB.");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

export { connectToMongoDB, db };



