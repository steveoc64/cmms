;(function() {
	'use strict';

	angular.module('cmms').controller('workerMapCtrl',
	 function($state){

		return {
			engriven: function() {
				$state.go("worker.machines")
			}
		}	
	})

})();