'use client';

import Link from 'next/link';
import Button from '../components/Button';
import GlobalConfig from '../app.config.js'
import { useEffect, useState } from 'react';

export default function Planner() {
    
    useEffect(() => {
        console.log(GlobalConfig.plan.getAllActions());
    }, [])

    return (
        <main>
            <Button colorBg="yellow" colorFg="black">
                <Link href='/'>BACK</Link>
            </Button>
        </main>
    );
}