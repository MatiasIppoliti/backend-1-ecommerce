import mongoose from "mongoose";

mongoose.connect("mongodb+srv://matiasippoliti:matias123@cluster0.t5jm7n1.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("Conectado a la base de datos"))
.catch((error) => console.log(error));