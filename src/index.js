"use strict"

/*

template engine that heavily focuses on not using "with" statement (even tho it would be faster and easier)

*/


/**
* Seagull templates.
*
* @module sgt
* @public
*/

/**
* Library title
* @readonly
* @type {string}
*/
exports.title = 'sgt'

/**
* Library version
* @readonly
* @type {string}
*/
exports.version = require('./package.json').version

const fs = require('fs');
const { replace } = ''


const { Validity, ValidateVariableNames, ValidateScopes } = require('./validity/validity.js')
const { generateIfStatement, objectPaths, resolveIncludePath, getDir, ConvertOutPutTag, _STATEMENT_ } = require('./utils.js');

let scopeVariables = {}
let statement_cache = {}

/** @type {string} */
let defaultErrorResponse
/**@type {string[]} */
let relativePaths = []

/**
* @public
* @param {string} str string that will be compiled
* @param {object} input variables used inside the string
* @param {string} der (default error response) default output if an error occurs during compiling 
* @returns compiled string
*/
exports.Compile = function(str, input, der = '') {
    try
    {

        if(typeof str !== 'string') {
            throw new TypeError(`str argument is of wrong type, expected string but is ${typeof str}`)
        } 

        const isArr = Array.isArray(input)

        if(typeof input !== 'object' || isArr) {
            throw new TypeError(`input argument is of wrong type, expected object but is ${isArr ? 'array' : typeof input}`)
        } 
            
        if(typeof der !== 'string') {
            throw new TypeError(`defaultErrorResponse argument is of wrong type, expected string but is ${typeof der}`)
        }
        
        const error = ValidateVariableNames(input)

        if(error) throw new SyntaxError(error)

        if(relativePaths.length === 0)
            relativePaths.push(require.main.path)

        defaultErrorResponse = der

        const newInput = {...input}


        const keys = Object.keys(newInput)

        for(const key of keys) {
            if(typeof newInput[key] === 'object' && !Array.isArray(newInput[key])) {

                const result = objectPaths(newInput[key], key, newInput)

                if(!result) throw new Error('Duplicate variables are not allowed')
            }         
        }

        /**@type {string | boolean} */
        const output = Scan(str, newInput)

        
        relativePaths = []
        
        //If error
        if(!output) return defaultErrorResponse


        return output
    }
    catch(err) {
        console.error(err)

        return defaultErrorResponse
    }
}

/** 
* @public
* @param {string} path relative or absolute path to the html file
* @param {object} input variables used inside the html
* @param {string} der (default error response) default output if an error occurs during compiling 
* @returns compiled string
*/
exports.CompileFile = function(path, input, der = '') {
    try
    {
        if(typeof path !== 'string') {
            throw new TypeError(`path argument is of wrong type, expected string but is ${typeof path}`)
        } 

        const html = fs.readFileSync(path).toString('utf-8')
        
        relativePaths.push(getDir(path))

        return exports.Compile(html, input, der)
    }
    catch(err) {
        console.error(err)
        return der
    }
}

function Scan(html, input, stack = [], htmlSegments = {}, startIndex = 0) {
    try
    {
        let mode = 'scan'
        let output = ''
        let statement = ''
        let content = ''
        
        for(let i = startIndex; i<html.length; i++) 
        {
            if(html[i] === '{' && html[i + 1] === '{') {
                mode = 'write'
                i++
            } 
            //if its a closing statement, start scan mode but also add new/remove statement, stack validity and evaluate scope
            else if(html[i] === '}' && html[i + 1] === '}') {
                mode = 'scan'
                i++

                //Offset for else statements, its a stupid solution to a problem (I should start the process of refactoring this (I won't))
                const offset = statement.length + 4

                //Trim the white space from the outer sides of the statement 
                if(statement) statement = statement.trim()


                const statementType = statement[0]

                /**@type {Array | null} */
                const outputTag = statement.match(/^(--|-=|-%|%|=|__)/)

                const isVariable = !_STATEMENT_[statementType]

                if(outputTag)
                    statement = statement.slice(outputTag[0].length, statement.length) 

                //Get the latest statement from the stack
                const latest = stack[stack.length - 1]

                //If the statement is a variable and is inside the input variable 
                if(isVariable && statement in input)
                    content += ConvertOutPutTag(outputTag ? outputTag[0] : '', input[statement])
                else if(isVariable) { //if the statement is a variable 

                    if(stack.length === 0) 
                        throw new Error(`Variable "${statement}" does not exist`)

                    content += `{{${outputTag ? outputTag[0] : ''}${statement}}}`

                    if(!scopeVariables[latest])
                        scopeVariables[latest] = {}

                    if(!scopeVariables[latest][statement])
                        scopeVariables[latest][statement] = {} 

                    scopeVariables[latest][statement][outputTag ? outputTag[0] : ''] = true
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

                    const childSegments = Scan(html, input, stack, statementType === ':' ? htmlSegments['else'][statement] : htmlSegments[statement], i + 1)

                    if(!childSegments) return false

                    const [ newStartIndex, newOutput, newHtml, newStack ] = childSegments

                    i = newStartIndex
                    output += newOutput
                    html = newHtml
                    stack = newStack
                } 
                //If its a closing statement
                else if (statementType === '/') {

                    stack = ValidateScopes(stack, statement)

                    if(!stack) throw new SyntaxError("Missing or wrong closing statement")

                    if(stack.length === 0) {
                        
                        const result = ExecuteStatements(htmlSegments, latest, input)
                        
                        if(!result && result?.length !== 0) return false

                        output += result
                        htmlSegments = {}   
                        scopeVariables = {}
                    }
                    
                    return [i - (latest[0] === ':' ? offset : 0), output, html, stack]

                } else if (statementType === '+') {

                    const result = statement.match(/(\+include(\s+))(('(.+?)')|("(.+?)")|(`(.+?)`))/)

                    if(!result) 
                        throw new SyntaxError(`include statement " ${statement} " has the wrong format, the correct format is: " +include 'some/path/file.html' "`)

                    let path = result.filter(e => e)[5]

                    const [ resolvedPath, newArr ] = resolveIncludePath(path, relativePaths)

                    path = resolvedPath
                    relativePaths = newArr

                    const newHtml = fs.readFileSync(path)

                    html = html.slice(0, i + 1 - offset) + newHtml + html.slice(i + 1, html.length)

                    i -= offset
                }

                statement = ''
                content = ''

            } else {
                if(mode === 'write')
                    statement += html[i]
                else {
                    content += html[i]
                }
                    
            }
        }

        if(stack.length !== 0) throw new SyntaxError(`"${stack[stack.length - 1]}" statement scope is never closed`)

        output += content

        return output
    }
    catch(err) 
    {
        console.error(err)
        return false
    }   
}



