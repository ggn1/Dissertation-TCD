import React from 'react';
import Button from '../components/Button';
import GlobalConfig from '../app.config.js';

const ActionTag = ({action}) => {
    let treeImg = null;
    if (
        action.treeLifeStage == 'seedling' 
        || action.treeLifeStage == 'sapling'
    ) treeImg = GlobalConfig.treeImgs[action.treeLifeStage];
    else treeImg = GlobalConfig.treeImgs[action.treeLifeStage][action.treeType];

    const deleteAction = () => {
        // TO DO ...
        console.log('Delete Action', action.id);
    }

    const editAction = () => {
        // TO DO ...
        console.log('Edit Action', action.id);
    }

    let actionBorderColor = '';
    if (action.status == 0) actionBorderColor = 'border-slate-200';
    else if (action.status == 1) actionBorderColor = 'border-green-700';
    else if (action.status == -1) actionBorderColor = 'border-red-500';
    else if (action.status == 0.5) actionBorderColor = 'border-yellow-600';
    
    return (
        <div className={`min-w-44 rounded-xl border-4 bg-slate-200 ${actionBorderColor}`}>
            <Button onClick={editAction}>
                <div className='flex'>
                    <div className='font-bold mt-1.5 mr-2'>Q{action.quadrant}</div>
                    <img className="h-10 mr-3" src={GlobalConfig.actionImgs[action.action]} />
                    <div className='mt-1.5 font-bold mr-0.5'>{action.maxNumAffected}</div>
                    <svg className="h-10 w-6">
                        <path d={treeImg.d} fill={treeImg.fill} style={{
                            scale: 0.08, stroke: '#000', 'strokeWidth':10
                        }}/>
                    </svg>
                </div>
            </Button>
            <Button onClick={deleteAction} colorFg={'Tomato'}>X</Button>
        </div>
    )
}

export default ActionTag;