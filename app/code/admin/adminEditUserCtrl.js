;(function() {
	'use strict';

	angular.module('cmms').controller('adminEditUserCtrl', function(Session){
	
		console.log('.. adminEditUserCtrl')

		angular.extend(this, {
			label: 'adminEditUserCtrl',
			session: Session,
		})

	})

})();