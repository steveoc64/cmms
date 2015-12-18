;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'VendorCtrl', 
		['$state','vendors','Session','LxDialogService','logs','LxNotificationService',
		function($state, vendors, Session, LxDialogService, logs,LxNotificationService){
	
		angular.extend(this, {
			vendors: vendors,
			session: Session,
			logs: logs,
			logClass: logClass,
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
		['$state','$stateParams','vendor','logs','Session','$window','LxDialogService','parts','Upload','LxProgressService','docs','DBDocs',
		function($state,$stateParams,vendor,logs,Session,$window,LxDialogService,parts,Upload,LxProgressService,docs,DBDocs){

		angular.extend(this, {
			session: Session,
			vendor: vendor,
			logs: logs,
			docs: docs,
			parts: parts,
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
			goPart: function(row) {
				console.log('clicked on row', row)
				$state.go(base+'.editpart',{id: row.PartId})
			},
			editPriceList: function() {
				$state.go(base+'.editvendorprice',{id: $stateParams.id})
			},
			getDoc: function(row) {
				console.log('Get document',row.ID)
				var adoc = DBDocServer.get({id: row.ID})
			},
    	upload: function (file) {
    		LxProgressService.circular.show('green','#upload-progress')
    		var vm = this
        Upload.upload({
            url: 'upload',
            data: {
            	file: file, 
            	desc: this.doc,
            	type: "vendor",
            	ref_id: $stateParams.id,
            	worker: "true",
            	sitemgr: "true",
            	contractor: "true"
            }
        }).then(function (resp) {
        	if (resp.config.data.file) {
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
		    		LxProgressService.circular.hide()
		    		vm.uploadProgress = 'Success !'
		    		vm.doc = ''
     				vm.docs = DBDocs.query({type: 'vendor', id: $stateParams.id})		    		
        	}
        }, function (resp) {
            console.log('Error status: ' + resp.status + ' ' + resp.data);
		    		vm.uploadProgress = 'Error ! ' + resp.data
		    		LxProgressService.circular.hide()

        }, function (evt) {
            vm.uploadProgress = '' + parseInt(100.0 * evt.loaded / evt.total) + '%';
            /*
            if (evt.config.data.file) {
            	console.log(this.uploadProgress + ' ' + evt.config.data.file.name);
          	}
          	*/
        })
      },			

		})
	}])

})();