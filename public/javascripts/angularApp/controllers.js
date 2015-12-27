var appControllers = angular.module('appControllers', ['luegg.directives']);

appControllers.controller('messagesCTRL', ['$scope', '$http', 'socket', function ($scope, $http, socket) {

    function Conversation(user, lastMsg) {
        this.user = user;
        this.lastMsg = lastMsg;

    }  // conv obj constructor.


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
        console.log($('#'._id)[0]);
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
    socket.on('message', function (msg) {
        console.log(msg);
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
