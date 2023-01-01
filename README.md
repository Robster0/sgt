# {Seagull Templates}

An easy-to-use template engine

```js
const sgt = require('sgt')

//Compile string
sgt.Compile("<h1>{{ name }}</h1>", { name: 'example-name' })
// => "<h1>example-name</h1>"

//Compile file
sgt.CompileFile('path/to/file/example.html', { name: 'example-name' })
```

## Installation
```
$ npm install sgt
```

# Features
* Loop, if and else logic
* Escape outputs with %
* Trim outputs with @
* Includes (relative and absolute path)
* Compatible with MuxJS

# Example
https://github.com/Robster0/sgt/tree/main/example