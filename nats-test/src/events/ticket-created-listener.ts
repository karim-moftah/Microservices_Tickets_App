import nats , {Message} from 'node-nats-streaming'
import {Listener} from './base-listener'
import {TicketCreatedEvent} from './ticket-created-event'
import {Subjects} from './subjects'

export class TicketCreatedListener extends Listener<TicketCreatedEvent>{
    subject: Subjects.TicketCreated = Subjects.TicketCreated  // subject here must be exactly like subject in ticket-created-event
    queueGroupName = 'payments-service'
    onMessage(data: TicketCreatedEvent['data'] , msg: Message){ //enforce type checking on properties trying to access on data argument 
        console.log(`Event Data : ${JSON.stringify(data)}`)
        console.log(data.id)
        console.log(data.title)
        console.log(data.price)
        msg.ack()
    }
}