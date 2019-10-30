<?php
/**
 * @Creator Alexey Kutuzov <lexus27.khv@gmail.com>
 * @Author: Alexey Kutuzov <lexus27.khv@gmai.com>
 * @Project: ceive.app
 */


namespace Ceive\Routing;
include '../vendor/autoload.php';

use Ceive\App\ViewMethod;
use Ceive\Routing\Hierarchical\ConjunctionFactory;
use Ceive\Routing\Hierarchical\ConjunctionRoute;
use Ceive\Routing\Method\LocationMethod;
use Ceive\Routing\Plugin\BindingPlugin;
use Ceive\Routing\Plugin\NotFoundPlugin;
use Ceive\Routing\Plugin\PathModifierPlugin;
use Ceive\Routing\Plugin\ProcessPlugin;
use Ceive\Routing\Route\MyBindingAdapter;
use Ceive\Routing\Simple\SimpleMatching;
use Ceive\Routing\Simple\SimplePatternResolver;
use Ceive\Routing\Simple\SimpleRoute;
use Ceive\Routing\Simple\SimpleRouteFactory;
use Ceive\Routing\Simple\SimpleRouter;
use Ceive\View\Layer\LayerManager;

$resolver   = new SimplePatternResolver();
$resolver->setPathDelimiter('__');

$router = new SimpleRouter($resolver);

class MyProcess extends ProcessPlugin{

    public function process(){
        echo $this->matching->view();
    }

}


$router->addPlugin(new MyProcess());
$router->addPlugin(new BindingPlugin());
$router->addPlugin(new PathModifierPlugin());
$router->addPlugin(new NotFoundPlugin());
$router->setMethod('location',new LocationMethod(), true );

$baseDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'views';

$router->setMethod('view',new ViewMethod($baseDir,new LayerManager()));


$router->setBindingAdapter(new MyBindingAdapter());

$director = new FactoryDirector($router);

$director->setFactory(new ConjunctionFactory(),ConjunctionRoute::class);
$director->setFactory(new SimpleRouteFactory(),SimpleRoute::class);
$director->setDefault(SimpleRoute::class);

$fn = [
    'clearExtraSlashes' => function(Route $route, Matching $matching){
        $pp = $matching->getProposedPath();

        $pp = rtrim($pp,"\\/");

        //if($pp === '/') $pp = '';
        //else $pp = rtrim($pp,"\\/");

        $matching->setProposedPath($pp);
    }
];

$route = $director->createRoute([
    'pattern' 	=> '',
    'type' 		=> ConjunctionRoute::class,
    'location' 	=> [
        'title' => 'Главная',
    ],
    'view' => [
        'matched' => 'site/index',
        'reached' => 'site/index/index'
    ],
    'onBeforeMatch' => $fn['clearExtraSlashes'],
    'children' => [[
        'pattern' => '/users',
        'action' => 'user:list',
        'rules' => [[
            'http.method' => 'get',
        ]],
        'params' => [
            'users' => [
                ['id' => 456, 'name' => 'Alexey Kutuzie'],
                ['id' => 21, 'name' => 'Elena Kutuzov'],
                ['id' => 456, 'name' => 'Vadim Pol Mackartny'],
                ['id' => 14, 'name' => 'Anna Tkachist']
            ]
        ],
        'location' => [
            'title' => 'Пользователи',
        ],
        'view' => [
            'matched' => 'site/users',
            'reached' => 'site/users/list'
        ],
        'type' => ConjunctionRoute::class,

        'children' => [[
            'pattern' => '/create',
            'action' => 'user:create',
            /*'form' => [
                'source' => 'http.post'
            ],*/
            'view' => [
                'reached' => 'site/users/create'
            ],
        ],[
            'pattern' => '/(?<user__id>\d+)',
            'action' => '#user.view',
            'type' => ConjunctionRoute::class,
            'static' => true,// если в базе данных не будет объекта с айди user__id то произойдет выброс 404
            'rules' => [
                'http.method' => 'get'
            ],
            'output' => [ 'json', 'html' ],
            'view' => [
                'reached' => 'site/users/index'
            ],
            'location' => [
                'title' => 'Табличка пользователя',
                'breadcrumb' => '{user.profile.getFullname(`Family N.S.`)}',
            ],
            'objects'   => [
                'user' => 'UserClass'
            ],

            'children'  => [ [
                'pattern' => '/update',
                'action' => 'user:update',
                'form' => [
                    'source' => 'http.post'
                ],
                'view' => 'layer-j',
            ], [
                'pattern' => '/delete',
                'action' => 'user:delete',
                'view' => 'users/delete.xlay',
            ], [
                'location' => [
                    'breadcrumb' => 'Записи',
                    'title' => 'Записи пользователя',
                ],
                'pattern' => '/notes',
                'action' => 'user:note:list',
                'type' => ConjunctionRoute::class,
                'view' => 'layer-f',
                'children'  => [ [

                    'pattern' => '/(?<note__id>\d+)',
                    'action' => 'user:note:read',
                    'type' => ConjunctionRoute::class,
                    'location' => [
                        'breadcrumb' => '{note.title}',
                        'title' => 'Запись пользователя',
                    ],
                    'objects'   => [
                        'note' => 'NoteClass'
                    ],
                    'view' => 'layer-f',

                    'children' => [ [
                        'location' => [
                            'title' => 'Редактирование',
                        ],
                        'view' => [
                            'template' => 'layer-j'
                        ],
                        'pattern' => '/update',
                        'action' => 'user:note:update',
                    ], [
                        'pattern' => '/delete',
                        'action' => 'user:note:delete',
                    ] ],
                ], [
                    'pattern' => '/create',
                    'action' => 'user:note:create',
                ] ],
            ] ],
        ] ],
    ]]
]);

$path = $_SERVER['REQUEST_URI'];
// встроить Работу с Объектами ORM, В маршрутизатор (CONVERTER)
$matching = new SimpleMatching($path);
$router->addRoute($route);

$router->process($matching);