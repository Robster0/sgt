exports.home_input = {
    user: { name: "user", admin: true },
    LoggedIn: true,

    links: [
        { url: '/users', title: 'users', neededRole: 'admin' },
        { url: '/posts', title: 'posts', neededRole: 'normal' }
    ],
    title: 'home'
}


exports.posts_input = { 
    posts: [
        { id: 1, user: 'user-1', content: '<script>alert("alerted by user-1!")</script>' },
        { id: 2, user: 'user-2', content: '<script>alert("alerted by user-2!")</script>' },
        { id: 3, user: 'user-2', content: '<script>alert("alerted by user-3!")</script>' },
    ],
    comments: [
        {id: 1, postId: 1, user: 'user comment 1', content: "capitalized user-comment-1's comment content" },
        {id: 2, postId: 2, user: 'user comment 2', content: "capitalized user-comment-2's comment content" },
        {id: 3, postId: 2, user: 'user comment 3', content: "capitalized user-comment-3's comment content" },
        {id: 4, postId: 1, user: 'user comment 4', content: "capitalized user-comment-4's comment content" },
        {id: 5, postId: 3, user: 'user comment 5', content: "capitalized user-comment-5's comment content" },
        {id: 6, postId: 3, user: 'user comment 6', content: "capitalized user-comment-6's comment content" },
        {id: 7, postId: 3, user: 'user comment 7', content: "capitalized user-comment-7's comment content" },
        {id: 8, postId: 3, user: 'user comment 8', content: "capitalized user-comment-8's comment content" },
        {id: 9, postId: 2, user: 'user comment 9', content: "capitalized user-comment-9's comment content" },
        {id: 10, postId: 1, user: 'user comment 10', content: "capitalized user-comment-10's comment content" },
    ],
    title: 'posts'
}


exports.users_input = {
    users: [
        { id: 1, name: 'user-1', email: '       user-1@email.com        ', role: 'admin' },
        { id: 2, name: 'user-2', email: '       user-2@email.com        ', role: 'none' },
        { id: 3, name: 'user-3', email: '       user-3@email.com        ', role: 'none'  },
    ],
    title: 'users'
}