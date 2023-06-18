// Common format for all pages under this folder.

import '@/styles/globals.css';
import Nav from '@/components/Nav';

export const metadata = {
    title: 'Krimiverse',
    description: 'Enjoy observing a world of digital microbes called "Krimi".'
}

const RootLayout = ({children}:{children:any}) => {
  return (
    <html lang="en">
        <body>
            <main className='app font-mono'>
              <Nav/>
              {children}
            </main>
        </body>
    </html>
  )
}

export default RootLayout