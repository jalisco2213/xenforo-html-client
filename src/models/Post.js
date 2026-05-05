class Post {
    constructor(data) {
        this.id = data.postId;
        this.author = data.creator;
        this.content = data.htmlContent;
        this.date = data.createDate;
        this.thread = data.thread;
        this.textContent = data.textContent;
    }
}

module.exports = Post;
