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
			sortField: 'Name',
			sortDir: false,
			setSort: function(field) {
				if (this.sortField == field) {
					this.sortDir = !this.sortDir
				}
				this.sortField = field
			},		
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
			goAudit: function(row) {
				LxDialogService.close('partLogDialog')
				$state.go(base+'.editpart',{id: row.RefID})
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
				if (l.length < 1) {
					return vm.logs
				}
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
		['$state','$stateParams','part','logs','Session','$window','components','LxDialogService','vendors',
		'Upload','LxProgressService','docs','DBDocServer','DBDocs',
		function($state,$stateParams,part,logs,Session,$window,components,LxDialogService,vendors,
			Upload,LxProgressService,docs,DBDocServer,DBDocs){

		angular.extend(this, {
			session: Session,
			part: part,
			components: components,
			logs: logs,
			docs: docs,
			vendors: vendors,
			formFields: getPartForm(),		
			logClass: logClass,
			submit: function() {
				this.part._id = $stateParams.id
				this.part.$update(function(newpart) {
					$window.history.go(-1)
				})					
			},
			abort: function() {
				$window.history.go(-1)
			},
      showChange: function(c) {
      	this.Audit = c
      	this.Before = c.Before.split('\n')
      	this.After = c.After.split('\n')
				LxDialogService.open('changeDialog')
      },									
			goUser: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goMachine: function(row) {
				$state.go(base+'.editmachine',{id: row.MachineID})
			},
			goSite: function(row) {
				$state.go(base+'.editsite',{id: row.SiteID})
			},
			goTool: function(row) {
				$state.go(base+".edittool",{id: row.ComponentID})
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
            	type: "part",
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
     				vm.docs = DBDocs.query({type: 'part', id: $stateParams.id})
        	}
        }, function (resp) {
            console.log('Error status: ' + resp.status + ' ' + resp.data);
		    		vm.uploadProgress = 'Error ! ' + resp.data
		    		LxProgressService.circular.hide()

        }, function (evt) {
            vm.uploadProgress = '' + parseInt(100.0 * evt.loaded / evt.total) + '%';
        })
      },

		})
	}])

})();