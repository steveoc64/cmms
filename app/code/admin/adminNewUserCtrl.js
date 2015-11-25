;(function() {
	'use strict';

	angular.module('cmms').controller('adminNewUserCtrl', function(Session){
	
		console.log('.. adminNewUserCtrl')

		angular.extend(this, {
			label: 'adminNewUserCtrl',
			session: Session,
		})

	})

})();