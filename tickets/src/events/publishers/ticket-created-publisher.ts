import {Publisher , TicketCreatedEvent , Subjects} from '@karimtickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    subject: Subjects.TicketCreated = Subjects.TicketCreated
}