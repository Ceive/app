
import React, {Component} from 'react';
import './CheckMediaUI.css';
import audioTest from './CheckMediaUI/audio-test.mp3';


let Detect = require('Detect.js');
window['LANGUAGE_TRANSLATIONS'] = {};
window['_translate'] = function(key){
	if(LANGUAGE_TRANSLATIONS && LANGUAGE_TRANSLATIONS[key]){
		return LANGUAGE_TRANSLATIONS[key];
	}
	return key;
};

class IndicationBar extends Component{


	render(){

		let blocks = [];

		let chunks = [];
		let countInChunk = 4;
		for(let i=0;i< this.props.max;i++){
			let isActive = i <= this.props.current;
			blocks.push( <div key={ i + (isActive?'-active':'') } className={'CheckMediaUI-indicationBar-segment' + (isActive? ' CheckMediaUI-indicationBar-segment-active' : '')}></div> );
		}

		return <div className="CheckMediaUI-indicationBar">
			{ blocks }
		</div>;

	}

}
class VideoBlock extends Component{

	video = null;

	componentDidMount(){
		if(this.props.src){
			this.video.play();
		}
	}
	componentWillUnmount(){

	}

	render(){
		return <div className="CheckMediaUI-videoBlock">
			<video ref={ (el) => {
				if(el){
					el.srcObject = this.props.src;

				}
				this.video = el;
			} } height={ this.props.height || 200} width={this.props.width || 200}/>
		</div>;
	}

}
class QuestionPanel extends Component{

	constructor(props){
		super(props);
		this.onYesClicked 		= this.onYesClicked.bind(this);
		this.onNoClicked 		= this.onNoClicked.bind(this);
	}

	onYesClicked(){
		this.props.yes();
	}

	onNoClicked(){
		this.props.no();
	}


	render(){

		return <div>
			{this.props.children}
			<div className="CheckMediaUI-answer">
				<button className="CheckMediaUI-answer-yes" onClick={ this.onYesClicked }>{_translate('Yes')}</button>
				<button className="CheckMediaUI-answer-no" onClick={ this.onNoClicked }>{_translate('No')}</button>
			</div>
		</div>;


	}

}

class CheckBasic extends Component{

	checkType = null;

	constructor(props){
		super(props);

		this.state = {
			stateKey: null,
			error: null,
		};

		this.onYesClicked 		= this.onYesClicked.bind(this);
		this.onNoClicked 		= this.onNoClicked.bind(this);
		this.onRetryClicked 	= this.onRetryClicked.bind(this);
	}

	onYesClicked(){
		this.props.mediaState && this.props.mediaState.set(this.checkType, true);
		this.setState({ stateKey: true });
	}

	onNoClicked(){
		this.props.mediaState && this.props.mediaState.set(this.checkType, false);
		this.setState({ stateKey: false });
	}

	onRetryClicked(){
		this.setState({ stateKey: null });
	}


	getStateBlock(){
		let Component;

		switch(true){

			case this.state.stateKey === false:

				if(this.state.error){
					let error = this.state.error;
					Component = typeof this.props.error === 'function'?this.props.error: null ;
					let HintComponent = typeof this.props.failure === 'function'?this.props.failure:null;
					HintComponent = HintComponent?<HintComponent parent={ this }/>: this.props.failure?<div>{this.props.failure}</div>: null;

					return <div className="CheckMediaUI-errorTest">
						{ Component? <Component parent={ this } error={ error }/> : this.props.error || (error.message) }
						{ HintComponent? <div className="CheckMediaUI-failureTest">{ HintComponent }</div> : null }
						<button className="CheckMediaUI-retry" onClick={ this.onRetryClicked }>{ this.retry || _translate('Retry') }</button>
					</div>;
				}


				Component = typeof this.props.failure === 'function'?this.props.failure:null;
				return <div className="CheckMediaUI-failureTest">
					{ Component?<Component parent={ this }/>: this.props.failure }
					<p>{this.state.error?this.state.error.message:''}</p>
					<button className="CheckMediaUI-retry" onClick={ this.onRetryClicked }>{ this.retry || _translate('Retry') }</button>
				</div>;

				break;

			case this.state.stateKey === true:
				let info = this.getInfo();

				Component = typeof this.props.success === 'function'?this.props.success:null;
				return <div className="CheckMediaUI-successTest">
					{ Component?<Component parent={ this }/>: this.props.success?<div>{this.props.success}</div>: <div className="CheckMediaUI-success">{_translate('Retry')}</div>  }
					{info? <div>{info}</div> : ''}

					<button className="CheckMediaUI-retry" onClick={ this.onRetryClicked }>{ this.retry || _translate('Retry') }</button>
				</div>;

				break;
		}
	}

