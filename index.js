//Polyfills, if you're not using ES6.
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

function validatorFunctionFor(criterion_, params_, data) {

    var generateFunction = function (criterion, params) {
        if (criterion === 'required')
            return generateRequiredValidatorFunction();

        else if (criterion === 'alpha_dash')
            return generateAlphaDashValidatorFunction();
        else if (criterion === 'alpha_num')
            return generateAlphaNumValidatorFunction();
        else if (criterion === 'boolean')
            return generateBooleanValidatorFunction();
        else if (criterion === 'confirmed')
            return generateConfirmedValidatorFunction(params, data);
        else if (criterion === 'email')
            return generateEmailValidatorFunction();
        else if (criterion === 'integer')
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
        else if (criterion === 'regex')
            return generateRegexValidatorFunction(params);

        return null; //Fallthrough
    }

    //If parameters were not given already
    if (params_ == undefined) {
        //Parse criteria with colons
        var splitByPipe = criterion_.split(':');

        if (splitByPipe.length > 1) {
            var criterion = splitByPipe[0];
            return generateFunction(criterion, splitByPipe[1].split(','));
        } else return generateFunction(criterion_);
    } else return generateFunction(criterion_, params_);
}

//Validator generators.
//If you want to add a new one, include a generator function here.
//The generator must return a function(key, value).
//This function in turn must return either:
//{valid: true}
//OR
//{valid: false, error: 'Your error message here'}
//Otherwise, the validator will crash.

function generateAlphaDashValidatorFunction() {
    "use strict";
    return function (key, value) {
        var regex = /^[A-Za-z0-9_-]+$/;
        if (regex.test(value)) return {valid: true};
        else return {
            valid: false,
            error: 'The ' + key + ' field must only contain letters, numbers, dashes or underscores.'
        }
    }
}

function generateAlphaNumValidatorFunction() {
    "use strict";
    return function (key, value) {
        var regex = /^[A-Za-z0-9]+$/;
        if (regex.test(value)) return {valid: true};
        else return {
            valid: false,
            error: 'The ' + key + ' field must only contain letters and numbers.'
        }
    }
}

function generateBooleanValidatorFunction() {
    "use strict";
    return function (key, value) {
        if ((value == 0 || value == 1) || (typeof value == "string" && (value =='true' || value =='false'))) return {valid: true};
        else return {
            valid: false,
            error: 'The ' + key + ' field must have a value of true or false.'
        }
    }
}

function generateConfirmedValidatorFunction(params, data) {
    "use strict";
    return function (key, value) {
        if (value) {
            if (data[key] === data[key + "_confirmation"]) return {valid: true};
            else return {
                valid: false,
                error: 'The two ' + key + ' fields must match.'
            }
        } else return {
            valid: false,
            error: 'The ' + key + ' field must be present, and it must be confirmed.'
        }
    }
}

function generateEmailValidatorFunction() {
    "use strict";
    return function (key, value) {
        //Check for RFC 5322 compliance.
        var regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
        if (regex.test(value)) return {valid: true};
        else return {
            valid: false,
            error: 'The ' + key + ' field must be a valid e-mail address.'
        }
    }
}

function generateIntegerValidatorFunction() {
    return function (key, value) {
        var testNumeric = generateNumericValidatorFunction()(key, value);
        if (testNumeric.valid) {
            if (value % 1 === 0) {
                return {valid: true}
            } else return {
                valid: false,
                error: 'The ' + key + ' field must be a positive or negative integer.'
            }
        } else return testNumeric;
    }
}

