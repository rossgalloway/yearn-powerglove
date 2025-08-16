import React from 'react'
import { Link } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'

interface VaultPageBreadcrumbProps {
  vaultName: string
}

/**
 * Breadcrumb navigation component for vault pages
 */
export const VaultPageBreadcrumb = React.memo<VaultPageBreadcrumbProps>(
  ({ vaultName }) => {
    return (
      <div className="px-6 pt-2 border border-border bg-white border-b-0 border-t-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Vaults</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{vaultName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    )
  }
)
