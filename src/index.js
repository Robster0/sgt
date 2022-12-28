/*

Syntax:


$: statement

/: end the statement

":":  else statement 

# (only on variables): escape
@: trim white space

(.*?test.*?)}

*/

const fs = require('fs');

const Validity = require('./validity/validity')



class HtmlTemplate
{
    #input
    #attributedVariables

    #statement_rules
    #scopeVariables


    Compile(path, input, defaultErrorResponse = '') {
        try
        {

            //Checking if arguments are the correct type, if not then throw error
            if(typeof path !== 'string') throw new TypeError(`path argument is of wrong type, expected string but is ${typeof path}`)

            const isArr = Array.isArray(input)
   
            if(typeof input !== 'object' || isArr) throw new TypeError(`input argument is of wrong type, expected object but is ${isArr ? 'array' : typeof input}`)

            if(typeof defaultErrorResponse !== 'string') throw new TypeError(`defaultErrorResponse argument is of wrong type, expected string but is ${typeof defaultErrorResponse}`)
            
            
            //Set the variables
            this.#input = input
            this.#attributedVariables = {}
    
            //read the html file
            const html = fs.readFileSync(path).toString('utf-8')
    
    
            //Start the Scan
            const output = this.#Scan(html)
            
            //If error
            if(!output) return defaultErrorResponse
    
    
            return output
        }
        catch(err) {
            console.log(err)

            return defaultErrorResponse
        }
    }

