var appDirectives = angular.module('appDirectives', []);

appDirectives.directive('autoFocus', function () {
    return {
        restrict: 'A',

        template: function (scope, element, attrs) {
            console.log(scope, element, attrs);
            scope.$watch(function () {
                return scope.$eval(attrs.autoFocus);
            }, function (newValue) {
                if (newValue == true) {
                    element[0].focus();
                }
            });
        }
    };
});