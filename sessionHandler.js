'use strict';
var _ = require("lodash");

function SessionHandler(attributes) {
    var _data;
    var START_PROP_NAME = 'name';

    _init();

    function _init() {
        if (!_.has(attributes, 'sessionData')) {
            attributes['sessionData'] = _getInitialSessionData();
        }
        _data = attributes.sessionData;
    }

    function _getInitialSessionData() {
        return {
            query: {
                selectedProperties: {}
            },
            cart: []
        }
    }

    function isNewSession() {
        return !_.has(_data, 'query.queryPropName');
    }

    function getQueryPropName() {
        return isNewSession() ? START_PROP_NAME : _data.query.queryPropName;
    }

    function setPossibleValues(possibleValues) {
        _data.query.possibleValues = possibleValues;
    }

    function getPossibleValues() {
        return _data.query.possibleValues;
    }

    function getAllSelectedProperties() {
        return _data.query.selectedProperties;
    }

    function addSelectedProperty(name, value) {
        if (!_.has(_data, 'query.selectedProperties')) {
            _data.query['selectedProperties'] = {}
        }

        _data.query.selectedProperties[name] = value;
    }

    function appendSelectedProperties(properties) {
        if (!_.has(_data, 'query.selectedProperties')) {
            _data.query['selectedProperties'] = {}
        }

        _data.query.selectedProperties = _.assign({}, _data.query.selectedProperties, properties);
    }

    function setQueryProperty(name, possibleValues) {
        _data.query['queryPropName'] = name;
        _data.query['possibleValues'] = possibleValues;
    }

    function getCartItems() {
        return _data.cart;
    }

    function addToCart(product) {
        _data.cart.push(product);
    }

    function clearAll() {
        delete attributes.sessionData;
    }

    function clearQuery() {
        _data.query = {
            selectedProperties: {}
        };
    }

    return {
        isNewSession: isNewSession,
        getQueryPropName: getQueryPropName,
        setPossibleValues: setPossibleValues,
        getPossibleValues: getPossibleValues,
        getAllSelectedProperties: getAllSelectedProperties,
        addSelectedProperty: addSelectedProperty,
        appendSelectedProperties: appendSelectedProperties,
        setQueryProperty: setQueryProperty,
        getCartItems: getCartItems,
        addToCart: addToCart,
        clearQuery: clearQuery,
        clearAll: clearAll
    }
}

module.exports = SessionHandler;