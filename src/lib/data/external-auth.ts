"use server"

import { sdk } from "@lib/config"
import { getCacheTag, setAuthToken } from "./cookies"
import { decodeToken } from "react-jwt"
import { revalidateTag } from "next/cache"
import { transferCart } from "./customer"

interface UserIdentity {
  provider: string
  auth_identity_id: string
  user_metadata: {
    name: string
    email: string
    picture: string
    given_name: string
    family_name: string
  }
}

interface TokenPayload {
  actor_id: string
  iat: number
  exp: number
}

export async function externalLogin(
  _currentState: unknown,
  provider: string,
  payload?: Record<string, unknown>
): Promise<string | { location: string }> {
  try {
    return await sdk.auth.login("customer", provider, {
      scopes: "openid email profile",
    })
  } catch (error: any) {
    return error.toString()
  }
}

export async function externalLoginCallback(
  provider: string,
  query: Record<string, unknown>
): Promise<void> {
  try {
    let token = await sdk.auth.callback("customer", provider, query)

    if (!token) {
      throw new Error("External authorization failed.")
    }

    const jwt = decodeToken<TokenPayload>(token)

    // If the token does not contain an actor_id, the user is not registered as a customer
    if (!jwt?.actor_id) {
      const { identity } = await getAuthIdentity(token)
      const { customer } = await sdk.store.customer.create(
        {
          email: identity.user_metadata.email,
          first_name: identity.user_metadata.given_name,
          last_name: identity.user_metadata.family_name,
        },
        {},
        {
          Authorization: `Bearer ${token}`,
        }
      )

      if (!customer) {
        throw new Error("Failed to create customer.")
      }

      // Refresh the token after creating the customer
      token = await sdk.client.fetch("/auth/token/refresh", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    }

    await setAuthToken(token)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()
  } catch (error: any) {
    throw error
  }
}

export async function getAuthIdentity(
  token: string
): Promise<{ identity: UserIdentity }> {
  try {
    const result = await sdk.client.fetch<{ identity: UserIdentity }>(
      "/auth/identity",
      {
        credentials: "include",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return result
  } catch (error: any) {
    throw error
  }
}
