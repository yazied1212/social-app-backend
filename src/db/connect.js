import mongoose from "mongoose";

export async function isConnected() {
  await mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("db connected");
    })
    .catch((error) => {
      console.error(error.message);
    });
}
