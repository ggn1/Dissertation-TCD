'use client';
import { useState, useEffect } from "react";
import Link from "next/link";

const Nav = () => {

  return (
    <nav className="flex justify-center w-full p-5 align-middle">
        <Link href="/" className="flex text-3xl gap-2 flex-center hover:underline">Krimiverse</Link>
    </nav>
  )
}

export default Nav