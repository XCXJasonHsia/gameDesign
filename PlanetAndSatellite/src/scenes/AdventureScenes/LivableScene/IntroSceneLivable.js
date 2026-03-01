import { GenericIntroScene } from '../../../generalClasses/GenericIntroScene.js';

export class IntroSceneLivable extends GenericIntroScene {
    constructor() {
        super('IntroSceneLivable', 'SceneLivable', '绿洲星', 
            '经过广袤星带的考验，你终于来到了绿洲星。\n绿洲星是一颗充满生机的星球，拥有适宜人类居住的环境和丰富的资源。\n你的任务是在这颗星球上安全降落，探索星球表面，寻找可能的人类殖民地。\n在降落过程中，你需要控制火箭的速度和角度，确保安全着陆。\n祝你好运，宇航员！');
    }
}