import mongoose from 'mongoose'
import {Order , OrderStatus} from './order'
import {updateIfCurrentPlugin} from 'mongoose-update-if-current'
// An interface that discibes the properties that are required to create a new ticket

interface TicketAttrs{
    id: string,
    title : string,
    price: number,


}

// An interface that discibes the properties that a ticket document has
// to have possibility to add addition properties in the future
export interface TicketDoc extends mongoose.Document{
    title : string,
    price: number,
    version:number,
    isReserved() : Promise<boolean>

}


// An interface that discibes the properties that a ticket model has
interface TicketModel extends mongoose.Model<TicketDoc>{
    build(attrs :  TicketAttrs) : TicketDoc;
    findByEvent(event: {id: string , version:number}): Promise<TicketDoc | null>//  find by id and previos version
}


const ticketSchema = new mongoose.Schema(
    {

        title : {
            type: String,
            required : true
        },
        price : {
            type: Number,
            required : true
        },

    },
    
    {
        toJSON: {
            transform(doc , ret){
                ret.id = ret._id
                delete ret._id
            }
        }
        
    })

ticketSchema.set('versionKey' , 'version')
ticketSchema.plugin(updateIfCurrentPlugin)
ticketSchema.statics.findByEvent = (event: {id: string , version:number}) =>{
    return Ticket.findOne({
        _id:event.id,
        version:event.version -1
    });
};
// check validation on properties to create a new record
ticketSchema.statics.build = (attrs : TicketAttrs) =>{
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price
    });
}
    // run the query to look at all orders. find an order where the ticket is the ticket we just found and the order status is not cancelled
    // if we find the order from that means the ticket is reserved
ticketSchema.methods.isReserved = async function () {
    // this === the ticket document that we just callled 'isReserved'
    const existingOrder = await Order.findOne({
        ticket:this,
        status:{
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }

    })
    return !!existingOrder// if null flip to true then to false, if is exist flip to false then to true
}
const Ticket = mongoose.model<TicketDoc , TicketModel>('Ticket' ,ticketSchema);


export { Ticket };
