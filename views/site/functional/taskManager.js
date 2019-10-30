/**
 * @Created by Alexey Kutuzov <lexus27.khv@gmai.com> on 02.06.2018.
 */

import React from 'react';

class Storage{

	items = [];

	limit = 10;
	total = 10;

	listeners = {
		add: [],
		remove: [],
	};





	fire(eKey, ...args){
		if(this.listeners[eKey]){
			this.listeners[eKey].map((listener)=>{
				listener(...args);
			});
		}
	}

	on(eKey, listener){
		if(!this.listeners[eKey]){
			this.listeners[eKey] = [];
		}
		this.listeners[eKey].push(listener);
	}
	off(eKey, listener = null){
		if(this.listeners[eKey]){
			if(!listener){
				delete this.listeners[eKey];
			}else{
				while(true){
					let i = this.listeners[eKey].indexOf(listener);
					if(i>=0){
						this.listeners[eKey].splice(i,1);
					}else{
						break;
					}
				}
			}
		}
	}

}

class Pagination extends React.Component{

	constructor(){
		super(...arguments);
		this.onStoreUpdate = this.onStoreUpdate.bind(this);

		this.state = {
			page: 0,
		};

	}

	onStoreUpdate(){
		this.forceUpdate();
	}

	componentDidMount(){
		this.props.store.on('update', this.onStoreUpdate);
	}
	componentWillUnmount(){
		this.props.store.off('update', this.onStoreUpdate);
	}

	setPage(index){
		let limit = this.props.limit || this.props.store.limit;
		let total = this.props.total || this.props.store.total;
		this.setState({
			total: total,
			limit: limit,
			page: index,
			offset: limit * index
		});
	}

	render(){
		let pagesTotal = Math.round( this.state.total / this.state.limit );
		let pages = [];
		let inLastPage = this.state.total - this.state.limit * (pagesTotal-1);

		if(this.state.limit == inLastPage){
			inLastPage = null;
		}

		for(let i=0;i<pagesTotal;i++){
			pages.push( i == pagesTotal-1 ? inLastPage || this.state.limit: this.state.limit  );
		}



		function PageLink(props){
			return <a
				className={"Pagination-page" + (props.index!==false && props.active? ' Pagination-page-active' : '') + (props.index===false? ' Pagination-page-disabled' : '')}
				onClick={ ()=>{
					if(props.index===false){
						this.setPage(props.index)
					}
				} }
			>{props.children}</a>
		}

		let prevPageIndex = this.state.page-1;
		let nextPageIndex = this.state.page+1;

		return <div className="Pagination">
			<PageLink index={prevPageIndex < 0? false: prevPageIndex}>Prev</PageLink>
			{pages.map((items, index)=>{
				return <PageLink active={this.state.page === index} index={index}>{index + 1}</PageLink>;
			})}
			<PageLink index={nextPageIndex>pagesTotal? false: nextPageIndex}>Next</PageLink>
		</div>;
	}

}

class TaskManager extends React.Component{

	constructor(){
		super(...arguments);
		this.onStoreUpdate = this.onStoreUpdate.bind(this);
	}

	onStoreUpdate(){
		this.forceUpdate();
	}

	componentDidMount(){
		this.props.store.on('update', this.onStoreUpdate);
	}
	componentWillUnmount(){
		this.props.store.off('update', this.onStoreUpdate);
	}

	render(){
		return <div className="TaskManager">
			<div className="TaskManager-header">
				<Pagination store={ this.props.store } />
			</div>
			<div className="TaskManager-list">

				{this.props.store.items.map((item)=>{
					return <Task object={ item }/>
				})}

			</div>
			<div className="TaskManager-footer">
				<Pagination store={ this.props.store } />
			</div>
		</div>
	}

}

class Task extends React.Component{


	constructor(){
		super(...arguments);
		this.onObjectUpdate = this.onObjectUpdate.bind(this);
	}

	onObjectUpdate(){
		this.forceUpdate();
	}

	componentDidMount(){
		this.props.object.on('update', this.onObjectUpdate);
	}
	componentWillUnmount(){
		this.props.object.off('update', this.onObjectUpdate);
	}

	render(){
		return <div className="TaskManager-Task">
			{this.props.object.title}
		</div>
	}

}

