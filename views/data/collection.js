/**
 * @Created by Alexey Kutuzov <lexus27.khv@gmai.com> on 30.05.2018.
 */

class Criteria{

	static INF = -1;

	_extended = false;

	parent;

	_condition;

	_limitDefined = false;
	_limit = -1;

	_offset = 0;

	constructor(parent = null, configure = null){
		if(configure){
			let {condition, offset, limit} = configure;
			this.configure(condition, offset, limit);
		}
		this.parent = parent;
	}

	configure(condition, offset = 0, limit = -1){

		this.condition = condition;
		this.offset 	= offset;
		this.limit 		= limit;

		return this;
	}

	asExtended(){
		this._extended = true;
		return this;
	}
	asIs(){
		this._extended = false;
		return this;
	}


	set condition(condition){
		this._condition = condition;
	}
	get condition(){
		return this._condition;
	}

	set offset(offset){
		this._offset = offset;
	}
	get offset(){
		let offset = this._offset;
		if(this._extended){
			return (this.parent? this.parent.asExtended().offset + offset : offset )
		}
		return offset;
	}

	set limit(limit){
		this._limit = limit;
		this._limitDefined = true;
	}
	get limit(){
		if(this._limitDefined){
			return this._limit;
		}
		return this.parent? this.parent.asExtended().limit : -1 ;
	}

	static isInfiniteLimit(limit = null){
		return limit === null || limit <= -1;
	}

	static isEnough(limit, realLength){
		return Criteria.isInfiniteLimit(limit) && realLength >= limit;
	}

}

class DirtyState{

	constructor(prev = null){
		this.prev = prev || null;
	}

	prev;

	added = [];
	removed = [];

	get "+"(){
		return this.added;
	}
	get "-"(){
		return this.removed;
	}

	get isDirty(){
		return this.added.length || this.removed.length;
	}

	add(itm){
		while(true){
			let i = this.removed.indexOf(itm);
			if(i>=0){
				this.removed.splice(i,1);
			}else{
				break;
			}
		}

		this.dirty.added.push(item);
	}

	rm(itm){
		while(true){
			let i = this.added.indexOf(itm);
			if(i>=0){
				this.added.splice(i,1);
			}else{
				break;
			}
		}

		this.dirty.removed.push(item);
	}

	find(itm){
		let inAdded, inRemoved;

		let i;
		i = this.added.indexOf(itm);
		if(i>=0){
			inAdded = true;
		}

		i = this.removed.indexOf(itm);
		if(i>=0){
			inRemoved = true;
		}

		if(inAdded && inRemoved){
			return true;//both
		}else if(!inAdded && !inRemoved){
			return false;// no exists
		}
		return inAdded?'+':'-';//plus or minus signs(+, -)
	}

	resetItem(itm){
		let object = { added: false, removed: false };

		while(true){
			let i = this.added.indexOf(itm);
			if(i>=0){
				this.added.splice(i,1);
				object.added = true;
			}else{
				break;
			}
		}

		while(true){
			let i = this.removed.indexOf(itm);
			if(i>=0){
				this.removed.splice(i,1);
				object.removed = true;
			}else{
				break;
			}
		}
		return object.added || object.removed? object: false;
	}

	reset(){
		let object = { added: this.added, removed: this.removed };

		this.added 		= [];
		this.removed 	= [];

		return object;
	}

	withoutPrev(){
		this.prev = null;
		return this;
	}
}

class ItemOperation extends Operation{

	type = null;

	message = null;

	success = true;

	rejections = [];

	item = null;

	constructor(type, item){
		super();
		this.type = type;
		this.item = item;
	}

	reject(reason){
		this.rejections.push(reason);
		this.success = false;
		this.message = 'Have rejections';
		return this;
	}

	failure(message){
		this.success = false;
		this.message = message;
		return this;
	}

	_before(){
		if(window['CEIVE_DEBUG']){
			console.log("Collection.ItemOperation: Before "+ this.type, this);
		}
	}

