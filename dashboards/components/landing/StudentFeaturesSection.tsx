import { Trophy, Star, Gift, Medal } from "lucide-react"

export function StudentFeaturesSection() {
    return (
        <section className="w-full py-6 md:py-12 lg:py-16 bg-primary relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">

                    {/* Left Side: Content */}
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <div className="inline-block rounded-lg bg-white/10 px-3 py-1 text-sm text-secondary mb-2 border border-white/20">
                                For the Hustlers
                            </div>
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-heading text-white">
                                More Than Just Discounts.
                            </h2>
                            <p className="max-w-[600px] text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Parchi gamifies your savings. Compete with friends, earn badges, and unlock elite status.
                            </p>
                        </div>

                        <div className="grid gap-6 mt-8 text-white">
                            <div className="flex items-start gap-4">
                                <div className="bg-white/10 p-3 rounded-full">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Leaderboards</h3>
                                    <p className="text-blue-100">See who's saving the most on campus. Top savers get exclusive monthly rewards.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-white/10 p-3 rounded-full">
                                    <Star className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Leaderboard Rewards</h3>
                                    <p className="text-blue-100">Top savers get exclusive status and lifetime premium perks.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-white/10 p-3 rounded-full">
                                    <Gift className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Loyalty Rewards</h3>
                                    <p className="text-blue-100">Every 5 redemptions at a partner brand unlocks a bonus freebie or massive discount.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Visuals/Cards */}
                    <div className="mx-auto flex w-full max-w-[500px] flex-col items-center justify-center space-y-6 lg:max-w-none">
                        {/* Mock Leaderboard Card */}
                        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-heading font-bold text-lg">Campus Top Savers</h4>
                                <Medal className="w-5 h-5 text-yellow-500" />
                            </div>
                            {/* List Items */}
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                        #{i}
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-2 w-24 bg-gray-200 rounded mb-1"></div>
                                        <div className="h-2 w-16 bg-gray-100 rounded"></div>
                                    </div>
                                    <div className="font-bold text-primary text-sm font-sans">Rs. {5000 - (i * 500)}</div>
                                </div>
                            ))}
                        </div>

                        {/* Mock Badge Card */}
                        <div className="w-full max-w-sm bg-gradient-to-r from-primary to-blue-600 rounded-2xl shadow-xl p-6 text-white transform -rotate-1 hover:rotate-0 transition-transform duration-300 translate-x-12 -mt-12">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Star className="w-6 h-6 text-secondary" fill="currentColor" />
                                </div>
                                <div>
                                    <h4 className="font-heading font-bold text-lg">Leaderboard Rewards</h4>
                                    <p className="text-xs text-white/80 font-sans">Top Saver 2024</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
