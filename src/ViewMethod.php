<?php
/**
 * @Creator Alexey Kutuzov <lexus27.khv@gmail.com>
 * @Author: Alexey Kutuzov <lexus27.khv@gmai.com>
 * @Project: ceive.app
 */

namespace Ceive\App;


use Ceive\Routing\Hierarchical\MatchingReached;
use Ceive\View\Layer\LayerManager;
use Ceive\View\Layer\Mlv;

class ViewMethod{
	
	protected $dirname;
	
	/** @var  LayerManager  */
	protected $layerManager;
	
	/**
	 * LayoutMethod constructor.
	 * @param $baseDirname
	 * @param LayerManager $layerManager
	 */
	public function __construct($baseDirname, LayerManager $layerManager){
		$this->dirname = $baseDirname;
		$this->layerManager = $layerManager;
	}
	
	/**
	 * @param MatchingReached $matching
	 * @return string
	 */
	public function run(MatchingReached $matching){
		$layers = [];
		$lastLayout = null;
		
		$way = $matching->way();
		$count = count($way);
		
		foreach($way as $i => $m){
			$view = $m->getOption('view');
			if($view){
				if(!is_string($view)){
					$view = array_replace([
						'matched'  => null, // layout for contains
						'reached'  => null, // concrete template
					],(array)$view);
					$matchedLayer   = $view['matched'];
					$reachedLayer   = $view['reached'];
				}else{
					$matchedLayer   = null;
					$reachedLayer   = $view;
				}
				
				if($matchedLayer){
					$layers[] = [
						'key' => $matchedLayer,
						'scope' => $m->getParams()
					];
				}
				
				switch($i){
					
					case $count - 1: // pre () reached
						if($reachedLayer){
							$layers[] = [
								'key' => $reachedLayer,
								'scope' => $m->getParams()
							];
						}
						break;
					case $count - 2: // pre pre (container)
						
						
						break;
					
				}
			}
		}
		
		$mlv = new Mlv([
			'appRoot'              =>   dirname(__DIR__),
			'webRoot'              =>   '@appRoot/web',
			'views.src'            =>   '@appRoot/views',
			'views.main'           =>   'index.html',
			'views.entryPoint'     =>   'index.js',
			'client.src'           =>   '@appRoot/webSrc',
			'client.entryPoint'     =>  'index.js',
			'client.dist'          =>   '@appRoot/web/build',
			'client.buildCmd'      =>   'npm run build',
			'client.jsBundleName'  =>   'bundle.js',
			'client.cssBundleName' =>   'bundle.css',
			
			'html.rootID'         => 'main'
		]);
		//$mlv->transpiler->clear();
		$mlv->env();
		$mlv->interpret();
		
		return $mlv->html($layers);
	}
	
	public function getDirname(){
		return $this->dirname;
	}
	
}


