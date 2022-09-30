export const natsWrapper = {
    client: {   // fake client for testing
        publish: jest.fn()
        .mockImplementation(
            (subject: string , data: string , callback: () => void) =>{
                callback()
            }
        )
        

    }
}