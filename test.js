/*

Syntax:


#: escaped


*/

const fs = require('fs');
const { isFunction } = require('util');



class HtmlTemplate
{
    #input


    #statement_rules


    constructor(path)
    {

        this.#statement_rules = {
            command: {
                $loop: true,
                $if: true
            },
            condition: {
                as: true,
                eq: true,
                '-eq': true,
                '>': true,
                '<': true,
                '>=': true,
                '<=': true
            },
            extra: {
                and: true,
                or: true
            }

        }



        this.#input = {}
    }


    


    Generate(path, input) {
        try
        {
            this.#input = input

            let html = fs.readFileSync('./test.html').toString('utf-8')


            let stack = []
            let mode = ''

            let htmlSegment = ''
            let newHtml = []
    
            let statement = ''

            let contentSeg = {}
            let content = ''
    
            for(let i = 0; i<html.length; i++) {

                if(stack.length === 0)
                    htmlSegment += html[i]
                

                //write the curr command
                if(mode === 'write')
                    statement += html[i]
                else if(stack.length !== 0)
                    content += html[i]
    
                
                if(html[i] === '[' && (html[i + 1] === '$' || html[i + 1] === '/'))
                    mode = 'write'

                    
                if(html[i + 1] === ']') {
                    mode = 'check'

                    const s = stack[stack.length - 1]

                    if(content[content.length - 1] === '[')
                        if(statement[0] === '$')
                            content += statement

    
                    contentSeg[s] = contentSeg[s] ? contentSeg[s] + content : content
    
                    if(statement[0] === '$')
                        stack.push(statement)
                    else if(statement[0] === '/') {
    
                        if(stack.length === 0) throw "invalid syntax"


                        if(!this.#ExecuteStatement(contentSeg[s].substring(0, contentSeg[s].length - 1), s)) throw "invalid statement syntax"
                        //console.log(contentSeg[s])

                        console.log()
    
                        stack.pop()
                    } 

                    content = ''
                    statement = ''
                }
            }
    
            if(stack.length) throw "invalid syntax" 
    
           // console.log(htmlSegment)
    
    
            const keys = Object.keys(contentSeg)
    
    
            //for(let i = 0; i<keys.length; i++) {
            //    console.log(keys[i], ": ")
            //    console.log(contentSeg[keys[i]].substring(1, contentSeg[keys[i]].length - 1))
            //}
        }
        catch(err) 
        {
            console.log(err)
        }
    }


    #ExecuteStatement(content, condition) {
        const seg = condition.split(' ')

        if(seg.length !== 4) {
            if(seg[3][0] !== `'` && seg[3][0] !== `"`) return false
        }


        console.log(seg)

        console.log(content)


        console.log(this.#input)

        switch(seg[0]) {
            case '$if':
                break
            case '$loop':
                this.#Loop()
                break
        }


        return true
    }


    #Loop() {
         
    }



    validStatement(statementSeg) {

        for(let i = 1; i<statementSeg.length; i++) {
            console.log((i - 1) % 3)

            const v = (i - 1) % 4

            if(v === 3) {
                console.log(statementSeg[i])
                console.log(statementSeg[i].toLowerCase())
                if(this.#statement_rules.extra[statementSeg[i].toLowerCase()]) console.log("TRUE")
            }



            //switch(v)
            //{
            //    case 0:
            //    console.log(statementSeg[i])
            //    case 1: 
            //    console.log(statementSeg[i])
            //    case 2: console.log(statementSeg)
            //}
        }
        
    }
}


console.log(new HtmlTemplate().validStatement(['$loop', 'var2', 'eq', 'cock', 'AND', 'var2', '-eq', '"jag', 'heter', 'robin"']))