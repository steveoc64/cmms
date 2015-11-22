;(function() {
	'use strict';

	angular.module('cmms').controller('adminCtrl', function(){
	
		console.log('inside adminCtrl')

		angular.extend(this, {
			value1: '1 on parent controller'
		})

		console.log('this = ',this)
		
	})

})();