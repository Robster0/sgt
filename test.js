/*

Syntax:


#: escaped


*/

const fs = require('fs');




class HtmlTemplate
{
    #input


    #statement_rules


    constructor(path)
    {

        



        this.#input = {'var2': []}
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

        try
        {

            //validate loop
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
            console.log(script)

            eval(script) 

            console.log(script)

            return true
        }
        catch(err) {

            console.log(err)
            return false
        }


        
    }
}


console.log(new HtmlTemplate().validStatement(['$if', 'var2', 'eq', '123', 'or', 'var1', '-eq', '25']))