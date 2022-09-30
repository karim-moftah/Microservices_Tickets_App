import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

// An interface that discibes the properties that are required to create a new user

interface TicketAttrs{
    title : string,
    price: number,
    userId: string
}

// An interface that discibes the properties that a user document has
// to have possibility to add addition properties in the future
interface TicketDoc extends mongoose.Document{
    title : string,
    price: number,
    userId: string,
    version:number,
    orderId?:string,
}


// An interface that discibes the properties that a user model has
interface TicketModel extends mongoose.Model<TicketDoc>{
    build(attrs :  TicketAttrs) : TicketDoc
}


const TicketSchema = new mongoose.Schema(
    {

        title : {
            type: String,
            required : true
        },
        price : {
            type: Number,
            required : true
        },
        userId:{
            type: String,
            required : true
        },
        orderId:{
            type:String,

        }
    },
    
    {
        toJSON: {
            transform(doc , ret){
                ret.id = ret._id
                delete ret._id
            }
        }
        
    })



TicketSchema.set('versionKey' , 'version')
TicketSchema.plugin(updateIfCurrentPlugin)
// check validation on properties to create a new record
TicketSchema.statics.build = (attrs : TicketAttrs) =>{
    return new Ticket(attrs);
}

const Ticket = mongoose.model<TicketDoc , TicketModel>('Ticket' ,TicketSchema);


export { Ticket };
