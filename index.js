//Polyfills, if you're not using ES6.
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

//Validator generators.
//If you want to add a new one, include a generator function here.
//The generator must return a function(key, value).
//This function in turn must return either:
//{valid: true}
//OR
//{valid: false, error: 'Your error message here'}
//Otherwise, the validator will crash.

function generateIntegerValidatorFunction() {
    "use strict";
    return function (key, value) {
        var testNumeric = generateNumericValidatorFunction()(value);
        if (testNumeric.valid) {
            if (value % 1 === 0) {
                return {valid: true}
            } else return {
                valid: false,
                error: 'The ' + key + ' field must be a positive or negative integer.'
            }
        } else return testNumeric.error;
    }
}

function generateMinValidatorFunction(params) {
    "use strict";
    return function (key, value) {
        try {
            if (typeof value === 'number' || !isNaN(value)) {
                if (value >= params[0]) return {valid: true};
                else return {
                    valid: false,
                    error: 'The ' + key + ' field must greater than or equal to ' + params[0] + '.'
                }
            } else if (typeof value === 'string') {
                if (key.length >= params[0]) return {valid: true};
                else return {
                    valid: false,
                    error: 'The ' + key + ' field cannot be less than ' + params[0] + 'characters long.'
                }
            } else return {
                valid: false,
                error: 'Validation error: Cannot restrict length of object of type ' + typeof value
            }
        } catch (error) {
            return {
                valid: false,
                error: 'Validation error: ' + error.message
            }
        }
    }
}
function generateMaxValidatorFunction(params) {
    "use strict";
    return function (key, value) {
        try {
            if (typeof value === 'number' || !isNaN(value)) {
                if (value <= params[0]) return {valid: true};
                else return {
                    valid: false,
                    error: 'The ' + key + ' field must less than or equal to ' + params[0] + '.'
                }
            } else if (typeof value === 'string') {
                if (key.length <= params[0]) return {valid: true};
                else return {
                    valid: false,
                    error: 'The ' + key + ' field cannot be more than ' + params[0] + 'characters long.'
                }
            } else return {
                valid: false,
                error: 'Validation error: Cannot restrict length of object of type ' + typeof value
            }
        } catch (error) {
            return {
                valid: false,
                error: 'Validation error: ' + error.message
            }
        }
    }
}

function generateNegativeValidatorFunction() {
    "use strict";
    return function (key, value) {
        var testInteger = generateIntegerValidatorFunction()(value);
        if (testInteger.valid) {
            if (value < 0) return {valid: true}
            else return {
                valid: false,
                error: 'The ' + key + ' field must be a negative integer.'
            }
        } else return testInteger.error;
    }
}

function generateNumericValidatorFunction() {
    "use strict";
    return function (key, value) {
        if (typeof value === 'number' || !isNaN(value)) {
            return {valid: true}
        } else return {
            valid: false,
            error: 'The ' + key + ' field must be a numeric value.'
        }
    };
}

function generatePositiveValidatorFunction() {
    "use strict";
    return function (key, value) {
        var testInteger = generateIntegerValidatorFunction()(value);
        if (testInteger.valid) {
            if (value > 0) return {valid: true}
            else return {
                valid: false,
                error: 'The ' + key + ' field must be a positive integer.'
            }
        } else return testInteger.error;
    }
}

function generateRequiredValidatorFunction() {
    "use strict";
    return function (key, value) {
        if (value) return {valid: true}
        else return {
            valid: false,
            error: 'The ' + key + ' field is required.'
        }
    }
}

//Exports a class.

//This class looks something like this:
//{
//  errors: [],
//  validatorFunctionFor: function(criterion_, params_)
//}

//Simply instantiate it with your form data and validation rules.
//The form data and validation rules should be objects.
//The errors property is a string array containing any validation errors encountered.

//Example:

/*
 var Validator = require('feathers-validator');
 var validator = new Validator(data, {
 username: 'required|max:255',
 password: 'required|min:6',
 email: 'required|email',
 add_to_mailing_list: 'required|boolean'
 });

 console.log('There were ' + validator.errors.length + ' errors in your input.');
 */

//RULES:
//Can take any of the following forms:
//1.
//  A string, with rules separated by pipes (|).
//  Rule parameters are denoted by a colon (:) and separated by commas (,).
//  Example: 'required|min:6|rule:foo,bar'
//2.
//  An object, where every rule is an object.
//  Rule parameters take the form of arrays.
//  Example:
//  {
//      required: true,
//      min: 6,
//      rule: ['foo', 'bar']
//  }

module.exports = function (data, rules) {
    "use strict";

    this.errors = [];

    this.validatorFunctionFor = function (criterion_, params_) {

        var generateFunction = function (criterion, params) {
            if (criterion === 'integer')
                return generateIntegerValidatorFunction();
            else if (criterion === 'max')
                return generateMaxValidatorFunction(params);
            else if (criterion === 'min')
                return generateMinValidatorFunction(params);
            else if (criterion === 'negative')
                return generateNegativeValidatorFunction();
            else if (criterion === 'numeric')
                return generateNumericValidatorFunction();
            else if (criterion === 'positive')
                return generatePositiveValidatorFunction();
            else if (criterion === 'required')
                return generateRequiredValidatorFunction();

            return null; //Fallthrough
        }

        //If parameters were not given already
        if (!params_) {
            //Parse criteria with pipes
            var splitByPipe = criterion_.split('|');

            if (splitByPipe.length > 1) {
                var criterion = splitByPipe[0];
                return generateFunction(criterion_, splitByPipe[1].split(','));
            } else return generateFunction(criterion_);
        } else return generateFunction(criterion_, params_);
    }

    //Yay
    var keys = Object.keys(rules);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var rule = rules[key];
        if (typeof rule === 'string') {
            // i.e. 'min:6'
            var stringCriteria = rule.split('|');
            stringCriteria.forEach(function (criterion) {
                var assert = this.validatorFunctionFor(criterion);
                if (assert) {
                    var result = assert(key, data[key]);
                    if (!result.valid) {
                        this.errors.push(result.error);
                    }
                } else throw new Error('Unrecognized criterion: "' + criterion + '"');
            });
        } else if (typeof rule === 'object') {
            // i.e. { min: 6 }
            var objectCriteria = Object.keys(rule);
            objectCriteria.forEach(function (criterion) {
                var assert = this.validatorFunctionFor(criterion, typeof rule[key] === 'object' ? rule[key] : [rule[key]]);
                if (assert) {
                    var result = assert(key, data[key]);
                    if (!result.valid) {
                        this.errors.push(result.error);
                    }
                } else throw new Error('Unrecognized criterion: "' + criterion + '"');
            });
        }
    }
};