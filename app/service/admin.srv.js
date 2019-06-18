(function() {
	var app = angular.module('admin_srv_module', ["ngFileUpload", 'ngCookies' ]);
	app.service('AdminService', function(Upload, $q, $http, $cookieStore,
			$rootScope, $q,  jsonServerUrl) {
		this.getUsers = function(){
			var deferred = $q.defer();
			$http.get(jsonServerUrl+"users?type=other").then(function(response){
				deferred.resolve(response);
			},function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		}

		this.deleteUser = function(id){
			$http.delete(jsonServerUrl+"users/"+id);
		}

		this.upgradeUser = function(user){
			$http.put(jsonServerUrl+"users/"+user.id,user);
		}

		this.getUser = function(id){
			var deferred = $q.defer();
			$http.get(jsonServerUrl+"users/"+id).then(function(response){
				deferred.resolve(response);
			},function(response){
				if(angular.equals(response.data,{})){
					response.username = id;
					deferred.resolve(response);
				}else{
					deferred.reject(response);
				}
				
			});
			return deferred.promise;
		}


		
		this.createUser = function(id, firstname, lastname, password, email, make_admin){
			var user = {
				"id" : id,
				"firstName": firstname,
				"lastName": lastname,
				"password": password,
				 "email" : email
			}
			if(make_admin){
				user.type = "admin";
			}else{
				user.type = "other";
			}

			var deferred = $q.defer();

			$http({
				method:"POST",
				url:jsonServerUrl + "users/",
				
				data:user,
				contentType:"application/json"
			}).then(function(response){
				deferred.resolve(response);

			},function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		}


		this.uploadFile = function(file){
			var deferred = $q.defer();
			Upload.upload({
	            url: 'http://localhost:8080/upload', //webAPI exposed to upload the file
	            data:{file:file} //p.ass file as data, should be user ng-model
	        }).then(function(response){
				deferred.resolve(response);

			},function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		}

		this.createQuestionSet = function(qs_name,questions){
			var qs = {};
			qs.author = $cookieStore.get('username');
			qs.name = qs_name;
			qs.questions = questions;
			qs.id = qs.author + "-" + qs.name;
			var deferred = $q.defer();
			$http({
				method:"POST",
				url:"http://localhost:3000/question-sets/",
				
				data:qs,
				contentType:"application/json"
			}).then(function(response){
				deferred.resolve(response);

			},function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		}


		this.getQuestionSets = function(author){
			var deferred = $q.defer();

			$http.get(jsonServerUrl+"question-sets/?author="+author).then(function(response){

				deferred.resolve(response);

			},function(response){
				
				deferred.reject(response);
				
				
			});
			return deferred.promise;
		}

		this.deleteQuestionSet = function(qs_id){
			var deferred = $q.defer();

			$http.delete(jsonServerUrl+"question-sets/"+qs_id).then(function(response){

				deferred.resolve(response);

			},function(response){
				
				deferred.reject(response);
				
				
			});
			return deferred.promise;
		}

		var addQuestionToPublicRepo = function(ques){
			var deferred = $q.defer();
			$http({
					method:"POST",
					url:jsonServerUrl + "questions/",
					
					data:ques,
					contentType:"application/json"
			}).then(function(response){
				deferred.resolve(response);

			},function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		}

		this.makeQSPublic = function(qs){
			

			var questions = qs.questions;
			var response = {};
			var count = 0;
			var deferred = $q.defer();
			for(var i = 0; i<questions.length; i++){
				addQuestionToPublicRepo(questions[i]).then(function(resp){
					
					count++;
					if(count == questions.length){
						response = {"error_code" : 0};
						deferred.resolve(response);
					}
					
				},function(resp){
					response = {"error_code" : 1};
					deferred.reject(response);
					
				})
			}
			return deferred.promise;
		}

		this.getQuestionsFromPublicSet = function(){
			var deferred = $q.defer();
			$http.get(jsonServerUrl+"questions").then(function(response){
				deferred.resolve(response);
			},function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		}

		function addUpcomingTestToUser(user, exam_id){
			var reg_tests = user.registered_tests;
			if(reg_tests == undefined){
				reg_tests = [];
			}
			reg_tests.push(exam_id);
			

			user.registered_tests = reg_tests;

			var deferred = $q.defer();
			$http({
				method:"PUT",
				url:jsonServerUrl + "users/"+user.id,
				
				data:user,
				contentType:"application/json"
			}).then(function(response){
				deferred.resolve(response);

			},function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		}

		this.addExamToExaminees = function(exam_id, examinees_list){
			var invalidUsernames = [];
			var count = 0;
			var length = examinees_list.length;
			var deferred = $q.defer();
			for(var i =0; i<examinees_list.length;i++){
				
				this.getUser(examinees_list[i]).then(function(response){
					var user = response.data;

					if(angular.equals(user,{})){
						var username = response.username;
						invalidUsernames.push(username);
						length--;
						if(count===length){
							 deferred.resolve({"invalidUsernames":invalidUsernames});
						}
					}else{
						addUpcomingTestToUser(user, exam_id).then(function(response){
							count++;
							if(count===length){
								deferred.resolve({"invalidUsernames":invalidUsernames});
							}
						},function(response){
							deferred.reject(response);
						});
					}
				},function(response){
					deferred.reject(response);
				});
				
			}
			return deferred.promise;
		}



		this.createExam = function(testname, date, timelimit, examinees_list, exam_question_set){
			var exam = {};
			var datetimestamp = Date.now();
			exam.id = testname+"-"+datetimestamp;
			exam.name = testname;
			exam.date = new Date(date);
			exam.date.setHours(0,0,0,0);
			exam.timelimit = timelimit;
			exam.questions = exam_question_set;
			exam.creator = $cookieStore.get('username');
			exam.examinees = examinees_list;

			
			


			var deferred = $q.defer();

			$http({
				method:"POST",
				url:jsonServerUrl+"exams/",
				
				data:exam,
				contentType:"application/json"
			}).then(function(response){
				
				deferred.resolve(exam);

			},function(response){
				
				deferred.reject(response);
			});

			
			return deferred.promise;

		}


		this.updateExam = function(exam, invalidUsernames){
			var examinees = $.grep(exam.examinees, function(e){
						return !invalidUsernames.includes(e);
					});
			exam.examinees = examinees;
			var deferred = $q.defer();
			$http({
				method:"PUT",
				url:jsonServerUrl+"exams/"+exam.id,				
				data:exam,
				contentType:"application/json"
			}).then(function(response){
				deferred.resolve(response);
			},function(response){
				deferred.reject(response);
			});
			return deferred.promise;

		}

		this.getScheduledExams = function(user_id) {
			var deferred = $q.defer();
			$http.get(jsonServerUrl+"exams/?creator="+user_id).then(function(response){
				deferred.resolve(response);
			},function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		}

		this.getTakenAssessments = function(id,iter){
			var deferred = $q.defer();
			$http.get(jsonServerUrl+"taken-assessments/?exam_id="+id).then(function(response){
				response.i = iter;
				deferred.resolve(response);
			},function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		}
	});
})();