	getInfo(){

	}

	render(){
		return <div className={'CheckMediaUI-block' + (this.cls? ' '+this.cls : '')}>
			<div className="CheckMediaUI-blockInner">
				<div>{ this.props.children }</div>
				{ this.getStateBlock() }
			</div>
		</div>;
	}
}

if (! window.AudioContext) {
	if (! window.webkitAudioContext) {
		alert('AudioContext is not supported');
	}
	window.AudioContext = window.webkitAudioContext;
}
if(!window.navigator.getUserMedia){
	if (! window.webkitGetUserMedia) {
		if (! window.mozGetUserMedia) {
			alert('getUserMedia is not supported');
		}else{
			window.navigator.getUserMedia = window.navigator.mozGetUserMedia
		}
	}else{
		window.navigator.getUserMedia = window.navigator.webkitGetUserMedia;
	}

}

let audioContext = new AudioContext();
document.addEventListener('click', () => {
	if(audioContext.state !== 'running'){
		audioContext.resume();
	}
} );

class LoadedEvent{

	loaded = false;

	listeners = [];

	push(l){
		if(!this.loaded){
			this.listeners.push(l);
		}else{
			l(this.loaded);
		}
		return this;
	}

	run(e){
		this.loaded = e;
		for(let l of this.listeners){
			l(this.loaded);
		}
	}


}
let loadedEvent = new LoadedEvent();
window.addEventListener('load', (e) => {
	loadedEvent.run(e);
});
class CheckMic extends CheckBasic{

	stream = null;

	peakLevel = 100;

	callStream(fn,failure){
		if(!this.stream){
			/**
			 * @Link: https://stackoverflow.com/questions/33322681/checking-microphone-volume-in-javascript
			 */
			window.navigator.getUserMedia({
				audio: true
			}, (stream) => {
				this.stream = stream;
				console.log("Stream", stream);
				fn(this.stream, true);
			}, function(err) {
				console.error("Error: " + err.name);
				failure(err);
			});
		}else{
			fn(this.stream);
		}
	}

	registerProcessor(){

		this.callStream((stream, isNew) => {

			if(!isNew){
				return false;
			}

			let analyser = audioContext.createAnalyser();
			let microphone = audioContext.createMediaStreamSource(stream);
			let javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

			analyser.smoothingTimeConstant = 0.8;
			analyser.fftSize = 1024;

			microphone.connect(analyser);
			analyser.connect(javascriptNode);
			javascriptNode.connect(audioContext.destination);

			javascriptNode.onaudioprocess = () => {
				let array = new Uint8Array(analyser.frequencyBinCount);
				analyser.getByteFrequencyData(array);
				let values = 0;

				let length = array.length;
				for (let i = 0; i < length; i++) {
					values += (array[i]);
				}

				let average = values / length;

				let averageRounded = Math.round(average);

				if(this.peakLevel < averageRounded){
					this.peakLevel = averageRounded;
				}

				let percents = averageRounded / this.peakLevel * 100;//percents
				let level = Math.round(this.max * (percents/100));// from max

				if(this.state.current !== level){
					this.setState((state)=>{
						state.current = level;
						return state;
					});
				}


				// console.log (average);
			};
		},(err)=>{
			this.setState((state) => {
				state.error = err;
				state.stateKey = false;
				state.src = null;
				return state;
			});
		});
	}

	constructor(props){
		super(props);
		this.cls = 'CheckMediaUI-mic';
		this.checkType = 'mic';
		this.max = 10;
		Object.assign(this.state, {
			current: 0,
			max: props.max || this.max
		});

		this.registerProcessor();
	}