function ExecuteStatements(htmlSegments, statement, input) {
    try
    {
        const statementSeg = statement.split('-DUPLICATE-')[0].split(/\s+/g).filter(e => e)

        let value

        if(!statement_cache[statement]) {

            value = Validity(statementSeg, statement, input)

            if(!value) return false

            statement_cache[statement] = value
        
        }
        else 
            value = statement_cache[statement]       
            
        switch(statementSeg[0].toLowerCase()) {
            case '#if':
            case ':else':
                return If(htmlSegments, statement, value, input)
            case '#loop':
                return Loop(htmlSegments, statement, statementSeg, input)
        }

        return false
    }
    catch(err) {
        console.error(err)
        return false
    }
}


function Loop(htmlSegments, statement,  [command, variable, as, pipedVariable, index], input) {

    try
    {
        let output = ''

        let data = input[variable]        

        if(pipedVariable[pipedVariable.length - 1] === ',') pipedVariable = pipedVariable.substring(0, pipedVariable.length - 1)

        if(pipedVariable in input || index in input) throw new Error(`Duplicate variables "${pipedVariable in input ? pipedVariable : index}" are not allowed`)

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

            const scannedHtml = Segments(htmlSegments, statement, input)

            if(!scannedHtml && scannedHtml !== '') return false

            //Delete this variable since shallow copy won't
            delete input[pipedVariable]
            
            output += scannedHtml
        }


        return output
    }
    catch(err) {
        console.error(err)
        return false
    }
}

function If(htmlSegments, statement, script, input) {
    try
    {
        const result = generateIfStatement(script)(input)

        if(typeof result !== 'boolean') return false

        if(result) 
            return Segments(htmlSegments, statement, input)
        else {
            if(!htmlSegments.else) return ''

            const elseStatement = Object.keys(htmlSegments.else)[0]


            return ExecuteStatements(htmlSegments.else[elseStatement], elseStatement, input)
        }
    }
    catch(err) {
        console.error(new Error(`Invalid if-statement at "${statement}"`))
        return false
    }
    
}



function Segments(htmlSegments, statement, input) {
    try
    {
        const content = htmlSegments.content
    
        let segmentIndex = 0

        let output = content[segmentIndex]

        let scopeSegments = Object.keys(htmlSegments)

        for(const scopeSegment of scopeSegments) {

            if(scopeSegment === 'content' || scopeSegment === 'else') continue

            const executedStatement = ExecuteStatements(htmlSegments[scopeSegment], scopeSegment, input)

            if(!executedStatement && executedStatement !== '') return false

            segmentIndex++

            output += executedStatement + content[segmentIndex]
        }

        //Cancel early if there are no scope made variables
        if(!scopeVariables[statement]) return output

        /**@type {string[]} */
        const variables = Object.keys(scopeVariables[statement])
        
        //Regex (cat)
        let rex = ''

        let targetObj = {}
        const targetFunc = v => targetObj[v]

        for(const variable of variables) {     
            
            if(!(variable in input)) throw new Error(`Variable "${variable}" does not exist`)
            
            const outputTags = Object.keys(scopeVariables[statement][variable])

            for(let j = 0; j<outputTags.length; j++) {

                const outputTag = outputTags[j]

                rex += `{{${outputTag}${variable}}}` + '|'

                const newOutput = ConvertOutPutTag(outputTag, input[variable])

                if(!newOutput) return false

                targetObj[`{{${outputTag}${variable}}}`] = newOutput                    
            }
        }

        //Replace all the variables at the same time which removes the possibility of a variable output being replaced
        return replace.call(output, new RegExp(rex.slice(0, -1), 'g'), targetFunc)
    }
    catch(err) {
        console.error(err)
        return false
    }
}