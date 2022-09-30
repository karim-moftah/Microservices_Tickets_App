import mongoose, { mongo } from 'mongoose'
import { OrderStatus} from '@karimtickets/common'
import {TicketDoc} from './ticket'
import {updateIfCurrentPlugin} from 'mongoose-update-if-current'

export {OrderStatus} // to be imported in tickets.ts file
// An interface that discibes the properties that are required to create a new order

interface OrderAttrs{
    userId : string,
    status: OrderStatus,
    expiresAt: Date,
    ticket: TicketDoc

}

// An interface that discibes the properties that a order document has
// to have possibility to add addition properties in the future
interface OrderDoc extends mongoose.Document{
    userId : string,
    status: OrderStatus,
    expiresAt: Date,
    ticket: TicketDoc,
    version:number,
}


// An interface that discibes the properties that a order model has
interface OrderModel extends mongoose.Model<OrderDoc>{
    build(attrs :  OrderAttrs) : OrderDoc
}


const orderSchema = new mongoose.Schema(
    {

        userId : {
            type: String,
            required : true
        },
        status : {
            type: String,
            required : true,
            enum: Object.values(OrderStatus),
            default: OrderStatus.Created
        },
        expiresAt:{
            type: mongoose.Schema.Types.Date,
            
        },
        ticket:{ //refernce to get ticket Id
            type: mongoose.Schema.Types.ObjectId,
            ref:'Ticket'
        }
    },
    
    {
        toJSON: {
            transform(doc , ret){
                ret.id = ret._id
                delete ret._id
                delete ret.__v
            }
        }
        
    })

orderSchema.set('versionKey' , 'version')
orderSchema.plugin(updateIfCurrentPlugin)

// check validation on properties to create a new record
orderSchema.statics.build = (attrs : OrderAttrs) =>{
    return new Order(attrs);
}

const Order = mongoose.model<OrderDoc , OrderModel>('Order' ,orderSchema);


export { Order };
