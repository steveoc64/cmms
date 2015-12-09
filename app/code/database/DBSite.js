;(function(){
	'use strict';

	angular.module('cmms').factory('DBSite', function($resource,ServerName,Session){
		return $resource(ServerName+'/sites/:id',{id: '@_id'},{
			'get':    {method:'GET'},
  		'update': {method:'PUT'},
  		'insert': {method:'POST'},
  		'query':  {method:'GET', isArray:true},
		  'delete': {method:'DELETE'}
		})
	})

	angular.module('cmms').factory('DBSiteUsers', function($resource,ServerName,Session){
		return $resource(ServerName+'/site/users/:id',{id: '@_id'},{
  		'query':  {method:'GET', isArray:true},
		})
	})

	angular.module('cmms').factory('DBSiteMachines', function($resource,ServerName,Session){
		return $resource(ServerName+'/site/machines/:id',{id: '@_id'},{
  		'query':  {method:'GET', isArray:true},
		})
	})

	angular.module('cmms').factory('DBSiteSupplies', function($resource,ServerName,Session){
		return $resource(ServerName+'/site/supplies/:id',{id: '@_id'},{
  		'query':  {method:'GET', isArray:true},
		})
	})

})();
