class Member {
    constructor(data) {
        this.id = data.userId;
        this.username = data.username;
        this.role = data.role;
        this.roles = data.roles,
        this.messageCount = data.messageCount;
        this.reactionScore = data.reactionScore;
        this.trophyPoints = data.trophyPoints;
        this.lastActivity = data.lastActivity;
    }
}

module.exports = Member;
