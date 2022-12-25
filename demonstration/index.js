const Twig = require('../src/index')
const MuxJS = require('muxjs-http')

const input = {
    posts: [
        {id: 1, user: "robin.andreasson@metabytes.se", content: "With damn good business impact"},
        {id: 2, user: "ludwig@ludvig.se", content: "Ludwig"},
        {id: 3, user: "smedberg.tor@rot.se", content: "anus?"}
    ],
    comments: [
        {id: 1, postId: 1, user: "test1", content: "boob"},
        {id: 2, postId: 2, user: "test2", content: "severe boob"},
        {id: 3, postId: 2, user: "test3", content: "chlamydia"},
        {id: 4, postId: 2, user: "test4", content: "dick"},
        {id: 5, postId: 1, user: "test5", content: "8"},
        {id: 6, postId: 3, user: "test6", content: "wow1"},
        {id: 7, postId: 3, user: "test7", content: "D"},
        {id: 8, postId: 1, user: "test8", content: "8===D"},
    ],
    title: "DICK",
    NoComments: "No comments for post"
}

MuxJS.ListenAndServe(3000, () => {
    console.log("Server listening on port: ", MuxJS.Port)
})

MuxJS.FileServer(__dirname + '/static')


const r = MuxJS.NewRouter()

r.HandleFunc('/', home).Method('GET')
r.HandleFunc('/posts', posts).Method('GET')

console.log(Twig.Render(__dirname + '/posts.html', input))


function home(w, r) {
    
    w.Send("<a href='/posts'>boob</a>")
}

function posts(w, r) {
    w.Send(Twig.Render(__dirname + '/posts.html', input))
}

