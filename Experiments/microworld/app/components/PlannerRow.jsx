import React from 'react'
import Button from '../components/Button';

const PlannerRow = ({month, year, actionTags}) => {
    return (
        <div className='flex mb-2 w-full justify-between'>
            <div className='font-bold text-sm bg-blue-100 pt-3 px-3 rounded-full mr-2' style={{width: "100px"}}>
                Month {month}<br/>Year {year}
            </div>
            <div className='flex flex-nowrap overflow-x-scroll gap-2 mr-2'>
                {actionTags}
            </div>
        </div>
    )
}

export default PlannerRow;