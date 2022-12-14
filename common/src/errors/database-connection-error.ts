import {CustomError} from './custom-error'

export class DatabaseConnectionError extends CustomError{
    reason = 'Error Connecting to database'
    statusCode = 500
    constructor (){
        super('Error Connecting to db');

        //Only because we are extending a built in class
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }

    serializeErrors(){
        return [{message : this.reason}]
    }

}
