import {Listener , OrderCreatedEvent , Subjects} from '@karimtickets/common'
import { Message } from 'node-nats-streaming';
import {queueGroupName} from './queue-group-name'
import { expirationQueue } from '../../queues/expiration-queue';


export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName
    async onMessage(data:OrderCreatedEvent['data'] , msg:Message){
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime()
        console.log("waiting this milliseconds to process " , delay)
        await expirationQueue.add({
            orderId: data.id
        },{ // delay before we recieve this job back from redis to be processed in expirationQueue.process()
            delay
        })
        msg.ack()

    }
}