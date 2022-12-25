/*

Syntax:


$: statement

/: end the statement

":":  else statement 

# (only on variables): escape

(.*?test.*?)}

*/

const fs = require('fs');

const Validity = require('./validity/validity')



class HtmlTemplate
{
    #input

    #statement_rules
    #scopeVariables


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
    }

    Render(path, input) {
        //Set the variables
        this.#input = input

        //read the html file
        const html = fs.readFileSync(path).toString('utf-8')


        //Start the Scan
        return this.#Scan(html)        
    }

    #Scan(html, stack = [], htmlSegments = {}, startIndex = 0) {
        try
        {

            //Write: currently writing a statement, scan: currently looking for a statement
            let mode = 'scan'
            let newHtml = ''
            let statement = ''
            let content = ''
            


            for(let i = startIndex; i<html.length; i++) 
            {
                if(html[i] === '{') {
                    mode = 'write'
                } 
                else if(html[i] === '}') {
                    mode = 'scan'


                    const command = statement[0]
                    const notCommand = command !== '$' && command !== '/' && command !== ':'
                    
                    const latest = stack[stack.length - 1]

                    //If the statement is just a variable
                    if(notCommand && statement in this.#input)
                        content += this.#input[statement]             
                    else if(notCommand) {
                        content += `{${statement}}`
                    }

                    //not inside a scope
                    if(stack.length === 0)
                        newHtml += content  
                           

                    if(latest) {
                        if(!htmlSegments['content'])
                            htmlSegments['content'] = ['']

                        htmlSegments['content'][htmlSegments['content'].length - 1] += content    
                    }
                    
                        
 
                        
                    //If its a statement
                    if(command === '$') {
                        if(htmlSegments[statement])
                            statement = statement + `-DUPLICATE-${Math.random().toString().substring(2, 5)}`

                        stack.push(statement)

                        if(htmlSegments['content'])
                            htmlSegments['content'].push('')


                        //if(htmlSegments)
                        htmlSegments[statement] = {}

                        const childSegments = this.#Scan(html, stack, htmlSegments[statement], i + 1)

                        if(!childSegments) return false

                        const [ newStartIndex, newNewHtml, newStack ] = childSegments

                        i = newStartIndex
                        newHtml += newNewHtml
                        stack = newStack
                    } 
                    //If its a closing statement
                    else if (command === '/') {
                        stack = this.#ValidateScopes(stack, statement)

 
                        if(!stack) throw new SyntaxError("Missing or wrong closing statement")

                        if(stack.length === 0) {
                            const segHTML = this.#ExecuteStatements(htmlSegments, latest)
                            
                            if(segHTML) {
                                newHtml += segHTML
                                htmlSegments = {}
                            }        
                        }

                        const elseStatementOffset = (latest[0] === ':' ? statement.length + 3 : 0)

                        return [i + 1 - elseStatementOffset, newHtml, stack]
                    } 
                    else if (command === ':') {
                        if(htmlSegments[statement])
                            statement = statement + `-DUPLICATE-${Math.random().toString().substring(2, 5)}`

                        stack.push(statement)


                        htmlSegments['else'] = {}
                        htmlSegments['else'][statement] = {}

                        const childSegments = this.#Scan(html, stack, htmlSegments['else'][statement], i + 1)

                        if(!childSegments) return false

                        const [ newStartIndex, newNewHtml, newStack ] = childSegments

                        i = newStartIndex
                        newHtml += newNewHtml
                        stack = newStack
                    }

                    statement = ''
                    content = ''

                } else {
                    if(mode === 'write')
                        statement += html[i]
                    else
                        content += html[i]
                }
            }

            if(stack.length !== 0) throw new SyntaxError("Missing closing scope")

            newHtml += content

            return newHtml
        }
        catch(err) 
        {
            console.log(err)
            return false
        }   
    }

    #ExecuteStatements(htmlSegments, statement, variables = {}) {

        const statementSeg = statement.split('-DUPLICATE-')[0].split(' ').filter(e => e)

        const value = Validity(statementSeg, this.#input, variables)
        
        if(!value) return ''

        switch(statementSeg[0].toLowerCase()) {
            case '$if':
            case ':else':
                return this.#If(htmlSegments, value, variables)
            case '$loop':
                return this.#Loop(htmlSegments, statementSeg, variables)
        }

        return ''
    }

    #ValidateScopes(stack, command) {

        const latest = stack[stack.length - 1].split(' ')[0]

        switch(command)
        {
            case '/if':
                if(latest !== ':else' && latest !== '$if')
                    return false

                stack.pop()

                return stack
            case '/loop':
                if(latest !== '$loop') 
                    return false
                    
                stack.pop()

                return stack
            default:
                return false
        }  
    }


    //For loops
    #Loop(htmlSegments, [command, variable, as, pipeVariable], variables) {
  
        let html = ''

        let data = variables[variable] ? variables[variable] : this.#input[variable]        

        for(let i = 0; i<data.length; i++) {

            const isObject = typeof data[i] === 'object' && !Array.isArray(data[i]) 
            
            if(isObject) {
                variables = {...variables, ...this.#objectTraversal(data[i], pipeVariable)}

            } else {
                variables[pipeVariable] = data[i]
            }


            const scannedHtml = this.#childSegments(htmlSegments, variables)

            if(!scannedHtml && scannedHtml !== '') return false

            //Delete this variable since shallow copy won't
            delete variables[pipeVariable]
            
            html += scannedHtml
        }


        return html
    }

    //For if statements
    #If(htmlSegments, script, variables = {}) {
        try
        {
            if(eval(script)) 
                return this.#childSegments(htmlSegments, variables)
            else {
                if(!htmlSegments.else) return ''
            

                const elseStatement = Object.keys(htmlSegments.else)[0]


                return this.#ExecuteStatements(htmlSegments.else[elseStatement], elseStatement, variables)
            }
        }
        catch(err) {
            if(err.message === 'Unexpected identifier') {
                console.log(new SyntaxError("Invalid if-statement syntax"))
            }
            return false
        }
        
    }

    #childSegments(htmlSegments, variables) {

        const content = htmlSegments.content
        
        let segmentIndex = 0

        let html = content[segmentIndex]

        let scopeSegments = Object.keys(htmlSegments)

        for(let i = 0; i<scopeSegments.length; i++) {
            if(scopeSegments[i] === 'content' || scopeSegments[i] === 'else') continue

            const executedStatement = this.#ExecuteStatements(htmlSegments[scopeSegments[i]], scopeSegments[i], variables)

            if(!executedStatement && executedStatement !== '') return false

            segmentIndex++

            html += executedStatement + content[segmentIndex]
        }

        const entries = Object.entries(variables)

        for(let i = 0; i<entries.length; i++) {

            const [ name, value ] = entries[i]


            html = html.replace(new RegExp(`{${name}}`, 'g'), value)
        }



        return html
    }

    #objectTraversal(obj, path, variables = {}) {
        if(typeof obj !== 'object' || Array.isArray(obj)) {
            variables[path] = obj

            return variables
        }
    
        const keys = Object.keys(obj)
    
        for(let i = 0; i<keys.length; i++) {
            this.#objectTraversal(obj[keys[i]], path + '.' + keys[i], variables)
        }


        return variables
    }
}

module.exports = new HtmlTemplate()