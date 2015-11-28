#feathers-validator

WIP. Validator for Feathers services, or any service.

```require('feathers-validator')``` will exports a class.
Simply instantiate it with your form data and validation rules.
The form data and validation rules should be objects.
The errors property is a string array containing any validation errors encountered.

Example:

```javascript
var feathers = require('feathers');

var myService = {
	create: function(data, params, callback) {
			var Validator = require('feathers-validator');
			var validator = new Validator(data, {
				username: 'required|max:255',
				password: 'required|min:6',
				email: 'required|email',
				add_to_mailing_list: 'required|boolean'
			});
			
			if (validator.errors.length == 0) {
				//Request is valid! Do stuff safely, without
				//breaking your app!
				//...
				callback(null, {error: 'success'});
			} else {
				//Validation errors occurred.
				//...
				callback(null, {error: 'failure', errors: validator.errors});
			}
		}
}

var app = feathers();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', myService);

module.exports = app;
```

##Rules

Can take any of the following forms:
1.
  A string, with rules separated by pipes (|).
  Rule parameters are denoted by a colon (:) and separated by commas (,).
  Example: 
  ```javascript
  'required|min:6|rule:foo,bar'
  ```
2.
  An object, where every rule is an object.
  Rule parameters take the form of arrays.
  Example:
  ```javascript
  {
      required: true,
      min: 6,
      rule: ['foo', 'bar']
  }
  ```
  
##Available Validation Rules
*	**integer**: Asserts a datum is an integer.
*	**max**: Limits a string to a maximum length, or restricts the magnitude of a Number.
*	**min**: Limits a string to a minimum length, or restricts the magnitude of a Number.
*	**negative**: Asserts a Number is less than zero.
*	**numeric**: Asserts a datum is a Number.
*	**positive**: Asserts a Number is greater than zero.
*	**required**: Asserts a key is present in the request.
  
##Contributing to feathers-validator

This package is really easy to extend.
All validation is performed by functions. feathers-validator
determines which one to use by parsing input, then running
a *generator function*.

If you want to add a new one, include a generator function in index.js.
The generator must return a ```function(key, value)```.
This function in turn must return either:
```{valid: true}```
OR
```{valid: false, error: 'Your error message here'}```
Otherwise, the validator will crash.

Then, submit a pull request. It will be reviewed, and if it's good,
I'll add it to feathers-validator.