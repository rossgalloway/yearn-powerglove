import { useState } from 'react'
import { Copy, Check, ExternalLink, Info } from 'lucide-react'
import { MainInfoPanelProps } from '@/types/dataTypes'

export function MainInfoPanel(data: MainInfoPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(data.vaultAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000) // Reset after 1 seconds
  }

  return (
    <div className="border border-border bg-white border-b-0 border-t-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="md:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <div className="text-sm text-gray-500">{data.vaultId}</div>
            <div className="bg-gray-100 text-xs inline-block px-2 py-1">
              Deployed: {data.deploymentDate}
            </div>
          </div>
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold mb-3">{data.vaultName}</h1>
              <div className="text-sm text-gray-500">{data.apiVersion}</div>
            </div>
            <p className="text-gray-600 mb-4">{data.description}</p>
            <a
              className="bg-[#0657f9] hover:bg-[#0657f9]/90 rounded-none text-white px-4 py-2 inline-flex items-center"
              href={data.yearnVaultLink}
              target="_blank"
              rel="noreferrer"
            >
              Go to Vault <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Vault Token</div>
            <div className="flex items-center gap-2">
              {data.vaultToken.icon ? (
                <img
                  src={data.vaultToken.icon}
                  alt={data.vaultToken.name}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 flex items-center justify-center bg-gray-300 rounded-full text-white">
                  ?
                </div>
              )}
              <span>{data.vaultToken.name}</span>
            </div>
            <div className="text-sm text-gray-500 mt-4 mb-1">Total Supply</div>
            <div>{data.totalSupply}</div>

            <div className="text-sm text-gray-500 mt-4 mb-1">Network</div>
            <div className="flex items-center gap-2">
              {data.network.icon ? (
                <img
                  src={data.network.icon}
                  alt={data.network.name}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 flex items-center justify-center bg-gray-300 rounded-full text-white">
                  ?
                </div>
              )}
              <span>{data.network.name}</span>
            </div>

            <div className="text-sm text-gray-500 mt-4 mb-1">Vault Address</div>
            <div className="flex items-center gap-2">
              <span>
                {data.vaultAddress.slice(0, 5) +
                  '...' +
                  data.vaultAddress.slice(-4)}
              </span>
              <div
                className="h-4 w-4 text-gray-400 cursor-pointer"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-grey-400" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400 cursor-pointer" />
                )}
              </div>
              <a href={data.blockExplorerLink} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 text-gray-400 cursor-pointer" />
              </a>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Est. Current APY</div>
            <div>{data.estimatedAPY}</div>

            <div className="text-sm text-gray-500 mt-4 mb-1">
              Historical APY
            </div>
            <div>{data.historicalAPY}</div>

            <div className="text-sm text-gray-500 mt-4 mb-1 flex items-center gap-1">
              Management Fee
              {/* <Info className="h-4 w-4 text-gray-400" /> */}
            </div>
            <div>{data.managementFee}</div>

            <div className="text-sm text-gray-500 mt-4 mb-1 flex items-center gap-1">
              Performance Fee
              {/* <Info className="h-4 w-4 text-gray-400" /> */}
            </div>
            <div>{data.performanceFee}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
