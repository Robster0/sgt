# hte

html template engine
```js
const hte = require('hte')

//Compile string
hte.Compile("{{ name }}", { name: 'example-name' })
//Compile file
hte.CompileFile('path/to/file/example.html', example-object)
```

## Installation
```
$ npm install hte
```

## example

https://github.com/Robster0/hte/tree/main/example