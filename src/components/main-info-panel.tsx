import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, Copy, Check, ExternalLink, Info } from 'lucide-react'
import { format } from 'date-fns'
import usdc1VaultData from '@/data/usdc1VaultData.json'
import smolAssets from '@/data/smolAssets.json'
import {
  CHAIN_ID_TO_ICON,
  CHAIN_ID_TO_NAME,
  CHAIN_ID_TO_BLOCK_EXPLORER,
} from '@/constants/chains'

interface MainInfoPanelProps {
  vaultId: string
  deploymentDate: string
  vaultName: string
  description: string
  vaultToken: {
    icon: string
    name: string
  }
  totalSupply: string
  network: {
    icon: string
    name: string
  }
  estimatedAPY: string
  historicalAPY: string
  managementFee: string
  performanceFee: string
  apiVersion: string
  vaultAddress: string
  blockExplorerLink?: string
  yearnVaultLink?: string
}

function hydrateMainInfoPanelData(): MainInfoPanelProps & {
  blockExplorerLink: string
} {
  const vaultData = usdc1VaultData.data.vault

  const deploymentDate = format(
    new Date(parseInt(vaultData.inceptTime) * 1000),
    'MMMM yyyy'
  )
  const vaultName = vaultData.name
  const description = `The ${vaultName} aims to optimize for risk-adjusted yield across established lending and yield-farming markets.`

  const vaultToken = {
    icon:
      smolAssets.tokens.find(token => token.symbol === vaultData.asset.symbol)
        ?.logoURI || '',
    name: vaultData.asset.symbol,
  }

  const totalSupply = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(vaultData.tvl.close)

  const network = {
    icon: CHAIN_ID_TO_ICON[vaultData.chainId],
    name: CHAIN_ID_TO_NAME[vaultData.chainId],
  }

  const estimatedAPY = `${(vaultData.apy.net * 100).toFixed(2)}%`
  const historicalAPY = `${(vaultData.apy.inceptionNet * 100).toFixed(2)}%`
  const managementFee = `${(vaultData.fees.managementFee / 100).toFixed(0)}%`
  const performanceFee = `${(vaultData.fees.performanceFee / 100).toFixed(0)}%`
  const apiVersion = vaultData.apiVersion
  const blockExplorerLink = `${CHAIN_ID_TO_BLOCK_EXPLORER[vaultData.chainId]}/address/${vaultData.address}`
  const yearnVaultLink = vaultData.apiVersion.startsWith('3')
    ? `https://yearn.fi/v3/${vaultData.chainId}/${vaultData.address}`
    : `https://yearn.fi/vaults/${vaultData.chainId}/${vaultData.address}`

  return {
    vaultId: vaultData.symbol,
    deploymentDate,
    vaultName,
    description,
    vaultToken,
    totalSupply,
    network,
    estimatedAPY,
    historicalAPY,
    managementFee,
    performanceFee,
    apiVersion,
    vaultAddress: vaultData.address,
    blockExplorerLink,
    yearnVaultLink,
  }
}

export function MainInfoPanel() {
  const [copied, setCopied] = useState(false)
  const data = hydrateMainInfoPanelData()

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
            <h1 className="text-3xl font-bold mb-3">{data.vaultName}</h1>
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
              <img
                src={data.vaultToken.icon}
                alt={data.vaultToken.name}
                className="h-6 w-6 rounded-full"
              />
              <span>{data.vaultToken.name}</span>
            </div>

            <div className="text-sm text-gray-500 mt-4 mb-1">Total Supply</div>
            <div>{data.totalSupply}</div>

            <div className="text-sm text-gray-500 mt-4 mb-1">Network</div>
            <div className="flex items-center gap-2">
              <img
                src={data.network.icon}
                alt={data.network.name}
                className="h-6 w-6 rounded-full"
              />
              <span>{data.network.name}</span>
            </div>

            <div className="text-sm text-gray-500 mt-4 mb-1">Vault Address</div>
            <div className="flex items-center gap-2">
              <span className="text-[#0657f9]">
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
                <ArrowUpRight className="h-4 w-4 text-gray-400 cursor-pointer" />
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
              <Info className="h-4 w-4 text-gray-400" />
            </div>
            <div>{data.managementFee}</div>

            <div className="text-sm text-gray-500 mt-4 mb-1 flex items-center gap-1">
              Performance Fee
              <Info className="h-4 w-4 text-gray-400" />
            </div>
            <div>{data.performanceFee}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
