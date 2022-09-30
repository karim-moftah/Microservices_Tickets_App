import {Publisher , ExpirationCompleteEvent , Subjects} from '@karimtickets/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
}