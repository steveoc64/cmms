/////////////////////////////////////////////////////
// Field definitions for use in formly

;(function(){

loadFieldDefinitions = function(formlyConfig) {

	angular.forEach(getUserFields(), function(v,k) {
		formlyConfig.setType(v)
	})
	angular.forEach(getSiteFields(), function(v,k) {
		formlyConfig.setType(v)
	})

} // loadFieldDefintions


})();

