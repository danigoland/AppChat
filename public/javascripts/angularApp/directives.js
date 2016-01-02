var appDirectives = angular.module('appDirectives', []);

appDirectives.directive('message', function(){
return {
restrict: 'E',
transclude: true,
scope: { message:'=messageData', $index:'=messageIndex' },
	templateUrl: 'javascripts/angularApp/partials/message.html'

}
});

appDirectives.directive('conversations', function () {
	return {
		restrict: 'E',
		transclude: true,
		templateUrl: 'javascripts/angularApp/partials/conversations.html'
	}
});