	getStateBlock(){
		let Component = typeof this.props.question === 'function'? this.props.question : null ;


		if(this.state.stateKey === null){
			return <div className="CheckMediaUI-start">
				<button onClick={ () => {
					this.registerProcessor();
					this.setState((state)=>{
						state.current = null;
						state.stateKey = 'listen';
						return state;
					});
					if(audioContext.state !== 'running'){
						audioContext.resume();
					}
				} }>{ this.props.start || _translate('Start tests') }</button>
			</div>;
		}else if(this.state.stateKey === 'listen'){
			return <div className="CheckMediaUI-question">
				<QuestionPanel yes={ this.onYesClicked } no={ this.onNoClicked }>
					<IndicationBar current={ this.state.current } max={ this.state.max }/>
					{ Component? <Component parent={ this }/> :this.props.question?<div>{this.props.question}</div>: null }
				</QuestionPanel>
			</div>;
		}
		return super.getStateBlock();
	}


	getInfo(){
		if(this.stream){
			let track = this.stream.getAudioTracks();
			track = track[0];
			if(track){
				return track.label;
			}
		}
		return null;
	}

}

class CheckCam extends CheckBasic{

	callStream(fn,error){
		if(!this.stream){
			/**
			 * @Link: https://stackoverflow.com/questions/33322681/checking-microphone-volume-in-javascript
			 */
			window.navigator.getUserMedia({
				video: true
			}, (stream) => {
				this.stream = stream;
				console.log("Stream", stream);
				fn(this.stream, true);
			}, function(err) {
				console.error("The following error " + err.message);
				error(err);
			});
		}else{
			fn(this.stream);
		}
	}

	registerProcessor(){
		this.callStream((stream, isNew) => {

			if(!isNew){
				return false;
			}

			this.setState((state) => {

				//var binaryData = [];
				//binaryData.push(stream);
				state.src = stream;//window.URL.createObjectURL(new Blob(binaryData, {type: "video/flv"}));

				//state.src = (window.URL) ? window.URL.createObjectURL(stream) : window.webkitURL.createObjectURL(stream);

				return state;
			});

		},(err) => {
			this.setState((state) => {
				state.error = err;
				state.stateKey = false;
				state.src = null;
				return state;
			});
		});
	}

	constructor(props){
		super(props);
		this.cls = 'CheckMediaUI-cam';
		this.checkType = 'cam';
		Object.assign(this.state, {
			src: null
		});
		this.registerProcessor();
	}

	getInfo(){
		if(this.stream){
			let track = this.stream.getVideoTracks();
			track = track[0];
			if(track){
				return track.label;
			}
		}
		return null;
	}

	getStateBlock(){
		if(this.state.stateKey === null){
			return <div className="CheckMediaUI-start">
				<button onClick={ () => {
					this.registerProcessor();
					this.setState((state)=>{
						state.current = null;
						state.stateKey = 'listen';
						return state;
					});
					if(audioContext.state !== 'running'){
						audioContext.resume();
					}
				} }>{ this.props.start || _translate('Start tests') }</button>
			</div>;
		}else if(this.state.stateKey === 'listen'){
			let Component = typeof this.props.question === 'function'? this.props.question : null ;
			return <div className="CheckMediaUI-question">
				<QuestionPanel yes={ this.onYesClicked } no={ this.onNoClicked }>
					<VideoBlock src={ this.state.src || '' } width={ this.props.width || 200 } height={ this.props.height || 200 }/>
					{ Component? <Component parent={ this }/> :this.props.question?<div>{this.props.question}</div>: null }
				</QuestionPanel>
			</div>;
		}
		return super.getStateBlock();
	}
}

class CheckAudio extends CheckBasic{

	audio = null;

	constructor(props){
		super(props);

		//this.max = 10;
		//this.peakLevel = 100;


		Object.assign(this.state, {
			play: false,
			//current: 0,
			//max: this.max
		});

		this.checkType = 'audio';
		this.cls = 'CheckMediaUI-audio';
		this.togglePlay = this.togglePlay.bind(this);
	}

	togglePlay(){
		this.setState((s)=>{
			s.play = !this.state.play;
			return s;
		});
	}

	getStateBlock(){

		if(this.state.stateKey === null){
			return <div className="CheckMediaUI-start">
				<button onClick={ () => {
					this.setState((state)=>{
						state.stateKey = 'listen';
						return state;
					});
				} }>{ this.props.start || _translate('Start tests') }</button>
			</div>;
		}else if(this.state.stateKey === 'listen'){
			let Component = typeof this.props.question === 'function'? this.props.question : null ;
			return <div className="CheckMediaUI-question">
				<QuestionPanel yes={ this.onYesClicked } no={ this.onNoClicked }>
					{ this.state.play?
						<audio
							ref={ (el)=>{ this.audio = el } }
							src={ audioTest }
							crossOrigin="anonymous"
							controls
							controlsList="nodownload"
							onEnded={ () => {
								this.setState((s)=>{
									s.play = false;
									return s;
								});
							} }
						/> : <button className="CheckMediaUI-play-toggle" onClick={ this.togglePlay }>{_translate('Play')}</button>  }

					{ Component? <Component parent={ this }/> : this.props.question?<div>{this.props.question}</div>: null  }
				</QuestionPanel>
			</div>;
		}
		return super.getStateBlock();
	}


