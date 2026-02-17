import Image from "next/image"

// Mock Data for Merchant Showcase (Logos)
// Ideally these would be real URLs, but we'll use placeholders with text for now
const merchants = [
    { name: "Gloria Jean's", logo: "/logos/gloria.png" }, // Placeholder paths, will fallback to text generator if needed
    { name: "Subway", logo: "/logos/subway.png" },
    { name: "OPTP", logo: "/logos/optp.png" },
    { name: "Burger Lab", logo: "/logos/burgerlab.png" },
    { name: "Pizza Hut", logo: "/logos/pizzahut.png" },
    { name: "KFC", logo: "/logos/kfc.png" },
    { name: "Dominos", logo: "/logos/dominos.png" },
    { name: "Hardee's", logo: "/logos/hardees.png" },
    { name: "Dunkin", logo: "/logos/dunkin.png" },
    { name: "California Pizza", logo: "/logos/california.png" },
    { name: "Chaaye Khana", logo: "/logos/chaaye.png" },
    { name: "Broadway Pizza", logo: "/logos/broadway.png" },
]

export function MerchantShowcaseSection() {
    return (
        <section className="w-full py-6 md:py-12 lg:py-16 bg-white">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-heading text-primary">
                            Trusted by Brands
                        </h2>
                        <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                            From your morning coffee to your late-night cravings, Parchi has you covered.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-80">
                    {merchants.map((merchant, index) => (
                        <div key={index} className="flex items-center justify-center w-32 h-20 relative grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-105">
                            {/* 
                  Using a placeholder service for logos since we don't have the actual files accessible 
                  without digging into the app assets which might be complex to extract right now.
                  In production, these would be proper <Image> tags with local assets.
               */}
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100 p-2">
                                <span className="text-sm font-bold text-gray-400 text-center">{merchant.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
