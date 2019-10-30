/**
 * @Created by Alexey Kutuzov <lexus27.khv@gmai.com> on 27.05.2018.
 */

class Router{

	routes = {};




}

class Route{

	pattern = null;

	params = {};

	getPattern(){

	}

	match(matching){

	}

}

class RouteLeaf extends Route{

	parent = null;

	wrapped = null;


	constructor(parent, route){
		this.parent = parent;
		this.wrapped = route;
	}

}
class ConjunctionRoute extends Route{

	parent = null;

	routes = [];

	constructor(parent){

	}
}


class Matching{

	proposedPath = null;

	matchedPath = null;

	route = null;

}
