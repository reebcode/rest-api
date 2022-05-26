/* StatusError is a class that extends the Error class and adds a statusCode property to it. */
export class StatusError extends Error {
    statusCode: number

    constructor(statusCode: number, message: string) {
        super(message)

        Object.setPrototypeOf(this, new.target.prototype)
        this.name = Error.name
        this.statusCode = statusCode
        Error.captureStackTrace(this)
    }
}
