"use strict"

const syntax = {
    'eq': '== ',
    '-eq': '!= ',
    'EQ': '=== ',
    '-EQ': '!== ',

    //Math
    '+': '+ ',
    '-': '- ',
    '/': '/ ',
    '*': '* ', 
    '%': '% ',

    //Logic
    'And': '&& ',
    'Or': '|| ',
    'True': 'true ',
    'False': 'false ',

    //Also logic
    '>': '> ',
    '<': '< ',
    '>=': '>= ',
    '<=': '<= ',
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
            if(statementSeg.length !== 4 && statementSeg.length !== 5) return [ null, '' ]

            if(statementSeg.length === 5 && statementSeg[3][statementSeg[3].length - 1] !== ',') return [null, 'missing mandatory comma sign']

            //If variable that will be looped isn't inside the input, return false
            if(!(statementSeg[1] in input) && !(statementSeg[1] in variables)) return [ null, `variable "${statementSeg[1]}" does not exist in the input` ]
            //If variable that 
            if(!Array.isArray(input[statementSeg[1]]) && !Array.isArray(variables[statementSeg[1]])) return [null, `variable "${statementSeg[1]}" is not iterable`]
            
            if(statementSeg[2].toLowerCase() !== 'as') return [null, 'missing mandatory "as" command']

            return [ true, null ]
        }

        if(command === ':else') {
            if(statementSeg.length === 1) {
                return "1 === 1"
            }
            statementSeg.shift()
            statementSeg[0] = '$' + statementSeg[0]
        }

        if(statementSeg[0].toLowerCase() !== '$if') return [null, command === ':else' ? 'else statement if continued can only be followed by an if statement' : 'command is unknown' ]


        let script = ''
        let isString = false
           
        for(let i = 1; i<statementSeg.length; i++) {
            if(statementSeg[i][0] === '`') 
                isString = true

            if(notAllowed[statementSeg[i]]) return [ null, 'follow the documentation for logic conditions' ]
            
            const sign = syntax[statementSeg[i]]
    
            if(sign)
                script += sign
            else {
                if(isString)
                    script += statementSeg[i] + ' '
                else {
    
                    const isFalseSign = statementSeg[i][0] === '!'
    
                    let variable
    
                    if(isFalseSign)
                        statementSeg[i] = statementSeg[i].substring(1, statementSeg[i].length)
    
                    if(statementSeg[i] in input)
                        variable = `this.#input["${statementSeg[i]}"] `  
                    else if(statementSeg[i] in variables)
                        variable = `variables["${statementSeg[i]}"] `
                    else 
                        variable = statementSeg[i] + ' '
    
                        
                    
                
                    script += isFalseSign ? '!' + variable : variable
                }
            }
    
            if(statementSeg[i][statementSeg.length - 1] === '`') 
                isString = false
        }

        return [script, null]
    }
    catch(err) {

        console.log(err)
        return false
    }
}


function ValidateVariableNames(input) {
    const keys = Object.keys(input)

    for(let i = 0; i<keys.length; i++) {
        if(keys[i].match(/#|@/gm))
            return `framework exclusive characters like "#" or "@" are not allowed in variable names ( ${keys[i]} )`
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