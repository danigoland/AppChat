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

appDirectives.directive('bootstrapSwitch', [
	function () {
		return {
			restrict: 'A',
			require: '?ngModel',
			link: function (scope, element, attrs, ngModel) {
				element.bootstrapSwitch({
					onColor: 'switchClass',
					offColor: 'switchClass',
					labelWidth: 10,
					state: false
				});

				element.on('switchChange.bootstrapSwitch', function (event, state) {
					scope.updateConversations(state);
					if (ngModel) {
						scope.$apply(function () {
							ngModel.$setViewValue(state);
						});
					}
				});

				scope.$watch(attrs.ngModel, function (newValue, oldValue) {
					if (newValue) {
						element.bootstrapSwitch('state', true, true);
					} else {
						element.bootstrapSwitch('state', false, true);
					}
				});
			}
		};
	}
]);