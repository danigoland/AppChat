var appControllers = angular.module('appControllers', ['luegg.directives', 'angular-inview']);

function Conversation(id, name, androidVersion, deviceModel, lastMsg, unreadMsgs) {
    this.id = id;
    this.name = name;
    this.androidVer = androidVersion;
    this.deviceModel = deviceModel;
    this.lastMsg = lastMsg;
    this.unreadMessages = unreadMsgs;
    this.isTyping = false;

}  // conv obj constructor.

appControllers.controller('mainCTRL', ['$scope', '$http', 'socket', 'currentConversation', function ($scope, $http, socket, currentConversation) {

    function updateLastMessage(msg, current) {
        var exist = false;
        console.log('updating..');
        var convs = $scope.conversations;
        for (var i in convs) {
            if (convs[i].id == msg.user) {
                convs[i].lastMsg = msg;
                exist = true;
                console.log('current?', current);
                if (current == false) {
                    console.log('asd');
                    convs[i].unreadMessages.push({_id: msg._id, body: msg.body});
                }
            }
        }
        if (!exist)
            $http.get('/api/users/' + msg.user)
                .success(function (users) {
                    var user = users[0];
                    console.log('the user isnt in the convs');
                    $scope.conversations.push(new Conversation(user._id, user.name, user.androidVersion,
                        user.deviceModel, user.lastMessage, user.unreadMessages));
                });
    }

    $scope.searchUser = '';
    $scope.conversations = [];
    $scope.messages = [];
    $scope.messageInput = 'test';

    socket.emit('login', {name: 'System'}, function () {
    });

    socket.on('message', function (msg) {
        var current = currentConversation.getCurrent();
        if (current)
            if (msg.user == current.id) {
                updateLastMessage(msg, true);
                msg.userName = current.name;
                $scope.messages.push(msg);
            }
            else
                updateLastMessage(msg, false);
        else
            updateLastMessage(msg, false);

    });

    socket.on('messageChangedToRead', function (id) {
        console.log(id);
        var convs = $scope.conversations;
        var msgs = $scope.messages;
        for (var i in convs) {
            for (var j in convs[i].unreadMessages) {
                console.log(convs[i].unreadMessages[j], j);
                if (convs[i].unreadMessages[j]._id == id) {
                    convs[i].unreadMessages.splice(j, 1);
                }
            }
        }
        for (var i in msgs) {
            if (msgs[i]._id == id)
                $scope.messages[i].read = true;
        }
    });

    socket.on('typing', function (data) {
        console.log(data.id, 'is typing..', data.isTyping);
        var index = getClientIndexById(data.id);
        console.log(index);
        if (index)
            $scope.conversations[index].isTyping = data.isTyping;
    });

    socket.on('disconnect', function (reason) {
        console.log('socket disconnected. reason -', reason);
    });

    function getClientIndexById(id) {
        for (var i in $scope.conversations) {
            if ($scope.conversations[i].id == id) {
                return i;
            }
        }
    }

    $http.get('/api/users')
        .success(function (users) {
            for (var i in users) {
                var user = users[i];
                $scope.conversations.push(new Conversation(user._id, user.name, user.androidVersion,
                    user.deviceModel, user.lastMessage, user.unreadMessages));
            }
            $scope.currentUser = '';
        });
    //
    //$http.get('/api/messages')
    //    .success(function (messages) {
    //        for (var i in messages) {
    //            loadMessage(messages[i]);
    //        }
    //    });


    $scope.changeUser = function () {
        //$scope.current = name;
        $('#messageInput').focus();
        $scope.searchUser = '';
    }

}]);

appControllers.controller('conversationCTRL', ['$scope', '$routeParams', '$http', 'socket', 'currentConversation',
    function ($scope, $routeParams, $http, socket, currentConversation) {
        document.title = "Angular App";
        var isExist = false;
        for (var i in $scope.conversations) {
            if ($scope.conversations[i].name == $routeParams.user) {
                if ($routeParams.user)
                    document.title = "Angular App - " + $scope.conversations[i].name;
                isExist = true;
                $scope.$parent.currentUser = $scope.conversations[i];
                //console.log($scope.conversations[i]);
                currentConversation.setCurrent($scope.$parent.currentUser);
                $http.get('/api/messages/' + $scope.$parent.currentUser.id)
                    .success(function (msgs) {
                        $scope.$parent.messages = [];
                        for (var i in msgs) {
                            var msg = msgs[i];
                            msg.userName = $routeParams.user;
                            $scope.$parent.messages.push(msg);
                        }
                    });

            }
        }

        if (!isExist) {
            topConversation = $scope.currentConvView[0];
            if (topConversation)
                window.location = '#/' + topConversation.name;
        }
        $scope.user = $routeParams.user;

        $scope.MessageIsViewed = function ($event, $inview) {
            var viewed = $event.inViewTarget;
            if (viewed) {
                var readStatus = (viewed.attributes.getNamedItem('read').value === 'true');
                //console.log('Message Viewed | Id:', viewed.id, '| Status:', readStatus);
                if (readStatus == false)
                    socket.emit('messageIsRead', viewed.id);
            }
        }
    }]);

appControllers.controller('keyboardCTRL', ['$scope', 'socket', 'currentConversation', function ($scope, socket, currentConversation) {
    $scope.messageInput = '';
    $scope.sendMessage = function (body) {
        var user = currentConversation.getCurrent().id;
        console.log(user, body);
        if ((user) && (body))
            if (body.length > 0 && user.length > 0) {
                $scope.messageInput = '';
                console.log($scope.messageInput);
                var time = new Date().toISOString();
                var msg = {user: user, direction: 'out', body: body, time: time};
                console.log(msg);
                socket.emit("systemMessage", msg, function (err) {
                    if (err)
                        console.log('err sending message');
                    console.log(err);
                });
            }
    };

    var typingTo = undefined;
    var typing = false;
    var timeout = undefined;

    function timeoutFunction() {
        typing = false;
        socket.emit("systemTyping", {to: typingTo, state: false});
        console.log('stopped typing to', typingTo, new Date().toLocaleTimeString());
    }

    $scope.keyboardHandler = function (e) {
        if (currentConversation.getCurrent())
        typingTo = currentConversation.getCurrent().id;
        if (typingTo) {
            if (e.which !== 13 || !e.shiftKey) {
                if (typing === false && $("#keyboard-message-input").is(":focus")) {
                    typing = true;
                    socket.emit("systemTyping", {to: typingTo, state: true});
                    console.log('typing..', typingTo, new Date().toLocaleTimeString());
                    clearTimeout(timeout);
                    timeout = setTimeout(timeoutFunction, 3000);
                } else {
                    clearTimeout(timeout);
                    timeout = setTimeout(timeoutFunction, 3000);
                }
            }
            else {
                e.preventDefault();
                $scope.sendMessage($scope.messageInput);
                clearTimeout(timeout);
                console.log('stopped typing', new Date().toLocaleTimeString());
                typing = false;
                socket.emit('systemTyping', {to: typingTo, state: false});
            }
        }
    };

}]);
