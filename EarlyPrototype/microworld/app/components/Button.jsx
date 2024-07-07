import React from 'react'

function Button({onClick, colorFg, colorBg, children}) {
  return (
    <button className='rounded-lg border-4 hover:brightness-75 px-2 py-1 font-bold' onClick={onClick} style={{color: colorFg, background: colorBg}}>
        {children}
    </button>
  )
}

export default Button