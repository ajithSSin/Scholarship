import React from 'react'
// import ButtonEvent from './ButtonEvent'

const About = () => {
  return (
    <section className="mx-auto max-w-3xl p-1 ">
        <div className="rounded-2xl bg-white/60 backdrop-blur-md  ">
            <header className="mb-3 text-center">
                <h2 className="text-2xl sm:text-3xl 
                            font-extrabold tracking-tight text-gray-900">
                    About the Scholarship Distribution DApp
                </h2>
            <p className="mt-1 text-sm text-gray-600">
                Transparent, secure scholarship distribution on Ethereum
            </p>
        </header>
        <div className="grid gap-4 ">
            <article className="flex items-start gap-4 p-4 
                                rounded-lg bg-gray-50 
                                border border-gray-100">
                <div className="flex items-center justify-center h-10 w-10
                                rounded-full bg-indigo-50 
                                text-indigo-600 font-semibold">1
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                        Student Application
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                        A student applies for a scholarship by providing the 
                        required details and documents.
                    </p>
                </div>
            </article>
            <article className="flex items-start gap-4 p-4 
                                rounded-lg bg-gray-50 
                                border border-gray-100">
                <div className="flex items-center justify-center h-10 w-10
                                rounded-full bg-amber-50 
                                text-amber-600 font-semibold">2
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                        Review & Decision
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                        An admin or reviewer approves or rejects the application 
                        using the DApp interface.
                    </p>
                </div>
            </article>
            <article className="flex items-start gap-4 p-4 
                                rounded-lg bg-gray-50 
                                border border-gray-100">
                <div className="flex items-center justify-center h-10 w-10
                                rounded-full bg-emerald-50 text-emerald-600 
                                font-semibold">3
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                        Fund Distribution
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                        Approved students receive scholarship funds in Ether or ERC-20 
                        tokens directly to their wallet.
                    </p>
                </div>
            </article>
            <article className="flex items-start gap-4 p-4 
                                rounded-lg bg-gray-50 
                                border border-gray-100">
                <div className="flex items-center justify-center h-10 w-10 
                                rounded-full bg-sky-50 text-sky-600 
                                font-semibold">4
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                        On-chain Records
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                        All actions and records are stored on the blockchain for 
                        transparency and auditability.
                    </p>
                </div>
            </article>
        </div>
        
        <footer className="m-3 text-sm text-gray-500 text-center">
            Note: use a connected wallet (e.g., MetaMask) 
            to sign transactions when approving or claiming funds.
        </footer>
    </div>
</section>
)
}

export default About