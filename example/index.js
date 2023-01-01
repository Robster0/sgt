const MuxJS = require('muxjs-http')
const sgt = require('sgt')

const { home_input, posts_input, users_input  } = require('./inputs')


MuxJS.ListenAndServe(3000, (err) => {
    if(err) return console.log(err)


    console.log("Starting server at port: ", MuxJS.Port)
})


MuxJS.FileServer(__dirname + '/static')


const r = MuxJS.NewRouter()


r.HandleFunc('/', home_handler).Method('GET')

r.HandleFunc('/posts', posts_handler).Method('GET')

r.HandleFunc('/users', users_handler).Method('GET')




function home_handler(w, r) {
    w.Send(sgt.CompileFile(__dirname + '/html/home.html', home_input))
}

function posts_handler(w, r) {
    w.Send(sgt.CompileFile(__dirname + '/html/posts.html', posts_input))
}

function users_handler(w, r) {
    w.Send(sgt.CompileFile(__dirname + '/html/users.html', users_input))
}