    #Scan(html, stack = [], htmlSegments = {}, startIndex = 0) {
        try
        {

            //Write: currently writing a statement/variable, scan: currently looking for a statement
            let mode = 'scan'

            //the outputed html
            let output = ''

            //Shouldn't be called this since it can also be a variable but fuck it
            let statement = ''
            
            //scope html
            let content = ''
            


            for(let i = startIndex; i<html.length; i++) 
            {
                //if its a opening statement, start write mode
                if(html[i] === '{' && html[i + 1] === '{') {
                    mode = 'write'
                    i++
                } 
                //if its a closing statement, start scan mode but also add new/remove statement, stack validity and evaluate scope
                else if(html[i] === '}' && html[i + 1] === '}') {
                    mode = 'scan'
                    i++

                    //Offset for else statements, its a stupid solution to a problem (I should start the process of refactoring this (I won't))
                    const offset = statement.length + 5

                    //Trim the white space from the outer sides of the statement 
                    if(statement) statement = statement.trim()


                    /**
                    * get the first character of the statement
                    * 
                    * 
                    * "$": condition, e.g. if statement or a loop
                    * ":":  else statement
                    * "/": close the current scope, e.g. {{/if}} (not inspired by Svelte)
                    */
                    const statementType = statement[0]

                    //Check if its a statement, if not then its a variable
                    const isVariable = statementType !== '$' && statementType !== '/' && statementType !== ':'
                    
                    const hasAttribute = statementType === '#' || statementType === '@'

                    if(hasAttribute)
                        statement = statement.substring(1, statement.length) 

                    //Get the latest statement from the stack
                    const latest = stack[stack.length - 1]

                    //If the statement is a variable and is inside the this.#input variable 
                    if(isVariable && statement in this.#input) {

                        content += hasAttribute ? this.#Attributes(statementType, this.#input[statement]) : this.#input[statement]

                    }
                    else if(isVariable) { //if the statement is a variable 
                        content += `{{${hasAttribute ? statementType : ''}${statement}}}`

                        if(hasAttribute) { 
                            if(!this.#attributedVariables[statement])
                                this.#attributedVariables[statement] = []

                            this.#attributedVariables[statement].push(statementType)
                        }    
                    }

                    //not inside a scope
                    if(stack.length === 0)
                        output += content  
                           

                    if(latest) {
                        if(!htmlSegments['content'])
                            htmlSegments['content'] = ['']

                        htmlSegments['content'][htmlSegments['content'].length - 1] += content    
                    }
                    
                        
 
                        
                    //If its a statement
                    if(statementType === '$' || statementType === ':') {

                        //If duplicate
                        if(htmlSegments[statement])
                            statement = statement + `-DUPLICATE-${Math.random().toString().substring(2, 5)}`


                        if(statementType === ':') {

                            const latestStatementType = latest?.split(' ')
                            //If latest statement isn't an if statement or else statement, throw syntax error
                            if(!latestStatementType || (latestStatementType[0] !== ':else' && latestStatementType[0] !== '$if')) 
                                throw new SyntaxError(`else statement is used incorrectly, latest condition is "${latestStatementType ? latestStatementType[0] : 'undefined'}" but should be "$if" or ":else"`)
    
                            htmlSegments['else'] = {}
                            htmlSegments['else'][statement] = {}

                        } else {

                            if(htmlSegments['content'])
                                htmlSegments['content'].push('')

                    
                            htmlSegments[statement] = {}
                        }   

                        
                        stack.push(statement)

                        const childSegments = this.#Scan(html, stack, statementType === ':' ? htmlSegments['else'][statement] : htmlSegments[statement], i + 1)

                        if(!childSegments) return false

                        const [ newStartIndex, newOutput, newStack ] = childSegments

                        i = newStartIndex
                        output += newOutput
                        stack = newStack
                    } 
                    //If its a closing statement
                    else if (statementType === '/') {
                        stack = this.#ValidateScopes(stack, statement)

 
                        if(!stack) throw new SyntaxError("Missing or wrong closing statement")

                        if(stack.length === 0) {
                            const segHTML = this.#ExecuteStatements(htmlSegments, latest)
                            
                            if(segHTML) {
                                output += segHTML
                                htmlSegments = {}
                            }        
                        }

                        return [i + 1 - (latest[0] === ':' ? offset : 0), output, stack]
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

            if(stack.length !== 0) throw new SyntaxError(`"${stack[stack.length - 1]}" statement scope is never closed`)

            output += content

            return output
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
    #Loop(htmlSegments, [command, variable, as, pipeVariable, index], variables) {
  
        let html = ''

        let data = variables[variable] ? variables[variable] : this.#input[variable]        

        if(pipeVariable[pipeVariable.length - 1] === ',') pipeVariable = pipeVariable.substring(0, pipeVariable.length - 1)

        for(let i = 0; i<data.length; i++) {

            const isObject = typeof data[i] === 'object' && !Array.isArray(data[i]) 
            
            if(isObject)
                variables = {...variables, ...this.#objectTraversal(data[i], pipeVariable)}
              
            variables[pipeVariable] = data[i]

            if(index) variables[index] = i

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
            console.log(new SyntaxError("Invalid if-statement syntax"))
            return false
        }
        
    }

    #childSegments(htmlSegments, variables) {
        try
        {
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
    
    
                html = html.replace(new RegExp(`{{${name}}}`, 'g'), value)
    
                if(this.#attributedVariables[name]) {
    
                    const attributes = this.#attributedVariables[name]
    
                    for(let i = 0; i<attributes.length; i++) {
                        const newValue = this.#Attributes(attributes[i], value)

                        if(!newValue) throw new Error(`${attributes[i] === '#' ? 'Escape' : 'Trim'} attribute can only be used on strings, "${name}" is not a string`)

                        html = html.replace(new RegExp(`{{${attributes[i]}${name}}}`, 'g'), newValue)
                    }
                        
                }   
            }
    
            return html
        }
        catch(err) {
            console.log(err)
            return false
        }
    }


    #Attributes(attribute, s) {

        if(typeof s !== 'string')
            return false
         
        switch(attribute) {
            case '#':
                return this.#Escape(s)
            case '@':
                return s.trim()
        }
    }

    #Escape(s) {

        const targets = {
            '>': '&gt;',
            '<': '&lt;',

            '&': '&amp;',

            "'": '&#39;',
            '"': '&quot;'
        };

        let escaped = ``

        for(let i = 0; i<s.length; i++) 
            escaped += targets[s[i]] ? targets[s[i]] : s[i]  

 
        return escaped
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