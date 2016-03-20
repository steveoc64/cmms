;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'SimCtrl',
		['$state','Session','LxDialogService','LxNotificationService','socket','workorders','DBWorkOrder',
		function($state, Session, LxDialogService, LxNotificationService, socket, workorders, DBWorkOrder){
		}])


})();
