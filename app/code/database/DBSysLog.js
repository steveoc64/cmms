;(function(){
	'use strict';

	angular.module('cmms').factory('DBSysLog', function($resource,ServerName,Session){
		return $resource(ServerName+'/syslog',{},{
			'query':  {method:'POST', isArray:true}  // Post a set of params, get back a variable list
		})
	})

})();