function generateMinValidatorFunction(params) {
    return function (key, value) {
        try {
            if (typeof value === 'number' || !isNaN(value) || value == undefined) {
                if (value >= params[0]) return {valid: true};
                else return {
                    valid: false,
                    error: 'The size of the ' + key + ' field must be greater than or equal to ' + params[0] + '.'
                }
            } else if (typeof value === 'string') {
                if (key.length >= params[0]) return {valid: true};
                else return {
                    valid: false,
                    error: 'The size of the ' + key + ' field cannot be less than ' + params[0] + 'characters long.'
                }
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
    return function (key, value) {
        try {
            if (typeof value === 'number' || !isNaN(value) || value == undefined) {
                if (value <= params[0]) return {valid: true};
                else return {
                    valid: false,
                    error: 'The size of the ' + key + ' field must be less than or equal to ' + params[0] + '.'
                }
            } else if (typeof value === 'string') {
                if (key.length <= params[0]) return {valid: true};
                else return {
                    valid: false,
                    error: 'The size of the ' + key + ' field cannot be more than ' + params[0] + 'characters long.'
                }
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
    return function (key, value) {
        var testInteger = generateIntegerValidatorFunction()(key, value);
        if (testInteger.valid) {
            if (value < 0) return {valid: true}
            else return {
                valid: false,
                error: 'The ' + key + ' field must be a negative integer.'
            }
        } else return testInteger;
    }
}

function generateNumericValidatorFunction() {
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
    return function (key, value) {
        var testInteger = generateIntegerValidatorFunction()(key, value);
        if (testInteger.valid) {
            if (value > 0) return {valid: true}
            else return {
                valid: false,
                error: 'The ' + key + ' field must be a positive integer.'
            }
        } else return testInteger;
    }
}

function generateRegexValidatorFunction(params) {
    "use strict";
    return function (key, value) {
        var regex = new RegExp("^" + params[0] + "$");
        if (regex.test(value)) return {valid: true};
        else return {
            valid: false,
            error: 'The ' + key + ' field must match this regular expression: \'' + params[0] + "'."
        }
    }
}

function generateRequiredValidatorFunction() {
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
//The errors() method returns a string array containing any validation errors encountered.

//Example:

/*
 var Validator = require('feathers-validator');
 var validator = new Validator(data, {
 username: 'required|max:255',
 password: 'required|min:6',
 email: 'required|email',
 add_to_mailing_list: 'required|boolean'
 });

 console.log('There were ' + validator.errors().length + ' errors in your input.');
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

    var errors = {};

    //Yay
    var keys = Object.keys(rules);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var rule = rules[key];
        if (typeof rule === 'string') {
            // i.e. 'min:6'
            var stringCriteria = rule.split('|');
            stringCriteria.forEach(function (criterion) {
                if (data[key] || rules[key].indexOf('required') != -1) {
                    var assert = validatorFunctionFor(criterion, null, data);
                    if (assert) {
                        var result = assert(key, data[key]);
                        if (!result.valid) {
                          var dataVal = data[key] || "";
                          addError(key, result.error, criterion, "ValidatorError", dataVal);
                        }
                    } else throw new Error('Unrecognized criterion: "' + criterion + '"');
                }
            });
        } else if (typeof rule === 'object') {
            // i.e. { min: 6 }
            var objectCriteria = Object.keys(rule);
            objectCriteria.forEach(function (criterion) {
                if (data[key] || rules[key].indexOf('required') != -1) {
                    var assert = validatorFunctionFor(criterion, typeof rule[criterion] === 'object' ? rule[criterion] : [rule[criterion]], data);
                    if (assert) {
                        var result = assert(key, data[key]);
                        if (!result.valid) {
                            var dataVal = data[key] || "";
                            addError(key, result.error, criterion, "ValidatorError", dataVal);
                        }
                    } else throw new Error('Unrecognized criterion: "' + criterion + '"');
                }
            });
        }
    }

    /***
    Format to mongoose type error
    "label": {
      "message": "Path `label` is required.",
      "name": "ValidatorError",
      "properties": {
        "type": "required",
        "message": "Path `{PATH}` is required.",
        "path": "label",
        "value": ""
      },
      "kind": "required",
      "path": "label",
      "value": ""
    }
    */
    function addError(key, message, kind, name, value) {
      errors[key] = { message : message, name : name, properties: { type : kind, message: message, path: key, value: value }, kind:kind, path:key, value:value };
    };

    this.errors = function () {
        "use strict";
        return errors;
    }
};