	_after(){
		if(window['CEIVE_DEBUG']){
			if(this.success){
				console.log("Collection.ItemOperation: Success "+ this.type, this);
			}else{
				console.log("Collection.ItemOperation: Failure "+ this.type + ": "+this.message, this);
			}

		}
	}

}
class CompareOperator{

	compare(...operands){

	}

}
// [operator, v1, v2, v3, v4]
// [operator, left, right]
class Condition{

	op 			= null;
	operands 	= [];

	call(_, item){


		let op = this.op;

		if(!op){
			//error
		}

		let toCompare = [];

		for(let operand of this.operands){
			try{
				let value = this.fetch( item, operand );
				toCompare.push(value);
			}catch(e){
				console.error("Error in the operand processing: ", e, operand, item);
				throw new Error("Error in the operand processing: ");
			}
		}


		return Condition.compareOperator(this.op, ...toCompare);
	}

	fetch(item, operand) {
		if(operand instanceof Condition){
			return operand.call(null, item);
		}
		return item[operand];
	}

	static checkCondition(item, condition){
		if(typeof condition.call === 'function'){
			return condition.call(typeof condition ==='object'? condition: window, item);
		}
		if(condition instanceof Function){
			return condition(item);
		}
	}

	static compareOperator(operator, ...operands){
		if(typeof operator.compare === 'function'){
			return operator.compare(typeof operator ==='object'? operator: window, ...operands);
		}
		if(operator instanceof Function){
			return operator(...operands);
		}
	}

	static makeCondition(condition){
		if(condition instanceof Array){
			let c = new Condition();
			c.op = condition.shift();
			c.operands = condition;
		}

	}
}


class Sorter{

	SORT_ASC = 'asc';
	SORT_DESC = 'desc';

	sortFields = {};

	constructor(sortFields){
		this.sortFields = sortFields;
	}

}

export default class Collection{

	static DirtyState 		= DirtyState;
	static Criteria 		= Criteria;
	static ItemOperation	= ItemOperation;

	static SYNC_LOCAL 		= 'local';		// local and descendants
	static SYNC_GLOBAL 		= 'global'; 	//full ancestors and descendants chains
	static SYNC_STORAGE 	= 'storage';	// absolutely full

	static SAT_NONE 		= false;		// Hydrate, Persistent
	static SAT_LOADING 		= 'loading';
	static SAT_DEPLOY 		= 'deploy';

	static LEVEL_NONE 		= null;
	static LEVEL_CHECKPOINT = 'checkpoint';
	static LEVEL_ROOT 		= 'root';


	level = Collection.LEVEL_NONE;

	ancestor;
	descendants = [];

	dirtyCapturing = true;

	syncLevel 		= Collection.SYNC_STORAGE;//sync level
	saturationMode 	= Collection.SAT_NONE;//saturation mode
	saturationInitiator;


	deployed = false;
	lastDeployed = null;
	items = [];

	dirty = new Collection.DirtyState;

	root;//root collection

	condition;

	offset;

	limit;

	sorter;
	sorted = false;




	// Collection
	// -------------

	sort(){

	}

	map(fn, filterNegativeValues = false){
		let a = [];
		for(let i=0;i<this.items.length;i++){
			let v = fn(this.items[i], i, a);
			if(!filterNegativeValues || v){
				a.push( v );
			}
		}
		return a;
	}



	// Pushing
	// -------------

	push(item){
		let operation = new ItemOperation('push',item);

		operation._before();
		this._beforePush(item, operation);

		if(operation.success){
			this.items.push(item);
			this._afterPush(item, operation);
		}

		operation._after();
		return operation;
	}

	/**
	 * @private
	 */
	_beforePush(item, op){

		if(Criteria.isEnough(this.limit, this.items.length)){
			op.reject("Collection is crowded, limit is "+this.limit+" items");
		}

		if(this.has(item)){
			op.reject("Item already existing in collection");
		}
		if(!this.isSuitable(item)){
			op.reject("Item is not suitable for conditions");
		}
	}
	/**
	 * @private
	 */
	_afterPush(item, op){
		if(this.dirtyCapturing){
			this.dirty.add(item)
		}
	}



