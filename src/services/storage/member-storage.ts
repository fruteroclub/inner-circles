/**
 * Member Storage Service
 *
 * Provides CRUD operations for group member data using JSON file storage.
 * For MVP, uses file-based persistence. Can be upgraded to database later.
 */

import { promises as fs } from "fs";
import { join } from "path";
import type {
  GroupMember,
  PartialGroupMember,
  MemberValidationResult,
} from "@/types/member";
import {
  validateGroupMember,
  isValidEthereumAddress,
} from "@/types/member";

/**
 * JSON storage format for members
 * Dates are stored as ISO strings for JSON compatibility
 */
interface StoredMember {
  telegramUserId: number;
  telegramHandle: string;
  circlesAddress: string;
  circlesUsername?: string;
  ensSubname?: string;
  eoaWallet?: string;
  joinedAt: string; // ISO string
  lastUpdated: string; // ISO string
}

/**
 * Storage file path
 */
const STORAGE_DIR = join(process.cwd(), "data");
const STORAGE_FILE = join(STORAGE_DIR, "members.json");

/**
 * Ensure data directory exists
 */
async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create data directory: ${error}`);
  }
}

/**
 * Read members from storage file
 */
async function readMembers(): Promise<Map<number, StoredMember>> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(STORAGE_FILE, "utf-8");
    const members: StoredMember[] = JSON.parse(data);
    return new Map(members.map((m) => [m.telegramUserId, m]));
  } catch (error: any) {
    // File doesn't exist or is empty - return empty map
    if (error.code === "ENOENT" || error.message.includes("Unexpected end")) {
      return new Map();
    }
    throw new Error(`Failed to read members: ${error.message}`);
  }
}

/**
 * Write members to storage file
 */
async function writeMembers(members: Map<number, StoredMember>): Promise<void> {
  try {
    await ensureDataDirectory();
    const membersArray = Array.from(members.values());
    await fs.writeFile(STORAGE_FILE, JSON.stringify(membersArray, null, 2), "utf-8");
  } catch (error: any) {
    throw new Error(`Failed to write members: ${error.message}`);
  }
}

/**
 * Convert GroupMember to StoredMember (Date -> ISO string)
 */
function toStoredMember(member: GroupMember): StoredMember {
  return {
    ...member,
    joinedAt: member.joinedAt.toISOString(),
    lastUpdated: member.lastUpdated.toISOString(),
  };
}

/**
 * Convert StoredMember to GroupMember (ISO string -> Date)
 */
function fromStoredMember(stored: StoredMember): GroupMember {
  return {
    ...stored,
    joinedAt: new Date(stored.joinedAt),
    lastUpdated: new Date(stored.lastUpdated),
  };
}

/**
 * Add a new member to storage
 * @param member - Member data to add
 * @throws Error if member already exists or validation fails
 */
export async function addMember(member: GroupMember): Promise<void> {
  // Validate member data
  const validation: MemberValidationResult = validateGroupMember(member);
  if (!validation.isValid) {
    throw new Error(`Invalid member data: ${validation.errors.join(", ")}`);
  }

  const members = await readMembers();

  // Check if member already exists
  if (members.has(member.telegramUserId)) {
    throw new Error(
      `Member with Telegram ID ${member.telegramUserId} already exists`
    );
  }

  // Check if Circles address is already registered
  for (const existingMember of members.values()) {
    if (existingMember.circlesAddress.toLowerCase() === member.circlesAddress.toLowerCase()) {
      throw new Error(
        `Circles address ${member.circlesAddress} is already registered to another member`
      );
    }
  }

  // Add member
  members.set(member.telegramUserId, toStoredMember(member));
  await writeMembers(members);
}

/**
 * Get member by Telegram user ID
 * @param telegramUserId - Telegram user ID
 * @returns Member if found, null otherwise
 */
export async function getMember(
  telegramUserId: number
): Promise<GroupMember | null> {
  if (!telegramUserId || telegramUserId <= 0) {
    return null;
  }

  const members = await readMembers();
  const stored = members.get(telegramUserId);
  return stored ? fromStoredMember(stored) : null;
}

/**
 * Get member by Circles address
 * @param address - Circles protocol address
 * @returns Member if found, null otherwise
 */
export async function getMemberByCirclesAddress(
  address: string
): Promise<GroupMember | null> {
  if (!address || !isValidEthereumAddress(address)) {
    return null;
  }

  const members = await readMembers();
  const addressLower = address.toLowerCase();

  for (const stored of members.values()) {
    if (stored.circlesAddress.toLowerCase() === addressLower) {
      return fromStoredMember(stored);
    }
  }

  return null;
}

/**
 * Update member data
 * @param telegramUserId - Telegram user ID of member to update
 * @param updates - Partial member data to update
 * @throws Error if member not found or validation fails
 */
export async function updateMember(
  telegramUserId: number,
  updates: PartialGroupMember
): Promise<void> {
  if (!telegramUserId || telegramUserId <= 0) {
    throw new Error("Invalid Telegram user ID");
  }

  const members = await readMembers();
  const existing = members.get(telegramUserId);

  if (!existing) {
    throw new Error(`Member with Telegram ID ${telegramUserId} not found`);
  }

  // Merge updates with existing data
  const updated: GroupMember = {
    ...fromStoredMember(existing),
    ...updates,
    telegramUserId, // Ensure ID cannot be changed
    joinedAt: existing.joinedAt ? new Date(existing.joinedAt) : new Date(), // Preserve original join date
    lastUpdated: new Date(), // Always update timestamp
  };

  // Validate updated member
  const validation: MemberValidationResult = validateGroupMember(updated);
  if (!validation.isValid) {
    throw new Error(`Invalid member data: ${validation.errors.join(", ")}`);
  }

  // Check if Circles address is being changed and conflicts with another member
  if (updates.circlesAddress && updates.circlesAddress !== existing.circlesAddress) {
    for (const [id, stored] of members.entries()) {
      if (id !== telegramUserId && stored.circlesAddress.toLowerCase() === updates.circlesAddress!.toLowerCase()) {
        throw new Error(
          `Circles address ${updates.circlesAddress} is already registered to another member`
        );
      }
    }
  }

  // Update member
  members.set(telegramUserId, toStoredMember(updated));
  await writeMembers(members);
}

/**
 * List all members
 * @returns Array of all members
 */
export async function listMembers(): Promise<GroupMember[]> {
  const members = await readMembers();
  return Array.from(members.values()).map(fromStoredMember);
}

/**
 * Remove a member from storage
 * @param telegramUserId - Telegram user ID of member to remove
 * @throws Error if member not found
 */
export async function removeMember(telegramUserId: number): Promise<void> {
  if (!telegramUserId || telegramUserId <= 0) {
    throw new Error("Invalid Telegram user ID");
  }

  const members = await readMembers();

  if (!members.has(telegramUserId)) {
    throw new Error(`Member with Telegram ID ${telegramUserId} not found`);
  }

  members.delete(telegramUserId);
  await writeMembers(members);
}

/**
 * Check if member exists
 * @param telegramUserId - Telegram user ID to check
 * @returns true if member exists
 */
export async function memberExists(telegramUserId: number): Promise<boolean> {
  const members = await readMembers();
  return members.has(telegramUserId);
}

/**
 * Get member count
 * @returns Number of members in storage
 */
export async function getMemberCount(): Promise<number> {
  const members = await readMembers();
  return members.size;
}

