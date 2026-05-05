class Thread {
    constructor(data) {
        this.id = data.threadId;
        this.title = data.title;
        this.author = data.author;
        this.date = new Date(data.date);
        this.category = data.categoryId;
        this.posts = data.posts || [];
        this.replyCount = data.replyCount;
        this.isLocked = data.isLocked;
    }
}

module.exports = Thread;
