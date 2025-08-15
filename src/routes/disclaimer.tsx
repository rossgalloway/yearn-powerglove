import { createFileRoute } from '@tanstack/react-router'

function DisclaimerPage() {
  return (
    <div className="container mx-auto px-8 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Disclaimer</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg mb-8">
            <p className="text-yellow-800 font-semibold">
              <strong>Important Notice:</strong> This information is provided
              for educational and informational purposes only.
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            No Financial Advice
          </h2>
          <p className="leading-relaxed">
            The information displayed on this dashboard does not constitute
            financial, investment, trading, or other advice. All data is
            provided as-is for informational purposes only. You should consult
            with qualified financial professionals before making any investment
            decisions.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            Use at Your Own Risk
          </h2>
          <p className="leading-relaxed">
            DeFi protocols and cryptocurrency investments carry significant
            risks, including but not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Complete loss of invested capital</li>
            <li>Smart contract vulnerabilities and exploits</li>
            <li>Regulatory changes and compliance risks</li>
            <li>Market volatility and impermanent loss</li>
            <li>Technical failures and network outages</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            Data Accuracy
          </h2>
          <p className="leading-relaxed">
            While we strive to provide accurate and up-to-date information about
            Yearn Finance vaults, we make no warranties or guarantees regarding
            the accuracy, completeness, or reliability of the data. Metrics such
            as APY, TVL, and strategy information are best-effort
            representations and may not reflect real-time conditions.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            No Transaction Capabilities
          </h2>
          <p className="leading-relaxed">
            This dashboard is for informational purposes only and does not
            provide direct deposit, withdrawal, or trading functionality. Any
            links to external platforms are provided for convenience and do not
            constitute an endorsement of those services.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            External Links and Third Parties
          </h2>
          <p className="leading-relaxed">
            Links to external websites, including yearn.fi and other DeFi
            platforms, are provided for convenience. We are not responsible for
            the content, accuracy, or practices of these external sites.
          </p>

          <div className="mt-8 p-6 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <p className="text-sm text-red-800">
              <strong>Risk Warning:</strong> DeFi protocols are experimental
              technology. Never invest more than you can afford to lose. Always
              do your own research and understand the risks before participating
              in any DeFi protocol.
            </p>
          </div>

          <div className="mt-6 p-6 bg-gray-50 border-l-4 border-gray-400 rounded-r-lg">
            <p className="text-sm text-gray-700">
              By using this dashboard, you acknowledge that you understand and
              accept these risks and disclaimers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/disclaimer')({
  component: DisclaimerPage,
})
