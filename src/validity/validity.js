"use strict"

const syntax = {
    'eq': '==',
    '-eq': '!=',
    'EQ': '===',
    '-EQ': '!==',

    //Math
    '+': '+',
    '-': '-',
    '/': '/',
    '*': '*', 
    '%': '%',

    //Logic
    'And': '&&',
    'Or': '||',
    'True': 'true',
    'False': 'false',

    //Also logic
    '>': '>',
    '<': '<',
    '>=': '>=',
    '<=': '<=',
}

const notAllowed = {
    '==': 1,
    '!=': 1,
    '===': 1,
    '!==': 1,
    '&&': 1,
    '||': 1,
    'true': 1,
    'false': 1,
}

function Validity(statementSeg, input, variables) {
    try
    {
        const command = statementSeg[0].toLowerCase()
        //validate loops
        if(command === '$loop') {

            //if length isn't four or five, return false
            if(statementSeg.length !== 4 && statementSeg.length !== 5) throw new SyntaxError('Invalid loop statement')

            if(statementSeg.length === 5 && statementSeg[3][statementSeg[3].length - 1] !== ',') throw new SyntaxError('missing mandatory comma sign')

            //If variable that will be looped isn't inside the input, return false
            if(!(statementSeg[1] in input) && !(statementSeg[1] in variables)) throw new Error(`variable "${statementSeg[1]}" does not exist in the input`)
            //If variable that 
            if(!Array.isArray(input[statementSeg[1]]) && !Array.isArray(variables[statementSeg[1]])) throw new Error(`variable "${statementSeg[1]}" is not iterable`)
            
            if(statementSeg[2].toLowerCase() !== 'as') throw new SyntaxError('missing mandatory "as" command')

            return true
        }

        if(command === ':else') {
            if(statementSeg.length === 1) {
                return "1 === 1"
            }
            statementSeg.shift()
            statementSeg[0] = '$' + statementSeg[0]
        }

        if(statementSeg[0].toLowerCase() !== '$if') 
            throw new SyntaxError(command === ':else' ? 'else statement if continued can only be followed by an if statement' : 'command is unknown')

        let script = ''
        for(let i = 1; i<statementSeg.length; i++)
            script += statementSeg[i] + ' '


        console.log("BEFORE")
        console.log(script)
        console.log("BEFORE\r\n")

        let data = []
        let variable = ``
        
        let isString = false
        
        for(let i = 0; i<script.length; i++) {
            if(script[i] === '`')
                isString = isString ? false : true
        
            if(isString) continue
        
            if(!script[i].match(/\s|\(|\)|,/gms)) {
                variable += script[i]
        
            } else {
                if(variable in input) {
                    data.push({name: variable, variant: 1, start: i - variable.length, end: i})
                } else if(variable in variables) {
                    data.push({name: variable, variant: 0, start: i - variable.length, end: i})
                } else if(variable in syntax) {
                    data.push({name: variable, variant: variable, start: i - variable.length, end: i})
                }
        
                variable = ``        
            }
        }

        if(isString) throw new TypeError('backtick is never closed')
        
        let offset = 0

        for(let i = 0; i<data.length; i++) {
            const [ newS, newOffset ] = swap(data[i], script, offset)
        
            script = newS
            offset += newOffset 
        }

        return script
    }
    catch(err) {

        console.log(err)
        return false
    }
}

function swap(v, script, offset) {
    let add = 0
    let value = ``

    if(v.variant === 1 || v.variant === 0) {

        add = v.variant === 1 ? 15 : 13
        value = v.variant === 1 ? `this.#input["${v.name}"]` : `variables["${v.name}"]`

    } else {
        add = syntax[v.variant].length - v.variant.length 
        value = syntax[v.variant]
    }

    script = script.slice(0, v.start + offset) + value + script.slice(v.end + offset)

    return [ script, add ]

}


function ValidateVariableNames(input) {
    const keys = Object.keys(input)

    for(let i = 0; i<keys.length; i++) {
        if(keys[i].match(/#|@|\s|\(|\)|,/gm))
            return `framework exclusive keywords are ['#'  '$'  '/'  ':'  '@'  ' '  ','  '('  ')'  '-DUPLICATE-' ], these are not allowed in variable names ( ${keys[i]} )`
    }
        


    return null
            
}

function ValidateScopes(stack, command) {

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


module.exports = { Validity, ValidateVariableNames, ValidateScopes }