	// Removing
	// -----------

	remove(item){
		let operation = new ItemOperation('remove',item);

		operation._before();
		this._beforeRemove(item, operation);

		if(operation.success){
			let i = this.items.indexOf(item);
			if(i>=0){
				this.items.splice(i,1);
			}

			this._afterRemove(item, operation);
		}

		operation._after();
		return operation;
	}

	/**
	 * @private
	 */
	_beforeRemove(item, op){ }

	/**
	 * @private
	 */
	_afterRemove(item, op){
		if(this.dirtyCapturing){
			this.dirty.rm(item)
		}
	}


	// Searching
	// ----------

	has(item){
		return this.items.indexOf(item)>=0;
	}


	// Conditions
	// --------------


	isSuitable(item){

		if(!Condition.checkCondition(item)){
			return false;
		}

		return true;
	}




	// Dirty state
	// ------------

	reset(){
		let oldDC = this.dirtyCapturing;
		try{

			this.dirtyCapturing = false;

			this.dirty.added.map((item)=>{
				this.remove(item);
			});
			this.dirty.removed.map((item)=>{
				this.add(item);
			});
			this.dirty.reset();
		}finally{
			this.dirtyCapturing = oldDC;
		}
	}


	// Inheritance
	// --------------

	extend(props){
		let descendant = new Collection();

		descendant.root = this.root;


		descendant.ancestor = this;

		if(this.level !== Collection.LEVEL_CHECKPOINT){
			descendant.root = descendant.root || this;
		}

		return descendant;
	}


	get checkpoint(){
		if([Collection.LEVEL_CHECKPOINT, Collection.LEVEL_ROOT].indexOf(this.level)>=0){
			return this;
		}else if(this.ancestor){
			return this.ancestor.checkpoint;
		}
	}



	// Synchronize and Saturation
	// ---------------------------

	sync(syncLevel){
		this.syncLevel = syncLevel;
		return this;
	}

	sat(saturationMode, saturationInitiator = null){
		let root = this.root || this;

		if(saturationMode instanceof Array){
			saturationMode = saturationMode[0];
			saturationInitiator = saturationMode[1];
		}

		if(!saturationInitiator){
			saturationInitiator = this;
		}

		root.saturationMode = saturationMode;
		root.saturationInitiator = saturationInitiator;
		return this;
	}

	deploy(){
		if(!this.root.saturationMode){

			this.sat(Collection.SAT_DEPLOY);

			this.fire('shouldDeploy', this);

			request()
				.then((items)=>{

					this.items = items;

					this.deployed 		= true;
					this.lastDeployed 	= new Date('now');

					this.fire('didDeploy', this, items);
					this.sat(Collection.SAT_NONE);
				})
				.catch((error)=>{

					this.deployed 		= false;
					this.lastDeployed 	= null;

					this.fire('errorDeploy', this, error);
					this.sat(Collection.SAT_NONE);
				});
		}
	}


	_doDeploy(){


	}



}
let Types = {

	STRING 	: 'string',
	INTEGER	: 'integer',
	FLOAT 	: 'float',
	OBJECT 	: 'object',
	ARRAY 	: 'array'

};

class Schema{

	fields = {};

	constructor(){

		this.fields = new FieldList();
		this.fields.extendBy({

			name: {
				nullable: true
			}

		});




		Field.extendField(this.fields, 'name', {
			nullable: true
		});

		Field.extend(this.fields, {
			name: {
				nullable: true
			}
		});

		this.extendField('name', {
			nullable: true
		});

		Object.assign(this.fields, {

			name: (field)=>{

			}

		})

	}

}

class FieldList{

	constructor(fields){
		Field.replaceRecursive(this, fields);
	}

	extendBy(fields){
		Field.extend(this, fields);
	}

}

