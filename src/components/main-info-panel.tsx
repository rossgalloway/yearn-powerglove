import { Button } from "@/components/ui/button"
import { ArrowUpRight, Copy, ExternalLink, Info } from "lucide-react"

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
  vaultAddress: string
}

export function MainInfoPanel({
  vaultId = "yvUSDC-1",
  deploymentDate = "Deployment Date: May 2024",
  vaultName = "Yearn USDC Prime",
  description = "The USDC Prime vault aims to optimize for risk-adjusted yield across large market cap and high liquidity collateral markets.",
  vaultToken = {
    icon: "USDC",
    name: "USDC",
  },
  totalSupply = "$82.7M",
  network = {
    icon: "Ethereum",
    name: "Ethereum",
  },
  estimatedAPY = "7.92%",
  historicalAPY = "6.52%",
  managementFee = "0%",
  performanceFee = "10%",
  vaultAddress = "0x8e...d458",
}: MainInfoPanelProps) {
  return (

        <div className="border border-border bg-white border-b-0 border-t-0"> 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="md:col-span-2">
          <div className="mb-2">
            <div className="text-sm text-gray-500 mb-1">{vaultId}</div>
            <div className="bg-gray-100 text-xs inline-block px-2 py-1">{deploymentDate}</div>
          </div>
          <div className="max-w-md">
            <h1 className="text-3xl font-bold mb-3">{vaultName}</h1>
            <p className="text-gray-600 mb-4">{description}</p>
            <Button className="bg-[#0657f9] hover:bg-[#0657f9]/90 rounded-none">
              Go to Vault <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Vault Token</div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[#0657f9] flex items-center justify-center text-white text-xs">
                {vaultToken.icon.charAt(0)}
              </div>
              <span>{vaultToken.name}</span>
            </div>

            <div className="text-sm text-gray-500 mt-4 mb-1">Total Supply</div>
            <div>{totalSupply}</div>

            <div className="text-sm text-gray-500 mt-4 mb-1">Network</div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[#627eea] flex items-center justify-center text-white text-xs">
                {network.icon.charAt(0)}
              </div>
              <span>{network.name}</span>
            </div>

            <div className="text-sm text-gray-500 mt-4 mb-1">Vault Address</div>
            <div className="flex items-center gap-2">
              <span className="text-[#0657f9]">{vaultAddress}</span>
              <Copy className="h-4 w-4 text-gray-400 cursor-pointer" />
              <ArrowUpRight className="h-4 w-4 text-gray-400 cursor-pointer" />
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Estimated APY</div>
            <div className="text-xl font-bold">{estimatedAPY}</div>

            <div className="text-sm text-gray-500 mt-4 mb-1">Historical APY</div>
            <div>{historicalAPY}</div>

            <div className="text-sm text-gray-500 mt-4 mb-1 flex items-center gap-1">
              Management Fee
              <Info className="h-4 w-4 text-gray-400" />
            </div>
            <div>{managementFee}</div>

            <div className="text-sm text-gray-500 mt-4 mb-1 flex items-center gap-1">
              Performance Fee
              <Info className="h-4 w-4 text-gray-400" />
            </div>
            <div>{performanceFee}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

