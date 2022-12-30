/*

Html-tempalate engine that heavily focuses on the idea of no "with" statement (even tho it would definitely be faster)

Syntax:


#: statement

/: end the statement

":":  else statement 

% (only on variables): escape
@: trim white space

(.*?test.*?)}

*/

const fs = require('fs');

const { Validity, ValidateVariableNames, ValidateScopes } = require('./validity/validity.js')
const { generateIfStatement, objectPaths, Escape, _ATTRIBUTES_ } = require('./utils.js')



class HtmlTemplate
{
    #input
    #scopeVariables
    #cache


    Compile(path, input, defaultErrorResponse = '') {
        try
        {

            //Checking if arguments are the correct type, if not then throw error
            if(typeof path !== 'string') throw new TypeError(`path argument is of wrong type, expected string but is ${typeof path}`)

            const isArr = Array.isArray(input)
   
            if(typeof input !== 'object' || isArr) throw new TypeError(`input argument is of wrong type, expected object but is ${isArr ? 'array' : typeof input}`)

            if(typeof defaultErrorResponse !== 'string') throw new TypeError(`defaultErrorResponse argument is of wrong type, expected string but is ${typeof defaultErrorResponse}`)
            
            const result = ValidateVariableNames(input)

            if(result) throw new SyntaxError(result)
            
            //Set the variables
            this.#input = {...input}
            this.#scopeVariables = {}
            this.#cache = {} 

            const keys = Object.keys(this.#input)

            for(let i = 0; i<keys.length; i++) {
                if(typeof this.#input[keys[i]] === 'object' && !Array.isArray(this.#input[keys[i]])) {

                    const result = objectPaths(this.#input[keys[i]], keys[i], this.#input)

                    if(!result) throw new Error('Duplicate variables are not allowed')
                }
                    
            }
    
            /**@type {string} */
            const html = fs.readFileSync(path).toString('utf-8')
    
    
            /**@type {string | boolean} */
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

            /** @type {string} */
            let mode = 'scan'
            let output = ''
            let statement = ''
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
                    * "#": condition, e.g. if statement or a loop
                    * ":":  else statement
                    * "/": close the current scope, e.g. {{/if}} (not inspired by Svelte)
                    */
                    const statementType = statement[0]

                    //Check if its a statement, if not then its a variable
                    const isVariable = statementType !== '#' && statementType !== '/' && statementType !== ':'
                    
                    const hasAttribute = statementType === '%' || statementType === '@'

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

                        if(!this.#scopeVariables[latest])
                            this.#scopeVariables[latest] = {}

                        this.#scopeVariables[latest][(hasAttribute ? statementType : '') + statement] = 1
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
                    if(statementType === '#' || statementType === ':') {

                        //If duplicate
                        if(htmlSegments[statement])
                            statement = statement + `-DUPLICATE-${Math.random().toString().substring(2, 5)}`


                        if(statementType === ':') {

                            const latestStatementType = latest?.split(' ')
                            //If latest statement isn't an if statement or else statement, throw syntax error
                            if(!latestStatementType || (latestStatementType[0] !== ':else' && latestStatementType[0] !== '#if')) 
                                throw new SyntaxError(`else statement is used incorrectly, latest condition is "${latestStatementType ? latestStatementType[0] : 'undefined'}" but should be "#if" or ":else"`)
    
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
                        stack = ValidateScopes(stack, statement)

 
                        if(!stack) throw new SyntaxError("Missing or wrong closing statement")

                        if(stack.length === 0) {
                            
                            const result = this.#ExecuteStatements(htmlSegments, latest, this.#input)
                            
                            if(!result && result?.length !== 0) return false

                            output += result
                            htmlSegments = {}   
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

    #ExecuteStatements(htmlSegments, statement, input) {
        try
        {
            const statementSeg = statement.split('-DUPLICATE-')[0].split(' ').filter(e => e)

            let value

            if(!this.#cache[statement]) {
                value = Validity(statementSeg, statement, input)

                if(!value) return false

                this.#cache[statement] = value
            }
            else 
                value = this.#cache[statement]       
                
            switch(statementSeg[0].toLowerCase()) {
                case '#if':
                case ':else':
                    return this.#If(htmlSegments, statement, value, input)
                case '#loop':
                    return this.#Loop(htmlSegments, statement, statementSeg, input)
            }
    
            return ''
        }
        catch(err) {
            console.log(err)
            return false
        }
    }


    //For loops
    #Loop(htmlSegments, statement,  [command, variable, as, pipedVariable, index], input) {

        try
        {
            let html = ''

            let data = input[variable]        
    
            if(pipedVariable[pipedVariable.length - 1] === ',') pipedVariable = pipedVariable.substring(0, pipedVariable.length - 1)
    
            if(pipedVariable in input || index in input) throw new Error('Duplicate variables are not allowed')

            for(let i = 0; i<data.length; i++) {
    
                const isObject = typeof data[i] === 'object' && !Array.isArray(data[i]) 
                
                if(isObject) {
    
                    let nodes = objectPaths(data[i], pipedVariable)

                    if(!nodes) throw new Error('Duplicate variables are not allowed')
    
                    input = {...input, ...nodes}
                }
                                
                input[pipedVariable] = data[i]
    
                if(index) input[index] = i
    
                const result = ValidateVariableNames(input)
    
                if(result) throw new SyntaxError(result)
    
                const scannedHtml = this.#Segments(htmlSegments, statement, input)
    
                if(!scannedHtml && scannedHtml !== '') return false
    
                //Delete this variable since shallow copy won't
                delete input[pipedVariable]
                
                html += scannedHtml
            }
    
    
            return html
        }
        catch(err) {
            console.log(err)
            return false
        }
    }

    //For if statements
    #If(htmlSegments, statement, script, input) {
        try
        {
            if(generateIfStatement(script)(input)) 
                return this.#Segments(htmlSegments, statement, input)
            else {
                if(!htmlSegments.else) return ''


                const elseStatement = Object.keys(htmlSegments.else)[0]


                return this.#ExecuteStatements(htmlSegments.else[elseStatement], elseStatement, input)
            }
        }
        catch(err) {
            console.log(new SyntaxError("Invalid if-statement syntax"))
            return false
        }
        
    }

    #Segments(htmlSegments, statement, input) {
        try
        {
            const content = htmlSegments.content
        
            let segmentIndex = 0
    
            let html = content[segmentIndex]
    
            let scopeSegments = Object.keys(htmlSegments)
    
            for(let i = 0; i<scopeSegments.length; i++) {
                if(scopeSegments[i] === 'content' || scopeSegments[i] === 'else') continue
    
                const executedStatement = this.#ExecuteStatements(htmlSegments[scopeSegments[i]], scopeSegments[i], input)
    
                if(!executedStatement && executedStatement !== '') return false
    
                segmentIndex++
    
                html += executedStatement + content[segmentIndex]
            }

            //Cancel early if there are no scope made variables
            if(!this.#scopeVariables[statement]) return html


            const keys = Object.keys(this.#scopeVariables[statement])

            for(let i = 0; i<keys.length; i++) {
    
                let name = keys[i]

                const attribute = name[0]

                const hasAttribute = attribute === '%' || attribute === '@'
    
    
                if(!hasAttribute)
                    html = html.replace(new RegExp(`{{${name}}}`, 'g'), input[name])
                else if(hasAttribute) {
    
                    name = name.slice(1)

                    if(!(name in input)) throw new Error(`Variable "${name}" does not exist`)

                    const newValue = this.#Attributes(attribute, input[name])

                    if(!newValue) throw new Error(`${_ATTRIBUTES_[attribute]} attribute can only be used on strings, "${name}" is not a string`)

                    html = html.replace(new RegExp(`{{${attribute}${name}}}`, 'g'), newValue)
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
            case '%':
                return Escape(s)
            case '@':
                return s.trim()
        }
    }
}

module.exports = new HtmlTemplate()