let s = new Schema();
class Field{


	static extend(targetFields, srcFields){
		for(let p in srcFields){
			if(srcFields.hasOwnProperty(p)){
				this.extendField(targetFields, p, srcFields[p] );
			}
		}
		return targetFields;
	}

	static extendField(fields, name, extender){
		if(!extender){
			delete fields[name];
		}else if(typeof extender === 'object'){
			if(fields[name]){
				fields[name] = Field.replaceRecursive(fields[name], extender);
			}else{
				fields[name] = extender;
			}
		}else if(typeof extender === 'function'){
			let f = extender(fields[name]);
			if(!f){
				delete fields[name];
			}else if(typeof f === 'object'){
				fields[name] = f;
			}
		}
		return fields;
	}

	static replaceRecursive(target, src){

		let o = target;

		for(let p in src){
			if(src.hasOwnProperty(p)){
				if(typeof src[p] === 'object' && typeof target[p] === 'object'){
					o[p] = Field.replaceRecursive(target[p], src[p]);
				}else{
					o[p] = src[p];
				}
			}
		}
		return o;
	}

	static copy(target, recursive = false){
		let o = {};
		for(let p in target){
			if(target.hasOwnProperty(p)){
				if(recursive && typeof target[p] === 'object'){
					o[p] = Field.copy(target[p], recursive);
				}else{
					o[p] = target[p];
				}
			}
		}
		return o;
	}



}

s.name = {
	type: Types.STRING,
	stabilizer: true,// Означает что если значение число то оно конвертируется в строку, но если конвертировать не получится то хз
	nullable: false,
	rules: [{
		type: "Unique",
		checker(v,opts,scope){
			let criteria = {};
			criteria[scope.name] = v;
			scope.repository.query(criteria);
		},
		onCreate(table, {_field}){
			table[_field].addKey('UNIQUE');
		}
	},{
		type: "PresenceOf",
		checker(v){
			return !!v;
		},
		hint: 'Must be not empty'
	}, {
		type: "Expectation",
		checker(v, opts, scope){
			return opts.expected.indexOf(v);
		},
		opts: {
			expected: ['A','B','C']
		},
		sysHint: 'Must be any of "A", "B", "C"',
	}]
};

s.family = {
	type: Types.STRING,
	nullable: false,
};

s.fullName = {
	type: Types.STRING,
	nullable: false,

	formula: {
		setter: (record, value) => {
			let chunks = value.split(' ');
			record.name = chunks[0];
			record.family = chunks[1];
		},
		getter: (record) => {
			return record.name + ' ' + record.family;
		}
	}

};

s.flags = {
	type: Types.ARRAY,
	nullable: false,

	storing: {
		type: Types.STRING,
		encode(v){
			return v.split(';');
		},
		decode(v){
			return v.join(';');
		}
	},

	formula: {
		setter: (record, value) => {
			let chunks = value.split(' ');
			record.name = chunks[0];
			record.family = chunks[1];
		},
		getter: (record) => {
			return record.name + ' ' + record.family;
		}
	}

};

let schemaProps = {

	pk: 'id',


	search: {
		attributes: ['name', 'content'],
		conditionOver(value){
			for(let attr of this.attributes){

			}

			return ['AND',[

			]];
		},
		conditionForEach(attributeName, value){
			return [ 'LIKE', attributeName, `%${value}%` ];
		}
	},

	/**
	 * Абстрактное разделение storing(Методов хранения) от Схемы модели ORM
	 */
	storing: {

		database: {
			db: null,
			table: 'user',
			collate: 'utf8_general_ci',
			columns: {
				id: 'int(10) unsigned AUTO_INCREMENT PRIMARY',
				title: 'varchar(255) default null',
			}
		},

		map: {
			name: 'title'
		}

	}

};


















let collection = new Collection();

collection.push( { id: 1, name: '509' } );


collection.dirty.added.map((item)=>{
	item.save();
});

collection.dirty.removed.map((item)=>{

});
