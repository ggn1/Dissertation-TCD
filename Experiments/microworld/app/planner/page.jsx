'use client';

import Link from 'next/link';
import Button from '../components/Button';
import GlobalConfig from '../app.config.js'
import { useEffect, useState } from 'react';
import ActionTag from '../components/ActionTag';
import PlannerRow from '../components/PlannerRow';

const initializeActions = () => {
    let actions = {};
    let time = GlobalConfig.time_range[0];
    while (GlobalConfig.timeCompare(time, GlobalConfig.time_range[1]) >= 0) {
        actions[`${time.month}-${time.year}`] = [];
        time = GlobalConfig.timeDelta(time, 1);
    }
    return actions;
}

export default function Planner() {
    const [actions, setActions] = useState(initializeActions());
    const [actionTags, setActionTags] = useState(initializeActions());
    const [plannerRows, setPlannerRows] = useState([]);

    const addAction = () => {
        // TO DO ...
        console.log('Add Action');
    }

    const deleteRepeatingAction = () => {
        // TO DO ...
        console.log('Delete all instances of an action.');
    }

    useEffect(() => {
        console.log(actions);
        let allActions = GlobalConfig.plan.getAllActions();
        let actionKeys = Object.keys(allActions).map(myStr => {
            const [month, year] = myStr.split('-');
            return {month: Number(month), year: Number(year)};
        });
        actionKeys.sort(function(a, b) {return GlobalConfig.timeCompare(b, a)});;
        let actionsCur = actions;
        let actionTagsCur = actionTags;
        let actionList = [];
        let plannerRowsCur = [];
        actionKeys.forEach(t => {
            actionList = allActions[`${t.month}-${t.year}`];
            actionList.forEach(a => {
                actionsCur[`${t.month}-${t.year}`].push(a);
                actionTagsCur[`${t.month}-${t.year}`].push(<ActionTag action={a} />);
            });
            plannerRowsCur.push(<PlannerRow 
                key={`${t.month}-${t.year}`} 
                month={t.month} 
                year={t.year}
                actionTags={actionTagsCur[`${t.month}-${t.year}`]}
            />);
        });
        setActions(actionsCur);
        setActionTags(actionTagsCur);
        setPlannerRows(plannerRowsCur);
    }, []);

    return (
        <main>
            <Button colorBg="yellow" colorFg="black">
                <Link href='/'>BACK</Link>
            </Button>
            <div>
                <div className='flex justify-center text-center items-center'>
                    <div className='max-h-96 overflow-y-scroll' style={{width: "500px"}}>
                        {plannerRows}
                    </div>
                </div>
                <div className='flex gap-5 justify-center mt-5'>
                    <Button onClick={addAction} colorBg="RoyalBlue" colorFg="white">ADD</Button>
                    <Button onClick={deleteRepeatingAction} colorBg="Tomato" colorFg="white">DELETE ALL</Button>
                </div>
            </div>
        </main>
    );
}