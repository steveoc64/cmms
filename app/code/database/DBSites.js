;(function(){
	'use strict';

	angular.module('cmms').factory('DBSites', function($resource,ServerName,Session){
		return $resource(ServerName+'/sites/:id',{id: '@_id'},{
			'get':    {method:'GET'},
  		'update': {method:'PUT'},
  		'insert': {method:'POST'},
  		'query':  {method:'GET', isArray:true},
		  'delete': {method:'DELETE'}
		})
	})

	angular.module('cmms').factory('DBSiteUsers', function($resource,ServerName,Session){
		return $resource(ServerName+'/siteusers/:id',{id: '@_id'},{
  		'query':  {method:'GET', isArray:true},
		})
	})

	angular.module('cmms').factory('DBSiteMachines', function($resource,ServerName,Session){
		return $resource(ServerName+'/sitemachines/:id',{id: '@_id'},{
  		'query':  {method:'GET', isArray:true},
		})
	})

})();
