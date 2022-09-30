import nats from 'node-nats-streaming'
import {randomBytes} from 'crypto'
import {TicketCreatedListener} from './events/ticket-created-listener'
console.clear()
const stan = nats.connect('ticketing' , randomBytes(4).toString('hex') , {
    url: 'http://localhost:4222'
})


stan.on('connect' , ()=>{
    console.log("listener connected to nats")

    // detect any time that the listener are about to close the connection and be down , so we will send a shutdown request 
    stan.on('close' , () => {
        console.log("NATS connection closed!")
        process.exit()
    })
    new TicketCreatedListener(stan).listen()
})

// two handlers to watch for any close process (ctrl + c OR manually restart : rs)
// watch for interrupt or terminate signals : signals that send to the process any time tsc-node-dev needs to restart a program or with (CTRL + c)
// cause the client to close down successfully then go to stan.on('close')
process.on('SIGINT', () => stan.close()) // interrupt signals
process.on('SIGTERM', () => stan.close()) // terminate signals



