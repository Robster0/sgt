"use strict"

const { translateScript } = require('../utils.js')

/**
* validates the statement
* @param {*} statementSeg statement split by whitespace
* @param {*} statement current statement
* @param {*} input the input
* @returns {boolean | string}
*/
exports.Validity = function(statementSeg, statement, input) {
    try
    {
        const command = statementSeg[0].toLowerCase()
        //validate loops
        if(command === '#loop') {

            //if length isn't four or five, return false
            if(statementSeg.length !== 4 && statementSeg.length !== 5) throw new SyntaxError('Invalid loop statement')

            if(statementSeg.length === 5 && statementSeg[3][statementSeg[3].length - 1] !== ',') throw new SyntaxError('missing mandatory comma sign')

            //If variable that will be looped isn't inside the input, return false
            if(!(statementSeg[1] in input)) throw new Error(`variable "${statementSeg[1]}" does not exist in the input`)
            //If variable that 
            if(!Array.isArray(input[statementSeg[1]])) throw new Error(`variable "${statementSeg[1]}" is not iterable`)
            
            if(statementSeg[2].toLowerCase() !== 'as') throw new SyntaxError('missing mandatory "as" command')

            return true
        }

        const isElse = command === ':else'

        if(isElse) {
            if(statementSeg.length === 1) {
                return "true"
            }

            if(statementSeg[1] !== 'if')
                throw new SyntaxError('else statement if continued can only be followed by an if statement')
        } else 
            if(command !== '#if') 
                throw new SyntaxError('command is unknown')
        
        let iftype = isElse ? 'if' : '#if'
        
        let index = statement.search(iftype)      

        return translateScript(statement.slice(index + iftype.length, statement.length) + ' ', input)
    }
    catch(err) {
        console.log(err)
        return false
    }
}


/**
* validates if the keys inside input are valid
* @param {object} input 
* @returns {string | null}
*/
exports.ValidateVariableNames = function(input) {
    const keys = Object.keys(input)

    for(let i = 0; i<keys.length; i++) {
        if(keys[i].match(/#|@|\s|\(|\)|,/gm))
            return `framework exclusive keywords are ['#'  '/'  '%'  ':'  '@'  ' '  ','  '('  ')'  '-DUPLICATE-' ], these are not allowed in variable names ( ${keys[i]} )`
    }
        


    return null
            
}
/**
* checks if the scope is valid
* @param {string[]} stack 
* @param {string} command 
* @returns {boolean} if scope is valid
*/
exports.ValidateScopes = function(stack, command) {

    const latest = stack[stack.length - 1].split(' ')[0]

    switch(command)
    {
        case '/if':
            if(latest !== ':else' && latest !== '#if')
                return false

            stack.pop()

            return stack
        case '/loop':
            if(latest !== '#loop') 
                return false
                
            stack.pop()

            return stack
        default:
            return false
    }  
}