/**
 * Group Member Data Structure
 * 
 * This interface defines the data structure for group members in the Inner Circles system.
 * Members are part of the Frutero Club Circles Group and can mint group tokens.
 */

export interface GroupMember {
  /**
   * Telegram user ID (unique identifier from Telegram)
   */
  telegramUserId: number

  /**
   * Telegram username/handle (e.g., @username)
   */
  telegramHandle: string

  /**
   * Circles protocol address (Safe wallet address)
   * This is the primary identifier for Circles operations
   */
  circlesAddress: string

  /**
   * Circles username (optional)
   * Display name in Circles protocol
   */
  circlesUsername?: string

  /**
   * Assigned ENS subname (optional)
   * Community membership tag (e.g., username.community.eth)
   */
  ensSubname?: string

  /**
   * EOA wallet address (optional)
   * External wallet for signing transactions
   * Separate from Circles address (which is a Safe wallet)
   */
  eoaWallet?: string

  /**
   * Timestamp when member joined the group
   */
  joinedAt: Date

  /**
   * Last update timestamp
   */
  lastUpdated: Date
}

/**
 * Partial member data for updates
 */
export type PartialGroupMember = Partial<Omit<GroupMember, 'telegramUserId' | 'joinedAt'>> & {
  lastUpdated: Date
}

/**
 * Member registration input
 */
export interface MemberRegistrationInput {
  telegramUserId: number
  telegramHandle: string
  circlesAddress: string
  circlesUsername?: string
  eoaWallet?: string
}

/**
 * Validation result for member data
 */
export interface MemberValidationResult {
  isValid: boolean
  errors: string[]
}

