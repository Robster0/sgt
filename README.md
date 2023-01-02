# {Seagull Templates}

An easy-to-use template engine

# Features
* Loop, if and else logic
* Manipulate string outputs with output tags
* Includes (relative and absolute path)
* Compatible with MuxJS


# Output tags
* Escape with -=
* Unescape with --
* Trim whitespace with =
* Upper case with %
* Lower case with __
* First char upper case with -%


```js
const sgt = require("sgt")

//Compile a string
sgt.Compile("<h1>{{ name }}</h1>", { name: "Seagull" })
// => "<h1>Seagull</h1>"

//Output tags
sgt.Compile("<h1>{{ -=tag }}</h1>", { tag: "<script>alert('Seagull!')</script>" })
// => "<h1>&lt;script&gt;alert(&#39;Seagull!&#39;)&lt;/script&gt;</h1>"

//Compile a file
sgt.CompileFile("path/to/file/file.html", { name: "Seagull" })
```

## Installation
```
$ npm install sgt
```

# Example
https://github.com/Robster0/sgt/tree/main/example