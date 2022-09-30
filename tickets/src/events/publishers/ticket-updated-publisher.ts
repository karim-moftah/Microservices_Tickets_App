import {Publisher , TicketUpdatedEvent , Subjects} from '@karimtickets/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}