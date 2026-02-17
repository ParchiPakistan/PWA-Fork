import Link from "next/link"
import Image from "next/image"

export function Footer() {
    return (
        <footer className="w-full py-8 bg-primary text-white">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid gap-8 lg:grid-cols-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            {/* Placeholder for white logo version if available */}
                            <span className="text-2xl font-bold font-heading">Parchi</span>
                        </div>
                        <p className="text-sm text-blue-100">
                            Pakistan's first student exclusive discount ecosystem.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">Company</h3>
                        <ul className="space-y-2 text-sm text-blue-100">
                            <li><Link href="#" className="hover:text-white">About Us</Link></li>
                            <li><Link href="#" className="hover:text-white">Careers</Link></li>
                            <li><Link href="#" className="hover:text-white">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">Legal</h3>
                        <ul className="space-y-2 text-sm text-blue-100">
                            <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-white">Merchant Agreement</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">Download App</h3>
                        <div className="flex flex-col gap-2">
                            <Link href="#" className="block w-36 bg-gray-800 rounded-lg p-2 border border-gray-700 hover:border-gray-500 transition-colors text-center">
                                App Store
                            </Link>
                            <Link href="#" className="block w-36 bg-blue-600 rounded-lg p-2 border border-blue-500 hover:border-blue-400 transition-colors text-center">
                                Google Play
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-blue-600 mt-8 pt-8 text-center text-sm text-blue-200">
                    © {new Date().getFullYear()} Parchi Technologies. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
