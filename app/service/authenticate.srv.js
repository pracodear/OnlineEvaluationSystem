(function() {
	var app = angular.module('authentication_module', [ 'ngCookies' ]);
	app.service('AuthenticationService', function($http, $cookieStore,
			$rootScope, $q,  jsonServerUrl) {
		this.login = function(username, password, callback) {
			

			url = jsonServerUrl;
			

	
			var deferred = $q.defer();
			$http.get(url+"users/"+username).then(function(result){
				deferred.resolve(result);
				var user = result.data;
				
			
				if(password === user.password){
					response = {
						success : true
					}
				}else{
					response = {
						success : false,
						message : 'Username or Password is incorrect'
					}
				}
				
				callback(response, user);

			},function(result){
				if(angular.equals(result.data,{})){
					response = {
						success : false,
						message : 'Username not registered'
					}
					callback(response, result.data);
				}
				deferred.reject(result);
			});
			
			
		}

		
		this.setCredentials = function(user) {
			$rootScope.user = {
				id : user.id,
				type : user.type
			};
			$cookieStore.put('username', user.id);
			$cookieStore.put('type', user.type);
		}

		this.clearCredentials = function() {
			$rootScope.user = {};
			$cookieStore.remove('username');
			$cookieStore.remove('type');
		}

		this.getCredentials = function() {
			var user = {};
			user.id = $cookieStore.get('username');
			user.type = $cookieStore.get('type');
			return user;
		}

	});
})();