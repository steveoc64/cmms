;(function(){
	'use strict';

	angular.module('cmms').factory('DBDocs', function($resource,ServerName,Session){
		return $resource(ServerName+'/docs/:type/:id',{type: '@_type', id: '@_id'},{
  		'query':  {method:'GET', isArray:true},
		})
	})

	angular.module('cmms').factory('DBDocServer', function($resource,ServerName,Session){
		return $resource(ServerName+'/doc/:id',{type: '@_type', id: '@_id'},{
  		'query':  {method:'GET', isArray:true},
		})
	})

})();