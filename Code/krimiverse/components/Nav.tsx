import Link from "next/link";

const Nav = () => {
  return (
    <nav className="grid justify-items-center w-full p-10 text-3xl hover:underline">
        <Link href="/" className="flex gap-2 flex-center">Krimiverse</Link>
    </nav>
  )
}

export default Nav