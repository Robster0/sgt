# hte

html template engine
```js
const hte = require('hte')

//Compile string
hte.Compile("<h1>{{ name }}</h1>", { name: 'example-name' })// output > '<h1>example-name</h1>'
//Compile file
hte.CompileFile('path/to/file/example.html', example-object)
```

## Installation
```
$ npm install hte
```

## example

https://github.com/Robster0/hte/tree/main/example