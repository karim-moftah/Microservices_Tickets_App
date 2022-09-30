import {app} from './app'
import mongoose, { mongo } from 'mongoose'

// const start =async () => {
//     try{
//     await mongoose.connect('mongodb://auth-mongo-srv:27017/auth')

//     console.log('Connected to mongo DB')
//     }catch(err){
//         console.error(err);
//     }

//     app.listen(3000, ()=>{
//         console.log('Listening on 3000');
//     });
// }

// start();

if(!process.env.JWT_KEY){
    throw new Error('JWT_KET must be defined')
}
if(!process.env.MONGO_URI){
    throw new Error('MONGO_URI must be defined')
}
mongoose
    .connect(process.env.MONGO_URI, {
        retryWrites: true,
        w: 'majority',
    })
    .then(() => {
        console.log('MongoDB connected successfully.');
        app.listen(3000, ()=>{
            console.log('Listening on 3000');
        });
    })
    .catch((error) => console.error(error));