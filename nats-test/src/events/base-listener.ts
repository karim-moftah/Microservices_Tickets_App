import nats , {Message , Stan} from 'node-nats-streaming'
import { Subjects } from './subjects';

interface Event{
    subject: Subjects
    data: any
}                               // when we use listener , we will provide custom type <....>
export abstract class Listener<T extends Event> {

    private client: Stan;
    abstract subject: T['subject'];   // name of channel this listener is going to listen
    abstract queueGroupName: string;
    abstract onMessage(data: T['data'] , msg: Message) :void; //function to run when a msg recieved
    protected ackWait = 5 * 1000; 
    constructor(client : Stan) {
        this.client = client
    }

    subscriptionOptions(){
        return this.client.subscriptionOptions().setManualAckMode(true).setDeliverAllAvailable().setAckWait(this.ackWait).setDurableName(this.queueGroupName)
    }

    listen(){   // set up the subscription
         // object we will listen to and recieve data througth subscription  subscribe(channel , queue group , options)
        const subscription = this.client.subscribe(this.subject , this.queueGroupName , this.subscriptionOptions())
        
        subscription.on('message' , (msg : Message) => {
        console.log(`Message Received : ${this.subject} / ${this.queueGroupName}`)
        const parsedData = this.parseMessage(msg)
        //console.log(`from base listener parsedData: ${ parsedData}`)
        this.onMessage(parsedData , msg)
       
    })
    }
    parseMessage(msg: Message){
        const data = msg.getData()
        if(typeof data === 'string'){
          return JSON.parse(data)
           //console.log(`from base listener : ${ JSON.parse(data).title}`)
        }
        else{
            return JSON.parse(data.toString('utf-8')) // parse Buffer
        }
        
    }
}
