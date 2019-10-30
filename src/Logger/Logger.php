<?php
/**
 * @Creator Alexey Kutuzov <lexus27.khv@gmail.com>
 * @Author: Alexey Kutuzov <lexus27.khv@gmai.com>
 * @Project: ceive.app
 */

namespace Ceive\App\Logger;


class Logger{
	
	public $zones = [];
	
	public function debug(){
		
		$this->registerZone(dirname(dirname(__DIR__)), [
			'name' => '@project',
			'ignore' => [
				'/vendor/*',
				'/node_modules/*'
			]
		]);
		$this->registerZone(dirname(dirname(__DIR__)) . DIRECTORY_SEPARATOR . 'vendor',
			'@project.packages'
		);
		
		/**
		 * А. Можно узнать где используется этот код, в каких цепочках, какие другие функции и тд используются в данной цепочке
		 * Б. В результате ошибки можно сформировать Хеш стека и определить его как тэг этой ошибки в багтрекере
		 * В. На базе Файла и строки в информации об ошибке можно сформировать её Хеш.
		 *      Далее на основе информации SUB_ROOT вложенных в проект, можно определить цепочку пакетных зависимостей в которых происходит ошибка для текущего проекта
		 *      Цепочку пакетных зависимостей можно определить только с имеющимся @CallStack. А на базе только файла и линии ошибки можно определить только путь до пакета.
		 *      @CallStack - доступен при debug_backtrace или при выброшенном Exception
		 */
		$trace  = debug_backtrace();
		
		$_ = [];
		foreach($trace as $index => $call){
			
			
			
			$file = isset($call['file'])?$call['file']:null;
			$__i = $index;
			while(!$file){
				$__i++;
				if(!isset($trace[$__i])){
					break;
				}
				$file = isset($trace[$__i]['file'])?$trace[$__i]['file']:null;
			}
			unset($__i);
			
			
			
			foreach($this->zones as $root => $options){
				$relative = strtr(substr($file, strlen($root)),['\\'=>'/']);
				
				if($options['ignore']){
					foreach($options['ignore'] as $pattern){
						if(fnmatch($pattern, $relative)){
							continue(2);
						}
					}
				}
				
				// Если файл находится в зоне
				if($file && substr($file, 0, strlen($root)) === $root  ){
					$_[$options['name']][] = array_replace([
						'relative' => $relative
					],$call);
				}
				
			}
			
			
		}
		
	}
	
	public function registerZone($root, $name){
		
		if(!is_array($name)){
			$name = ['name' => $name,'ignore' => null];
		}
		
		$this->zones[$root] = $name;
	}
	
	
	
	
	
}


