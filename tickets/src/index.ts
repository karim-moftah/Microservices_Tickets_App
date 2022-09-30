import {app} from './app'
import mongoose, { mongo } from 'mongoose'
import {natsWrapper} from './nats-wrapper'
import { OrderCreatedListener } from './events/listeners/order-created-listener'
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener'
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
if(!process.env.NATS_CLUSTER_ID){
    throw new Error('NATS_CLUSTER_ID must be defined')
}
if(!process.env.NATS_CLIENT_ID){
    throw new Error('NATS_CLIENT_ID must be defined')
}
if(!process.env.NATS_URL){
    throw new Error('NATS_URL must be defined')
}
try{
    //nats.connect(clusterId , clientId , url we want to connect)
 natsWrapper.connect(process.env.NATS_CLUSTER_ID , process.env.NATS_CLIENT_ID , process.env.NATS_URL)
 natsWrapper.client.on('connect', () => {
    console.log('Connected to NATS');
    new OrderCreatedListener(natsWrapper.client).listen()
    new OrderCancelledListener(natsWrapper.client).listen()
  });   
 // detect any time that the listener are about to close the connection and be down , so we will send a shutdown request 
    natsWrapper.client.on('close' , () => {
    console.log("NATS connection closed!")
    process.exit()
})
process.on('SIGINT', () => natsWrapper.client.close()) // interrupt signals
process.on('SIGTERM', () => natsWrapper.client.close()) // terminate signals
// new OrderCreatedListener(natsWrapper.client).listen()
// new OrderCancelledListener(natsWrapper.client).listen()
}catch(err){
    console.log(err)
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
