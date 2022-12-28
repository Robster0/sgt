const Twig = require('../src/index')


const MuxJS = require('muxjs-http')

const { data_input, links } = require('./inputs.js')

MuxJS.ListenAndServe(3000, () => {
    console.log("Server listening on port: ", MuxJS.Port)
})

MuxJS.FileServer('/static')


const r = MuxJS.NewRouter()

r.HandleFunc('/', home).Method('GET')
r.HandleFunc('/posts', posts).Method('GET')

function home(w, r) {
    
    w.Send(Twig.Compile(__dirname + '/home.html', links))
}

function posts(w, r) {
    w.Send(Twig.Compile(__dirname + '/posts.html', data_input))
}



