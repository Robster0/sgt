const htmltemplate = require('../src/index')

const ejs = require('ejs')


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
    
    w.Send(htmltemplate.Compile(__dirname + '/home.html', links, '<h1>ERROR</h1>'))
}

function posts(w, r) {
    w.Send(htmltemplate.Compile(__dirname + '/posts.html', data_input))
}

const time_1 = performance.now()

htmltemplate.Compile(__dirname + '/posts.html', data_input)

const time_2 = performance.now()

const time_1_ejs = performance.now()
ejs.renderFile(__dirname + '/ejs-test.ejs', data_input)

const time_2_ejs = performance.now()



console.log("HTMLTEMPLATE MILLISECONDS: ", time_2 - time_1)
console.log("EJS Milliseconds: ", time_2_ejs - time_1_ejs)





