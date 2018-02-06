'use strict';
var _ = require("lodash");

function Catalog(data) {
    var _data = data;

    function getProduct(criteria) {
        var partialMatches = _(_data).filter(_.matches(criteria)).value();
        return partialMatches.length === 1 ? partialMatches[0] : {};
    }

    function getMatchedProducts(criteria) {
        return _(_data).filter(_.matches(criteria)).value();
    }

    function getTopRatioProperty(criteria) {
        var matches = _(_data).filter(_.matches(criteria))
        var matchCount = matches.value().length;

        var groupByPropName = matches
            .map(_.partial(objectPropertyToArray, criteria))
            .flatten()
            .groupBy(getKeyFromPropertyString);

        var directKeys = {};
        var maxCountProps = [];
        groupByPropName.each(function (values, key) {
            var uniqValues = _.uniq(values);
            if (uniqValues.length === 1 && matchCount === values.length) {
                directKeys[key] = uniqValues[0].split(':')[1];
            } else {
                maxCountProps.push({
                    key: key,
                    count: values.length
                });
            }
        });

        if (maxCountProps.length == 0) {
            return {};
        }

        var maxCountProp = _.maxBy(maxCountProps, 'count');
        var possibleValues = groupByPropName.value()[maxCountProp.key];
        var uniqPossibleValues = _(possibleValues).map(removePropName).uniq().value();

        return {
            name: maxCountProp.key,
            possibleValues: uniqPossibleValues,
            directKeys: directKeys
        }
    }

    function getPossibleValues(propName) {
        return _(_data).map(_.property(propName)).uniq().value();
    }

    function objectPropertyToArray(ignoreKeys, obj) {
        var result = [];

        _.forOwn(obj, function (value, key) {
            if (!ignoreKeys.hasOwnProperty(key)) {
                if (key !== 'display') {
                    result.push(key + ":" + value)
                }
            }
        });

        return result;
    }

    function getKeyFromPropertyString(propString) {
        return propString.split(":")[0];
    }

    function removePropName(propString) {
        return propString.split(":")[1];
    }

    return {
        getProduct: getProduct,
        getMatchedProducts: getMatchedProducts,
        getTopRatioProperty: getTopRatioProperty,
        getPossibleValues: getPossibleValues
    }
}

module.exports = Catalog;