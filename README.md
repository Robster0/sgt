# {{ Seagull Templates }}

An easy-to-use template engine

```js
const sgt = require("sgt")

//Compile a string
sgt.Compile("<h1>{{ name }}</h1>", { name: "Seagull" })
// => "<h1>Seagull</h1>"

//Compile a file
sgt.CompileFile("path/to/file/file.html", { name: "Seagull" })
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