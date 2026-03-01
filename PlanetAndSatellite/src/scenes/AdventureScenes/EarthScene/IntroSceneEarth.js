import { GenericIntroScene } from '../../../generalClasses/GenericIntroScene.js';

export class IntroSceneEarth extends GenericIntroScene {
    constructor() {
        super('IntroSceneEarth', 'SceneEarth', '起源', 
            '在遥远的宇宙中，人类发现了一颗蓝色的星球，它被称为地球。\n地球是人类的发源地，拥有丰富的水资源和生命。\n然而，地球正面临着前所未有的危机，重力系统出现异常，地球可能会被压缩成一个肉饼。\n作为一名勇敢的宇航员，你的任务是驾驶火箭，拯救地球于危难之中。\n你需要掌握火箭的推进系统，在复杂的重力环境中导航，找到解决地球危机的方法。\n祝你好运，宇航员！');
    }
}