	componentDidUpdate(){
		if(this.state.play){
			this.audio && this.audio.play();
		}
	}
}



class CheckCompatibility extends Component{

	constructor(props){
		super(props);

		if(props.checker){
			this.state = {
				compatible: Boolean(props.checker()),
				stateKey: null,
			};
		}else{
			this.state = {
				compatible: this.check(),
				stateKey: null
			};
		}

	}

	check(){
		return (
			window.AudioContext ||
			window.webkitAudioContext
		) && (
			window.navigator.getUserMedia ||
			window.webkitGetUserMedia ||
			window.mozGetUserMedia
		);
	}


	getStateBlock(){

		if(this.state.stateKey === null){
			return <div className="CheckMediaUI-start">
				<button onClick={ () => {
					this.setState((state)=>{
						state.stateKey = 'listen';
						return state;
					});
				} }>{ this.props.start || _translate('Start tests') }</button>
			</div>;
		}
		let info = this.getInfo();
		if(this.state.compatible){

			this.props.mediaState && this.props.mediaState.set('compatible', true);
			return  <div className="CheckMediaUI-successTest">
				{ this.props.success?<div>{this.props.success}</div>: <div className="CheckMediaUI-success">{_translate('Compatible')}</div> }
				{info?<div>{info}</div>:''}
			</div>;
		}else{
			this.props.mediaState && this.props.mediaState.set('compatible', false);
			return <div className="CheckMediaUI-failureTest">
				{info?<div>{info}</div>:''}
				{ this.props.failure?<div>{this.props.failure}</div>: <div className="CheckMediaUI-failure">{ _translate('Have problems') }</div> }
			</div>
		}

	}

	getInfo(){
		return Detect.parse(navigator.userAgent).browser.name;
	}

	render(){
		return <div className={'CheckMediaUI-block CheckMediaUI-compatibility'}>
			<div className="CheckMediaUI-blockInner">
				<div>{ this.props.children }</div>
				{ this.getStateBlock() }
			</div>

		</div>;
	}
}


class MediaState{

	compatible 	= false;
	mic 		= false;
	audio 		= false;
	cam 		= false;

	isComplete(){
		return this.compatible && this.mic && this.audio && this.cam;
	}

	set(prop, value){
		this[prop] = value;
		this.onChange();
	}

	onChange(prop, value){

	}
}

export default class CheckMediaUI extends Component{

	static MediaState = MediaState;

	getErrorText(error){
		let text = error.message;
		if(this.props.errors && this.props.errors[error.name]){
			text = this.props.errors[error.name];
		}
		return <div>{ text }</div>
	}

	getPropsFor(component){
		let props = {};
		props.error = (props) => {
			return <p>{this.getErrorText(props.error)}</p>;
		};
		if(this.props[component]){
			Object.assign(props, this.props[component])
		}
		return props;
	}

