;(function() {
	'use strict';

	console.log('Init app')

	angular.module('cmms', ['lumx','ui.router'])
		.config(config)
		.run(run)
	    .filter('unsafe', function($sce) { return $sce.trustAsHtml; })

  	function config($stateProvider, $urlRouterProvider, $locationProvider) {
	    $urlRouterProvider.otherwise('/');

	    $locationProvider.html5Mode({
	      enabled:false,
	      requireBase: false
	    });

	    $locationProvider.hashPrefix('!');

	    // Manually create all the routes here
	    $stateProvider
	      .state('login',{
	        url: '/',
	        templateUrl: 'templates/login.html',
	        controller: 'loginCtrl',
	        controllerAs: 'loginCtrl',
	        animation: {
	          enter: 'hingeInFromTop'
	        },
	      })
	  }

	function run($rootScope) {
	   FastClick.attach(document.body);
	}  

})();

