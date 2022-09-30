import {Publisher , OrderCancelledEvent , Subjects} from '@karimtickets/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}