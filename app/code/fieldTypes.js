/////////////////////////////////////////////////////
// Field definitions for use in formly

;(function(){

loadFieldDefinitions = function(formlyConfig) {
	console.log('.. loading field defintiions')

	angular.forEach(getUserFields(), function(v,k) {
		formlyConfig.setType(v)
	})

} // loadFieldDefintions


})();

