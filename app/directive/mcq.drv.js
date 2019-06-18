(function(){
	angular.module("directive_module").directive("mcqView",function(){
		return {
			restrict : 'E',
			templateUrl : 'app/templ/mcq.templ.html',
			scope : {
				serial : '=',
				question : '=',
				marks : '=',
				options : '=',
				selectValue : '=',
				selectChange : '&'
			},
			link : function(scope, element, attrs) {
                 scope.$watch('selectValue', function(val) {
                 	 console.log("link called");
                       element.html(val);
                });
            } 
		}
	})
})();