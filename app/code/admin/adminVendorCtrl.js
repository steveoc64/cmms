;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'VendorCtrl', 
		['$state','vendors','Session','LxDialogService','logs','LxNotificationService','parts',
		function($state, vendors, Session, LxDialogService, logs,LxNotificationService,parts){
	
		angular.extend(this, {
			vendors: vendors,
			session: Session,
			logs: logs,
			logClass: logClass,
			parts: parts,
			sortField: 'Name',
			sortDir: false,
			setSort: function(field) {
				if (this.sortField == field) {
					this.sortDir = !this.sortDir
				}
				this.sortField = field
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
				$state.go(base+'.editvendor',{id: row.ID})
			},
			goAudit: function(row) {
				LxDialogService.close('vendorLogDialog')
				$state.go(base+'.editvendor',{id: row.RefID})
			},
			showLogs: function() {
				LxDialogService.open('vendorLogDialog')
			},
			getSelectedLogs: function() {
				var l = []
				var vm = this
				angular.forEach (vm.logs, function(v,k){
					angular.forEach(vm.vendors, function(vv,kk){
						if (vv.selected && v.RefID == vv.ID) {
							l.push(v)
						}
					})
				})
				if (l.length < 1) {
					return vm.logs
				}
				// l now contains filtered logs
				return l
			},
			deleteSelected: function() {
				var vm = this
				LxNotificationService.confirm('Delete Vendors',
					'Do you want to delete all the selected Vendors ?',
					{cancel: 'No',ok:'Yes, delete them all !'},
					function(answer){
						if (answer) {
							angular.forEach (vm.vendors, function(v,k){
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

	app.controller(base+'NewVendorCtrl', 
		['$state','Session','DBVendor','LxNotificationService','$window',
		function($state,Session,DBVendor,LxNotificationService,$window){
	
		angular.extend(this, {
			session: Session,
			vendor: new DBVendor(),
			formFields: getVendorForm(),
			logClass: logClass,
			submit: function() {
				if (this.form.$valid) {
					this.vendor.$insert(function(newRecord) {
						$state.go(base+'.vendors')
					})					
				}
			},
			abort: function() {
				LxNotificationService.warning('New Vendor - Cancelled')
				$window.history.go(-1)
			}
		})
	}])

	app.controller(base+'EditVendorCtrl', 
		['$state','$stateParams','vendor','logs','Session','$window','LxDialogService',
		function($state,$stateParams,vendor,logs,Session,$window,LxDialogService){

		angular.extend(this, {
			session: Session,
			vendor: vendor,
			logs: logs,
			formFields: getVendorForm(),		
			logClass: logClass,
      showChange: function(c) {
      	this.Audit = c
      	this.Before = c.Before.split('\n')
      	this.After = c.After.split('\n')
				LxDialogService.open('changeDialog')
      },						
			submit: function() {
				this.vendor._id = $stateParams.id
				this.vendor.$update(function(newvendor) {
					$window.history.go(-1)
				})					
			},
			abort: function() {
				$window.history.go(-1)
			},
		})
	}])

})();