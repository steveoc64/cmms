;(function() {
	'use strict';

	var base = 'sitemgr'
	var app = angular.module('cmms')

	app.controller(base+'SitesCtrl', 
		['$state','sites','Session','LxDialogService','LxNotificationService',
		function($state, sites, Session, LxDialogService, LxNotificationService){
	
		angular.extend(this, {
			sites: sites,
			session: Session,
			sortField: 'Name',
			sortDir: false,
			setSort: function(field) {
				if (this.sortField == field) {
					this.sortDir = !this.sortDir
				}
				this.sortField = field
			},		
			clickEdit: function(row) {
				$state.go(base+'.editsite',{id: row.ID})
			},
			goParent: function(row) {
				if (row.ParentSite != 0) {
					$state.go(base+'.editsite',{id: row.ParentSite})
				}
			},
			getMapURI: function(addr) {
			  return "https://www.google.com/maps?q="+encodeURIComponent(addr)
			},

		})
	}])

	app.controller(base+'EditSiteCtrl', 
		['$state','$stateParams','site','Session','$window','users','$timeout','machines','LxDialogService','supplies','socket','DBSiteMachines',
		function($state,$stateParams,site,Session,$window,users,$timeout,machines,LxDialogService,supplies,socket,DBSiteMachines){
	

			var vm = this
			socket.ws.onMessage(function(msg){
				console.log("Rx Msg",msg)
				if (msg.data == "machine") {
					vm.machines = DBSiteMachines.query({id: $stateParams.id})					
				}
			})

		angular.extend(this, {
			session: Session,
			site: site,
			users: users,
			machines: machines,
			supplies: supplies,
			formFields: getSiteForm(),		
			canEdit: function() {
				return false
			},
			abort: function() {
				$window.history.go(-1)
			},
			goUser: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goMachine: function(row) {
				$state.go(base+'.editmachine', {id: row.ID})
			},
			goSite: function(row) {
				$state.go(base+'.editsite',{id: row.SiteId})
			},
			getMachineClass: function(row) {
				if (row.selected) {
					return "data-table__selectable-row--is-selected"
				}
				switch (row.Status) {
					case 'Running':
						return "machine__running"
						break
					case 'Needs Attention':
						return "machine__attention"
						break
					case 'Stopped':
						return "machine__stopped"
						break
					case 'Maintenance Pending':
						return "machine__pending"
						break
					case 'New':
						return "machine__new"
						break
				} // switch
			},
			getMapURI: function(addr) {
			  return "https://www.google.com/maps?q="+encodeURIComponent(addr)
			},
			
		})

	}])

})();