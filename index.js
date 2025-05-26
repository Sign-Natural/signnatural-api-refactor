import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import usersRouter from './routes/user-routes.js';

await mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));




const app = express()
app.use(express.json())
app.use(cors())

app.use(usersRouter)




const port = process.env.PORT || 4040
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})