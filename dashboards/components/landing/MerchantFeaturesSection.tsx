"use client" // Needed for interactivity if we add it, but good practice for client components
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BarChart3, ShieldCheck, Store } from "lucide-react"

export function MerchantFeaturesSection() {
    return (
        <section className="w-full py-6 md:py-12 lg:py-16 bg-background border-t">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">

                    {/* Left Side: Visuals (Admin Dashboard Mockup) */}
                    <div className="order-2 lg:order-1 mx-auto flex w-full max-w-[600px] flex-col items-center justify-center space-y-4">
                        <div className="w-full aspect-video bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-4 relative overflow-hidden group">
                            {/* Fake UI */}
                            <div className="absolute top-0 left-0 w-full h-10 bg-gray-800 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="mt-8 flex gap-4 h-full">
                                <div className="w-1/4 bg-gray-800/50 rounded-lg h-3/4"></div>
                                <div className="w-3/4 flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-1/3 h-24 bg-primary/20 rounded-lg border border-primary/30"></div>
                                        <div className="w-1/3 h-24 bg-secondary/10 rounded-lg border border-secondary/30"></div>
                                        <div className="w-1/3 h-24 bg-gray-800 rounded-lg"></div>
                                    </div>
                                    <div className="w-full h-40 bg-gray-800 rounded-lg"></div>
                                </div>
                            </div>

                            {/* Badge */}
                            <div className="absolute bottom-6 right-6 bg-white text-primary px-4 py-2 rounded-full font-bold text-sm shadow-lg transform group-hover:scale-110 transition-transform">
                                Partner Dashboard
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Content */}
                    <div className="order-1 lg:order-2 flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-2">
                                For Merchants
                            </div>
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-heading text-primary">
                                Grow Your Business with Gen Z.
                            </h2>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                                Tap into the student market with precision. Manage multiple branches, track redemptions in real-time, and ensure secure verification.
                            </p>
                        </div>

                        <div className="grid gap-6 mt-6">
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <Store className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Corporate & Branch Management</h3>
                                    <p className="text-sm text-muted-foreground">Centralized control for franchises. Assign managers to specific branches with custom access levels.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <BarChart3 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Real-time Analytics</h3>
                                    <p className="text-sm text-muted-foreground">Know exactly how many students visited, what they bought, and your ROI.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <ShieldCheck className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Secure Verification</h3>
                                    <p className="text-sm text-muted-foreground">Zero fraud. Our closed-loop system ensures only verified active students can redeem offers.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold" asChild>
                                <Link href="/auth/login">
                                    Become a Partner
                                </Link>
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
