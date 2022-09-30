import  Queue  from "bull";
import {natsWrapper} from '../nats-wrapper'
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher'

// data that will store in the job object
interface Payload {
    orderId: string
}
// expirationQueue allows us to publish a job and process it
// when a new job is created , typescript will use Payload to put, recieve the right information to the queue
const expirationQueue = new Queue<Payload>('order:expiration', {
    // connect expirationQueue to redis
    redis:{
        host: process.env.REDIS_HOST
    }
})

// job is similar to msg in NATS 
// job not the actual data , it's an object that wrappes a data and has info about the job itself like (date , jobId)
// data that will send inside a job (orderId) is one of its properties
expirationQueue.process(async (job) =>{
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId
    })
})

export {expirationQueue}