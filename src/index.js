/*

Syntax:


#: escaped


*/

const fs = require('fs');



class HtmlTemplate
{
    constructor(path)
    {
       this.Generate(path, {
           "posts": [9, 8, 7, 6, 5],
           "s": "teststring"
       })
    }


    


    Generate(path, input) {
        let data = fs.readFileSync('./test.html').toString('utf-8')

        let loops = []
        let loopcontent = {}
        let commands = []
        let mode = 'check'
        let currentCommand = ''
        let content = ''

        for(let i = 0; i<data.length; i++) {
            if(mode === 'write') {
                currentCommand += data[i]
                content += data[i]
            }

            
            if(data[i] === '[')
                mode = 'write'

            if(data[i + 1] === ']') {
                mode = 'check'

                if(currentCommand.substring(0, 5) === '$loop') {
                    loops.push(currentCommand)
                } else if(currentCommand === '/loop') {
                    loopcontent[loops[loops.length - 1]] = content

                    loops.pop()

                    content = ''
                }   
                currentCommand = ''
            }
        }

        console.log(loopcontent)

        //console.log(currentCommand)
//
        //let variables = []
        //let loops = data.match(/\[\$loop.+?\]((.|\n|\r\n|\r)*?)\[\/loop\]/gm)
//
        //console.log("LOOPS")
        //console.log(loops)
//
        //for(let i = 0; i<loops.length; i++) {
        //    let loopCommand = loops[i].match(/(.*)\[\$loop.+?\]/gm)[0]
//
        //    console.log(loopCommand)
        //}
    }
}

const template = new HtmlTemplate('./test.html');