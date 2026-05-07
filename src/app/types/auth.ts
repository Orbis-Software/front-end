import type { User } from "@/app/types/user"
import type { CustomerAccount } from "@/app/types/customer"

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResult {
  user: User
  token: string
}

export interface CustomerLoginResult {
  customer: CustomerAccount
  token: string
}
