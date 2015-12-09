;(function(){
	'use strict';

	angular.module('cmms').factory('DBVendor', function($resource,ServerName,Session){
		return $resource(ServerName+'/vendor/:id',{id: '@_id'},{
			'get':    {method:'GET'},
  		'update': {method:'PUT'},
  		'insert': {method:'POST'},
  		'query':  {method:'GET', isArray:true},
		  'delete': {method:'DELETE'}
		})
	})

	angular.module('cmms').factory('DBVendorPart', function($resource,ServerName,Session){
		return $resource(ServerName+'/vendor/part/:id',{id: '@_id'},{
  		'query':  {method:'GET', isArray:true}
		})
	})

	angular.module('cmms').factory('DBVendorPrices', function($resource,ServerName,Session){
		return $resource(ServerName+'/vendor/prices/:id',{id: '@_id'},{
  		'insert':  {method:'POST'}
		})
	})


})();