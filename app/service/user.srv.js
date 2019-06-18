(function() {
	var app = angular.module('user_srv_module', ["ngFileUpload", 'ngCookies' ]);
	app.service('UserService', function(Upload, $q, $http, $cookieStore,
			$rootScope, $q,  jsonServerUrl) {

		this.createTakenAssessment = function(evalQuestions){
			var deferred = $q.defer();
			$http({
				method:"POST",
				url:"http://localhost:3000/taken-assessments/",
				data:evalQuestions,
				contentType:"application/json"
			}).then(function(response){
				deferred.resolve(response);
			},function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		}

		this.getUser = function(id){
			var deferred = $q.defer();
			$http.get(jsonServerUrl+"users?id="+id).then(function(response){
				deferred.resolve(response);
			},function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		}

		this.getTakenAssessment = function(user_id){
			var deferred = $q.defer();
			$http.get(jsonServerUrl+"taken-assessments?user_id="+user_id).then(function(response){
				deferred.resolve(response);
			},function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		}

		this.getExamDetails = function(exam_id,iter){
			var deferred = $q.defer();
			$http.get(jsonServerUrl+"exams?id="+exam_id).then(function(response){
				response.i = iter;
				deferred.resolve(response);
			},function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		}

		this.updateUser = function(user){
			var deferred = $q.defer();
			$http.put(jsonServerUrl+ "users/"+user.id, user).then(function(response){
				deferred.resolve(response);
			},function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		}
	});
})();