/**
 * @Created by Alexey Kutuzov <lexus27.khv@gmai.com> on 24.05.2018.
 */
import React from 'react';

class AddressField extends React.Component{


	onInputChange(){

	}

	onInputKeyDown(){

	}


	render(){

		let inputs = null;
		if(!this.props.encoded){
			inputs.push(
				<input type="hidden" name={this.props.name  + '[country]'} 		value={ this.props.value.country }/>,
				<input type="hidden" name={this.props.name  + '[region]'} 		value={ this.props.value.region }/>,
				<input type="hidden" name={this.props.name  + '[city]'} 		value={ this.props.value.city }/>,
				<input type="hidden" name={this.props.name  + '[street]'} 		value={ this.props.value.street }/>,
				<input type="hidden" name={this.props.name  + '[house]'} 		value={ this.props.value.house }/>,
				<input type="hidden" name={this.props.name  + '[quarter]'} 		value={ this.props.value.quarter }/>,
				<input type="hidden" name={this.props.name  + '[longitude]'} 	value={ this.props.value.longitude }/>,
				<input type="hidden" name={this.props.name  + '[latitude]'} 	value={ this.props.value.latitude }/>,
				<input type="hidden" name={this.props.name + '[full]'} 			value={ this.props.value.encoded }/>
			);
		}else{
			inputs.push(
				<input type="hidden" name={this.props.name}/>
			);
		}



		return <div>
			{this.props.children}
			<div>
				{inputs}
			</div>

			<div>
				<input
					type="text"
					onChange={ this.onInputChange }
					onKeyDown={ this.onInputKeyDown }
					value={ this.props.value.pretty }
				/>

			</div>

		</div>;

	}


}