	render(){


		/**
		 *

		 <CheckCompatibility success={ 'Браузер совместим' }>
		 <h3>Совместимость браузера</h3>
		 </CheckCompatibility>

		 <CheckMic
		 mediaState={ this.props.mediaState }
		 question={ 'Говорите в микрофон, меняется ли индикатор когда вы проговариваете в него?' }
		 success={ 'Ваш микрофон работает' }
		 error={ ({error}) => {
					return <div>{ this.getErrorText(error) }</div>
				} }
		 failure={
					<ul>
						<li>1. Возможно у вас не правильно подключен микрофон</li>
						<li>2. Смените выбранное устройство в браузере, которое вы выбрали ранее</li>
						<li>3. Проверьте правильно ли подготовлен Ваш микрофон, включен ли включатель на нем если имеется</li>
						<li>4. Прибегнимте к помощи администратора если вышеперечисленное не помагает</li>
					</ul>
				}>
		 <h3>Проверка микрофона</h3>
		 </CheckMic>

		 <CheckAudio
		 mediaState={ this.props.mediaState }
		 question={ 'Нажмите на кнопку "Проигрывать", слышен ли звук из колонок/наушников?' }
		 success={ 'Устройства воспроизведения работают' }
		 error={ ({error}) => {
					return <div>{ this.getErrorText(error) }</div>
				} }
		 failure={
					<ul>
						<li>1. Возможно у вас не правильно подключены колонки или микрофон</li>
						<li>2. Смените выбранное устройство в настройках устройств воспроизведения вашего компьютера, убедитесь что установленная слышимая громкость в настройках пк</li>
						<li>3. Убедитесь в готовности ваших колонок или наушников, включен ли включатель на устройстве, настроена ли громкость на аппаратуре</li>
						<li>4. Прибегнимте к помощи администратора если вышеперечисленное не помагает</li>
					</ul>
				} >
		 <h3>Проверка устройства воспроизведения</h3>
		 </CheckAudio>

		 <CheckCam
		 mediaState={ this.props.mediaState }
		 success={ 'Ваша камера работает' }
		 error={ ({error}) => {
					return <div>{ this.getErrorText(error) }</div>
				} }
		 failure={
					<ul>
						<li>1. Возможно у вас не правильно подключена камера</li>
						<li>2. Смените выбранное устройство в браузере, которое вы выбрали ранее</li>
						<li>3. Убедитесь в готовности вашей камеры, включен ли включатель на устройстве, все ли провода подключены</li>
						<li>4. Прибегнимте к помощи администратора если вышеперечисленное не помагает</li>
					</ul>
				}>
		 <h3>Проверка вашей камеры</h3>
		 </CheckCam>




		 * */

		return <section className="CheckMediaUI">
			<CheckCompatibility mediaState={ this.props.mediaState } {...this.getPropsFor('compatibility')}/>
			<CheckMic 			mediaState={ this.props.mediaState } {...this.getPropsFor('mic')} />
			<CheckAudio 		mediaState={ this.props.mediaState } {...this.getPropsFor('audio')}/>
			<CheckCam 			mediaState={ this.props.mediaState } {...this.getPropsFor('cam')}/>
		</section>;

	}


}




export function CheckMediaUI_Ru(){
	return <CheckMediaUI

		errors={{
			"NotFoundError": _translate('Device unavailable'),
			"NotAllowedError": _translate('You are not permit to device')
		}}


		compatibility={{
			success: _translate('Your browser is compatible'),
			failure: _translate('Please update your browser'),
			children: [<h3>{_translate('Browser compatibility')}</h3>]
		}}

		mic={{
			success: _translate('Your microphone is work'),
			question: _translate('Does the indicator change when you speak to the microphone?'),
			failure: (
				<ul>
					<li>{ _translate('Check whether your microphone is properly prepared, whether the switch is turned on if there is') }</li>
					<li>{ _translate('Change the selected device in the browser you chose earlier') }</li>
					<li>{ _translate('Maybe your microphone is not properly connected.') }</li>
					<li>{ _translate('If the above does not help - resort to the help of the administrator') }</li>
				</ul>
			),
			children: [ <h3>{ _translate('Microphone checking') }</h3> ]
		}}

		cam={{
			success: _translate('Your camera is work'),
			failure: (
				<ul>
					<li>{ _translate('Make sure your camera is ready, whether the power switch on the device is on, whether all the wires are connected') }</li>
					<li>{ _translate('Change the selected device in the browser you chose earlier') }</li>
					<li>{ _translate('Maybe your camera is not properly connected') }</li>
					<li>{ _translate('If the above does not help - resort to the help of the administrator') }</li>
				</ul>
			),
			children: [ <h3>{ _translate('Camera checking') }</h3> ]
		}}


		audio={{
			question: _translate('Click on the "Play" button, is there any sound coming from the speakers / headphones?'),
			success: _translate('Playback devices work'),
			failure: (
				<ul>
					<li>{ _translate('Make sure your speakers or headphones are ready, the switch is on on the device, the volume is on the equipment') }</li>
					<li>{ _translate('Change the selected device in the settings of the playback devices of your computer, make sure that the audible volume is set in the PC settings') }</li>
					<li>{ _translate('Maybe your speakers or headphones are not properly connected.') }</li>
					<li>{ _translate('If the above does not help - resort to the help of the administrator') }</li>
				</ul>
			),
			children: [ <h3>{ _translate('Audio device checking') }</h3> ]
		}}
	/>
}