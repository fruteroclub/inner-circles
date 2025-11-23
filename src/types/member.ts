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
  telegramUserId: number;

  /**
   * Telegram username/handle (e.g., @username)
   */
  telegramHandle: string;

  /**
   * Circles protocol address (Safe wallet address)
   * This is the primary identifier for Circles operations
   */
  circlesAddress: string;

  /**
   * Circles username (optional)
   * Display name in Circles protocol
   */
  circlesUsername?: string;

  /**
   * Assigned ENS subname (optional)
   * Community membership tag (e.g., username.community.eth)
   */
  ensSubname?: string;

  /**
   * EOA wallet address (optional)
   * External wallet for signing transactions
   * Separate from Circles address (which is a Safe wallet)
   */
  eoaWallet?: string;

  /**
   * Timestamp when member joined the group
   */
  joinedAt: Date;

  /**
   * Last update timestamp
   */
  lastUpdated: Date;
}

/**
 * Partial member data for updates
 */
export type PartialGroupMember = Partial<
  Omit<GroupMember, "telegramUserId" | "joinedAt">
> & {
  lastUpdated: Date;
};

/**
 * Member registration input
 */
export interface MemberRegistrationInput {
  telegramUserId: number;
  telegramHandle: string;
  circlesAddress: string;
  circlesUsername?: string;
  eoaWallet?: string;
}

/**
 * Validation result for member data
 */
export interface MemberValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validation functions for GroupMember fields
 */

/**
 * Validates an Ethereum address format
 * @param address - Address string to validate
 * @returns true if address format is valid
 */
export function isValidEthereumAddress(address: string): boolean {
  if (!address || typeof address !== "string") {
    return false;
  }
  // Basic Ethereum address format: 0x followed by 40 hex characters
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(address);
}

/**
 * Validates a Telegram user ID
 * @param userId - User ID to validate
 * @returns true if user ID is valid
 */
export function isValidTelegramUserId(userId: number): boolean {
  return (
    typeof userId === "number" &&
    Number.isInteger(userId) &&
    userId > 0 &&
    userId <= Number.MAX_SAFE_INTEGER
  );
}

/**
 * Validates a Telegram handle/username
 * @param handle - Handle string to validate
 * @returns true if handle format is valid
 */
export function isValidTelegramHandle(handle: string): boolean {
  if (!handle || typeof handle !== "string") {
    return false;
  }
  // Telegram usernames: 5-32 characters, alphanumeric and underscores
  // Can start with @ or not
  const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;
  const handleRegex = /^[a-zA-Z0-9_]{5,32}$/;
  return handleRegex.test(cleanHandle);
}

/**
 * Validates an ENS subname format
 * @param subname - ENS subname to validate
 * @returns true if subname format is valid
 */
export function isValidEnsSubname(subname: string): boolean {
  if (!subname || typeof subname !== "string") {
    return false;
  }
  // ENS subname format: username.domain.eth or similar
  // Basic validation: contains at least one dot and ends with .eth
  const ensRegex = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/i;
  return ensRegex.test(subname) && subname.length <= 255;
}

/**
 * Validates a Circles username
 * @param username - Username to validate
 * @returns true if username format is valid
 */
export function isValidCirclesUsername(username: string): boolean {
  if (!username || typeof username !== "string") {
    return false;
  }
  // Circles usernames: alphanumeric, hyphens, underscores, 3-50 characters
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return usernameRegex.test(username);
}

/**
 * Validates a Date object
 * @param date - Date to validate
 * @returns true if date is valid
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validates a complete GroupMember object
 * @param member - Member object to validate
 * @returns Validation result with errors array
 */
export function validateGroupMember(
  member: Partial<GroupMember>
): MemberValidationResult {
  const errors: string[] = [];

  // Required fields validation
  if (member.telegramUserId === undefined) {
    errors.push("telegramUserId is required");
  } else if (!isValidTelegramUserId(member.telegramUserId)) {
    errors.push("telegramUserId must be a positive integer");
  }

  if (!member.telegramHandle) {
    errors.push("telegramHandle is required");
  } else if (!isValidTelegramHandle(member.telegramHandle)) {
    errors.push(
      "telegramHandle must be 5-32 characters, alphanumeric and underscores only"
    );
  }

  if (!member.circlesAddress) {
    errors.push("circlesAddress is required");
  } else if (!isValidEthereumAddress(member.circlesAddress)) {
    errors.push(
      "circlesAddress must be a valid Ethereum address (0x followed by 40 hex characters)"
    );
  }

  // Optional fields validation (only if provided)
  if (member.circlesUsername !== undefined && member.circlesUsername !== null) {
    if (
      member.circlesUsername !== "" &&
      !isValidCirclesUsername(member.circlesUsername)
    ) {
      errors.push(
        "circlesUsername must be 3-50 characters, alphanumeric, hyphens, and underscores only"
      );
    }
  }

  if (member.ensSubname !== undefined && member.ensSubname !== null) {
    if (member.ensSubname !== "" && !isValidEnsSubname(member.ensSubname)) {
      errors.push(
        "ensSubname must be a valid ENS subname format (e.g., username.domain.eth)"
      );
    }
  }

  if (member.eoaWallet !== undefined && member.eoaWallet !== null) {
    if (member.eoaWallet !== "" && !isValidEthereumAddress(member.eoaWallet)) {
      errors.push(
        "eoaWallet must be a valid Ethereum address (0x followed by 40 hex characters)"
      );
    }
  }

  if (member.joinedAt !== undefined) {
    if (!isValidDate(member.joinedAt)) {
      errors.push("joinedAt must be a valid Date object");
    }
  }

  if (member.lastUpdated !== undefined) {
    if (!isValidDate(member.lastUpdated)) {
      errors.push("lastUpdated must be a valid Date object");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates MemberRegistrationInput
 * @param input - Registration input to validate
 * @returns Validation result with errors array
 */
export function validateMemberRegistrationInput(
  input: Partial<MemberRegistrationInput>
): MemberValidationResult {
  const errors: string[] = [];

  if (input.telegramUserId === undefined) {
    errors.push("telegramUserId is required");
  } else if (!isValidTelegramUserId(input.telegramUserId)) {
    errors.push("telegramUserId must be a positive integer");
  }

  if (!input.telegramHandle) {
    errors.push("telegramHandle is required");
  } else if (!isValidTelegramHandle(input.telegramHandle)) {
    errors.push(
      "telegramHandle must be 5-32 characters, alphanumeric and underscores only"
    );
  }

  if (!input.circlesAddress) {
    errors.push("circlesAddress is required");
  } else if (!isValidEthereumAddress(input.circlesAddress)) {
    errors.push(
      "circlesAddress must be a valid Ethereum address (0x followed by 40 hex characters)"
    );
  }

  // Optional fields validation (only if provided)
  if (input.circlesUsername !== undefined && input.circlesUsername !== null) {
    if (
      input.circlesUsername !== "" &&
      !isValidCirclesUsername(input.circlesUsername)
    ) {
      errors.push(
        "circlesUsername must be 3-50 characters, alphanumeric, hyphens, and underscores only"
      );
    }
  }

  if (input.eoaWallet !== undefined && input.eoaWallet !== null) {
    if (input.eoaWallet !== "" && !isValidEthereumAddress(input.eoaWallet)) {
      errors.push(
        "eoaWallet must be a valid Ethereum address (0x followed by 40 hex characters)"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
