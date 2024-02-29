import { ErrorCodes } from "./errorCode.js"

export class ParamError extends Error {
    constructor(message, paramName) {
        super(message)

        Object.setPrototypeOf(this, new.target.prototype)

        this.paramName = paramName
        this.status = this.code = ErrorCodes.PARAMETER_ERROR

        Error.captureStackTrace(this)
    }
}

export class SystemError extends Error {
    constructor(message) {
        super(message)

        Object.setPrototypeOf(this, new.target.prototype)

        this.status = this.code = ErrorCodes.SYSTEM_ERROR

        Error.captureStackTrace(this)
    }
}

export class NotFoundError extends Error {
    constructor(message) {
        super(message)

        Object.setPrototypeOf(this, new.target.prototype)
        this.code = ErrorCodes.NOT_FOUND

        Error.captureStackTrace(this)
    }
}

export class ExistDataError extends Error {
    constructor(message) {
        super(message)

        Object.setPrototypeOf(this, new.target.prototype)
        this.code = ErrorCodes.EXIST_DATA

        Error.captureStackTrace(this)
    }
}

export class AuthenticationError extends Error {
    constructor(message) {
        super(message)

        Object.setPrototypeOf(this, new.target.prototype)
        this.status = this.code = ErrorCodes.AUTHENTICATION_ERROR

        Error.captureStackTrace(this)
    }
}

export class PermissionError extends Error {
    constructor(message, paramName) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);
        this.paramName = paramName;
        this.status = this.errorCode = ErrorCodes.PERMISSION_ERROR;
        Error.captureStackTrace(this);
    }
}

export class UploadError extends Error {
    constructor(message) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);
        this.errorCode = ErrorCodes.UPLOAD_ERROR;
        Error.captureStackTrace(this);
    }
}