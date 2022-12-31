# hte

easy to use html template engine
```js
const hte = require('h-te')

//Compile string
hte.Compile("<h1>{{ name }}</h1>", { name: 'example-name' })// output > '<h1>example-name</h1>'
//Compile file
hte.CompileFile('path/to/file/example.html', example-object)
```

## Installation
```
$ npm install h-te
```

## example

https://github.com/Robster0/hte/tree/main/example