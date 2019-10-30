<?php
/**
 * @Creator Alexey Kutuzov <lexus27.khv@gmail.com>
 * @Author: Alexey Kutuzov <lexus27.khv@gmai.com>
 * @Project: ceive.app
 */

namespace Ceive\App\Tests;


use Ceive\View\Layer\Node\PackageGenerator;
use PHPUnit\Framework\TestCase;

class TestA extends TestCase{
	
	public function testGenerate(){
		$pg = new PackageGenerator(dirname(__DIR__),[
			'webDir'    => '/web/',
			
			'src'       => 'webSrc',
			'entry'     => 'webSrc/index.js',
			
			'dist'      => 'web/build',
			'distJs'    => 'bundle.js',
			'distCss'   => 'bundle.css',
		]);
		$pg->generate();
	}
	
	public function testProcessingMlv(){
		
		
		
		
	}
	
}


