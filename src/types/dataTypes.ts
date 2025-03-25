export type MainInfoPanelProps = {
  vaultId: string
  deploymentDate: string
  vaultName: string
  vaultAddress: string
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
  blockExplorerLink?: string
  yearnVaultLink?: string
}
