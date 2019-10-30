<?php
/**
 * @Creator Alexey Kutuzov <lexus27.khv@gmail.com>
 * @Author: Alexey Kutuzov <lexus27.khv@gmai.com>
 * @Project: ceive.app
 */

namespace Ceive\App\Tests;


use PHPUnit\Framework\TestCase;

class Logger extends TestCase{
	
	public function testBasic(){
		$logger = new \Ceive\App\Logger\Logger();
		
		
		$logger->debug();
		
	}
	
}


