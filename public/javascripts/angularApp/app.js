var app = angular.module("app", []);  // TODO: Auto-scroll down

app.factory('socket', function ($rootScope) {
    var socket = io.connect(window.location.hostname + ':8081');
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
});

app.controller('messageCTRL', ['$scope', '$http', 'socket', function ($scope, $http, socket) {

    function Conversation(user, lastMsg) {
        this.user = user;
        this.lastMsg = lastMsg;

    }  // conv obj constructor.


    $scope.focus = function () {
        var messages = $('#chat-messages')[0].children;
        var lastIndex = messages.length - 1;
        messages[lastIndex].focus();

    };

    function loadMessage(msg) {
        $scope.messages.push(msg);
        var exist = false;
        for (var j in $scope.conversations) {
            if (msg.user == $scope.conversations[j].user) {
                exist = true;
                $scope.conversations[j].lastMsg = msg;
            }
        }
        if (exist == false) {
            $scope.conversations.push(new Conversation(msg.user, msg));
        }
    }

    $http.get('/api/messages')
        .success(function (messages) {
            $scope.conversations = [];
            $scope.messages = [];
            $scope.$watch($scope.messages, function () {
                console.log('message object changed!');
            }), 1;
            for (var i in messages) {
                loadMessage(messages[i]);
            }
        });
    socket.emit('login', 'System', function () {
    });
    socket.on('message', function (msg) {
        loadMessage(msg);
    });


    $scope.sendMessage = function (user, body) {
        if ((user) && (body))
            if (body.length > 0 && user.length > 0) {
                $scope.messageInput = '';
                var time = new Date().toISOString();
                var msg = {user: user, direction: 'out', body: body, time: time};
                socket.emit("systemMessage", msg, function (err) {
                    if (!err)
                        loadMessage(msg);
                });
            }
    };

    $scope.sendTo = function (name) {
        $scope.current = name;
        $('#messageInput').focus();
    }

}]);
