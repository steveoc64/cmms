;(function(){
	'use strict';

	angular.module('cmms').factory('DBPart', function($resource,ServerName,Session){
		return $resource(ServerName+'/parts/:id',{id: '@_id'},{
			'get':    {method:'GET'},
  		'update': {method:'PUT'},
  		'insert': {method:'POST'},
  		'query':  {method:'GET', isArray:true},
		  'delete': {method:'DELETE'}
		})
	})

	angular.module('cmms').factory('DBPartComponents', function($resource,ServerName,Session){
		return $resource(ServerName+'/partcomponents/:id',{id: '@_id'},{
  		'query':  {method:'GET', isArray:true},
		})
	})

	angular.module('cmms').factory('DBComponentParts', function($resource,ServerName,Session){
		return $resource(ServerName+'/componentparts/:id',{id: '@_id'},{
  		'query':  {method:'GET', isArray:true},
		})
	})

})();