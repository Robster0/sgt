/*

Syntax:


#: escaped


*/

const fs = require('fs');
const { isFunction } = require('util');



class HtmlTemplate
{
    #input
    #duplicateID

    #statement_rules


    constructor(path)
    {

        this.#statement_rules = {
            'eq': '=== ',
            '-eq': '!== ',
            'and': '&& ',
            'or': '|| ',

            '>': '> ',
            '<': '< ',
            '>=': '>= ',
            '<=': '<= ',
        }


        
        this.#input = {}
        this.#duplicateID = {}
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

            let newHtml = ''

            let statement = ''

            let contentSeg = {}
            let content = ''

            for(let i = 0; i<html.length; i++) {

                if(stack.length === 0 && mode !== 'write')
                newHtml += html[i]
                
                    
            

                //write the curr command
                if(mode === 'write')
                    statement += html[i]
                else if(stack.length !== 0) {
                    content += html[i]
                }
                    
    
                
                if(html[i] === '[' && (html[i + 1] === '$' || html[i + 1] === '/'))
                    mode = 'write'




                    
                if(html[i + 1] === ']') {

                    mode = 'check'

                    const s = stack[stack.length - 1]

                    if(statement[0] === '$') {

                        if(contentSeg[statement])
                            statement = statement + `-DUPLICATE-${Math.random().toString().substring(2, 5)}`
                        
                            

                        content += this.#addIndex(statement, content[content.length - 1], statement[0])
                        newHtml += this.#addIndex(statement, newHtml[newHtml.length - 1], statement[0])

                        stack.push(statement)

                        //check statement
                    }

                    if(s) contentSeg[s] = contentSeg[s] ? contentSeg[s] + content : content
                    
                    if(statement[0] === '/') {

                        //Statement command
                        const sc = statement.split(' ')[0].toLowerCase()
                        //Latest command
                        const lc = s.split(' ')[0].toLowerCase()

                        if(sc.substring(1, sc.length - 1) !== lc.substring(1, lc.length - 1)) throw new SyntaxError("invalid closing scope")
    
                        if(stack.length === 0) throw new SyntaxError("invalid syntax")

                        const executedStatement = this.#ExecuteStatement(contentSeg[s].substring(0, contentSeg[s].length - 1), s)

                        stack.pop()
                    } 



                    content = ''
                    statement = ''
                }   
            }
    
            if(stack.length) throw new SyntaxError("invalid syntax") 
    
           console.log(newHtml)
    
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
        const statementSeg = condition.split('-DUPLICATE-')[0].split(' ')

        if(!this.#validStatement(statementSeg)) return false

        switch(statementSeg[0].toLowerCase()) {
            case '$if':
                break
            case '$loop':
                return this.#Loop(content, statementSeg)
        }


        return true
    }


    #Loop(content, [command, variable, as, element]) {

        let iterableVar = Array.isArray(this.#input[variable]) ? this.#input[variable] : Object.keys(this.#input[variable])

        let html = ``

        let valid = [['[', ' '], ['.', ' ', ']']]
        let mode = false

        console.log(content)

        content.search(element)

        for(let i = 0; i<iterableVar.length; i++) {
            
        }
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
}

const template = new HtmlTemplate('./test.html');