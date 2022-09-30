import {Listener , TicketUpdatedEvent , Subjects} from '@karimtickets/common'
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import {queueGroupName} from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName
    async onMessage(data:TicketUpdatedEvent['data'] , msg:Message){
        const ticket = await Ticket.findByEvent(data)
        if(!ticket){
            throw new Error("Tcket not found")
        }
        const {title , price} = data
        ticket.set({title , price})

        await ticket.save()
        // tell nats streaming server that we proccessed the msg
        msg.ack()
    }
}