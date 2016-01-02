var app = angular.module("app", ['appControllers', 'appDirectives', 'ngRoute']);  // TODO: Auto-scroll down

app.factory('socket', function ($rootScope) {
    var socket = io.connect(window.location.hostname + ':3333');
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});  // Socket Service.

app.factory('currentConversation', function ($rootScope) {
    var current = undefined;
    return {
        setCurrent: function (name) {
            current = name;
        },
        getCurrent: function () {
            return current;
        }
    };
});

app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'javascripts/angularApp/partials/conversation.html',
            controller: 'conversationCTRL'
        }).
        when('/:user', {
            templateUrl: 'javascripts/angularApp/partials/conversation.html',
            controller: 'conversationCTRL'
        }).
        otherwise({
            redirectTo: '/'
        });
    }]);


