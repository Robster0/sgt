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
       this.Generate(path, {
           "posts": [9, 8, 7, 6, 5],
            "test": "teststring"
       })
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

            let index = 0
            let test = []
    
            let statement = ''

            let contentSeg = {}
            let content = ''

            for(let i = 0; i<html.length; i++) {

                if(stack.length === 0 && mode !== 'write')
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

                    content += this.#addIndex(index, content[content.length - 1], statement[0])
                    htmlSegment += this.#addIndex(index, htmlSegment[htmlSegment.length - 1], statement[0])


                    if(s)
                        contentSeg[s] = contentSeg[s] ? contentSeg[s] + content : content
    


    
                    if(statement[0] === '$') {

                        index++

                        let pass = true

                        for(let i = 0; i<stack.length; i++) {
                            if(stack[i] === statement) {
                                stack.push(statement + `-#-${Math.random()}`)
                                pass = false
                            }
                        }
                        
                        if(pass)
                            stack.push(statement)

                    } else if(statement[0] === '/') {

                        //Statement command
                        const sc = statement.split(' ')[0].toLowerCase()
                        //Latest command
                        const lc = s.split(' ')[0].toLowerCase()

                        if(sc.substring(1, sc.length - 1) !== lc.substring(1, lc.length - 1)) throw "invalid closing scope" 
    
                        if(stack.length === 0) throw "invalid syntax"

                        const executedStatement = this.#ExecuteStatement(contentSeg[s].substring(0, contentSeg[s].length - 1), s)

                        //if(!this.#ExecuteStatement(contentSeg[s].substring(0, contentSeg[s].length - 1), s)) throw "invalid statement syntax"
                        //console.log(contentSeg[s])

                        //console.log()
    
                        stack.pop()
                    } 



                    content = ''
                    statement = ''
                }   
            }
    
            if(stack.length) throw "invalid syntax" 
    
           // console.log(htmlSegment)
    
           console.log(htmlSegment)
    
            const keys = Object.keys(contentSeg)
    
    
            for(let i = 0; i<keys.length; i++) {
                console.log(keys[i], ": ")
                console.log(contentSeg[keys[i]].substring(1, contentSeg[keys[i]].length - 1))
            }
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

        switch(seg[0].toLowerCase()) {
            case '$if':
                break
            case '$loop':
                return this.#Loop(content, seg)
        }


        return true
    }


    #Loop(content, statementSeg) {
         if(this.#validStatement(statementSeg)) return false


    }



    #validStatement(statementSeg) {
        try
        {
            //validate loops
            if(statementSeg[0].toLowerCase() === '$loop') {

                //if length isn't four, return false
                if(statementSeg.length !== 4) return false
                //If variable that will be looped isn't inside the input, return false
                if(!(statementSeg[1] in this.#input)) return false
                //If variable that 
                if(!Array.isArray(this.#input[statementSeg[1]]) && typeof this.#input[statementSeg[1]] !== 'object') return false
                
                if(statementSeg[2].toLowerCase() !== 'as') return false


                return true
            }

            if(statementSeg[0].toLowerCase() !== '$if') return false

            let script = ''
            let isString = false

            for(let i = 1; i<statementSeg.length; i++) {

                if(statementSeg[i][0] === '"') 
                    isString = true
                else if(statementSeg[i][statementSeg.length - 1] === '"') 
                    isString = false

                const valid = this.#statement_rules[statementSeg[i].toLowerCase()]

                if(valid)
                    script += valid
                else {
                    if(isString)
                        script += statementSeg[i] + ' '
                    else {

                        //if(this.#statement_rules[statementSeg[i]])
                        
                        script += statementSeg[i][0] === '!' ? '!1 ' : '1 '
                    }
                }
            }

            eval(script) 

            return true
        }
        catch(err) {

            console.log(err)
            return false
        }
    }

    #addIndex(index, lastChar, isCommand) {
        if(lastChar === '[' && isCommand === '$')
            return index

        return ''
    }

    #duplicate(stack, statement) {

        for(let i = 0; i<stack.length; i++) {
            if(stack[i] === statement) {
                stack.push(statement + `-#-${Math.random()}`)
                pass = false
            }
        }
        
        if(pass)
            stack.push(statement)
    }
}

const template = new HtmlTemplate('./test.html');