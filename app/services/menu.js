;(function(){
	'use strict';

	angular.module('cmms').factory('Menu', function($resource,ServerName){
		return $resource(ServerName+'/menu/:id',{},{
			login: {method: 'POST'},
			logout: {method: 'DELETE', params:{id: '@id'}}
		})
	})

	angular.module('cmms').service('Menu', function(Session) {

		return {
			options: [
				{sref: 'aa', title: 'Menu 1'},
				{sref: 'bb', title: 'Menu Option 2'},
				{sref: 'cc', title: 'Option 3'},
				{sref: 'dd', title: 'Another Option'},
				{sref: 'ee', title: 'Last Option'},
			]
		}

	})

})();