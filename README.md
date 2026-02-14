# gameDesign

a collaborative project with jsm & wzx



###### xcx的一些说明（对于那些generic类应该怎么使用）

一个场景可以有：**一组planet， 一组satellite， 一个rocket**（比如说：可以设计两个黑洞作为planet， 四个卫星在黑洞周围打转，一个主角rocket）

若要新创建一个场景（eg：SceneKey 为‘BlackHole’），可以在assets目录下面创建一个文件夹（直接取名为‘BlackHole’），再在这个文件夹里传入planet，satellite的图片。这些图片都应当添加到scenes文件夹的Preloader.js 文件中。例如：this.load.image('cartoon\_BlackHole', 'BlackHole/cartoon\_BlackHole.png');括号中第一项为这张照片的key，第二项为进入了assets文件夹后找到该图片的路径。



接下来，需要写五个类，分别继承自GenericPlanet，GenericSatellite， GenericRocket， GenericScene， GenericPreparationScene。**我写了一个Demonstration文件来展示继承的时候每个类必须要写的基础功能（否则这个类没法用）。这几个基类实现了一些基础功能（如行星绕转，血条机制，火箭发动机，碰撞检测，游戏重置）**，其他功能需要在继承这些基类的基础上进行重写。



详细介绍：



###### **Genericplanet的构造函数的参数有scene, x, y, texture, radius, setHealthBar, bodyMass**

&nbsp;	scene是场景，x,y是planet中心的坐标（number型）， texture是你想放进去的图片的key，即一个字符串（eg：‘BlackHole’）， radius是星球的半径	（number型）， setHealthBar是bool型参量，true意味着给planet设置血条，false意味着不设置血条（无限血）， bodymass是行星的重量，会影响引力计	算，一般设置1000的量级。	

&nbsp;	**需要给一个Planet设置G和幂律，当引力幂率不可变时，引力计算会调用这些参量**（可以参考planetEg）。



&nbsp;	Note：planet现在都是静止类，双星系统这样要求planet动起来的基类还没有开发，可以先拖到后面去做。



###### **GenericSatellite的构造函数的参数有：scene, x, y, texture, targetPlanets, setHealthBar, radius,  gravitySystem, setRestart**

&nbsp;	targetPlanets指会给予Satellite引力作用的Planet列表，其他参数的含义与上文类似。gravitySystem是用于更新引力参数的（用	于应对引力参数会变化的情况）。一般情况下对于这些参数照抄就可以了（可以参考SatelliteEg的	constructor），setRestart === true即意味着需要按R键手动重启

&nbsp;	**需要写initializeVelocity这个函数！很重要！否则开始时卫星将没有速度。**initializeVelocity函数的目的是给this.initialVelocity赋值，最简单的方法是在SatelliteEg	中第80行注释掉的直接赋值的语句。在SatelliteEg中用的initializeVelocity保证satellite可以近似稳定地运动



###### **GenericRocket的构造函数参数是：scene, x, y, texture, targetPlanets, setHealthBar, radius,  gravitySystem, setRestart， infiniteFuel**

	genericRocket继承自GenericSatellite，多加了引擎机制，可以沿着法线和切线方向加速减速，并可选择是否有“无限油量”——通过infiniteFuel这个参数	（bool）型，选择了	infiniteFuel === true之后	不会显示油量条，油量不消耗。

&nbsp;	要注意的是：GenericRocket也要实现initialVelocity这个函数，要求与GenericSatellite完全相同。



&nbsp;	Note：现在汽油条显示和更新的逻辑有问题，留待之后解决（这个问题已经解决）



###### **GenericScene的构造函数参数是：sceneKey, cameraFollow, leader\_str, powerManipulation**

	sceneKey是这个Scene的“值”，需要通过key找到这个Scene。例如this.scene.start('SceneEg')语句可以从一个场景切换到另一个场景。

&nbsp;	cameraFollow表示镜头是否跟着主角走，是bool型，true表示跟着主角，false表示不跟随

&nbsp;	leader\_str只能为两个字符串：‘rocket’或者‘satellite’。如果输入rocket则镜头跟随rocket，如果输入Satellite则镜头跟随Satellite数组的第一个（即	Satellite\[0]）.(前提是cameraFollow是true。cameraFollow为false的话，这个参数想填啥填啥，不会影响）

&nbsp;	PowerManipulation表示这个场景是否引入引力幂律调整机制，如果引入的话，界面会显示引力幂率滑动标识，且所有的Satellite都将用gravitySystem类中的G	计算。

&nbsp;	**GenericScene必须要实现：四个initiateblablabla函数（构造backGround， Planets， Satellites， rocket）在函数中完成以下步骤：**

&nbsp;	0.将数组this.satellites设置为空的

&nbsp;	1.把初始位置放入this.initialSatellitePositions这个list中（具体格式参见SceneEg）（这一步没有非常重要）

&nbsp;	2.把new好的类（不能是基类！必须是继承类）push进那个空this.satellites数组中


###### **GenericPreparationScene的构造函数参数是：sceneKey, sceneKeyGame**
&nbsp;	sceneKeyGame是preparationScene对应的那个主游戏场景的key




&nbsp;	Note：

&nbsp;		1.backGround会1覆盖部分UI显示，这个问题还要调整
			(这个问题已经解决)

&nbsp;		2.现在GravitySystem的滑动条显示不出来，不知道怎么搞的，**但烦请大家尽量不要改GravitySystem，因为我的GenericSatellite和这个类联系紧密可能会	崩：(**









**最后：每个新的Scene都放在Scenes中新开的AdventureScenes文件夹里，每个新的Scene对应的一组继承类（planet， satellite， rocket）按场景打包放在Adventure文件夹中（这样大家都好管理一些~）**



**我把Game.js作为一开始的菜单页面，大家要调试的话把Game.js第136行this.scene.start('SceneEg');里面的key改成自己的Scene的key即可**



2、13
新增加的功能：血量都已经设置好了，为之后宇宙回程碰撞rocket之类的场景做好准备



	











