;(function() {
	'use strict';

	angular.module('cmms').controller('adminDashCtrl', function(){

		console.log('inside adminDashCtrl')	

		angular.extend(this, {
			value2: '2 on the child controller',		
		})

		console.log("controller vars = ",this.value1,this.value2)
		
	})

})();