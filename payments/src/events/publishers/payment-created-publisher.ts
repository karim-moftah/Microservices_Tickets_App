import {Publisher , PaymentCreatedEvent , Subjects} from '@karimtickets/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}