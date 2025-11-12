import { ChainId } from '@/constants/chains'

export type YDaemonStrategy = {
  address: string
  netAPR?: number | null
}

export type YDaemonForwardApr = {
  netAPR?: number | null
}

export type YDaemonVault = {
  address: string
  chainID: ChainId
  apr?: {
    forwardAPR?: YDaemonForwardApr
  }
  strategies?: YDaemonStrategy[]
}
