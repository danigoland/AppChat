var appControllers = angular.module('appControllers', ['luegg.directives']);

appControllers.controller('messagesCTRL', ['$scope', '$http', 'socket', function ($scope, $http, socket) {

    function Conversation(id, user, lastMsg) {
        this.id = id;
        this.user = user;
        this.lastMsg = lastMsg;
        this.isTyping = false;

    }  // conv obj constructor.

    function getClientIndexById(id) {
        for (var i in $scope.conversations) {
            console.log('GCBN - id:', id);
            console.log('GCBN - checking:', $scope.conversations[i]);
            if ($scope.conversations[i].id == id) {
                console.log('GCBN - Found:', i, '(index)');
                return i;
            }
        }
    }

    function loadMessage(msg, id) {
        $scope.messages.push(msg);
        var exist = false;
        for (var j in $scope.conversations) {
            if (msg.user == $scope.conversations[j].user) {
                exist = true;
                $scope.conversations[j].id = id;
                $scope.conversations[j].lastMsg = msg;
            }
        }
        if (exist == false) {
            $scope.conversations.push(new Conversation(id, msg.user, msg));
        }
    }

    $http.get('/api/messages')
        .success(function (messages) {
            $scope.conversations = [];
            $scope.messages = [];
            for (var i in messages) {
                loadMessage(messages[i]);
            }
        });

    socket.emit('login', 'System', function () {
    });

    socket.on('message', function (msg, id) {
        console.log(msg, id);
        loadMessage(msg, id);
    });

    socket.on('typing', function (data) {

        console.log(data.id, 'is typing..', data.isTyping);
        var index = getClientIndexById(data.id);
        if (index)
            index.isTyping = data.isTyping;
    });

    socket.on('disconnect', function () {
        alert('disconnect');
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

appControllers.controller('conversationCTRL', ['$scope', '$routeParams',
    function ($scope, $routeParams) {
        var isExist = false;
        for (var i in $scope.conversations) {
            if ($scope.conversations[i].user == $routeParams.user)
                isExist = true;
        }
        if (!isExist)
            window.location = '#/';
        $scope.user = $routeParams.user;
        $scope.current = $routeParams.user;
    }]);
