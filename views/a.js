/**
 * @Created by Alexey Kutuzov <lexus27.khv@gmai.com> on 09.05.2018.
 */
import React from 'react';

export class A extends React.Component{

	state = {
		route: null
	};


	constructor(props){
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	onClick(e){

		window.Mlv.Router.route('/users/100');

		function users(){

		}
		window.Mlv.Scheme('user').collection([
			['name','like','%adasdas%'],
			['dt_create','>=', 'NOW()']
		]);

		users();


		window.history.pushState({}, "e.target.href", e.target.href);


		/**
		 * Ключи слоев */
		let layers = this.props.layers;

		Mlv.setup();

		e.preventDefault();
		return false;
	}

	render(){
		return <a
			onClick={ this.onClick }
			href={this.props.href}
		>{ this.props.children }</a>;
	}

}
