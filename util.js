'use strict';
var _ = require("lodash");

function Utility() {
    function getInput(request) {
        return _.has(request, 'intent.slots.POSSIBLE_INPUT.value') ? request.intent.slots['POSSIBLE_INPUT'].value : '';
    }

    function validateInput(possibleValues, input) {
        var upperCaseInput = _.upperCase(input);
        var matches = _.filter(possibleValues, function (possibleValue) {
            return (_.upperCase(possibleValue) === upperCaseInput);
        });

        return (matches.length == 1);
    }

    function getPossibleInputs(values) {
        return _.join(values, ' or ');
    }

    function getProductShortDescription(product) {
        var values = _.values(product);
        return _.filter(values, function (value) {
            return !_.isObject(value);
        }).join(' ');

    }

    return {
        getInput: getInput,
        validateInput: validateInput,
        getPossibleInputs: getPossibleInputs,
        getProductShortDescription: getProductShortDescription
    }
};

module.exports = new Utility();