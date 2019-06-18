(function(){
	var main_module = angular.module("main_module",["admin_ctrl_module","authentication_module","paper_module","user_module","ngRoute","ngCookies"]);

	main_module.constant('jsonServerUrl',"http://localhost:3000/");

	main_module.controller("IndexController", function($scope, $rootScope, $location, AuthenticationService){
		$rootScope.logged_in = false;
		var user_cookie = AuthenticationService.getCredentials();
		if(user_cookie.id != undefined){
			$rootScope.logged_in = true;
			$rootScope.user = user_cookie.id;
		}
		$scope.logout = function() {
			$location.path("/logout");
		}
	});

	main_module.config(function($routeProvider, $locationProvider){
		$routeProvider
		.when('/login',{//uses authentication module's services
			templateUrl : 'app/page/login.html',
			controller: function($scope, $rootScope, AuthenticationService, $location){
				$scope.login = function(){
					
					AuthenticationService.login($scope.username, $scope.password, function(response, user){
						if(response.success == true){
							AuthenticationService.setCredentials(user);
							$rootScope.logged_in = true;
							$rootScope.user = $scope.username;
							if(user.type == 'admin')
								$location.path("/admin");
							else
								$location.path("/user");
						}else{
							// alert(response.message);
							$scope.error = response.message;
						}
					});
				}
			}
		})
		.when('/admin',{
			templateUrl: 'app/page/admin_main.html'
		})
		.when('/create-user',{
			templateUrl : 'app/page/register.html'
		})
		.when('/papers', {
			templateUrl : 'app/page/paper.html'
		})
		.when('/user', {
			templateUrl : 'app/page/user.html'
		})
		.when('/logout',{
			template: "",
			controller : function($location,$rootScope, AuthenticationService){
				$location.path('/');
				AuthenticationService.clearCredentials();
				$rootScope.logged_in = false;
			}
		})
	}).run(check);

	function check($cookieStore, $location, $rootScope, $http, AuthenticationService){
			$rootScope.$on("$locationChangeStart",function(event,next,current){
				// var user = $cookieStore.get('user');
				var user = AuthenticationService.getCredentials();
				var home = '/';
				if($location.path() === home){
					if(user.type === undefined){
						$location.path('/login');
					}else if(user.type === 'admin'){
						$location.path('/admin');
					}else {
						$location.path('/user');
					}
				}else{
					var adminPages = $.inArray($location.path(),['/admin','/create-user']) != -1;
					var userPages = $.inArray($location.path(),['/user','/papers']) != -1;
					if((adminPages && user.type!="admin") || (userPages && user.type!="other")){
						$location.path('/');
					}else{
						
						$http.get(next);
					}
				}
			});
		}

})();