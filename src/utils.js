"use strict"

const path_node = require('path')
const fs = require('fs')

/** 
* @type {object} list of all the variable attribute and their name
*/
exports._ATTRIBUTES_ = {
    '%': 'Escape',
    '@': 'Trim'
}

exports._STATEMENT_ = {
    '+': true,
    '#': true,
    ':': true,
    '/': true,
}

const SYNTAX = {
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

const NOTALLOWED = {
    '==': 1,
    '!=': 1,
    '===': 1,
    '!==': 1,
    '&&': 1,
    '||': 1,
    'true': 1,
    'false': 1,
}

const STRINGDELIMITERS = {
    '`': '`',
    '"': '"',
    "'": "'"
}



/**
* @param {string} script 
* @returns Function that returns if the script executed inside an if statement is true or not
*/
exports.generateIfStatement = function(script) {
    return new Function('input', `
        try
        {
            if( ${script} )
                return true
            
            return false
        }
        catch(err) {
            console.log(err)
            return err
        }
    `)
}

/**
* @param {string} script 
* @param {object} input 
* @returns translated script
*/
exports.translateScript = function(script, input) {

    let data = []
    let variable = ''

    let isStringLiteral = false
    let stringDelimiter = null
        
    for(let i = 0; i<script.length; i++) {
        if(script[i] === STRINGDELIMITERS[script[i]] && !isStringLiteral) {
            isStringLiteral = true

            stringDelimiter = script[i]
        }      
        else if(script[i] === stringDelimiter && isStringLiteral) {
            isStringLiteral = false

            stringDelimiter = null
        }
    
        if(isStringLiteral) continue
    
        if(!script[i].match(/\s|\(|\)|,|!/gms)) {
            variable += script[i]
    
        } else {
            if(variable in input) {
                data.push({name: variable, variant: 'input', start: i - variable.length, end: i})
            } else if(variable in SYNTAX) {
                data.push({name: variable, variant: variable, start: i - variable.length, end: i})
            } else if(variable in NOTALLOWED) 
                throw new SyntaxError('Invalid if statement syntax')
    
            variable = ''
        }
    }


    if(isStringLiteral) throw new TypeError('string literal is never closed')

    let offset = 0

    for(let i = 0; i<data.length; i++) {
        const [ newS, newOffset ] = swap(data[i], script, offset)

        script = newS
        offset += newOffset 
    }

    return script
}
/**
* @param {object} v 
* @param {string} script  
* @param {string} offset   
*/
function swap(v, script, offset) {
    let add = 0
    /**@type {string} */
    let value = ''

    if(v.variant === 'input') {

        add = 9
        value = `input["${v.name}"]`

    } else {
        add = SYNTAX[v.variant].length - v.variant.length 
        value = SYNTAX[v.variant]
    }

    script = script.slice(0, v.start + offset) + value + script.slice(v.end + offset)

    return [ script, add ]

}

/**
* @param {object} obj object to be traversed 
* @param {string} path the current path
* @param {object} newInput where the paths will be stored 
* @returns object with all the paths
*/
exports.objectPaths = function(obj, path, newInput = {}) {
    if(typeof obj !== 'object' || Array.isArray(obj)) {

        newInput[path] = obj

        return newInput
    }

    const keys = Object.keys(obj)

    for(let i = 0; i<keys.length; i++) {
        let result = exports.objectPaths(obj[keys[i]], path + '.' + keys[i], newInput)

        if(!result) return false
    }


    return newInput
}
/**
* @param {string} s 
* @returns escaped string 
*/
exports.Escape = function(s) {

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
/**
* resolve path
* @param {string} path 
* @param {string[]} arr 
*/
exports.resolveIncludePath = function(path, arr) {

    if(path_node.isAbsolute(path)) {
        arr.push(exports.getDir(path))
    } else  {

        for(let i = 0; i<arr.length; i++) {
            if (!fs.existsSync(arr[i]+'/'+path)) continue

            path = path_node.resolve(arr[i]+'/'+path)

            arr.push(exports.getDir(path))

            break
        }
    }

    return [ path, arr ]
}
/**
* gets the directory of the current path
* @param {string} path 
*/
exports.getDir = function(path) {
    
    for(let i = path.length; i>=0; i--) {
        if(path[i] !== '/' && path[i] !== '\\') continue
    
        return path.slice(0, i)
    }

    return ''
}