/**
 * Mock interfaces and data for the Expandable Chain Selector component
 * Use this file for testing, storybook, or development mocking
 */

export interface ChainData {
  /** Unique chain identifier */
  id: number
  /** Human-readable chain name */
  name: string
  /** URL or path to chain icon */
  icon: string
}

export interface ChainSelectorProps {
  /** Array of selected chain IDs */
  selectedChains: number[]
  /** Callback when a chain is toggled on/off */
  onChainToggle: (chainId: number) => void
  /** Optional callback to set multiple chains at once */
  onSetSelectedChains?: (chainIds: number[]) => void
  /** Whether the component starts in collapsed state */
  isCollapsed?: boolean
  /** Optional callback when collapse state changes */
  onToggleCollapsed?: () => void
}

export interface ExpandableFilterProps {
  /** The collapsed button content (icon + text) */
  buttonContent: React.ReactNode
  /** The expanded content that shows on hover */
  expandedContent: React.ReactNode
  /** Optional className for the container */
  className?: string
  /** Whether the component should expand on hover */
  expandOnHover?: boolean
}

export interface IconPosition {
  chainId: number
  name: string
  icon: string
  canonicalIndex: number
  targetX: number
  isSelected: boolean
  stackBehind?: number
}

// Mock data for testing and development
export const mockChains: ChainData[] = [
  { id: 1, name: 'Ethereum', icon: '/icons/ethereum.svg' },
  { id: 42161, name: 'Arbitrum', icon: '/icons/arbitrum.svg' },
  { id: 137, name: 'Polygon', icon: '/icons/polygon.svg' },
  { id: 10, name: 'Optimism', icon: '/icons/optimism.svg' },
  { id: 8453, name: 'Base', icon: '/icons/base.svg' },
  { id: 250, name: 'Fantom', icon: '/icons/fantom.svg' },
]

// Mock props for different states
export const mockPropsDefault: ChainSelectorProps = {
  selectedChains: [],
  onChainToggle: chainId => console.log('Toggle chain:', chainId),
  onSetSelectedChains: chainIds => console.log('Set chains:', chainIds),
  isCollapsed: true,
}

export const mockPropsWithSelection: ChainSelectorProps = {
  selectedChains: [1, 42161], // Ethereum and Arbitrum selected
  onChainToggle: chainId => console.log('Toggle chain:', chainId),
  onSetSelectedChains: chainIds => console.log('Set chains:', chainIds),
  isCollapsed: true,
}

export const mockPropsAllSelected: ChainSelectorProps = {
  selectedChains: [1, 42161, 137, 10, 8453, 250], // All chains selected
  onChainToggle: chainId => console.log('Toggle chain:', chainId),
  onSetSelectedChains: chainIds => console.log('Set chains:', chainIds),
  isCollapsed: true,
}

// Test scenarios for different states
export const testScenarios = {
  default: {
    name: 'Default State (No Selection)',
    props: mockPropsDefault,
    expectedText: 'Filter Chains',
    expectedIconCount: 0,
    expectedWidth: 140,
  },
  someSelected: {
    name: 'Some Chains Selected',
    props: mockPropsWithSelection,
    expectedText: 'Selected Chains',
    expectedIconCount: 2,
    expectedWidth: 180,
  },
  allSelected: {
    name: 'All Chains Selected',
    props: mockPropsAllSelected,
    expectedText: 'Filter Chains',
    expectedIconCount: 0,
    expectedWidth: 140,
  },
}

// Animation configuration constants
export const animationConfig = {
  ICON_WIDTH_EXPANDED: 40,
  ICON_WIDTH_COLLAPSED: 20,
  TRANSITION_DURATION: 300,
  TRANSITION_EASING: 'ease-in-out',
  MIN_BUTTON_WIDTH: 140,
}

// Mock event handlers for testing
export const mockEventHandlers = {
  onChainToggle: (chainId: number) => console.log('Toggle:', chainId),
  onSetSelectedChains: (chainIds: number[]) => console.log('Set:', chainIds),
  onToggleCollapsed: () => console.log('Toggle collapsed'),
}

// Helper function to create test props
export function createMockProps(
  selectedChains: number[] = []
): ChainSelectorProps {
  return {
    selectedChains,
    onChainToggle: mockEventHandlers.onChainToggle,
    onSetSelectedChains: mockEventHandlers.onSetSelectedChains,
    isCollapsed: true,
  }
}

// CSS class names for testing
export const cssClasses = {
  container:
    'relative flex items-center border rounded-md transition-all duration-200 bg-white',
  containerHover: 'border-gray-400 shadow-sm',
  containerDefault: 'border-gray-300',
  buttonContent: 'flex items-center px-3 py-2',
  filterIcon: 'w-4 h-4 text-gray-500 mr-2',
  buttonText: 'text-sm font-medium text-gray-700 whitespace-nowrap',
  iconContainer: 'relative h-10 flex-1 ml-2',
  chainIcon:
    'absolute flex items-center justify-center rounded-full transition-all duration-300 ease-in-out focus:outline-none',
  iconSelected: 'z-10 w-8 h-8',
  iconUnselected: 'z-5 filter grayscale',
  iconExpanded: 'w-8 h-8',
  iconCollapsed: 'w-6 h-6',
}
