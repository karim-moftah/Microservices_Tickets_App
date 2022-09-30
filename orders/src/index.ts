import {app} from './app'
import mongoose, { mongo } from 'mongoose'
import {natsWrapper} from './nats-wrapper'
import {TicketCreatedListener} from './events/listeners/ticket-created-listener'
import {TicketUpdatedListener} from './events/listeners/ticket-updated-listener'
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener'
import { PaymentCreatedListener } from './events/listeners/payment-created-listener'
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
console.log("Orders start up.")
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
    new TicketCreatedListener(natsWrapper.client).listen()
    new TicketUpdatedListener(natsWrapper.client).listen()
    new ExpirationCompleteListener(natsWrapper.client).listen()
    new PaymentCreatedListener(natsWrapper.client).listen()
  });
    // detect any time that the listener are about to close the connection and be down , so we will send a shutdown request 
    natsWrapper.client.on('close' , () => {
    console.log("NATS connection closed!")
    process.exit()
    })
process.on('SIGINT', () => natsWrapper.client.close()) // interrupt signals
process.on('SIGTERM', () => natsWrapper.client.close()) // terminate signals
console.log('start listen')
// new TicketCreatedListener(natsWrapper.client).listen()
// new TicketUpdatedListener(natsWrapper.client).listen()
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
