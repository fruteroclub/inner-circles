/**
 * Member Lookup Service
 * 
 * Maps Circles addresses to Telegram user IDs for sending notifications
 */

import { readFileSync } from "fs";
import { join } from "path";

// Load members data from JSON file
function loadMembersData(): any[] {
  try {
    const filePath = join(process.cwd(), "data", "members.json");
    const fileContents = readFileSync(filePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.warn("Could not load members.json:", error);
    return [];
  }
}

const membersData = loadMembersData();

export interface Member {
  telegramUserId: number;
  telegramHandle: string;
  circlesAddress: string;
  circlesUsername?: string;
  ensSubname?: string;
  eoaWallet?: string;
  joinedAt: string;
  lastUpdated: string;
}

/**
 * Get member by Circles address
 */
export function getMemberByAddress(circlesAddress: string): Member | null {
  const members = membersData as Member[];
  const normalizedAddress = circlesAddress.toLowerCase();
  
  return members.find(
    (member) => member.circlesAddress.toLowerCase() === normalizedAddress
  ) || null;
}

/**
 * Get Telegram user ID by Circles address
 */
export function getTelegramUserIdByAddress(circlesAddress: string): number | null {
  const member = getMemberByAddress(circlesAddress);
  return member?.telegramUserId || null;
}

/**
 * Get all members
 */
export function getAllMembers(): Member[] {
  return membersData as Member[];
}

