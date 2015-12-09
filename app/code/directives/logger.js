;(function(){
	
// Log browser to go at the top of a lister page

angular.module('cmms').directive('logger', function() {
	return {
		restrict: 'AE',
		templateUrl: 'html/includes/logger.html',
    replace: false,
    transclude: true
	}
})

})()