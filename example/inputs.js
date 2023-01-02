const home_input = {
    user: { name: "user", admin: true },
    LoggedIn: true,

    links: [
        { url: '/users', title: 'users', neededRole: 'admin' },
        { url: '/posts', title: 'posts', neededRole: 'normal' }
    ],
    title: 'home'
}


const posts_input = { 
    posts: [
        { id: 1, user: 'user-1', content: 'content-1' },
        { id: 2, user: 'user-2', content: 'content-2' },
        { id: 3, user: 'user-2', content: 'content-3' },
    ],
    comments: [
        {id: 1, postId: 1, user: '   user-comment-1   ', content: '<script>alert("alerted!")</script>' },
        {id: 2, postId: 2, user: '   user-comment-2   ', content: '<script>alert("alerted!")</script>' },
        {id: 3, postId: 2, user: '   user-comment-3   ', content: '<script>alert("alerted!")</script>' },
        {id: 4, postId: 1, user: '   user-comment-4   ', content: '<script>alert("alerted!")</script>' },
        {id: 5, postId: 3, user: '   user-comment-5   ', content: '<script>alert("alerted!")</script>' },
        {id: 6, postId: 3, user: '   user-comment-6   ', content: '<script>alert("alerted!")</script>' },
        {id: 7, postId: 3, user: '   user-comment-7   ', content: '<script>alert("alerted!")</script>' },
        {id: 8, postId: 3, user: '   user-comment-8   ', content: '<script>alert("alerted!")</script>' },
        {id: 9, postId: 2, user: '   user-comment-9   ', content: '<script>alert("alerted!")</script>' },
        {id: 10, postId: 1, user: '   user-comment-10   ', content: '<script>alert("alerted!")</script>' },
    ],
    title: 'posts'
}


const users_input = {
    users: [
        { id: 1, name: 'user-1', email: 'user-1@email.com', role: 'admin' },
        { id: 2, name: 'user-2', email: 'user-2@email.com', role: 'none' },
        { id: 3, name: 'user-3', email: 'user-3@email.com', role: 'none'  },
    ],
    title: 'users'
}


module.exports = { home_input, posts_input, users_input }