var request = require('request');
var Q = require("q");

var utils = require("soa-example-core-utils");

var config = require("soa-example-service-config").config();

var redisUtil = require('soa-example-redis-util');

var createCategory = function(accessToken, name){
	var deferred = Q.defer();

	var url = utils.createBaseUrl(config.categoryServiceIp, config.categoryServicePort);

	var object = {
		name: name
	};

	utils.postJsonWithAccessToken(accessToken, object, url + "/categories").then(function(response){
		deferred.resolve(response);
	});

	return deferred.promise;
};

var getCategoryById = function(accessToken, id){
	var deferred = Q.defer();

	redisUtil.get(id).then(function(category){
		if ( category ){
			console.log("Category by ID found in Redis");
			deferred.resolve(category);
			return;
		}

		var url = utils.createBaseUrl(config.categoryServiceIp, config.categoryServicePort);
		
		utils.getWithAccessToken(accessToken, url + "/categories/" + id).then(function(category){	
			redisUtil.put(id, category);
			deferred.resolve(category);
		});
	});

	return deferred.promise;
};

var getCategories = function(accessToken){
	var deferred = Q.defer();

	var url = utils.createBaseUrl(config.categoryServiceIp, config.categoryServicePort);
	
	utils.getWithAccessToken(accessToken, url + "/categories").then(function(categories){
		deferred.resolve(categories);
	});

	return deferred.promise;
};

module.exports = {
	createCategory: createCategory,
	getCategoryById: getCategoryById,
	getCategories: getCategories
};