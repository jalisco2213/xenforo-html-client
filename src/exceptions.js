class IncorrectLoginData extends Error {
    constructor(message) {
        super(message);
        this.name = 'IncorrectLoginData';
    }
}

class ThisIsYouError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ThisIsYouError';
    }
}

module.exports = {
    IncorrectLoginData,
    ThisIsYouError
};
