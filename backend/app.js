import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import morgan from "morgan"

//? Enable Dotenv
dotenv.config()

//? Initial Configs
const PORT = process.env.PORT || 5000;


const app = express();
//? Enable incoming JSON data
app.use(express.json());

//? Enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders:['Content-type', "Authorization"],
}));

//? Authenticate DB
app.use(morgan('dev'));

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('DB Conected succesfully!'))
    .catch((err) => console.log('Failed to connect to DB:', err));

//? Sync Database Models


//? Initialize my models relations


//? Routes v1
//? root route '/'
app.get('/', (req, res) => {
    res.status(200).json({
        status: 200,
        message: 'OK!',
        routes: {
            users: ""
        }
    })
});

//? Definimos prefijo rutas

//? error midleware

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(404).json({ message: 'Internal server error'});;
});

//? not found middleware
app.use((req, res) => {
    res.status(404).json({
        message: 'Not found',
    })

});

app.listen(PORT, async(req, res) => {
    console.log(`Server running on port ${PORT}`);
})