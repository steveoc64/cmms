;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'PartsCtrl', 
		['$scope','$state','parts','Session','LxDialogService','logs','LxNotificationService',
		function($scope,$state, parts, Session, LxDialogService, logs,LxNotificationService){
	
		angular.extend(this, {
			parts: parts,
			session: Session,
			logs: logs,
			logClass: logClass,
			search: '',
			newSearch: function() {
				console.log('New Search', this.search)
			},
			getClass: function(row) {
				if (row.selected) {
					return "data-table__selectable-row--is-selected"
				}
			},
			clickedRow: function(row) {
				if (!angular.isDefined(row.selected)) {
					row.selected = false
				}
				row.selected = !row.selected
			},
			clickEdit: function(row) {
				$state.go(base+'.editpart',{id: row.ID})
			},
			showLogs: function() {
				LxDialogService.open('partLogDialog')
			},
			getSelectedLogs: function() {
				var l = []
				var vm = this
				angular.forEach (vm.logs, function(v,k){
					angular.forEach(vm.parts, function(vv,kk){
						if (vv.selected && v.RefID == vv.ID) {
							l.push(v)
						}
					})
				})
				// l now contains filtered logs
				return l
			},
			deleteSelected: function() {
				var vm = this
				LxNotificationService.confirm('Delete Parts',
					'Do you want to delete all the selected parts ?',
					{cancel: 'No',ok:'Yes, delete them all !'},
					function(answer){
						if (answer) {
							angular.forEach (vm.parts, function(v,k){
								if (v.selected) {
									v.$delete({id: v.ID})
								}
							})
							// Now refresh the users list
							$state.reload()
						}
					})
			}

		})

	}])

	app.controller(base+'NewPartCtrl', 
		['$state','Session','DBPart','LxNotificationService','$window',
		function($state,Session,DBPart,LxNotificationService,$window){
	
		angular.extend(this, {
			session: Session,
			part: new DBPart(),
			formFields: getPartForm(),
			logClass: logClass,
			submit: function() {
				if (this.form.$valid) {
					this.part.$insert(function(newRecord) {
						$state.go(base+'.parts')
					})					
				}
			},
			abort: function() {
				LxNotificationService.warning('New Part - Cancelled')
				$window.history.go(-1)
			}
		})
	}])

	app.controller(base+'EditPartCtrl', 
		['$state','$stateParams','part','logs','Session','$window',
		function($state,$stateParams,part,logs,Session,$window){

		angular.extend(this, {
			session: Session,
			part: part,
			logs: logs,
			formFields: getPartForm(),		
			logClass: logClass,
			submit: function() {
				this.part._id = $stateParams.id
				this.part.$update(function(newpart) {
					$state.go(base+'.parts')
				})					
			},
			abort: function() {
				$window.history.go(-1)
			},
			goUser: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
		})
	}])

})();