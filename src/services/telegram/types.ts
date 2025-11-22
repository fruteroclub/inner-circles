export interface TelegramUser {
  id: number
  username?: string
  first_name?: string
  last_name?: string
}

export interface CommandContext {
  userId: number
  username?: string
  chatId: number
}

export interface LoanRequest {
  userId: number
  amount: number
  currency?: string
}

export interface LoanStatus {
  loanId: string
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'repaid'
  amount: number
  createdAt: string
}

export interface VouchStatus {
  userId: number
  vouches: number
  reputation: number
}

export interface RepayLoanRequest {
  loanId: string
  userId: number
  amount: number
}

